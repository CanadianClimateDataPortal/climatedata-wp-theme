
/**
 * Stories for the time periods controls of this folder: `time-periods-control.tsx`,
 * `-single.tsx`, `-for-sea-level.tsx` and `-s2d.tsx`. The {@link S2D} story
 * covers {@link TimePeriodsControlS2D}.
 * @see https://www.radix-ui.com/themes/docs/components/slider
 */

import React from 'react';

import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import { store } from '@/app/store';
import { setReleaseDate } from '@/features/s2d/s2d-slice';
import { type ClimateVariableContextType } from '@/context/climate-variable-provider';
import ClimateVariableContext from '@/hooks/use-climate-variable';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import {
	ForecastDisplays,
	S2DFrequencyTypes,
	type ClimateVariableConfigInterface,
	type ForecastDisplay,
	type S2DFrequencyType,
} from '@/types/climate-variable-interface';
import { URL_PARAMS } from '@/lib/url-params';
import { TimePeriodsControlS2D } from './time-periods-control-s2d';
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
 * Story args for {@link S2D}.
 *
 * {@link TimePeriodsControlS2D} varies with the forecast display and the
 * frequency. With the release date, they decide which periods it offers.
 * The app keeps both in its URL, under the {@link URL_PARAMS} keys that the
 * Maps and Download apps share. This type uses the same keys, so a story URL
 * and an app URL use the same names, and each key leads to its definition.
 *
 * The same value has a different name in each layer, and no type links them:
 *
 * | Arg and URL parameter                      | Values and type                                     | Config field      | In the control    |
 * | ------------------------------------------ | --------------------------------------------------- | ----------------- | ----------------- |
 * | `fcastDisp`, `URL_PARAMS.FORECAST_DISPLAY` | {@link ForecastDisplays}, {@link ForecastDisplay}   | `forecastDisplay` | `forecastDisplay` |
 * | `freq`, `URL_PARAMS.FREQUENCY`             | {@link S2DFrequencyTypes}, {@link S2DFrequencyType} | `frequency`       | `frequencyType`   |
 *
 * The config field belongs to {@link ClimateVariableConfigInterface}.
 */
type S2DStoryProps = {
	[URL_PARAMS.FORECAST_DISPLAY]: ForecastDisplay;
	[URL_PARAMS.FREQUENCY]: S2DFrequencyType;
};

/**
 * Renders the real {@link TimePeriodsControlS2D}, so that its variations show
 * for each combination of forecast display and frequency.
 *
 * In the app, `useUrlSync()` reads the URL query parameters named in
 * {@link URL_PARAMS} into the climate variable, and the control reads that
 * variable. Both apps share these parameters.
 * The story args are the same parameters, as {@link S2DStoryProps} declares.
 */
export const S2D: Story<S2DStoryProps> = ({
	fcastDisp,
	freq,
}) => {
	const [
		dateRange,
		setDateRange,
	] = React.useState<string[] | undefined>(undefined);
	const climateVariable = React.useMemo(
		() =>
			new S2DClimateVariable({
				id: EXAMPLE_S2D_CLIMATE_VARIABLE_ID,
				frequency: freq,
				dateRange,
				forecastDisplay: fcastDisp,
			} as ClimateVariableConfigInterface),
		[
			dateRange,
			fcastDisp,
			freq,
		]
	);
	// Only the members the control uses. The app's provider supplies them all.
	const contextValue: Partial<ClimateVariableContextType> = {
		climateVariable,
		setDateRange,
	};

	return (
		<div className="w-[300px]">
			<ul>
				<ClimateVariableContext.Provider
					value={contextValue as ClimateVariableContextType}
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
