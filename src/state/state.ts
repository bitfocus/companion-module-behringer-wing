import osc from 'osc'
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
		this.namedChoices.channels = []
		for (let ch = 1; ch <= model.channels; ch++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(ch)) ?? `Channel ${ch}`)
			this.namedChoices.channels.push(
				this.getNameForChoice(ch, Commands.Channel.Node(ch), Commands.Channel.RealName(ch), 'Channel', 'CH'),
			)
		}

		this.namedChoices.auxes = []
		for (let aux = 1; aux <= model.auxes; aux++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(aux)) ?? `Aux ${aux}`)
			this.namedChoices.auxes.push(
				this.getNameForChoice(aux, Commands.Aux.Node(aux), Commands.Aux.RealName(aux), 'Aux', 'A'),
			)
		}

		this.namedChoices.busses = []
		for (let bus = 1; bus <= model.busses; bus++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(bus)) ?? `Bus ${bus}`)
			this.namedChoices.busses.push(
				this.getNameForChoice(bus, Commands.Bus.Node(bus), Commands.Bus.Name(bus), 'Bus', 'B'),
			)
		}

		this.namedChoices.matrices = []
		for (let matrix = 1; matrix <= model.matrices; matrix++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(matrix)) ?? `Matrix ${matrix}`)
			this.namedChoices.matrices.push(
				this.getNameForChoice(matrix, Commands.Matrix.Node(matrix), Commands.Matrix.RealName(matrix), 'Matrix', 'MX'),
			)
		}

		this.namedChoices.mains = []
		for (let main = 1; main <= model.mains; main++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(main)) ?? `Main ${main}`)
			this.namedChoices.mains.push(
				this.getNameForChoice(main, Commands.Main.Node(main), Commands.Main.RealName(main), 'Main', 'M'),
			)
		}

		this.namedChoices.dcas = []
		for (let dca = 1; dca <= model.dcas; dca++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(dca)) ?? `DCA ${dca}`)
			this.namedChoices.dcas.push(
				this.getNameForChoice(dca, Commands.Dca.Node(dca), Commands.Dca.Name(dca), 'DCA', 'DCA'),
			)
		}

		this.namedChoices.mutegroups = []
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(mgrp)) ?? `Mute Group ${mgrp}`)
			this.namedChoices.mutegroups.push(
				this.getNameForChoice(mgrp, Commands.MuteGroup.Node(mgrp), Commands.MuteGroup.Name(mgrp), 'Mute Group', 'MGRP'),
			)
		}
	}

	public requestNames(model: ModelSpec, ensureLoaded: (path: string, arg?: string | number) => void): void {
		for (let ch = 1; ch <= model.channels; ch++) {
			ensureLoaded(Commands.Channel.RealName(ch))
		}
		for (let aux = 1; aux <= model.auxes; aux++) {
			ensureLoaded(Commands.Aux.RealName(aux))
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			ensureLoaded(Commands.Bus.Name(bus))
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			ensureLoaded(Commands.Matrix.RealName(mtx))
		}
		for (let main = 1; main <= model.mains; main++) {
			ensureLoaded(Commands.Main.RealName(main))
		}
		for (let dca = 1; dca <= model.dcas; dca++) {
			ensureLoaded(Commands.Dca.Name(dca))
		}
		for (let mgrp = 1; mgrp <= model.mutegroups; mgrp++) {
			ensureLoaded(Commands.MuteGroup.Name(mgrp))
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
