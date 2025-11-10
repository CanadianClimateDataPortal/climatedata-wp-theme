import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import {
	type ColourQuantitiesMap,
	type Locale,
} from '@/types/types';

import {
	LadleMockLocaleProvider,
	createLadleMockLocaleStoryArgTypes,
	type StoryWithLocale,
} from '@/lib/ladle';

import { EXAMPLE_COLOR_MAP_DISCRETE_SINGLE } from '@/hooks/use-color-map.examples';

import MapLegendCommon, { type MapLegendCommonProps } from '@/components/map-layers/map-legend-common';

const styleForFirstChildOfLegendWrapperLeafletControl: React.CSSProperties = {
	width: 200,
};

// Mocked translation specific for this component
const translatedFrench = {
	Probability: 'Probabilité',
};

export default {
	title: 'map-layers/map-legend-common',
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

interface MapLegendControlStory extends StoryWithLocale {
	data: ColourQuantitiesMap;
	isDelta: MapLegendCommonProps['isDelta'];
	opacity: MapLegendCommonProps['opacity'];
	title: MapLegendCommonProps['title'];
	tooltipContents: MapLegendCommonProps['tooltipContents'];
	unit: MapLegendCommonProps['unit'];
}

export const StoryAlpha: Story<MapLegendControlStory> = ({
	data = EXAMPLE_COLOR_MAP_DISCRETE_SINGLE,
	isDelta,
	locale = 'en',
	opacity,
	title,
	tooltipContents,
	unit = 'degC',
}) => {
	return (
		<LadleMockLocaleProvider
			locale={locale as Locale}
			translatedFrench={translatedFrench}
		>
			<MapLegendCommon
				data={data}
				isDelta={isDelta}
				opacity={opacity}
				title={title}
				tooltipContents={tooltipContents}
				unit={unit}
			/>
		</LadleMockLocaleProvider>
	);
};

StoryAlpha.storyName = 'Default';



StoryAlpha.args = {
	isDelta: true,
	locale: 'en',
	opacity: 1,
	title: 'Hardcoded Title',
	tooltipContents: 'Hardcoded Tooltip Text Contents',
	unit: 'mm',
};

StoryAlpha.argTypes = {
	...createLadleMockLocaleStoryArgTypes(),
};
