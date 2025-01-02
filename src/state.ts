import osc from 'osc'
import { FeedbackId } from './feedbacks.js'
import { DropdownChoice } from '@companion-module/base'
import { ModelSpec } from './models/types.js'
import { AuxCommands } from './commands/aux.js'
import { getIdLabelPair } from './utils.js'
import { ChannelCommands } from './commands/channel.js'
import { BusCommands } from './commands/bus.js'
import { MatrixCommands } from './commands/matrix.js'
import { MainCommands } from './commands/main.js'

type Names = {
	channels: DropdownChoice[]
	auxes: DropdownChoice[]
	busses: DropdownChoice[]
	matrices: DropdownChoice[]
	mains: DropdownChoice[]
}
export class WingState implements IStoredChannelSubject {
	private readonly data: Map<string, osc.MetaArgument[]>
	private readonly pressStorage: Map<string, number>
	private storedChannel: number
	namedChoices: Names = {
		channels: [],
		auxes: [],
		busses: [],
		matrices: [],
		mains: [],
	}

	constructor(model: ModelSpec) {
		this.data = new Map()
		this.pressStorage = new Map()
		this.storedChannel = 1
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
		// console.log(`Getting ${path}`)
		return this.data.get(path)
	}
	public set(path: string, data: osc.MetaArgument[]): void {
		const key = path
		this.data.set(key, data)
		// console.log(`Setting ${key}`)
	}

	public setPressValue(path: string, value: number): void {
		this.pressStorage.set(path, value)
	}
	public popPressValue(path: string): number | undefined {
		const val = this.pressStorage.get(path)
		if (val !== undefined) this.pressStorage.delete(path)
		return val
	}

	private getNameForChoice(index: number, id: string, nameKey: string, defaultName: string): DropdownChoice {
		const realName = this.get(nameKey)
		const label = realName ? `${index} - ${realName}` : `${defaultName} ${index}`
		return getIdLabelPair(id, label)
	}

	public updateNames(model: ModelSpec): void {
		for (let ch = 1; ch <= model.channels; ch++) {
			this.namedChoices.channels.push(
				this.getNameForChoice(ch, ChannelCommands.Node(ch), ChannelCommands.RealName(ch), 'Channel'),
			)
		}
		for (let aux = 1; aux <= model.auxes; aux++) {
			this.namedChoices.auxes.push(this.getNameForChoice(aux, AuxCommands.Node(aux), AuxCommands.RealName(aux), 'Aux'))
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			this.namedChoices.busses.push(this.getNameForChoice(bus, BusCommands.Node(bus), BusCommands.Name(bus), 'Bus'))
		}
		for (let matrix = 1; matrix <= model.matrices; matrix++) {
			this.namedChoices.matrices.push(
				this.getNameForChoice(matrix, MatrixCommands.Node(matrix), MatrixCommands.RealName(matrix), 'Bus'),
			)
		}
		for (let main = 1; main <= model.mains; main++) {
			this.namedChoices.mains.push(
				this.getNameForChoice(main, MainCommands.Node(main), MainCommands.RealName(main), 'Bus'),
			)
		}
	}

	public requestNames(model: ModelSpec, ensureLoaded: (path: string) => void): void {
		for (let ch = 1; ch <= model.channels; ch++) {
			ensureLoaded(ChannelCommands.RealName(ch))
		}
		for (let aux = 1; aux <= model.auxes; aux++) {
			ensureLoaded(AuxCommands.RealName(aux))
		}
		for (let bus = 1; bus <= model.busses; bus++) {
			ensureLoaded(BusCommands.Name(bus))
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			ensureLoaded(MatrixCommands.RealName(mtx))
		}
		for (let main = 1; main <= model.mains; main++) {
			ensureLoaded(MainCommands.RealName(main))
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

	constructor() {
		this.data = new Map()
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
}

interface IStoredChannelSubject {
	attach(observer: IStoredChannelObserver): void
	detach(observer: IStoredChannelObserver): void
	notify(): void
}

export interface IStoredChannelObserver {
	storedChannelChanged(): void
}
