import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'
import * as Commands from '../commands/index.js'

export function getTalkbackVariables(model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	const tbs = ['A', 'B']

	tbs.map((tb) => {
		const upper = tb.toUpperCase()
		const lower = tb.toLowerCase()
		for (let bus = 1; bus <= model.busses; bus++) {
			variables.push({
				variableId: `talkback_${lower}_bus${bus}_assign`,
				name: `Talkback ${upper} to Bus ${bus} assign`,
				path: Commands.Configuration.TalkbackBusAssign(upper, bus),
			})
		}
		for (let mtx = 1; mtx <= model.matrices; mtx++) {
			variables.push({
				variableId: `talkback_${lower}_mtx${mtx}_assign`,
				name: `Talkback ${upper} to Matrix ${mtx} assign`,
				path: Commands.Configuration.TalkbackMatrixAssign(upper, mtx),
			})
		}
		for (let main = 1; main <= model.mains; main++) {
			variables.push({
				variableId: `talkback_${lower}_main${main}_assign`,
				name: `Talkback ${upper} to Matrix ${main} assign`,
				path: Commands.Configuration.TalkbackMainAssign(upper, main),
			})
		}
	})

	return variables
}
