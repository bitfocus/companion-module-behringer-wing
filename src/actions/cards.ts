import { CompanionActionDefinitions } from '@companion-module/base'
import { CompanionActionWithCallback } from './common.js'
import { CardsCommands as Commands } from '../commands/cards.js'
import { InstanceBaseExt } from '../types.js'
import { WingConfig } from '../config.js'
import {
	getCardsLinkChoices,
	getCardsAutoInChoices,
	getCardsAutoRoutingChoices,
	getCardsActionChoices,
	getCardsChoices,
} from '../choices/cards.js'
import { GetDropdownWithVariables, GetNumberFieldWithVariables, GetTextFieldWithVariables } from '../choices/common.js'
import { getStringWithVariables, getNumberWithVariables } from './utils.js'

export enum CardsActionId {
	SetLink = 'set-link',
	SetAutoInput = 'set-auto-input',
	SetAutoStop = 'set-auto-stop',
	SetAutoPlay = 'set-auto-play',
	SetAutoRecord = 'set-auto-record',
	CardAction = 'card-action',
	OpenSession = 'open-session',
	DeleteSession = 'delete-session',
	NameSession = 'name-session',
	SetPosition = 'set-position',
	AddMarker = 'add-marker',
	EditMarker = 'edit-marker',
	GotoMarker = 'goto-marker',
	DeleteMarker = 'delete-marker',
	FormatCard = 'format-card',
}

export function createCardsActions(self: InstanceBaseExt<WingConfig>): CompanionActionDefinitions {
	const send = self.connection!.sendCommand.bind(self.connection)

	const actions: { [id in CardsActionId]: CompanionActionWithCallback | undefined } = {
		[CardsActionId.SetLink]: {
			name: 'WLive: Set Link',
			description: 'Set whether the USB cards should be linked or unlinked.',
			options: [...GetDropdownWithVariables('Link', 'link', getCardsLinkChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveSDLink()
				const link = await getStringWithVariables(event, 'link')
				await send(cmd, link)
			},
		},
		[CardsActionId.SetAutoInput]: {
			name: 'WLive: Set Auto Input',
			description: 'Set which cards should be used for auto input selection.',
			options: [...GetDropdownWithVariables('Selection', 'selection', getCardsAutoInChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoIn()
				const selection = await getStringWithVariables(event, 'selection')
				await send(cmd, selection)
			},
		},
		[CardsActionId.SetAutoStop]: {
			name: 'WLive: Set Auto Stop',
			description: 'Set input actions on stop',
			options: [...GetDropdownWithVariables('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoStop()
				const selection = await getStringWithVariables(event, 'selection')
				await send(cmd, selection)
			},
		},
		[CardsActionId.SetAutoPlay]: {
			name: 'WLive: Set Auto Play',
			description: 'Set input actions on play',
			options: [...GetDropdownWithVariables('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoPlay()
				const selection = await getStringWithVariables(event, 'selection')
				await send(cmd, selection)
			},
		},
		[CardsActionId.SetAutoRecord]: {
			name: 'WLive: Set Auto Record',
			description: 'Set input actions on record',
			options: [...GetDropdownWithVariables('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoRecord()
				const selection = await getStringWithVariables(event, 'selection')
				await send(cmd, selection)
			},
		},
		[CardsActionId.CardAction]: {
			name: 'WLive: Card Action',
			description: 'Start, stop, pause or record on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetDropdownWithVariables('Action', 'action', getCardsActionChoices()),
			],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const cmd = Commands.WLiveCardControl(card)
				const action = await getStringWithVariables(event, 'action')
				await send(cmd, action)
			},
		},
		[CardsActionId.OpenSession]: {
			name: 'WLive: Open Session',
			description: 'Open a session on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetNumberFieldWithVariables('Session Number', 'session', 1, 100, 1, 1),
			],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const session = await getNumberWithVariables(event, 'session')
				const cmd = Commands.WLiveCardOpenSession(card)
				await send(cmd, session)
			},
		},
		[CardsActionId.DeleteSession]: {
			name: 'WLive: Delete Session',
			description: 'Delete a session on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetNumberFieldWithVariables('Session Number', 'session', 1, 100, 1, 1),
			],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const session = await getNumberWithVariables(event, 'session')
				const cmd = Commands.WLiveCardDeleteSession(card)
				await send(cmd, session)
			},
		},
		[CardsActionId.NameSession]: {
			name: 'WLive: Name Session',
			description: 'Name the current session on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetTextFieldWithVariables(
					'Session Name',
					'name',
					'',
					'The name to set for the current session on the card.',
				),
			],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const name = await getStringWithVariables(event, 'name')
				const cmd = Commands.WLiveCardNameSession(card)
				await send(cmd, name)
			},
		},
		[CardsActionId.SetPosition]: {
			name: 'WLive: Set Position',
			description: 'Set the position of a recording on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetNumberFieldWithVariables('Position (ms)', 'position', 0, 36000000, 1, 0),
			],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const position = await getNumberWithVariables(event, 'position')
				const cmd = Commands.WLiveCardTime(card)
				await send(cmd, position, true)
				const cmd2 = Commands.WLiveCardGotoMarker(card)
				await send(cmd2, 101)
			},
		},
		[CardsActionId.AddMarker]: {
			name: 'WLive: Add Marker',
			description: 'Add a marker to a recording on a card.',
			options: [...GetDropdownWithVariables('Card', 'card', getCardsChoices())],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const cmd = Commands.WLiveCardSetMarker(card)
				await send(cmd, 1)
			},
		},
		[CardsActionId.EditMarker]: {
			name: 'WLive: Edit Marker',
			description: 'Edit a marker in a recording on a card. Sets the marker number to the current position.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetNumberFieldWithVariables('Marker Number', 'marker', 1, 100, 1, 1),
			],

			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const marker = await getNumberWithVariables(event, 'marker')
				const cmd = Commands.WLiveCardEditMarker(card)
				await send(cmd, marker)
			},
		},
		[CardsActionId.GotoMarker]: {
			name: 'WLive: Goto Marker',
			description: 'Go to a marker in a recording on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetNumberFieldWithVariables('Marker Number', 'marker', 1, 100, 1, 1),
			],

			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const marker = await getNumberWithVariables(event, 'marker')
				const cmd = Commands.WLiveCardGotoMarker(card)
				await send(cmd, marker)
			},
		},
		[CardsActionId.DeleteMarker]: {
			name: 'WLive: Delete Marker',
			description: 'Delete a marker from a recording on a card.',
			options: [
				...GetDropdownWithVariables('Card', 'card', getCardsChoices()),
				...GetNumberFieldWithVariables('Marker Number', 'marker', 1, 100, 1, 1),
			],

			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const marker = await getNumberWithVariables(event, 'marker')
				const cmd = Commands.WLiveCardDeleteMarker(card)
				await send(cmd, marker)
			},
		},
		[CardsActionId.FormatCard]: {
			name: 'WLive: Format Card',
			description: 'Format (delete all contents) of a card.',
			options: [...GetDropdownWithVariables('Card', 'card', getCardsChoices())],
			callback: async (event) => {
				const card = await getNumberWithVariables(event, 'card')
				const cmd = Commands.WLiveCardFormat(card)
				await send(cmd, 1)
			},
		},
	}

	return actions
}
