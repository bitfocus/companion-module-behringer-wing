import { WingModel } from '../models/types.js'
import { getDeskModel } from '../models/index.js'
import { WingState } from './state.js'

const model = getDeskModel(WingModel.Full)
const state = new WingState(model)

state.set('/ch/1/fdr', 1.0)
state.set('/ch/1/send/2/fdr', -10.0)
state.set('/ch/1/send/2/fdr', -10.0)
console.log(state.channels[1].fdr.value)
console.log(state.get('/ch/1/send/2/fdr'))
console.log(JSON.stringify(state.channels[1]))
