import { lazy, Suspense, useState } from 'react';

import { type Story, type StoryDefault } from '@ladle/react';

import MapLegendOpenControl from '@/components/map-layers/map-legend-open-control';


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

	const LazyMapLegendInnerS2D = lazy(() => {
		return Promise.all([
			import('@/components/map-layers/map-legend-inner-s2d'),
			new Promise((resolve) => setTimeout(resolve, 800)),
		]).then(([moduleExports]) => moduleExports);
	});

	return (
		<>
			<MapLegendOpenControl
				isOpen={isOpen}
				toggleOpen={toggleOpen}
			>
				<Suspense fallback="...">
					<LazyMapLegendInnerS2D />
				</Suspense>
			</MapLegendOpenControl>
		</>
	);
};

StoryBravo.storyName = 'With something inside';
