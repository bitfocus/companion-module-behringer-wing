import {
	FixupBooleanOrVariablesValueToExpressions,
	FixupNumericOrVariablesValueToExpressions,
	type CompanionMigrationOptionValues,
	type CompanionStaticUpgradeScript,
	type CompanionStaticUpgradeResult,
	type ExpressionOrValue,
	type JsonValue,
} from '@companion-module/base'
import type { WingConfig } from './config.js'

type OptionValue = ExpressionOrValue<JsonValue | undefined> | undefined

/**
 * Action number fields which were textinputs with variable support before v2.4.0 (API v1)
 */
const LegacyNumericTextInputs = [
	'session',
	'position',
	'marker',
	'index',
	'gain',
	'amount_m',
	'amount_ft',
	'amount_ms',
	'amount_samples',
	'sceneId',
]
// 'dim' is a dropdown on other actions, so only convert it where it was a number
const LegacyNumericDimActions = ['set-monitor-pfl-dim', 'talkback-monitor-dim', 'talkback-bus-dim']

/**
 * Convert the text of a legacy `useVariables` textinput into an expression (if it contains variables) or a plain value
 */
function legacyVariableTextToValue(raw: OptionValue, staticValue: OptionValue): OptionValue {
	if (raw === undefined || raw.isExpression) return raw
	const text = typeof raw.value === 'string' ? raw.value : typeof raw.value === 'number' ? String(raw.value) : ''
	if (text.trim() === '-oo') return { isExpression: false, value: -144 }
	const staticType = typeof staticValue?.value
	if (staticType === 'number') return FixupNumericOrVariablesValueToExpressions({ isExpression: false, value: text })
	if (staticType === 'boolean') return FixupBooleanOrVariablesValueToExpressions({ isExpression: false, value: text })
	if (!text.includes('$(')) return { isExpression: false, value: text }
	// Strings with variables: reuse the numeric helper, which turns them into a variable or parseVariables expression
	return FixupNumericOrVariablesValueToExpressions({ isExpression: false, value: text })
}

/**
 * Upgrade the options of a single action/feedback from the v2.3.x "Use Variables" layout to API v2 expressions.
 * Returns true if anything was changed.
 */
function upgradeLegacyVariableOptions(options: CompanionMigrationOptionValues, numericTextInputs: string[]): boolean {
	let changed = false

	// Fader delta percentage mode: the percentage was added directly to the dB value (delta = percent / 100)
	if (options.delta_use_percentage !== undefined) {
		if (options.delta_use_percentage?.value === true) {
			const useVariables = options.delta_use_variables?.value === true
			const percent = useVariables
				? legacyVariableTextToValue(options.delta_percent_variables, { isExpression: false, value: 0 })
				: options.delta_percent
			if (percent?.isExpression) {
				options.delta = { isExpression: true, value: `(${percent.value}) / 100` }
			} else {
				options.delta = { isExpression: false, value: Number(percent?.value ?? 0) / 100 }
			}
			delete options.delta_use_variables
			delete options.delta_variables
		}
		delete options.delta_use_percentage
		delete options.delta_percent
		delete options.delta_percent_variables
		changed = true
	}

	// Send source/destination variables
	if (options.send_src_dest_use_variables !== undefined) {
		if (options.send_src_dest_use_variables?.value === true) {
			options.src = legacyVariableTextToValue(options.send_src_variables, options.src)
			const dest = legacyVariableTextToValue(options.send_dest_variables, options.dest)
			options.dest = dest
			options.mainDest = dest
		}
		delete options.send_src_dest_use_variables
		delete options.send_src_variables
		delete options.send_dest_variables
		changed = true
	}

	// Generic "<id>_use_variables" / "<id>_variables" pairs
	for (const key of Object.keys(options)) {
		if (!key.endsWith('_use_variables')) continue
		const id = key.slice(0, -'_use_variables'.length)
		if (options[key]?.value === true) {
			options[id] = legacyVariableTextToValue(options[`${id}_variables`], options[id])
		}
		delete options[key]
		delete options[`${id}_variables`]
		changed = true
	}

	// Former numeric textinputs which may contain variables
	for (const id of numericTextInputs) {
		const value = options[id]
		if (value === undefined || value.isExpression || typeof value.value !== 'string') continue
		options[id] =
			value.value.trim() === '-oo'
				? { isExpression: false, value: -144 }
				: FixupNumericOrVariablesValueToExpressions(value)
		changed = true
	}

	return changed
}

export const UpgradeScripts: CompanionStaticUpgradeScript<WingConfig>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	// Upgrade RecorderState feedback from advanced to boolean (v2.2.0)
	((_context, props): CompanionStaticUpgradeResult<WingConfig, undefined> => {
		const updatedFeedbacks = []

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'recorder-state') {
				// Convert old advanced feedback with stateText option to new boolean feedback with state option
				updatedFeedbacks.push({
					...feedback,
					// Remove old stateText option and add new state option defaulting to 'REC'
					options: {
						state: { value: 'REC', isExpression: false as const },
					},
				})
			}
		}

		return {
			updatedConfig: {
				...props.config,
				fadeUpdateRate: props.config?.fadeUpdateRate ?? 50,
				statusPollUpdateRate: props.config?.statusPollUpdateRate ?? 3000,
				variableUpdateRate: props.config?.variableUpdateRate ?? 100,
				prefetchVariablesOnStartup: props.config?.prefetchVariablesOnStartup ?? true,
				startupVariableRequestChunkSize: props.config?.startupVariableRequestChunkSize ?? 10,
				startupVariableRequestChunkWait: props.config?.startupVariableRequestChunkWait ?? 100,
				requestTimeout: props.config?.requestTimeout ?? 20,
				panicOnLostRequest: props.config?.panicOnLostRequest ?? false,
				subscriptionInterval: props.config?.subscriptionInterval ?? 9000,
				enableOscForwarding: props.config?.enableOscForwarding ?? false,
				oscForwardingHost: props.config?.oscForwardingHost ?? '',
				oscForwardingPort: props.config?.oscForwardingPort ?? 0,
				debugMode: props.config?.debugMode ?? false,
			},
			updatedActions: [],
			updatedFeedbacks,
		}
	}) satisfies CompanionStaticUpgradeScript<WingConfig>,
	// Convert the v2.3.x "Use Variables" options to API v2 expressions (v2.4.0)
	((_context, props): CompanionStaticUpgradeResult<WingConfig, undefined> => {
		const updatedActions = []
		const updatedFeedbacks = []

		for (const action of props.actions) {
			let changed = false
			// Set SOF used to always turn SOF off when pressed for the selected strip, which is now only done with Toggle enabled
			if (action.actionId === 'set-sof') {
				action.options.toggle = { isExpression: false, value: true }
				changed = true
			}
			const numericIds = LegacyNumericDimActions.includes(action.actionId)
				? [...LegacyNumericTextInputs, 'dim']
				: LegacyNumericTextInputs
			if (upgradeLegacyVariableOptions(action.options, numericIds) || changed) updatedActions.push(action)
		}
		for (const feedback of props.feedbacks) {
			if (upgradeLegacyVariableOptions(feedback.options, [])) updatedFeedbacks.push(feedback)
		}

		return {
			updatedConfig: null,
			updatedActions,
			updatedFeedbacks,
		}
	}) satisfies CompanionStaticUpgradeScript<WingConfig>,
]
