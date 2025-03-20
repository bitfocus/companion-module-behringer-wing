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
import { GetDropdown } from '../choices/common.js'

export enum CardsActionId {
	SetLink = 'set-link',
	SetAutoInput = 'set-auto-input',
	SetAutoStop = 'set-auto-stop',
	SetAutoPlay = 'set-auto-play',
	SetAutoRecord = 'set-auto-record',
	CardAction = 'card-action',
	AddMarker = 'add-marker',
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
			options: [GetDropdown('Selection', 'selection', getCardsAutoInChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoIn()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.SetAutoStop]: {
			name: 'WLive: Set Auto Stop',
			options: [GetDropdown('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoStop()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.SetAutoPlay]: {
			name: 'WLive: Set Auto Play',
			options: [GetDropdown('Selection', 'selection', getCardsAutoRoutingChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveAutoPlay()
				send(cmd, event.options.selection as string)
			},
		},
		[CardsActionId.SetAutoRecord]: {
			name: 'WLive: Set Auto Record',
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
		[CardsActionId.AddMarker]: {
			name: 'WLive: Add Marker',
			description: 'Add a marker to a recording on a card.',
			options: [GetDropdown('Card', 'card', getCardsChoices())],
			callback: async (event) => {
				const cmd = Commands.WLiveCardSetMarker(event.options.card as number)
				send(cmd, 1)
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
