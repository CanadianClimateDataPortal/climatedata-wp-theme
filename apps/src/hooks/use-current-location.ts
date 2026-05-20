import type { MapLocation } from '@/types/types';
import { useAppSelector } from '@/app/hooks';

export const useCurrentLocation = (): MapLocation | null => {
	const list = useAppSelector(
		(state) => state.map.recentLocations,
	);
	const last = Array.isArray(list) && list.length > 0
		? list[list.length - 1]
		: null;
	return last
		&& typeof last.title === 'string'
		&& last.title.length > 0
		? last
		: null;
};

/**
 * Title of the recentLocations we've selected on the map last.
 *
 * @returns string - title of last item in the `state.map.recentLocations`
 *
 * @example 'Lac Rahin, QC' - After having clicked on the map at coord. `59.866883195210214,-72.89428710937501`
 * @example 'Saint-Anthony-of-Padua, QC' - After having clicked on the map at coord. `45.5111111,-73.5552778`
 * @example 'Point (83.1597, -72.1143)' - After having clicked on the map at coord. `83.15965662857204,-72.11425781250001`
 *
 * @see {@link LocationModalContentProps.title}
 */
export const useCurrentLocationTitle = (): string | null =>
	useCurrentLocation()?.title ?? null;
