import { Suspense, useState } from 'react';

import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import { createDelayedComponent } from '@/lib/ladle/delayed-component';

import MapLegendOpenControl from '@/components/map-layers/map-legend-open-control';

const SomethingInside = () => (
	<>
		<img src="https://placecats.com/500/400" />
	</>
);

export default {
	title: 'Map Legend Open Control!',
	// https://ladle.dev/docs/decorators
	decorators: [
		(Component) => (
			<div className="relative">
				<Component />
			</div>
		),
	],
} satisfies StoryDefault;

/**
 * With Nothing
 */
export const StoryAlpha: Story = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toggleOpen = () => setIsOpen((prev) => !prev);

	return (
		<>
			<MapLegendOpenControl
				isOpen={isOpen}
				toggleOpen={toggleOpen}
			/>
		</>
	);
};
StoryAlpha.storyName = 'With nothing inside';

/**
 * With Some Lazy component
 */
export const StoryBravo: Story = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toggleOpen = () => setIsOpen((prev) => !prev);

	const DelayedComponent = createDelayedComponent(SomethingInside, 1000);

	const maxLegendWidth = MapLegendOpenControl.maxLegendWidth ?? 900;

	return (
		<div
			style={{
				width: maxLegendWidth,
			}}
			className="p-5 bg-neutral-grey-light"
		>
			<MapLegendOpenControl
				isOpen={isOpen}
				toggleOpen={toggleOpen}
			>
				<Suspense fallback="...">
					<DelayedComponent />
				</Suspense>
			</MapLegendOpenControl>
		</div>
	);
};

StoryBravo.storyName = 'With something inside';
