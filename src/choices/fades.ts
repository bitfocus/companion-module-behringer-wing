import { CompanionOptionValues, SomeCompanionActionInputField } from '@companion-module/base'

export const FadeDurationChoice: SomeCompanionActionInputField[] = [
	{
		type: 'number',
		label: 'Fade Duration (ms)',
		id: 'fadeDuration',
		default: 0,
		min: 0,
		step: 10,
		max: 60000,
		tooltip:
			'Set the desired duration of the transition in milliseconds. Be aware that the minimal temporal resolution is defined by the Fader Update Rate setting of the module.',
	},
	{
		type: 'dropdown',
		label: 'Algorithm',
		id: 'fadeAlgorithm',
		default: 'linear',
		choices: [
			{ id: 'linear', label: 'Linear' },
			{ id: 'quadratic', label: 'Quadratic' },
			{ id: 'cubic', label: 'Cubic' },
			{ id: 'quartic', label: 'Quartic' },
			{ id: 'quintic', label: 'Quintic' },
			{ id: 'sinusoidal', label: 'Sinusoidal' },
			{ id: 'exponential', label: 'Exponential' },
			{ id: 'circular', label: 'Circular' },
			{ id: 'elastic', label: 'Elastic' },
			{ id: 'back', label: 'Back' },
			{ id: 'bounce', label: 'Bounce' },
		],
		isVisible: (options: CompanionOptionValues): boolean => {
			return options.fadeDuration != null && (options.fadeDuration as number) > 0
		},
		tooltip: 'Selec the algorithm with which the fade is performed.',
	},
	{
		type: 'dropdown',
		label: 'Fade type',
		id: 'fadeType',
		default: 'ease-in-out',
		choices: [
			{ id: 'ease-in', label: 'Ease-In' },
			{ id: 'ease-out', label: 'Ease-Out' },
			{ id: 'ease-in-out', label: 'Ease-In-Out' },
		],
		isVisible: (options: CompanionOptionValues): boolean => {
			return (
				options.fadeDuration != null &&
				options.fadeAlgorithm != null &&
				(options.fadeDuration as number) > 0 &&
				(options.fadeAlgorithm as string) !== 'linear'
			)
		},
		tooltip: 'Select how to ease your algorithm. Easing avoids abrupt changes in value',
	},
]
