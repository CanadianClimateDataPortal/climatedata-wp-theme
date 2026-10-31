//
// CURRENT STATE: ILLUSTRATION
//
// Idea: Module to describe components we want to track if they're visible
//       their current value, the options available.
//

import type { MapState } from '@/types/types';

/**
 * Different type of input has different field options available, current value
 */
export type FieldType = 'enum' | 'checkbox' | 'slider-date';

/**
 * Is the TrackedField currently visible or not.
 * @remark I am unsure if we can track reliably if during a run and a change
 * of value on another field, and react re-rendering constantly, that we'll
 * be able to track whether a component was visible and hidden.
 * So we will have to be consistent in the timing when capturing a snapthot
 * of the state.
 */
export type FieldVisibility = 'currently-visible' | 'currently-hidden';

/**
 * Basic Component
 */
export interface Cmp {
	/**
	 * Name of component
	 * Useful to guide where to look in the code.
	 */
	exportedCmpName: string;
	/**
	 * Which file
	 */
	sourcePath: string;
}

/**
 * Name of a symbol, and the expected boolean value to make it visible
 */
export type VisibilityAffectingSymbolAndExpectation = [string, boolean];

/**
 * What is the Component that imports it
 */
export interface HostCmp extends Cmp {
	/**
	 * Names of boolean test variable to check whether
	 * or not the component should be visible or hidden.
	 * This is a list of keys of variable names
	 * to import from.
	 * Useful to guide where to look in the code
	 *
	 * @remark for example `showEmissionScenariosControl`
	 */
	visibilityConditionalSymbolNames: VisibilityAffectingSymbolAndExpectation[];
}

type BaseHostCmp = Omit<HostCmp, 'visibilityConditionalSymbolNames'>;

/**
 * Which UI State affecting component to track.
 * Where the file is stored, its name, its type.
 * This will allow to know which ones are currently not
 * visible by querying list of items and all expected {@link SEED_FIELDS_TO_TRACK}
 * Purpose is to know which symbols can have an impact on the element to affect its state and visibility.
 */
export interface TrackedField extends Cmp {
	/**
	 * Type of Field to structure how to represent
	 */
	fieldType: FieldType;

	parentNodeDfn?: HostCmp;

	// visibilityAffectingBooleanSymbolNames?: string[];
}

/**
 * Recurring components that mounts many
 */
const AppSideBar: BaseHostCmp = {
	exportedCmpName: 'AppSideBar',
	sourcePath: 'apps/src/components/app-sidebar.tsx',
};

const SidebarInnerProjection: BaseHostCmp = {
	exportedCmpName: 'SidebarInnerProjection',
	sourcePath: 'apps/src/components/sidebar-inner-projection.tsx',
};

/**
 * Where in the store all variables are stored, when/if they are loaded
 */
type VariablesInternalDataType = MapState['variableList']; /* eslint-disable-line */

/**
 * Which Elements in the App that can affect how other elements are displayed?
 * Static information about each field, their type of control with information
 * about where the source is, which component is tracked.
 */
const SEED_FIELDS_TO_TRACK: TrackedField[] = [
	{
		exportedCmpName: 'DatasetsMenuItem',
		sourcePath: 'apps/src/components/sidebar-menu-items/datasets.tsx',
		fieldType: 'enum',
		parentNodeDfn: {
			...AppSideBar,
			visibilityConditionalSymbolNames: [
			],
		},
	},

	{
		exportedCmpName: 'VariablesMenuItem',
		sourcePath: 'apps/src/components/sidebar-menu-items/variables.tsx',
		fieldType: 'enum',
		/**
		 * @see {@link VariablesInternalDataType}
		 */
		parentNodeDfn: {
			...AppSideBar,
			visibilityConditionalSymbolNames: [
			],
		},
	},

	{
		exportedCmpName: 'VersionsDropdown',
		sourcePath:
			'apps/src/components/sidebar-menu-items/versions-dropdown.tsx',
		fieldType: 'enum',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showVersionDropdown', true],
			],
		},
	},

	{
		exportedCmpName: 'ThresholdValuesDropdown',
		sourcePath:
			'apps/src/components/sidebar-menu-items/threshold-values-dropdown.tsx',
		fieldType: 'enum',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showThreshold', true],
			],
		},
	},

	{
		exportedCmpName: 'EmissionScenariosControl',
		sourcePath:
			'apps/src/components/sidebar-menu-items/emission-scenarios-control.tsx',
		fieldType: 'enum',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showEmissionScenariosControl', true],
			],
		},
		childNode: [
	  /**
	   * TODO: Add subfield based on same file
		 * - compare scenarios checkbox (lines: 64-79),
		 *   - `checked={climateVariable?.getScenarioCompare() ?? false}`
		 *   - I've added to element `[data-tracking-url-query="cmp"]`
		 * - compare scenarios, pick a 2nd one (lines 81-91)
		 *   - I've added element `data-tracking-url-query="cmpTo"`
		 *   - visible when `climateVariable?.getScenarioCompare()`
	   */
		]
	},

	{
		exportedCmpName: 'InteractiveRegionsMenuItem',
		sourcePath:
			'apps/src/components/sidebar-menu-items/interactive-regions-menu-item.tsx',
		fieldType: 'enum',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showInteractiveRegionsMenuItem', true],
			],
		}
	},

	{
		exportedCmpName: 'FrequenciesDropdown',
		sourcePath:
			'apps/src/components/sidebar-menu-items/frequencies-dropdown.tsx',
		fieldType: 'enum',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showFrequenciesDropdown', true],
			],
		}
	},

	{
		exportedCmpName: 'TimePeriodsControlForSeaLevel',
		sourcePath:
			'apps/src/components/sidebar-menu-items/time-periods-control-for-sea-level.tsx',
		fieldType: 'slider-date',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showTimePeriodsControl', true],
				["climateVariable?.getId() === 'sea_level'", true],
			],
		}
	},

	{
		exportedCmpName: 'TimePeriodsControl',
		sourcePath:
			'apps/src/components/sidebar-menu-items/time-periods-control.tsx',
		fieldType: 'slider-date',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showTimePeriodsControl', true],
				["climateVariable?.getId() === 'sea_level'", false],
				['isTimePeriodsControlRanged', true],
			],
		}
	},

	{
		exportedCmpName: 'TimePeriodsControlSingle',
		sourcePath:
			'apps/src/components/sidebar-menu-items/time-periods-control-single.tsx',
		fieldType: 'slider-date',
		parentNodeDfn: {
			...SidebarInnerProjection,
			visibilityConditionalSymbolNames: [
				['showTimePeriodsControl', true],
				["climateVariable?.getId() === 'sea_level'", false],
				['isTimePeriodsControlRanged', false],
			],
		}
	},

];

/**
 * Current state of each field
 * Represent a snapthot of the current state
 */
export interface SidebarField {
	cmpName: (typeof SEED_FIELDS_TO_TRACK)[number]['exportedCmpName'];
	/**
	 * What's the label currently displayed in the current language
	 */
	label: string;
	element: Element;
}

/**
 * What's exposed by InstrumentationSidebarMenuItems
 */
export interface CurrentStateMap {
	/**
   * Top most of the stack is the newest location.href
   */
	locationHistory: string[];
	/**
	 * When field is empty, it is not displayed
	 */
	fields: Map<string, SidebarField | null>;
}

const seekFor = (seek: string): TrackedField | null => SEED_FIELDS_TO_TRACK.find(({ exportedCmpName }) => {
	return seek === exportedCmpName;
}) ?? null;

const SEED_FIELDS_NAMES = SEED_FIELDS_TO_TRACK.map(i => i.exportedCmpName);

const refreshAll = () => new Map(
	SEED_FIELDS_NAMES.map(exportedCmpName => [exportedCmpName, null]),
)

class InstrumentationSidebarMenuItems {
	#state: CurrentStateMap;

	get state() {
		return this.#state;
	}

	constructor() {
		this.#state = Object.create(null) as CurrentStateMap;
		this.#state.locationHistory = [document.location.search];
		this.#state.fields = refreshAll();
		this.snap()
	}

	changeLocation(newLocation: string) {
		this.#state.locationHistory.push(newLocation);
	}

	// Re-Run to grab a new snapshot
	snap() {
		// At every snap, make sure we do not forget items, so we have a list of all of them
		const headcount = new Set([ ...SEED_FIELDS_NAMES ]);
		const foo = [...document.querySelectorAll('[data-part]')];
		for (const e of foo) {
			const cmpName = e.getAttribute('data-part') ?? null;
			if (cmpName !== '' && this.#state.fields.has(cmpName ?? '')) {
				headcount.delete(cmpName as string); // Remove the ones we got from the list
				const withStuff: SidebarField = {
					cmpName: cmpName as SidebarField['cmpName'],
					element: e,
					label: e.textContent,
				};
				this.#state.fields.set(cmpName ?? '', withStuff);
			}
		}
		for (const cmpName of headcount) {
			// Reset the ones we lost
			this.#state.fields.set(cmpName, null);
		}
	}

	// Quickly jotted down resolver
	getTrackedFieldDefinition = (
		seek: TrackedField['exportedCmpName'],
	): TrackedField | null => {
		const attempt = seekFor(seek);
		return attempt ?? null;
	}


}

export default (() => {
	let instance: InstrumentationSidebarMenuItems;
	if (!window?.smii) {
		instance = new InstrumentationSidebarMenuItems()
		window.smii = instance;
	} else {
		instance = window.smii;
	}
	return instance;
})()

declare global {
	interface Window {
		smii: InstrumentationSidebarMenuItems;
	}
}
