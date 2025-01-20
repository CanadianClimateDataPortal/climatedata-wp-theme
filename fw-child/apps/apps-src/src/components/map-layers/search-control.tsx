/**
 * @description A React component that integrates the `leaflet-search` plugin with a React Leaflet map.
 * This component allows users to search for locations using the OpenStreetMap Nominatim API and navigate the map to the selected location.
 */

import { useEffect, ReactElement } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { useMap } from 'react-leaflet';
import mapPinIcon from '@/assets/map-pin.svg';
import L from 'leaflet';
import 'leaflet-search/dist/leaflet-search.min.css';
import 'leaflet-search';
import './styles.css';

import { useAppDispatch } from '@/app/hooks';
import { addRecentLocation } from '@/features/map/map-slice';
import {
	SEARCH_PLACEHOLDER,
	SEARCH_DEFAULT_ZOOM,
	SEARCH_COUNTRY_CODE,
	MAP_SEARCH_URL,
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
export default function SearchControl(): ReactElement | null {
	const { __ } = useI18n();

	// defining default placeholder here so that it can be translated
	const textPlaceholder = __(SEARCH_PLACEHOLDER) || '';

	const map = useMap(); // Access the Leaflet map instance from the context.

	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!map) {
			return;
		}

		// Create a new Leaflet Search Control with custom options.
		// @ts-ignore: suppress leaflet typescript error
		const searchControl = new L.Control.Search({
			url: MAP_SEARCH_URL,
			jsonpParam: 'json_callback',
			propertyName: 'display_name',
			propertyLoc: ['lat', 'lon'],
			autoCollapse: false,
			autoType: false,
			minLength: 2,
			textPlaceholder,
			// @ts-ignore: suppress leaflet typescript errors
			marker: L.marker([0, 0], {
				// @ts-ignore: suppress leaflet typescript errors
				icon: L.icon({
					iconUrl: mapPinIcon, // Custom marker icon
					iconSize: [25, 41], // Size of the icon
					iconAnchor: [12, 41], // Anchor of the icon
					popupAnchor: [0, -41], // Popup position relative to the icon
				}),
			}),
			// @ts-ignore: suppress leaflet typescript errors
			moveToLocation: (latlng: L.LatLng, title: string, map: L.Map) => {
				map.setView(latlng, SEARCH_DEFAULT_ZOOM); // Move the map view to the selected location.

				dispatch(
					addRecentLocation({
						title,
						...latlng,
					})
				);
			},
		});

		// Add the search control to the map.
		map.addControl(searchControl);

		// Expand the search control by default for user visibility.
		// @ts-ignore: suppress leaflet typescript errors
		searchControl.expand();

		// Cleanup function to remove the search control when the component unmounts.
		return () => {
			map.removeControl(searchControl);
		};
	}, [map, SEARCH_PLACEHOLDER, SEARCH_DEFAULT_ZOOM, SEARCH_COUNTRY_CODE]);

	// This component does not render any JSX since it directly interacts with the Leaflet map.
	return null;
}
