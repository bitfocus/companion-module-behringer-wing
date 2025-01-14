import { WingState } from './state.js'

export function getStringFromState(cmd: string, state: WingState): string | undefined {
	const currentState = state.get(cmd)
	if (!currentState || currentState.length === 0) {
		return undefined
	}

	const firstState = currentState[0]

	if (firstState.type === 's') {
		return firstState.value
	}
	return undefined
}

export function storeValueWithKey(cmd: string, state: WingState, value: number | undefined): void {
	const key = `${cmd}`
	if (value !== undefined) {
		state.setPressValue(key, value)
	}
}

export function getValueFromKey(cmd: string, state: WingState): number | undefined {
	const key = `${cmd}`
	const value = state.popPressValue(key)
	return value
}

export function getNumberFromState(cmd: string, state: WingState): number | undefined {
	const currentState = state.get(cmd)

	if (!currentState || currentState.length === 0) {
		return undefined
	}

	const firstState = currentState[0]

	if (firstState.type === 'f' || firstState.type === 'i') {
		return firstState.value
	}

	if (firstState.type === 's') {
		const numericValue = parseFloat(firstState.value)
		return isNaN(numericValue) ? undefined : numericValue
	}

	return undefined
}

export function storeValueForCommand(cmd: string, state: WingState): void {
	const value = getNumberFromState(cmd, state)
	storeValueWithKey(cmd, state, value)
}

export function restoreValueForCommand(cmd: string, state: WingState): number | undefined {
	return getValueFromKey(cmd, state)
}
