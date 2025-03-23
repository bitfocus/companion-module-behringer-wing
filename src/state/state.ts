import { FeedbackId } from '../feedbacks.js'
import { DropdownChoice } from '@companion-module/base'
import { ModelSpec } from '../models/types.js'
import { getIdLabelPair } from '../choices/utils.js'
import * as Commands from '../commands/index.js'
import { Channel } from '../state/channel.js'
import { Bus } from './bus.js'
import { OSCLeaf } from './base.js'

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

type t_DataBase = number | string | boolean | undefined
export class WingState implements IStoredChannelSubject {
	private readonly data: Map<string, t_DataBase>
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

	channels: Record<number, Channel> = {}
	busses: Bus[] = []

	constructor(model: ModelSpec) {
		for (let i = 1; i <= model.channels; i++) {
			this.channels[i] = new Channel(i)
		}
		for (let i = 1; i <= model.busses; i++) {
			this.busses[i] = new Bus(model, i)
		}

		this.data = new Map()
		this.pressStorage = new Map()
		this.deltaStorage = new Map()
		this.storedChannel = 1
		this.updateNames(model)
	}

	private getLeaf(path: string): OSCLeaf<t_DataBase> | undefined {
		for (const key of Object.keys(this)) {
			const property = (this as any)[key]
			const leaf = this.findLeafRecursive(property, path)
			if (leaf) return leaf
		}
		return undefined
	}

	public get(path: string): any | undefined {
		const leaf = this.getLeaf(path)
		if (leaf) {
			return leaf.value
		}
		return this.data.get(path)
	}

	public set(path: string, value: t_DataBase): boolean {
		const leaf = this.getLeaf(path)
		if (leaf) {
			leaf.value = value
			return true
		}
		this.data.set(path, value)
		return false
	}

	private findLeafRecursive(obj: any, path: string): OSCLeaf<any> | undefined {
		if (obj instanceof OSCLeaf && obj.getPath() === path) {
			return obj
		}
		if (typeof obj === 'object' && obj !== null) {
			for (const value of Object.values(obj)) {
				const found = this.findLeafRecursive(value, path)
				if (found) return found
			}
		}
		return undefined
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
		const name = this.get(key) as string
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
			this.names.channels.push(this.getRealName(Commands.Channel.RealName(mgrp)) ?? `Mute ${mgrp}`)
			this.namedChoices.mutegroups.push(
				this.getNameForChoice(mgrp, Commands.MuteGroup.Node(mgrp), Commands.MuteGroup.Name(mgrp), 'MuteGroup', 'MGRP'),
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
	public subscribePoll(path: string, feedbackId: string, type: FeedbackId): void {
		this.subscribe(path, feedbackId, type)
		this.pollData.add(path)
	}
	public unsubscribePoll(path: string, feedbackId: string): void {
		this.unsubscribe(path, feedbackId)
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
