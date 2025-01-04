import { WingTransitions } from '../transitions.js'
import { WingState } from '../state/index.js'
import { CompanionActionInfo, CompanionFeedbackInfo } from '@companion-module/base'
import { Easing } from '../easings.js'

export function getNodeNumber(action: CompanionActionInfo | CompanionFeedbackInfo, id: string): number {
	return action.options[id]?.toString().split('/')[2] as unknown as number
}

export function getNumber(action: CompanionActionInfo, key: string, defaultValue?: number): number {
	const rawVal = action.options[key]
	if (defaultValue !== undefined && rawVal === undefined) {
		return defaultValue
	}
	const val = Number(rawVal)
	if (isNaN(val)) {
		throw new Error(`Invalid option '${key}'`)
	}
	return val
}

const getAlgorithm = (action: CompanionActionInfo, key: string): Easing.algorithm | undefined => {
	const rawVal = action.options[key]
	if (rawVal === undefined) {
		return rawVal
	}
	return rawVal as Easing.algorithm
}

const getCurve = (action: CompanionActionInfo, key: string): Easing.curve | undefined => {
	const rawVal = action.options[key]
	if (rawVal === undefined) {
		return rawVal
	}
	return rawVal as Easing.curve
}

export function getString(action: CompanionActionInfo, key: string, defaultValue?: string): string {
	const rawVal = action.options[key]
	if (defaultValue !== undefined && rawVal === undefined) {
		return defaultValue
	}
	const val = rawVal as string
	return val
}

export function runTransition(
	cmd: string,
	valueId: string,
	action: CompanionActionInfo,
	state: WingState,
	transitions: WingTransitions,
	targetValue?: number,
): void {
	const current = getNumberFromState(cmd, state)
	const target = targetValue ?? getNumber(action, valueId)
	transitions.run(
		cmd,
		current as number,
		target,
		getNumber(action, 'fadeDuration'),
		getAlgorithm(action, 'fadeAlgorithm'),
		getCurve(action, 'fadeType'),
	)
	state.set(cmd, [{ type: 'f', value: target }])
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
