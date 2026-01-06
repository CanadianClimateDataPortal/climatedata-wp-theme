/**
 * @description A React component that integrates the `leaflet-search` plugin with a React Leaflet map.
 * This component allows users to search for locations using the OpenStreetMap Nominatim API and navigate the map to the selected location.
 */

import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { __ } from '@/context/locale-provider';
import { Locate, LocateFixed } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { nanoid } from 'nanoid';

import L from 'leaflet';
import 'leaflet-search/dist/leaflet-search.min.css';
import 'leaflet-search';
import mapPinIcon from '@/assets/map-pin.svg';

import { cn, parseLatLon } from '@/lib/utils';
import { fetchLocationByCoords } from '@/services/services';
import { SearchControlLocationItem, SearchControlResponse } from '@/types/types';
import { LOCATION_SEARCH_ENDPOINT, SEARCH_DEFAULT_ZOOM, SEARCH_PLACEHOLDER } from '@/lib/constants';

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
	layerRef,
}: {
	className?: string;
	layerRef?: React.MutableRefObject<any>;
}): ReactElement | null {
	const [isGeolocationEnabled, setIsGeolocationEnabled] =
		useState<boolean>(false);
	const [isTracking, setIsTracking] = useState<boolean>(false);
	const vectorLayer: any = layerRef?.current;

	// we need a unique id for the search control container for cases where multiple maps
	// are rendered on the same page -- ie. comparing emission scenarios
	const searchControlId = useMemo(() => {
		let id = nanoid(); // Generate a normal nanoid

		// Make sure it starts with an alphabetic character
		if (!/^[a-zA-Z]/.test(id)) {
			id = 'a' + id.substring(1);
		}

		return id;
	}, []);

	// defining default placeholder here so that it can be translated
	const textPlaceholder = __(SEARCH_PLACEHOLDER) || '';

	const map = useMap();

	const handleLocationChange = useCallback(
		(latlng: L.LatLng) => {
			// clear all existing markers from the map
			map.eachLayer(layer => {
				if (layer instanceof L.Marker) {
					map.removeLayer(layer);
				}
			});
			map.setView(latlng, SEARCH_DEFAULT_ZOOM);

			// The location will be saved via the click event.
			// see handleClick() in use-map-interactions.tsx.
			if (vectorLayer) {
				vectorLayer.fire('click', {
					latlng: {
						lat: latlng.lat,
						lng: latlng.lng,
					}
				})
			}
		},
		[map, vectorLayer]
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
					const title = __('Your current location');
					handleLocationChange(L.latLng(latitude, longitude));
					L.marker([latitude, longitude], {
						title: title,
						icon: L.icon({
							iconUrl: mapPinIcon, // Custom marker icon
							iconSize: [25, 41], // Size of the icon
							iconAnchor: [12, 41], // Anchor of the icon
							popupAnchor: [0, -41], // Popup position relative to the icon
						}),
					}).addTo(map);

					setIsGeolocationEnabled(true);
					setIsTracking(false);
				},
				(err) => {
					setIsTracking(false);

					console.error('Error fetching geolocation:', err);
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
			propertyLoc: ['lat', 'lng'],
			autoResize: false,
			collapsed: false,
			autoCollapse: false,
			autoType: false,
			minLength: 2,
			container: searchControlId,
			textPlaceholder,
			formatData: (response: SearchControlResponse) => {
				const formattedData: Record<
					string,
					SearchControlLocationItem & { loc: number[]; lng: string; }
				> = {};

				response.items.forEach((item: SearchControlLocationItem) => {
					const title = buildLocationTitle(item);
					const loc = [parseFloat(item.lat), parseFloat(item.lon)];
					formattedData[title] = {
						...item,
						lng: item.lon,
						loc,
					};
				});

				return formattedData;
			},
			buildTip: (_: string, item: SearchControlLocationItem) => {
				void _; // intentionally ignore to suppress typescript error
				return `<div>${buildLocationTitle(item)}</div>`;
			},
			locationNotFound: async function() {
				// If the list of suggestions is still shown, no error message is shown.
				// See #86862
				if (Object.keys(this._recordsCache).length > 0) {
					this.showTooltip(this._recordsCache)
					return;
				}
				// Check if the coordinates are valid if the location is empty.
				const latLng = parseLatLon(this._input.value);
				// If the coordinates are valid, move to that location.
				if (latLng && !latLng.isPartial) {
					// Fetch location data
					const locationByCoords = await fetchLocationByCoords({ lat: latLng.lat, lng: latLng.lon });
					// Trigger show location.
					this.showLocation(locationByCoords, locationByCoords.geo_id);
				}
				else {
					// Show error alert.
					this.showAlert();
				}
			},
			marker: L.marker([0, 0], {
				icon: L.icon({
					iconUrl: mapPinIcon, // Custom marker icon
					iconSize: [25, 41], // Size of the icon
					iconAnchor: [12, 41], // Anchor of the icon
					popupAnchor: [0, -41], // Popup position relative to the icon
				}),
			}).on('click', async (e: L.LayerEvent) => {
				console.log(e);
			}),
			moveToLocation: (latlng: L.LatLng) => {
				handleLocationChange(latlng);
			},
		});

		map.addControl(searchControl);

		// manually trigger search when the input changes.. this fixes the issue where deleting characters doesn't trigger a search
		const searchInput = document.querySelector(`#${searchControlId} input`);
		searchInput?.addEventListener('input', (event) => {
			let value = (event.target as HTMLInputElement).value;
			// Remove a single leading space, if present
			if (value.startsWith(' ')) value = value.slice(1);
			// If two trailing spaces are present, remove one.
			if (value.endsWith('  ') && value.length > 1) value = value.slice(0, -1);
			value = value.replace(/  +/g, '');
			// Count the characters without spaces
			if (value.replace(/ /g, '').length >= 2) {
				searchControl.searchText(value);
			}
		});

		// Dynamically set the input size attribute based on screen width.
		// If the screen is less than 520px wide, set the size to 27 (smaller input).
		// Otherwise, set the size to 48 (default for larger screens).
		function updateInputSize() {
			if (searchInput) {
				if (window.innerWidth < 520) {
					// On smaller screens, set the size to 27 (smaller input).
					searchInput.setAttribute('size', '27');
				}
				else if (window.innerWidth > 520 && window.innerWidth < 882) {
					// On medium-sized screens, set the size to 35 (smaller input).
					searchInput.setAttribute('size', '35');
				} else {
					// On larger screens, set the size to 48 (default for larger screens).
					searchInput.setAttribute('size', '48'); // Or set to your default
				}
			}
		}
		updateInputSize();
		window.addEventListener('resize', updateInputSize);

		return () => {
			map.removeControl(searchControl);
			window.removeEventListener('resize', updateInputSize);
		};
	}, [map, handleLocationChange, searchControlId, textPlaceholder]);

	return (
		<div
			className={cn(
				'search-control absolute top-24 left-6 z-40 flex items-center space-x-1',
				className
			)}
			id='map-search-control'
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
