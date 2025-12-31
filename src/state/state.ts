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

		for (let ch = 1; ch <= model.channels; ch++) {
			self.sendCommand(Commands.Channel.RealName(ch))
		}
		for (let aux = 1; aux <= model.auxes; aux++) {
			self.sendCommand(Commands.Aux.RealName(aux))
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			self.sendCommand(Commands.Bus.Name(bus))
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			self.sendCommand(Commands.Matrix.RealName(mtx))
		}
		for (let main = 1; main <= model.mains; main++) {
			self.sendCommand(Commands.Main.RealName(main))
		}
		for (let dca = 1; dca <= model.dcas; dca++) {
			self.sendCommand(Commands.Dca.Name(dca))
		}
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			self.sendCommand(Commands.MuteGroup.Name(mgrp))
		}
	}

	public async requestAllVariables(self: WingInstance): Promise<void> {
		const model = self.model
		const sleep = async (ms: number): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, ms))

		// Desk/system status
		self.sendCommand(Commands.Io.MainAltSwitch())

		// Control Status: Sends on Fader mode and Selected strip
		self.sendCommand(`${Commands.Control.StatusNode()}/sof`)
		self.sendCommand(`${Commands.Control.StatusNode()}/selidx`)

		// Control Library: Active show/scene and scene list
		self.sendCommand(Commands.Control.LibraryActiveShowName())
		self.sendCommand(Commands.Control.LibraryActiveSceneIndex())
		self.sendCommand(Commands.Control.LibraryActiveSceneName())
		// Trigger library content listing (includes $scenes list)
		self.sendCommand(Commands.Control.LibraryNode(), '?')

		// USB Player/Recorder
		self.sendCommand(Commands.UsbPlayer.PlayerActiveState())
		self.sendCommand(Commands.UsbPlayer.PlayerActiveFile())
		self.sendCommand(Commands.UsbPlayer.PlayerPosition())
		self.sendCommand(Commands.UsbPlayer.PlayerTotalTime())
		self.sendCommand(Commands.UsbPlayer.PlayerRepeat())

		self.sendCommand(Commands.UsbPlayer.RecorderActiveState())
		self.sendCommand(Commands.UsbPlayer.RecorderActiveFile())
		self.sendCommand(Commands.UsbPlayer.RecorderTime())

		// Wing Live SD Cards general link status
		self.sendCommand(Commands.Cards.WLiveActLink())
		self.sendCommand(Commands.Cards.WLiveSDLink())

		for (let card = 1; card <= 2; card++) {
			self.sendCommand(Commands.Cards.WLiveCardState(card))
			self.sendCommand(Commands.Cards.WLiveCardSDState(card))
			self.sendCommand(Commands.Cards.WLiveCardSDSize(card))
			self.sendCommand(Commands.Cards.WLiveCardMarkers(card))
			self.sendCommand(Commands.Cards.WLiveCardMarkerPosition(card))
			self.sendCommand(Commands.Cards.WLiveCardSessions(card))
			self.sendCommand(Commands.Cards.WLiveCardSessionPosition(card))
			self.sendCommand(Commands.Cards.WLiveCardMarkerList(card))
			self.sendCommand(Commands.Cards.WLiveCardETime(card))
			self.sendCommand(Commands.Cards.WLiveCardSessionLength(card))
			self.sendCommand(Commands.Cards.WLiveCardSDFree(card))
		}

		// GPIO states
		for (let gpio = 1; gpio <= model.gpio; gpio++) {
			self.sendCommand(Commands.Control.GpioReadState(gpio))
		}

		// Talkback assigns (A and B)
		for (let bus = 1; bus <= model.busses; bus++) {
			await sleep(50)
			self.sendCommand(Commands.Configuration.TalkbackBusAssign('A', bus))
			self.sendCommand(Commands.Configuration.TalkbackBusAssign('B', bus))
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			self.sendCommand(Commands.Configuration.TalkbackMatrixAssign('A', mtx))
			self.sendCommand(Commands.Configuration.TalkbackMatrixAssign('B', mtx))
		}
		for (let main = 1; main <= model.mains; main++) {
			self.sendCommand(Commands.Configuration.TalkbackMainAssign('A', main))
			self.sendCommand(Commands.Configuration.TalkbackMainAssign('B', main))
		}

		// Names are requested elsewhere via state.requestNames

		// Channel strips
		for (let ch = 1; ch <= model.channels; ch++) {
			await sleep(50)
			self.sendCommand(Commands.Channel.InputGain(ch))
			self.sendCommand(Commands.Channel.Mute(ch))
			self.sendCommand(Commands.Channel.Fader(ch))
			self.sendCommand(Commands.Channel.Pan(ch))

			for (let bus = 1; bus <= model.busses; bus++) {
				self.sendCommand(Commands.Channel.SendOn(ch, bus))
				self.sendCommand(Commands.Channel.SendLevel(ch, bus))
				await sleep(50)
				self.sendCommand(Commands.Channel.SendPan(ch, bus))
			}
			for (let main = 1; main <= model.mains; main++) {
				self.sendCommand(Commands.Channel.MainSendOn(ch, main))
				self.sendCommand(Commands.Channel.MainSendLevel(ch, main))
			}
			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				self.sendCommand(Commands.Channel.MatrixSendOn(ch, mtx))
				self.sendCommand(Commands.Channel.MatrixSendLevel(ch, mtx))
				self.sendCommand(Commands.Channel.MatrixSendPan(ch, mtx))
			}
		}

		// Auxes
		for (let aux = 1; aux <= model.auxes; aux++) {
			await sleep(50)
			self.sendCommand(Commands.Aux.InputGain(aux))
			self.sendCommand(Commands.Aux.Mute(aux))
			self.sendCommand(Commands.Aux.Fader(aux))
			self.sendCommand(Commands.Aux.Pan(aux))

			for (let main = 1; main <= model.mains; main++) {
				self.sendCommand(Commands.Aux.MainSendOn(aux, main))
				self.sendCommand(Commands.Aux.MainSendLevel(aux, main))
			}
			for (let bus = 1; bus <= model.busses; bus++) {
				await sleep(50)
				self.sendCommand(Commands.Aux.SendOn(aux, bus))
				self.sendCommand(Commands.Aux.SendLevel(aux, bus))
				self.sendCommand(Commands.Aux.SendPan(aux, bus))
			}
			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				self.sendCommand(Commands.Aux.MatrixSendOn(aux, mtx))
				self.sendCommand(Commands.Aux.MatrixSendLevel(aux, mtx))
				self.sendCommand(Commands.Aux.MatrixSendPan(aux, mtx))
			}
		}

		// Busses
		for (let bus = 1; bus <= model.busses; bus++) {
			await sleep(50)
			self.sendCommand(Commands.Bus.Mute(bus))
			self.sendCommand(Commands.Bus.Fader(bus))
			self.sendCommand(Commands.Bus.Pan(bus))

			for (let main = 1; main <= model.mains; main++) {
				self.sendCommand(Commands.Bus.MainSendOn(bus, main))
				self.sendCommand(Commands.Bus.MainSendLevel(bus, main))
			}
			for (let other = 1; other <= model.busses; other++) {
				if (other === bus) continue
				await sleep(50)
				self.sendCommand(Commands.Bus.SendOn(bus, other))
				self.sendCommand(Commands.Bus.SendLevel(bus, other))
				self.sendCommand(Commands.Bus.SendPan(bus, other))
			}
			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				self.sendCommand(Commands.Bus.MatrixSendOn(bus, mtx))
				self.sendCommand(Commands.Bus.MatrixSendLevel(bus, mtx))
				self.sendCommand(Commands.Bus.MatrixSendPan(bus, mtx))
			}
		}

		// Matrices
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			self.sendCommand(Commands.Matrix.Mute(mtx))
			self.sendCommand(Commands.Matrix.Fader(mtx))
			self.sendCommand(Commands.Matrix.Pan(mtx))
		}

		// Mains
		for (let main = 1; main <= model.mains; main++) {
			await sleep(50)
			self.sendCommand(Commands.Main.Mute(main))
			self.sendCommand(Commands.Main.Fader(main))
			self.sendCommand(Commands.Main.Pan(main))

			for (let mtx = 1; mtx <= model.matrices; mtx++) {
				self.sendCommand(Commands.Main.MatrixSendOn(main, mtx))
				self.sendCommand(Commands.Main.MatrixSendLevel(main, mtx))
				self.sendCommand(Commands.Main.MatrixSendPan(main, mtx))
			}
		}

		// DCAs
		for (let dca = 1; dca <= model.dcas; dca++) {
			self.sendCommand(Commands.Dca.Mute(dca))
			self.sendCommand(Commands.Dca.Fader(dca))
		}

		// Mute Groups
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			// Mute group variables are handled via RE_MUTE
			self.sendCommand(Commands.MuteGroup.Mute(mgrp))
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
