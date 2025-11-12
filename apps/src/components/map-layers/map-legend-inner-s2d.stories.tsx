import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

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

export const StoryAlpha: Story<StoryWithLocale> = ({ locale = 'en' }) => {
	return (
		<LadleMockLocaleProvider
			locale={locale}
			translatedFrench={translatedFrench}
		>
			<MapLegendInnerS2D />
		</LadleMockLocaleProvider>
	);
};

StoryAlpha.storyName = 'Using a table';

StoryAlpha.argTypes = {
	...createLadleMockLocaleStoryArgTypes(),
};
