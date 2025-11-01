import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import MapLegendInnerS2D from '@/components/map-layers/map-legend-inner-s2d'

export default {
	title: 'Seasonal Decadal Legend',
	decorators: [
		(Component) => (
			<div className="relative">
				<Component />
			</div>
		),
	],
} satisfies StoryDefault;

export const StoryAlpha: Story = () => {
	return (
		<>
			<MapLegendInnerS2D />
		</>
	);
};

StoryAlpha.storyName = 'Using a table';
