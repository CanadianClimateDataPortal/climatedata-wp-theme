import React from 'react';

import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import {
	LadleMockLocaleProvider,
	createLadleMockLocaleStoryArgTypes,
	type StoryWithLocale,
} from '@/lib/ladle';

import {
	type ColourQuantitiesMap,
} from '@/types/types';

import {
	ForecastTypes,
	type ForecastType,
} from '@/types/climate-variable-interface';

import { EXAMPLE_COLOR_MAP_S2D_MULTIBAND } from '@/hooks/use-color-map.examples';

import MapLegendForecastS2D from '@/components/map-layers/map-legend-forecast-s2d';

const styleForFirstChildOfLegendWrapperLeafletControl: React.CSSProperties = {
	width: 500,
};

export default {
	title: 'map-layers/map-legend-forecast-s2d',
	decorators: [
		(Component) => (
			<div
				className="relative space-y-[5px]"
				style={styleForFirstChildOfLegendWrapperLeafletControl}
			>
				<div className="flex flex-col overflow-hidden overflow-y-auto items-end gap-1 px-2 py-4 bg-white border rounded-md border-cold-grey-3">
					<Component />
				</div>
			</div>
		),
	],
} satisfies StoryDefault;

// Mocked translation specific for this component
const translatedFrench = {
	Probability: 'Probabilité',
	Above: 'Au-dessus',
	Near: 'Près de',
	Below: 'En dessous',
};

interface MapLegendInnerStory extends StoryWithLocale {
	translatedFrench: Record<string, string>;
	data: ColourQuantitiesMap;
	forecastType?: ForecastType;
	variableName?: string | null;
}

export const StoryAlpha: Story<MapLegendInnerStory> = ({
	data,
	forecastType,
	locale,
	translatedFrench,
	variableName = null,
}) => {
	return (
		<LadleMockLocaleProvider
			locale={locale}
			translatedFrench={translatedFrench}
		>
			<MapLegendForecastS2D
				data={data}
				forecastType={forecastType}
				variableName={variableName}
			/>
		</LadleMockLocaleProvider>
	);
};

StoryAlpha.storyName = 'Default';

StoryAlpha.args = {
	data: EXAMPLE_COLOR_MAP_S2D_MULTIBAND,
	forecastType: ForecastTypes.EXPECTED,
	locale: 'en',
	translatedFrench,
	variableName: 'Air Temperature',
};

StoryAlpha.argTypes = {
	...createLadleMockLocaleStoryArgTypes(),
	forecastType: {
		options: Object.values(ForecastTypes),
		control: {
			type: 'select',
		},
	},
};
