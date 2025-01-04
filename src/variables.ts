import type { WingInstance } from './index.js'

export function UpdateVariableDefinitions(self: WingInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'variable1', name: 'My first variable' },
		{ variableId: 'variable2', name: 'My second variable' },
		{ variableId: 'variable3', name: 'Another variable' },
	])
}
