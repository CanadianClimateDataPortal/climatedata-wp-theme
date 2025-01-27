/**
 * @description A React component that integrates the `leaflet-search` plugin with a React Leaflet map.
 * This component allows users to search for locations using the OpenStreetMap Nominatim API and navigate the map to the selected location.
 */

import { useState, useEffect, ReactElement } from "react";
import { useI18n } from "@wordpress/react-i18n";
import { Locate, LocateFixed } from "lucide-react";
import { useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet-search/dist/leaflet-search.min.css";
import "leaflet-search";
import mapPinIcon from "@/assets/map-pin.svg";

import { useAppDispatch } from "@/app/hooks";
import { addRecentLocation } from "@/features/map/map-slice";
import { cn } from "@/lib/utils";
import {
	SEARCH_PLACEHOLDER,
	SEARCH_DEFAULT_ZOOM,
	MAP_SEARCH_URL,
} from "@/lib/constants.ts";

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
	const [isGeolocationEnabled, setIsGeolocationEnabled] = useState<boolean>(false);
	const [isTracking, setIsTracking] = useState<boolean>(false);

	const { __ } = useI18n();

	// we need a unique id for the search control container for cases where multiple maps
	// are rendered on the same page -- ie. comparing emission scenarios
	const searchControlId = Math.random().toString(36);

	// defining default placeholder here so that it can be translated
	const textPlaceholder = __(SEARCH_PLACEHOLDER) || '';

	const map = useMap();

	const dispatch = useAppDispatch();

	useEffect(() => {
		if (! map) {
			return;
		}

		// Create a new Leaflet Search Control with custom options.
		// @ts-ignore: suppress leaflet typescript error
		const searchControl = new L.Control.Search({
			url: MAP_SEARCH_URL,
			jsonpParam: 'json_callback',
			propertyName: 'display_name',
			propertyLoc: ['lat', 'lon'],
			collapsed: false,
			autoCollapse: false,
			autoType: false,
			minLength: 2,
			container: searchControlId,
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
			moveToLocation: (latlng: L.LatLng, title: string, _: L.Map) => {
				handleLocationChange(title, latlng);
			},
		});

		map.addControl(searchControl);

		return () => {
			map.removeControl(searchControl);
		};
	}, [map]);

	const handleLocationChange = (title: string, latlng: L.LatLng) => {
		map.setView(latlng, SEARCH_DEFAULT_ZOOM);

		dispatch(
			addRecentLocation({
				title,
				...latlng,
			})
		);
	}

	const toggleGeoLocation = () => {
		if (! navigator.geolocation) {
			// TODO: what do do if geolocation is not supported?
			alert(__('Geolocation is not supported by your browser.'));
			return;
		}

		if (! isGeolocationEnabled) {
			setIsTracking(true);

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;

					// TODO: what to use as title here, and do we update the search control input box with this latlng?
					handleLocationChange(
						__('Your current location'),
						L.latLng(latitude, longitude)
					);

					setIsGeolocationEnabled(true);
					setIsTracking(false)
				},
				(err) => {
					setIsTracking(false);

					console.error('Error fetching geolocation:', err);
					// TODO: what do do if geolocation fails?
					alert(__('Unable to retrieve your location.'));
				}
			);
		}
		else {
			setIsGeolocationEnabled(false);
		}
	}

	const geolocationIconClass = cn(
		'w-4 h-4',
		isGeolocationEnabled ? 'text-white' : 'text-zinc-900',
		isTracking ? 'animate-ping' : '',
	);

	return (
		<div className="search-control absolute top-24 left-4 z-[9999] flex items-center space-x-1">
			<div id={searchControlId} className="border border-gray-300 shadow-md inline-block" />
			<div
				className={cn(
					'bg-white shadow-md',
					'transition-colors duration-300 ease-out',
					isGeolocationEnabled ? 'bg-brand-blue' : 'bg-white',
				)}
			>
				<button className="w-10 h-10 flex items-center justify-center" onClick={toggleGeoLocation} disabled={isTracking}>
					{isGeolocationEnabled
						? <LocateFixed className={geolocationIconClass} />
						: <Locate className={geolocationIconClass} />
					}
				</button>
			</div>
		</div>
	);
}
