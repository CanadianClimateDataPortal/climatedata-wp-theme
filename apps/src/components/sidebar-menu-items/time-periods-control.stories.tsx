
/**
 * WIP Notes during work of starting up work on CLIM-1491:
 *
 * Story for the TimePeriodsControl component, and make sure it behaves correctly and uses the other variations of TimePeriodsControl.
 *
 * DO NOT REMOVE NOTES UNTIL I REMOVE THEM MYSELF.
 *
 * Links:
 * - https://www.radix-ui.com/themes/docs/components/slider
 */

/* eslint-disable */
// @ts-nocheck

import React from 'react';

import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import { store } from '@/app/store';
import { setReleaseDate } from '@/features/s2d/s2d-slice';
import ClimateVariableContext from '@/hooks/use-climate-variable';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import {
	ForecastDisplays,
	S2DFrequencyTypes,
} from '@/types/climate-variable-interface';

import { TimePeriodsControlS2D } from './time-periods-control-s2d';

// Static illustrative data for these stories, in the examples file beside this one.
import {
	EXAMPLE_S2D_CLIMATE_VARIABLE_ID,
	EXAMPLE_S2D_DECADAL_RELEASE_DATE,
} from './time-periods-control.examples';

export default {
	title: 'sidebar-menu-items/time-periods-control',
	decorators: [
		(Component) => (
			<div
				className="relative space-y-[5px]"
			>
				<div className="flex flex-col overflow-hidden overflow-y-auto items-end gap-1 px-2 py-4 bg-white border rounded-md border-cold-grey-3">
					<Component />
				</div>
			</div>
		),
	],
} satisfies StoryDefault;

/**
 * Seed the release date cache, so `useS2D()` inside the real component finds
 * it and never calls the API.
 */
Object.values(S2DFrequencyTypes).forEach((frequency) => {
	store.dispatch(
		setReleaseDate({
			key: `${EXAMPLE_S2D_CLIMATE_VARIABLE_ID}__${frequency}`,
			value: EXAMPLE_S2D_DECADAL_RELEASE_DATE,
		})
	);
});

/**
 * The real TimePeriodsControlS2D, unchanged.
 *
 * The `freq` and `fcastDisp` controls feed the climate variable, as the
 * sidebar's own frequency and forecast display controls do on the portal.
 * Every combination renders from this one story. The args carry the names and
 * values of the Maps page URL parameters (`URL_PARAMS` in `@/lib/url-params`),
 * so `/maps/?freq=decadal-may-sep&fcastDisp=forecast` reads here as
 * `&arg-freq=decadal-may-sep&arg-fcastDisp=forecast`.
 *
 * It needs a ClimateVariableContext value holding an S2DClimateVariable (for
 * `useS2D()`), and a `setDateRange` that feeds the date range back. The
 * release date comes from the store, seeded above. The sidebar is 300px wide
 * on the portal, and the control sits in a list.
 */
export const S2D: Story = ({
	fcastDisp,
	freq,
}) => {
	const [dateRange, setDateRange] = React.useState(undefined);
	const climateVariable = React.useMemo(
		() =>
			new S2DClimateVariable({
				id: EXAMPLE_S2D_CLIMATE_VARIABLE_ID,
				frequency: freq,
				dateRange,
				forecastDisplay: fcastDisp,
			}),
		[
			dateRange,
			fcastDisp,
			freq,
		]
	);

	return (
		<div className="w-[300px]">
			<ul>
				<ClimateVariableContext.Provider
					value={{ climateVariable, setDateRange }}
				>
					<TimePeriodsControlS2D />
				</ClimateVariableContext.Provider>
			</ul>
		</div>
	);
};

S2D.args = {
	fcastDisp: ForecastDisplays.FORECAST,
	freq: S2DFrequencyTypes.DECADAL_ANNUAL,
};

S2D.argTypes = {
	fcastDisp: {
		options: Object.values(ForecastDisplays),
		control: {
			type: 'select',
		},
	},
	freq: {
		options: Object.values(S2DFrequencyTypes),
		control: {
			type: 'select',
		},
	},
};
