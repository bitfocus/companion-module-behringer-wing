// import { ModelSpec } from "../models/types.js"
// import { BusSend } from "./bus.js"

import { BooleanLeaf, NumberLeaf, StringLeaf } from './base.js'

// export enum ConnectionGroup {
//     OFF = 'Off',
//     LCL = 'Local',
//     Aux = 'Auxiliary',
//     A = 'AES A',
//     B = 'AES B',
//     C = 'AES C',
// }

// export class InputConnection {
//     group: ConnectionGroup | undefined
//     index: number | undefined
// }

// export class ConnectionNode {
//     main: InputConnection
//     alt: InputConnection

//     constructor() {
//         this.main = new InputConnection()
//         this.alt = new InputConnection()
//     }
// }

// export class Channel {
//     id: number
//     connection: ConnectionNode
//     name: string | undefined
//     fader: number | undefined
//     mute: boolean | undefined
//     busSends: BusSend[] = []

//     constructor(model: ModelSpec, id: number) {
//         this.id = id
//         this.connection = new ConnectionNode()
//         for (let i = 1; i <= model.busses; i++) {
//             this.busSends[i] = new BusSend()
//         }
//     }
// }

export class Channel {
	// flt: Filter;
	mute = new BooleanLeaf('')
	fdr = new NumberLeaf('')
	pan = new NumberLeaf('')
	wid = new NumberLeaf('')
	solo = new BooleanLeaf('')
	name = new StringLeaf('')

	constructor(index: number) {
		const base = `/ch/${index}`
		//   this.flt = new Filter(`${base}/flt`);
		this.mute.path = `${base}/mute`
		this.fdr.path = `${base}/fdr`
		this.pan.path = `${base}/pan`
		this.wid.path = `${base}/wid`
		this.solo.path = `${base}/solo`
		this.name.path = `${base}/name`
	}
}
