import React from 'react';

import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import {
	type ColourQuantitiesMap,
} from '@/types/types';

import {
	LadleMockLocaleProvider,
	createLadleMockLocaleStoryArgTypes,
	type StoryWithLocale,
} from '@/lib/ladle';

import { EXAMPLE_COLOR_MAP_3_BANDS } from '@/hooks/use-color-map.examples';

import MapLegendInnerS2D from '@/components/map-layers/map-legend-inner-s2d';

const styleForFirstChildOfLegendWrapperLeafletControl: React.CSSProperties = {
	width: 500,
};

export default {
	title: 'Seasonal Decadal Legend',
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
	data: ColourQuantitiesMap;
}

export const StoryAlpha: Story<MapLegendInnerStory> = ({
	locale,
	data,
}) => {
	return (
		<LadleMockLocaleProvider
			locale={locale}
			translatedFrench={translatedFrench}
		>
			<MapLegendInnerS2D data={data} />
		</LadleMockLocaleProvider>
	);
};

StoryAlpha.storyName = 'Using a table';

StoryAlpha.args = {
	data: EXAMPLE_COLOR_MAP_3_BANDS,
	locale: 'en',
};

StoryAlpha.argTypes = {
	...createLadleMockLocaleStoryArgTypes(),
};
