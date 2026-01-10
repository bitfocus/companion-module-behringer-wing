import { CompanionActionDefinitions, Regex } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import { ControlCommands } from '../commands/control.js'
import { StateUtil } from '../state/index.js'
import {
	GetDropdownWithVariables,
	GetNumberFieldWithVariables,
	GetOnOffToggleDropdownWithVariables,
} from '../choices/common.js'
import { getIdLabelPair } from '../choices/utils.js'
import { getGpioModes } from '../choices/control.js'
import { getGpios } from '../choices/control.js'
import { FadeDurationChoice } from '../choices/fades.js'
import * as ActionUtil from './utils.js'

export enum OtherActionId {
	RecallSceneByName = 'recall-scene-by-name',
	RecallSceneByNumber = 'recall-scene-by-number',
	SendLibraryAction = 'send-library-action',
	SetGpioMode = 'set-gpio-mode',
	SetGpioState = 'set-gpio-state',
	SaveNow = 'save-now',
	SetSOF = 'set-sof',
	SetSelected = 'set-selected',
	SetLightIntensities = 'set-light-intensities',
}

export function createControlActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.connection!.sendCommand.bind(self.connection)
	const state = self.stateHandler?.state
	if (!state) throw new Error('State handler or state is not available')
	const ensureLoaded = self.stateHandler!.ensureLoaded.bind(self.stateHandler)
	const subscriptions = self.feedbackHandler?.subscriptions
	if (!subscriptions) throw new Error('Feedback handler or subscriptions are not available')
	const model = self.model

	const actions: { [id in OtherActionId]: CompanionActionWithCallback | undefined } = {
		[OtherActionId.RecallSceneByName]: {
			name: 'Recall Scene by Name',
			description:
				'ATTENTION: if you have the same scene name twice in your show, you will not be able to recall it by name! In this case, use the "Recall Scene by Number" action instead.',
			options: [...GetDropdownWithVariables('Scene Name', 'sceneName', state.namedChoices.scenes)],
			callback: async (event) => {
				const sceneName = ActionUtil.getStringWithVariables(event, 'sceneName')
				const sceneId = state.sceneNameToIdMap.get(sceneName) ?? 0
				await send(ControlCommands.LibrarySceneSelectionIndex(), sceneId)
				await send(ControlCommands.LibraryAction(), 'GO')
			},
			subscribe: () => {
				subscriptions.subscribePoll(ControlCommands.LibraryScenes())
				ensureLoaded(ControlCommands.LibraryActiveSceneIndex())
				ensureLoaded(ControlCommands.LibraryNode(), '?')
			},
			unsubscribe: () => {
				subscriptions.unsubscribePoll(ControlCommands.LibraryScenes())
			},
		},
		[OtherActionId.RecallSceneByNumber]: {
			name: 'Recall Scene by Number',
			description: 'Recall scene in a show by its number',
			options: [...GetNumberFieldWithVariables('Scene Number', 'sceneId', 1, 16384)],
			callback: async (event) => {
				const sceneId = ActionUtil.getNumberWithVariables(event, 'sceneId')
				await send(ControlCommands.LibrarySceneSelectionIndex(), sceneId)
				await send(ControlCommands.LibraryAction(), 'GO')
			},
			subscribe: () => {
				ensureLoaded(ControlCommands.LibraryActiveSceneIndex())
				ensureLoaded(ControlCommands.LibraryNode(), '?')
			},
			learn: () => {
				const cmd = ControlCommands.LibraryActiveSceneIndex()
				const sceneId = StateUtil.getNumberFromState(cmd, state)
				return { sceneId: sceneId, sceneId_use_variables: false }
			},
		},
		[OtherActionId.SendLibraryAction]: {
			name: 'Send Library Action',
			description: 'Trigger a library action (Select and navigate scenes in a show)',
			options: [
				...GetDropdownWithVariables(
					'Action',
					'act',
					[
						getIdLabelPair('GOPREV', 'Select Previous and Go'),
						getIdLabelPair('GONEXT', 'Select Next and Go'),
						getIdLabelPair('GO', 'Go'),
						getIdLabelPair('PREV', 'Select Previous'),
						getIdLabelPair('NEXT', 'Select Next'),
						//getIdLabelPair('GOTAG', 'G'),
					],
					'GO',
				),
			],
			callback: async (event) => {
				const act = ActionUtil.getStringWithVariables(event, 'act')
				if (act === 'GO') {
					await send(ControlCommands.LibrarySceneSelectionIndex(), 0) // required for 'GO' with PREV/NEXT
				}
				const cmd = ControlCommands.LibraryAction()
				await send(cmd, act)
			},
		},
		[OtherActionId.SetGpioMode]: {
			name: 'Set GPIO Mode',
			description: 'Configure the mode of a GPIO',
			options: [
				...GetDropdownWithVariables('Mode', 'mode', getGpioModes(), 'TGLNO'),
				...GetDropdownWithVariables('GPIO', 'gpio', getGpios(model.gpio), '1'),
			],
			callback: async (event) => {
				const gpio = ActionUtil.getNumberWithVariables(event, 'gpio')
				const val = ActionUtil.getStringWithVariables(event, 'mode')
				const cmd = ControlCommands.GpioMode(gpio)
				await send(cmd, val)
			},
		},
		[OtherActionId.SetGpioState]: {
			name: 'Set GPIO State',
			description: 'Set the state of a GPIO',
			options: [
				...GetDropdownWithVariables('Selection', 'sel', getGpios(model.gpio), '1'),
				...GetOnOffToggleDropdownWithVariables('state', 'State', true),
			],
			callback: async (event) => {
				const sel = ActionUtil.getNumberWithVariables(event, 'sel')
				const gpioState = ActionUtil.getNumberWithVariables(event, 'state')
				const cmd = ControlCommands.GpioState(sel)

				await send(cmd, gpioState)
			},
		},
		[OtherActionId.SaveNow]: {
			name: 'Save',
			description:
				'Save console data to internal flash. CAUTION: excessive writes to the internal flash memory can cause it to wear out.',
			options: [],
			callback: async () => {
				await send(ControlCommands.SaveNow(), 1)
			},
		},
		[OtherActionId.SetSOF]: {
			name: 'Set SOF',
			description: 'Set Sends on Fader',
			options: [
				{
					type: 'checkbox',
					label: 'Toggle',
					id: 'toggle',
					default: false,
					tooltip: 'Toggle the Sends-on-fade state of a selected channel, aux, bus, main or matrix',
				},
				...GetDropdownWithVariables(
					'Channel',
					'channel',
					[
						{ id: 'current', label: 'Currently Selected Channel' },
						{ id: 'off', label: 'Off' },
						...state.namedChoices.channels,
						...state.namedChoices.auxes,
						...state.namedChoices.busses,
						...state.namedChoices.mains,
						...state.namedChoices.matrices,
					],
					'current',
				),
			],
			callback: async (event) => {
				const cmd = ControlCommands.SetSof()
				const channel = ActionUtil.getStringWithVariables(event, 'channel')
				const channelIndex = ActionUtil.getStripIndexFromString(channel)
				const currentSelectedIndex = StateUtil.getNumberFromState(cmd, state) ?? 0

				/* explicitely use a string as argument. OSC Documentation:
				 * -1: sof active
				 *  0: sof not active
				 *  x: sof active on strip x
				 *
				 * +1 if an int is used
				 *
				 * When pressing on the console, the state is updated from the string the console sends,
				 * which is always lower by 1 compared to the integer
				 */
				if (channelIndex === currentSelectedIndex) {
					await send(cmd, 1)
				} else {
					await send(cmd, channelIndex + 1)
				}
			},
		},
		[OtherActionId.SetSelected]: {
			name: 'Set Selected',
			description: 'Set Selected Channel Strip',
			options: [
				...GetDropdownWithVariables('Channel', 'channel', [
					...state.namedChoices.channels,
					...state.namedChoices.auxes,
					...state.namedChoices.busses,
					...state.namedChoices.mains,
					...state.namedChoices.matrices,
				]),
			],
			callback: async (event) => {
				const channel = ActionUtil.getStringWithVariables(event, 'channel')
				// convert channel to index
				const channelIndex = ActionUtil.getStripIndexFromString(channel)
				// send the SOF command with the channel index
				await send(ControlCommands.SetSelect(), channelIndex)
			},
		},
		////////////////////////////////////////////////////////////////
		// Light Controls
		////////////////////////////////////////////////////////////////
		[OtherActionId.SetLightIntensities]: {
			name: 'Set Light Intensities',
			description: 'Set the intensities of console lights. (leave empty for no change)',
			options: [
				{
					type: 'textinput',
					label: 'Lamp',
					id: 'lamp',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Lamp light intensity (0-100%)',
				},
				{
					type: 'textinput',
					label: 'Buttons',
					id: 'btns',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Button backlight intensity (0-100%)',
				},
				{
					type: 'textinput',
					label: 'Layer Buttons',
					id: 'leds',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Layer button LED intensity (5-100%)',
				},
				{
					type: 'textinput',
					label: 'Meters',
					id: 'meters',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Meter display intensity (0-100%)',
				},
				{
					type: 'textinput',
					label: 'Channel Color',
					id: 'rgbleds',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'RGB LED color indicator intensity (0-100%)',
				},
				{
					type: 'textinput',
					label: 'Channel LCD',
					id: 'chlcds',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Channel LCD screen intensity (5-100%)',
				},
				{
					type: 'textinput',
					label: 'Channel LCD Contrast',
					id: 'chlcdctr',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Channel LCD screen contrast (0-100%)',
				},
				{
					type: 'textinput',
					label: 'Channel Strip LCD',
					id: 'chedit',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Channel edit strip LCD intensity (5-100%)',
				},
				{
					type: 'textinput',
					label: 'Touchscreen',
					id: 'main',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Main touchscreen intensity (5-100%)',
				},
				{
					type: 'textinput',
					label: 'Under Console',
					id: 'glow',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Under console ambient light intensity (0-100%)',
				},
				{
					type: 'textinput',
					label: 'Patch Panel',
					id: 'patch',
					default: '',
					useVariables: true,
					regex: Regex.PERCENT,
					tooltip: 'Patch panel light intensity (0-100%)',
				},
				...FadeDurationChoice(),
			],
			callback: async (event) => {
				const lightControls = [
					{ id: 'btns', cmd: ControlCommands.ButtonsBacklightIntensity },
					{ id: 'leds', cmd: ControlCommands.ButtonsLEDIntensity },
					{ id: 'meters', cmd: ControlCommands.MetersIntensity },
					{ id: 'rgbleds', cmd: ControlCommands.ColorLEDIntensity },
					{ id: 'chlcds', cmd: ControlCommands.ChannelLCDIntensity },
					{ id: 'chlcdctr', cmd: ControlCommands.ChannelLCDContrast },
					{ id: 'chedit', cmd: ControlCommands.ChannelStripIntensity },
					{ id: 'main', cmd: ControlCommands.TouchscreenIntensity },
					{ id: 'glow', cmd: ControlCommands.UnderConsoleLightIntensity },
					{ id: 'patch', cmd: ControlCommands.PatchPanelLightIntensity },
					{ id: 'lamp', cmd: ControlCommands.LampLightIntensity },
				]

				for (const control of lightControls) {
					const value = ActionUtil.getStringWithVariables(event, control.id)
					if (value !== undefined && value !== null && value !== '') {
						const intensity = parseFloat(value)
						if (!isNaN(intensity)) {
							const cmd = control.cmd()
							ActionUtil.runTransition(cmd, control.id, event, state, self.transitions, intensity, false)
						}
					}
				}
			},
			subscribe: () => {
				ensureLoaded(ControlCommands.ButtonsBacklightIntensity())
				ensureLoaded(ControlCommands.ButtonsLEDIntensity())
				ensureLoaded(ControlCommands.MetersIntensity())
				ensureLoaded(ControlCommands.ColorLEDIntensity())
				ensureLoaded(ControlCommands.ChannelLCDIntensity())
				ensureLoaded(ControlCommands.ChannelLCDContrast())
				ensureLoaded(ControlCommands.ChannelStripIntensity())
				ensureLoaded(ControlCommands.TouchscreenIntensity())
				ensureLoaded(ControlCommands.UnderConsoleLightIntensity())
				ensureLoaded(ControlCommands.PatchPanelLightIntensity())
				ensureLoaded(ControlCommands.LampLightIntensity())
			},
		},
	}

	return actions
}
