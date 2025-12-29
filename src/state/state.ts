import osc from 'osc'
import type { WingInstance } from '../index.js'
import { FeedbackId } from '../feedbacks.js'
import { DropdownChoice } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'
import { getIdLabelPair } from '../choices/utils.js'
import * as Commands from '../commands/index.js'

type NameChoices = {
	channels: DropdownChoice[]
	auxes: DropdownChoice[]
	busses: DropdownChoice[]
	matrices: DropdownChoice[]
	mains: DropdownChoice[]
	dcas: DropdownChoice[]
	mutegroups: DropdownChoice[]
	scenes: DropdownChoice[]
}

type Names = {
	channels: string[]
	auxes: string[]
	busses: string[]
	matrices: string[]
	mains: string[]
	dcas: string[]
	mutegroups: string[]
	scenes: string[]
}
export class WingState implements IStoredChannelSubject {
	private readonly data: Map<string, osc.MetaArgument[]>
	private readonly pressStorage: Map<string, number>
	private readonly deltaStorage: Map<string, number>
	private storedChannel: number
	namedChoices: NameChoices = {
		channels: [],
		auxes: [],
		busses: [],
		matrices: [],
		mains: [],
		dcas: [],
		mutegroups: [],
		scenes: [],
	}

	names: Names = {
		channels: [],
		auxes: [],
		busses: [],
		matrices: [],
		mains: [],
		dcas: [],
		mutegroups: [],
		scenes: [],
	}

	sceneNameToIdMap: Map<string, number>

	constructor(model: ModelSpec) {
		this.data = new Map()
		this.pressStorage = new Map()
		this.deltaStorage = new Map()
		this.storedChannel = 1
		this.sceneNameToIdMap = new Map()
		this.updateNames(model)
	}

	// StoredChannelSubject
	private observers: IStoredChannelObserver[] = []

	attach(observer: IStoredChannelObserver): void {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer)
		}
	}
	detach(observer: IStoredChannelObserver): void {
		const observerIndex = this.observers.indexOf(observer)
		if (observerIndex !== -1) {
			this.observers.splice(observerIndex, 1)
		}
	}

	notify(): void {
		for (const observer of this.observers) {
			observer.storedChannelChanged()
		}
	}

	public get(path: string): osc.MetaArgument[] | undefined {
		return this.data.get(path)
	}
	public set(path: string, data: osc.MetaArgument[]): void {
		const key = path
		if (data[0].value == '-oo') {
			data[0] = { type: 'f', value: -140 }
		}
		this.data.set(key, data)
	}

	public setPressValue(path: string, value: number): void {
		this.pressStorage.set(path, value)
	}
	public popPressValue(path: string): number | undefined {
		const val = this.pressStorage.get(path)
		if (val !== undefined) this.pressStorage.delete(path)
		return val
	}

	public storeDelta(path: string, delta: number): void {
		this.deltaStorage.set(path, delta)
	}

	public restoreDelta(path: string): number {
		const delta = this.deltaStorage.get(path)
		this.deltaStorage.delete(path)
		return delta ?? 0
	}

	private getRealName(key: string): string | undefined {
		const name = this.get(key)?.[0]?.value as string
		return name
	}

	private getNameForChoice(
		index: number,
		id: string,
		nameKey: string,
		defaultName: string,
		short_name: string,
	): DropdownChoice {
		const realName = this.getRealName(nameKey)
		const label = realName ? `${short_name}${index} - ${realName}` : `${defaultName} ${index}`
		return getIdLabelPair(id, label)
	}

	public updateNames(model: ModelSpec): void {
		// Reset cached name arrays to avoid unbounded growth between updates
		this.names = {
			channels: [],
			auxes: [],
			busses: [],
			matrices: [],
			mains: [],
			dcas: [],
			mutegroups: [],
			scenes: [],
		}

		this.namedChoices.channels = []
		for (let ch = 1; ch <= model.channels; ch++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(ch)) ?? `Channel ${ch}`)
			this.namedChoices.channels.push(
				this.getNameForChoice(ch, Commands.Channel.Node(ch), Commands.Channel.RealName(ch), 'Channel', 'CH'),
			)
		}

		this.namedChoices.auxes = []
		for (let aux = 1; aux <= model.auxes; aux++) {
			this.names.auxes.push(this.getRealName(Commands.Aux.RealName(aux)) ?? `Aux ${aux}`)
			this.namedChoices.auxes.push(
				this.getNameForChoice(aux, Commands.Aux.Node(aux), Commands.Aux.RealName(aux), 'Aux', 'A'),
			)
		}

		this.namedChoices.busses = []
		for (let bus = 1; bus <= model.busses; bus++) {
			this.names.busses.push(this.getRealName(Commands.Bus.Name(bus)) ?? `Bus ${bus}`)
			this.namedChoices.busses.push(
				this.getNameForChoice(bus, Commands.Bus.Node(bus), Commands.Bus.Name(bus), 'Bus', 'B'),
			)
		}

		this.namedChoices.matrices = []
		for (let matrix = 1; matrix <= model.matrices; matrix++) {
			this.names.matrices.push(this.getRealName(Commands.Matrix.RealName(matrix)) ?? `Matrix ${matrix}`)
			this.namedChoices.matrices.push(
				this.getNameForChoice(matrix, Commands.Matrix.Node(matrix), Commands.Matrix.RealName(matrix), 'Matrix', 'MX'),
			)
		}

		this.namedChoices.mains = []
		for (let main = 1; main <= model.mains; main++) {
			this.names.mains.push(this.getRealName(Commands.Main.RealName(main)) ?? `Main ${main}`)
			this.namedChoices.mains.push(
				this.getNameForChoice(main, Commands.Main.Node(main), Commands.Main.RealName(main), 'Main', 'M'),
			)
		}

		this.namedChoices.dcas = []
		for (let dca = 1; dca <= model.dcas; dca++) {
			this.names.dcas.push(this.getRealName(Commands.Dca.Name(dca)) ?? `DCA ${dca}`)
			this.namedChoices.dcas.push(
				this.getNameForChoice(dca, Commands.Dca.Node(dca), Commands.Dca.Name(dca), 'DCA', 'DCA'),
			)
		}

		this.namedChoices.mutegroups = []
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			this.names.mutegroups.push(this.getRealName(Commands.MuteGroup.Name(mgrp)) ?? `Mute Group ${mgrp}`)
			this.namedChoices.mutegroups.push(
				this.getNameForChoice(mgrp, Commands.MuteGroup.Node(mgrp), Commands.MuteGroup.Name(mgrp), 'Mute Group', 'MGRP'),
			)
		}
	}

	public requestNames(self: WingInstance): void {
		const model = self.model
		console.info('Requesting all names')
		const sendCommand = self.connection!.sendCommand.bind(self.connection)

		for (let ch = 1; ch <= model.channels; ch++) {
			void sendCommand(Commands.Channel.RealName(ch))
		}
		for (let aux = 1; aux <= model.auxes; aux++) {
			void sendCommand(Commands.Aux.RealName(aux))
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			void sendCommand(Commands.Bus.Name(bus))
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			void sendCommand(Commands.Matrix.RealName(mtx))
		}
		for (let main = 1; main <= model.mains; main++) {
			void sendCommand(Commands.Main.RealName(main))
		}
		for (let dca = 1; dca <= model.dcas; dca++) {
			void sendCommand(Commands.Dca.Name(dca))
		}
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			void sendCommand(Commands.MuteGroup.Name(mgrp))
		}
	}

	public requestAllVariables(self: WingInstance): void {
		const model = self.model
		const sendCommand = self.connection!.sendCommand.bind(self.connection)

		// Desk/system status
		void sendCommand(Commands.Io.MainAltSwitch())

		// Control Status: Sends on Fader mode and Selected strip
		void sendCommand(`${Commands.Control.StatusNode()}/sof`)
		void sendCommand(`${Commands.Control.StatusNode()}/selidx`)

		// Control Library: Active show/scene and scene list
		void sendCommand(Commands.Control.LibraryActiveShowName())
		void sendCommand(Commands.Control.LibraryActiveSceneIndex())
		void sendCommand(Commands.Control.LibraryActiveSceneName())
		// Trigger library content listing (includes $scenes list)
		void sendCommand(Commands.Control.LibraryNode(), '?')

		// USB Player/Recorder
		void sendCommand(Commands.UsbPlayer.PlayerActiveState())
		void sendCommand(Commands.UsbPlayer.PlayerActiveFile())
		void sendCommand(Commands.UsbPlayer.PlayerPosition())
		void sendCommand(Commands.UsbPlayer.PlayerTotalTime())
		void sendCommand(Commands.UsbPlayer.PlayerRepeat())

		void sendCommand(Commands.UsbPlayer.RecorderActiveState())
		void sendCommand(Commands.UsbPlayer.RecorderActiveFile())
		void sendCommand(Commands.UsbPlayer.RecorderTime())

		// Wing Live SD Cards general link status
		void sendCommand(Commands.Cards.WLiveActLink())
		void sendCommand(Commands.Cards.WLiveSDLink())

		for (let card = 1; card <= 2; card++) {
			void sendCommand(Commands.Cards.WLiveCardState(card))
			void sendCommand(Commands.Cards.WLiveCardSDState(card))
			void sendCommand(Commands.Cards.WLiveCardSDSize(card))
			void sendCommand(Commands.Cards.WLiveCardMarkers(card))
			void sendCommand(Commands.Cards.WLiveCardMarkerPosition(card))
			void sendCommand(Commands.Cards.WLiveCardSessions(card))
			void sendCommand(Commands.Cards.WLiveCardSessionPosition(card))
			void sendCommand(Commands.Cards.WLiveCardMarkerList(card))
			void sendCommand(Commands.Cards.WLiveCardETime(card))
			void sendCommand(Commands.Cards.WLiveCardSessionLength(card))
			void sendCommand(Commands.Cards.WLiveCardSDFree(card))
		}

		// GPIO states
		for (let gpio = 1; gpio <= model.gpio; gpio++) {
			void sendCommand(Commands.Control.GpioReadState(gpio))
		}

		// Talkback assigns (A and B)
		for (let bus = 1; bus <= model.busses; bus++) {
			void sendCommand(Commands.Configuration.TalkbackBusAssign('A', bus))
			void sendCommand(Commands.Configuration.TalkbackBusAssign('B', bus))
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			void sendCommand(Commands.Configuration.TalkbackMatrixAssign('A', mtx))
			void sendCommand(Commands.Configuration.TalkbackMatrixAssign('B', mtx))
		}
		for (let main = 1; main <= model.mains; main++) {
			void sendCommand(Commands.Configuration.TalkbackMainAssign('A', main))
			void sendCommand(Commands.Configuration.TalkbackMainAssign('B', main))
		}

		// Names are requested elsewhere via state.requestNames

		// Channel strips
		for (let ch = 1; ch <= model.channels; ch++) {
			void sendCommand(Commands.Channel.InputGain(ch))
			void sendCommand(Commands.Channel.Color(ch))
			void sendCommand(Commands.Channel.Mute(ch))
			void sendCommand(Commands.Channel.Fader(ch))
			void sendCommand(Commands.Channel.Pan(ch))

			for (let bus = 1; bus <= model.busses; bus++) {
				void sendCommand(Commands.Channel.SendOn(ch, bus))
				void sendCommand(Commands.Channel.SendLevel(ch, bus))
				void sendCommand(Commands.Channel.SendPan(ch, bus))
			}
			for (let main = 1; main <= model.mains; main++) {
				void sendCommand(Commands.Channel.MainSendOn(ch, main))
				void sendCommand(Commands.Channel.MainSendLevel(ch, main))
			}
			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				void sendCommand(Commands.Channel.MatrixSendOn(ch, mtx))
				void sendCommand(Commands.Channel.MatrixSendLevel(ch, mtx))
				void sendCommand(Commands.Channel.MatrixSendPan(ch, mtx))
			}
		}

		// Auxes
		for (let aux = 1; aux <= model.auxes; aux++) {
			void sendCommand(Commands.Aux.InputGain(aux))
			void sendCommand(Commands.Aux.Color(aux))
			void sendCommand(Commands.Aux.Mute(aux))
			void sendCommand(Commands.Aux.Fader(aux))
			void sendCommand(Commands.Aux.Pan(aux))

			for (let main = 1; main <= model.mains; main++) {
				void sendCommand(Commands.Aux.MainSendOn(aux, main))
				void sendCommand(Commands.Aux.MainSendLevel(aux, main))
			}
			for (let bus = 1; bus <= model.busses; bus++) {
				void sendCommand(Commands.Aux.SendOn(aux, bus))
				void sendCommand(Commands.Aux.SendLevel(aux, bus))
				void sendCommand(Commands.Aux.SendPan(aux, bus))
			}
			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				void sendCommand(Commands.Aux.MatrixSendOn(aux, mtx))
				void sendCommand(Commands.Aux.MatrixSendLevel(aux, mtx))
				void sendCommand(Commands.Aux.MatrixSendPan(aux, mtx))
			}
		}

		// Busses
		for (let bus = 1; bus <= model.busses; bus++) {
			void sendCommand(Commands.Bus.Mute(bus))
			void sendCommand(Commands.Bus.Fader(bus))
			void sendCommand(Commands.Bus.Pan(bus))
			void sendCommand(Commands.Bus.Color(bus))

			for (let main = 1; main <= model.mains; main++) {
				void sendCommand(Commands.Bus.MainSendOn(bus, main))
				void sendCommand(Commands.Bus.MainSendLevel(bus, main))
			}
			for (let other = 1; other <= model.busses; other++) {
				if (other === bus) continue
				void sendCommand(Commands.Bus.SendOn(bus, other))
				void sendCommand(Commands.Bus.SendLevel(bus, other))
				void sendCommand(Commands.Bus.SendPan(bus, other))
			}
			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				void sendCommand(Commands.Bus.MatrixSendOn(bus, mtx))
				void sendCommand(Commands.Bus.MatrixSendLevel(bus, mtx))
				void sendCommand(Commands.Bus.MatrixSendPan(bus, mtx))
			}
		}

		// Matrices
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			void sendCommand(Commands.Matrix.Mute(mtx))
			void sendCommand(Commands.Matrix.Fader(mtx))
			void sendCommand(Commands.Matrix.Pan(mtx))
			void sendCommand(Commands.Matrix.Color(mtx))
		}

		// Mains
		for (let main = 1; main <= model.mains; main++) {
			void sendCommand(Commands.Main.Mute(main))
			void sendCommand(Commands.Main.Fader(main))
			void sendCommand(Commands.Main.Pan(main))
			void sendCommand(Commands.Main.Color(main))

			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				void sendCommand(Commands.Main.MatrixSendOn(main, mtx))
				void sendCommand(Commands.Main.MatrixSendLevel(main, mtx))
				void sendCommand(Commands.Main.MatrixSendPan(main, mtx))
			}
		}

		// DCAs
		for (let dca = 1; dca <= model.dcas; dca++) {
			void sendCommand(Commands.Dca.Mute(dca))
			void sendCommand(Commands.Dca.Fader(dca))
			void sendCommand(Commands.Dca.Color(dca))
		}

		// Mute Groups
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			// Mute group variables are handled via RE_MUTE
			void sendCommand(Commands.MuteGroup.Mute(mgrp))
		}
	}

	public setStoredChannel(channel: number): void {
		this.storedChannel = channel
		this.notify()
	}

	public getStoredChannel(): number {
		return this.storedChannel
	}
}

export class WingSubscriptions {
	private readonly data: Map<string, Map<string, FeedbackId>>
	private readonly pollData: Set<string>

	constructor() {
		this.data = new Map()
		this.pollData = new Set()
	}

	public getFeedbacks(path: string): FeedbackId[] {
		const entries = this.data.get(path)
		if (entries) {
			return Array.from(new Set(entries.values()))
		} else {
			return []
		}
	}
	public subscribe(path: string, feedbackId: string, type: FeedbackId): void {
		let entries = this.data.get(path)
		if (!entries) {
			entries = new Map()
			this.data.set(path, entries)
		}
		entries.set(feedbackId, type)
	}
	public unsubscribe(path: string, feedbackId: string): void {
		const entries = this.data.get(path)
		if (entries) {
			entries.delete(feedbackId)
		}
	}

	public getPollPaths(): string[] {
		return Array.from(this.pollData)
	}
	public subscribePoll(path: string): void {
		this.pollData.add(path)
	}
	public unsubscribePoll(path: string): void {
		this.pollData.delete(path)
	}
}

interface IStoredChannelSubject {
	attach(observer: IStoredChannelObserver): void
	detach(observer: IStoredChannelObserver): void
	notify(): void
}

export interface IStoredChannelObserver {
	storedChannelChanged(): void
}
