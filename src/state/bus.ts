import { ModelSpec } from '../models/types.js'

export class BusSend {
	fader: number | undefined
	mute: boolean | undefined
	pre: boolean | undefined
}

export class Bus {
	id: number
	name: string | undefined
	fader: number | undefined
	mute: boolean | undefined
	sends: BusSend[] = []
	constructor(model: ModelSpec, id: number) {
		this.id = id
		for (let i = 1; i <= model.busses; i++) {
			if (i == this.id) continue
			this.sends[i] = new BusSend()
		}
	}
}
