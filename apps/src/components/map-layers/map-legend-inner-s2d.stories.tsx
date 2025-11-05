import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import {
	type ColourMap,
	type Locale,
} from '@/types/types';

import {
	LadleMockLocaleProvider,
	createLadleMockLocaleStoryArgTypes,
	type StoryWithLocale,
} from '@/lib/ladle';

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
	data: ColourMap;
}

export const StoryAlpha: Story<MapLegendInnerStory> = ({
	locale = 'en',
	data = FIXTURE_DATA,
}) => {
	return (
		<LadleMockLocaleProvider
			locale={locale as Locale}
			translatedFrench={translatedFrench}
		>
			<MapLegendInnerS2D data={data} />
		</LadleMockLocaleProvider>
	);
};

StoryAlpha.storyName = 'Using a table';

StoryAlpha.argTypes = {
	...createLadleMockLocaleStoryArgTypes(),
};

/**
 * Sample data we'd receive from `useColorMap`
 */
const FIXTURE_DATA = {
	colours: [
		'#FFFFFF',
		/* Will get into "Line 1" */
		'#FDD0BB',
		'#FBAD94',
		'#F88B6E',
		'#F26A49',
		'#E54E29',
		'#C73518',


		'#FFFFFF',
		/* Will get into "Line 2" */
		'#E5E5E5',
		'#D0D0D0',
		'#BABABA',
		'#A5A5A5',
		'#8F8F8F',
		'#7A7A7A',


		'#FFFFFF',
		/* Will get into "Line 3" */
		'#D4E8F5',
		'#B5D9EE',
		'#96CAE7',
		'#77BBE0',
		'#58ACD9',
		'#3A9DD2',

	],
	quantities: [
		// Line 1
		1040, 1050, 1060, 1070, 1080, 1090, 1100,
		// Line 2
		2040, 2050, 2060, 2070, 2080, 2090, 2100,
		// Line 3
		3040, 3050, 3060, 3070, 3080, 3090, 3100,
	],
} as ColourMap;
