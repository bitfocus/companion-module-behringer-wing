import { ModelSpec } from '../models/types.js'
import { VariableDefinition } from './index.js'

export function getStatusVariables(_model: ModelSpec): VariableDefinition[] {
	const variables: VariableDefinition[] = []

	variables.push({ variableId: 'last_msg_received_timestamp', name: 'Last Message Received Timestamp' })
	variables.push({ variableId: 'last_msg_path', name: 'Last Message Path' })
	variables.push({ variableId: 'last_msg_value', name: 'Last Message Value' })

	return variables
}
