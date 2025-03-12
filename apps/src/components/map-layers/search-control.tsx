/**
 * @description A React component that integrates the `leaflet-search` plugin with a React Leaflet map.
 * This component allows users to search for locations using the OpenStreetMap Nominatim API and navigate the map to the selected location.
 */

import { useState, useEffect, ReactElement, useCallback, useMemo } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { Locate, LocateFixed } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { nanoid } from 'nanoid';

import L from 'leaflet';
import 'leaflet-search/dist/leaflet-search.min.css';
import 'leaflet-search';
import mapPinIcon from '@/assets/map-pin.svg';

import { useAppDispatch } from '@/app/hooks';
import { addRecentLocation } from '@/features/map/map-slice';
import { cn } from '@/lib/utils';
import {
	SearchControlLocationItem,
	SearchControlResponse,
} from '@/types/types';
import {
	SEARCH_PLACEHOLDER,
	SEARCH_DEFAULT_ZOOM,
	LOCATION_SEARCH_ENDPOINT,
} from '@/lib/constants.ts';

/**
 * SearchControl Component
 * ---------------------------
 * A React component that adds a search control to a Leaflet map using the `leaflet-search` plugin.
 *
 * @returns {ReactElement | null} The rendered component (or null if not used within a map context).
 *
 * @example
 * <SearchControl />
 */
export default function SearchControl({
	className,
}: {
	className?: string;
}): ReactElement | null {
	const [isGeolocationEnabled, setIsGeolocationEnabled] =
		useState<boolean>(false);
	const [isTracking, setIsTracking] = useState<boolean>(false);

	const { __ } = useI18n();

	// we need a unique id for the search control container for cases where multiple maps
	// are rendered on the same page -- ie. comparing emission scenarios
	const searchControlId = useMemo(() => nanoid(), []);

	// defining default placeholder here so that it can be translated
	const textPlaceholder = __(SEARCH_PLACEHOLDER) || '';

	const map = useMap();

	const dispatch = useAppDispatch();

	const handleLocationChange = useCallback(
		(title: string, latlng: L.LatLng) => {
			map.setView(latlng, SEARCH_DEFAULT_ZOOM);

			dispatch(
				addRecentLocation({
					title,
					...latlng,
				})
			);
		},
		[map, dispatch]
	);

	const toggleGeoLocation = () => {
		if (!navigator.geolocation) {
			// TODO: what do do if geolocation is not supported?
			alert(__('Geolocation is not supported by your browser.'));
			return;
		}

		if (!isGeolocationEnabled) {
			setIsTracking(true);

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;

					handleLocationChange(
						__('Your current location'),
						L.latLng(latitude, longitude)
					);

					setIsGeolocationEnabled(true);
					setIsTracking(false);
				},
				(err) => {
					setIsTracking(false);

					console.error('Error fetching geolocation:', err);
					// TODO: what do do if geolocation fails?
					alert(__('Unable to retrieve your location.'));
				}
			);
		} else {
			setIsGeolocationEnabled(false);
		}
	};

	const geolocationIconClass = cn(
		'w-4 h-4',
		isGeolocationEnabled ? 'text-white' : 'text-zinc-900',
		isTracking ? 'animate-ping' : ''
	);

	useEffect(() => {
		if (!map) {
			return;
		}

		// helper function to build the title for a location item, following same format as original implementation
		// eg.: text (term) location, province
		// 	Ottawa (City) Carleton; Russel, Ontario
		// 	Nottawasaga River (River), Simcoe, Ontario
		const buildLocationTitle = (item: SearchControlLocationItem) => {
			const parts = [item.text];

			if (item.term) {
				parts.push(`(${item.term})`);
			}
			if (item.location) {
				parts.push(item.location);
			}

			if (item.province) {
				parts.push(item.province);
			}

			return parts.join(', ');
		};

		// Create a new Leaflet Search Control with custom options.
		// @ts-expect-error: suppress leaflet typescript error
		const searchControl = new L.Control.Search({
			url: LOCATION_SEARCH_ENDPOINT,
			propertyLoc: ['lat', 'lon'],
			collapsed: false,
			autoCollapse: false,
			autoType: false,
			minLength: 2,
			container: searchControlId,
			textPlaceholder,
			formatData: (response: SearchControlResponse) => {
				const formattedData: Record<
					string,
					SearchControlLocationItem & { title: string; loc: number[] }
				> = {};

				response.items.forEach((item: SearchControlLocationItem) => {
					const title = buildLocationTitle(item);
					const loc = [parseFloat(item.lat), parseFloat(item.lon)];
					formattedData[title] = {
						...item,
						title, // explicitly set the title to make moving to a location be able to store the title to recent locations
						loc,
					};
				});

				return formattedData;
			},
			buildTip: (_: string, item: SearchControlLocationItem) => {
				void _; // intentionally ignore to suppress typescript error
				return `<div>${buildLocationTitle(item)}</div>`;
			},
			marker: L.marker([0, 0], {
				icon: L.icon({
					iconUrl: mapPinIcon, // Custom marker icon
					iconSize: [25, 41], // Size of the icon
					iconAnchor: [12, 41], // Anchor of the icon
					popupAnchor: [0, -41], // Popup position relative to the icon
				}),
			}),
			moveToLocation: (latlng: L.LatLng, title: string, _: L.Map) => {
				void _; // intentionally ignore to suppress typescript error
				handleLocationChange(title, latlng);
			},
		});

		map.addControl(searchControl);

		return () => {
			map.removeControl(searchControl);
		};
	}, [map, handleLocationChange, searchControlId, textPlaceholder]);

	return (
		<div
			className={cn(
				'search-control absolute top-24 left-4 z-20 flex items-center space-x-1',
				className
			)}
		>
			<div
				id={searchControlId}
				className="border border-gray-300 shadow-md inline-block [&_input]:leading-5 [&_input]:placeholder:text-neutral-grey-medium"
			/>
			<div
				className={cn(
					'shadow-md',
					'transition-colors duration-300 ease-out',
					isGeolocationEnabled ? 'bg-brand-blue' : 'bg-white'
				)}
			>
				<button
					className="w-10 h-10 flex items-center justify-center"
					onClick={toggleGeoLocation}
					disabled={isTracking}
				>
					{isGeolocationEnabled ? (
						<LocateFixed className={geolocationIconClass} />
					) : (
						<Locate className={geolocationIconClass} />
					)}
				</button>
			</div>
		</div>
	);
}
