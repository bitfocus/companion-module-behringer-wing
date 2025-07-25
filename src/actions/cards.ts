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
import { GetDropdown, GetNumberField } from '../choices/common.js'

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
	const send = self.sendCommand

	const actions: { [id in CardsActionId]: CompanionActionWithCallback | undefined } = {
		[CardsActionId.SetLink]: {
			name: 'WLive: Set Link',
			description: 'Set whether the USB cards should be linked or unlinked.',
			options: [GetDropdown('Link', 'link', getCardsLinkChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveSDLink()
				send(cmd, event.options.link as string)
			},
		},
		[CardsActionId.SetAutoInput]: {
			name: 'WLive: Set Auto Input',
			description: 'Set which cards should be used for auto input selection.',
			options: [GetDropdown('Selection', 'selection', getCardsAutoInChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoIn()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.SetAutoStop]: {
			name: 'WLive: Set Auto Stop',
			description: 'Set input actions on stop',
			options: [GetDropdown('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoStop()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.SetAutoPlay]: {
			name: 'WLive: Set Auto Play',
			description: 'Set input actions on play',
			options: [GetDropdown('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoPlay()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.SetAutoRecord]: {
			name: 'WLive: Set Auto Record',
			description: 'Set input actions on record',
			options: [GetDropdown('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoRecord()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.CardAction]: {
			name: 'WLive: Card Action',
			description: 'Start, stop, pause or record on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetDropdown('Action', 'action', getCardsActionChoices()),
			],
			callback: async (event) => {
				const cmd = Commands.WLiveCardControl(event.options.card as number)
				send(cmd, event.options.action as string)
			},
		},
		[CardsActionId.OpenSession]: {
			name: 'WLive: Open Session',
			description: 'Open a session on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetNumberField('Session Number', 'session', 1, 100, 1, 1),
			],
			callback: async (event) => {
				const cmd = Commands.WLiveCardOpenSession(event.options.card as number)
				send(cmd, event.options.session as number)
			},
		},
		[CardsActionId.DeleteSession]: {
			name: 'WLive: Delete Session',
			description: 'Delete a session on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetNumberField('Session Number', 'session', 1, 100, 1, 1),
			],
			callback: async (event) => {
				const cmd = Commands.WLiveCardDeleteSession(event.options.card as number)
				send(cmd, event.options.session as number)
			},
		},
		[CardsActionId.NameSession]: {
			name: 'WLive: Name Session',
			description: 'Name the current session on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				{
					id: 'name',
					type: 'textinput',
					label: 'Session Name',
					default: '',
					tooltip: 'The name to set for the current session on the card.',
					useVariables: true,
				},
			],
			callback: async (event) => {
				const cmd = Commands.WLiveCardNameSession(event.options.card as number)
				send(cmd, event.options.name as string)
			},
		},
		[CardsActionId.SetPosition]: {
			name: 'WLive: Set Position',
			description: 'Set the position of a recording on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetNumberField('Position (ms)', 'position', 0, 36000000, 1, 0),
			],
			callback: async (event) => {
				const cmd = Commands.WLiveCardTime(event.options.card as number)
				send(cmd, event.options.position as number, true)
				const cmd2 = Commands.WLiveCardGotoMarker(event.options.card as number)
				send(cmd2, 101)
			},
		},
		[CardsActionId.AddMarker]: {
			name: 'WLive: Add Marker',
			description: 'Add a marker to a recording on a card.',
			options: [GetDropdown('Card', 'card', getCardsChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveCardSetMarker(event.options.card as number)
				send(cmd, 1)
			},
		},
		[CardsActionId.EditMarker]: {
			name: 'WLive: Edit Marker',
			description: 'Edit a marker in a recording on a card. Sets the marker number to the current position.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetNumberField('Marker Number', 'marker', 1, 100, 1, 1),
			],

			callback: async (event) => {
				const cmd = Commands.WLiveCardEditMarker(event.options.card as number)
				send(cmd, event.options.marker as number)
			},
		},
		[CardsActionId.GotoMarker]: {
			name: 'WLive: Goto Marker',
			description: 'Go to a marker in a recording on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetNumberField('Marker Number', 'marker', 1, 100, 1, 1),
			],

			callback: async (event) => {
				const cmd = Commands.WLiveCardGotoMarker(event.options.card as number)
				send(cmd, event.options.marker as number)
			},
		},
		[CardsActionId.DeleteMarker]: {
			name: 'WLive: Delete Marker',
			description: 'Delete a marker from a recording on a card.',
			options: [
				GetDropdown('Card', 'card', getCardsChoices()),
				GetNumberField('Marker Number', 'marker', 1, 100, 1, 1),
			],

			callback: async (event) => {
				const cmd = Commands.WLiveCardDeleteMarker(event.options.card as number)
				send(cmd, event.options.marker as number)
			},
		},
		[CardsActionId.FormatCard]: {
			name: 'WLive: Format Card',
			description: 'Format (delete all contents) of a card.',
			options: [GetDropdown('Card', 'card', getCardsChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveCardFormat(event.options.card as number)
				send(cmd, 1)
			},
		},
	}

	return actions
}
