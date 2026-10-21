import { useContext, useEffect, useMemo, useState } from 'react';
import { LocaleContext } from '@/context/locale-provider';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSelectedLocation, setLegendOpen } from '@/features/map/map-slice';
import {
	createFetchRequestInitToRaster,
	createFetchTargetToRasterWithEncodedUrl,
	createSelectedLocationSnapshot,
	installPrepareRasterStub,
	prepareRaster,
	type Window_Fn_Prepare_Raster,
	type SelectedLocationSnapshot,
} from '@/lib/map/image-rastering';
import { getFilenameFromContentDisposition } from '@/lib/download/get-filename-from-content-disposition';
import { useMap } from '@/hooks/use-map';
import { useMapMarker } from '@/hooks/use-map-marker';

import { INTERNAL_URLS } from '@/lib/constants';

export interface UseMapHeaderButtonsDownloadHook {
	downloadDataHref: string;
	imageDownloadButtonWorking: boolean;
	imageDownloadOnClick: () => Promise<void>;
}

export const useMapHeaderButtonsDownload = (
): UseMapHeaderButtonsDownloadHook => {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const localeContext = useContext(LocaleContext);
	const currentLocale = localeContext?.locale || 'en';

	// Get dataset and variable information for download URL
	const dispatch = useAppDispatch();
	const dataset = useAppSelector((state) => state.map.dataset);
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);
	const selectedLocation = useAppSelector(selectSelectedLocation);

	// Map handles `prepareRaster` used to replay the captured popup and marker.
	const { map, comparisonMap } = useMap();
	const { addMarker, clearMarkers } = useMapMarker();

	// Registers `window.$.fn.prepare_raster`, the entry point the screenshot
	// service calls from inside its own headless browser session.
	useEffect(() => {
		window.$ = window.$ || {};
		window.$.fn = window.$.fn || {};

		const prepare_raster: Window_Fn_Prepare_Raster = (
			locationPopupHtml,
			markerLatLon,
		) => {
			dispatch(setLegendOpen(true));
			let payload = undefined;
			if (locationPopupHtml && markerLatLon) {
				payload = {
				 	locationPopupHtml,
					markerLatLon,
				}
			}

			/**
			 * Do not signal readiness after a preparation failure. We let its wait time out.
			 */
			prepareRaster(payload, { map, comparisonMap, addMarker, clearMarkers })
				.catch((error) => {
					console.error('prepareRaster failed:', error);
				});
		}
		window.$.fn.prepare_raster = prepare_raster;

		return () => {
			// Reinstalls the polling stub where the real implementation was.
			// A screenshot-service call arriving after this unmount used to hit a
			// deleted key and crash outright.
			// The stub now captures that call and forwards it once a later mount
			// registers the real implementation again.
			installPrepareRasterStub();
		};
	}, [
		addMarker,
		clearMarkers,
		comparisonMap,
		dispatch,
		map,
	]);

	/**
	 * Handles the click on the "Map" button of `DownloadMapSplitButton`.
	 *
	 * POSTs the current view to the screenshot service, then saves the returned PNG as the downloaded map image.
	 */
	const handleDownloadClick = async () => {
		const mapUrl = new URL(window.location.href);
		// Make sure to remove addition hashes.
		mapUrl.hash = '';

		const fetchTarget = createFetchTargetToRasterWithEncodedUrl(mapUrl.href);

		setIsGenerating(true);

		// No selected location means that no `LocationModal` is open.
		let payload: SelectedLocationSnapshot | undefined = undefined;
		if (selectedLocation !== null) {
			payload = createSelectedLocationSnapshot(selectedLocation);
		}
		const fetchInit = createFetchRequestInitToRaster(payload);

		try {
			const response = await fetch(fetchTarget, fetchInit);
			if (!response.ok) {
				throw new Error(`Map image request failed with status ${response.status}`);
			}

			const blob = await response.blob();
			const objectUrl = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = objectUrl;

			const contentDisposition = response.headers.get('content-disposition');
			// The header reads as null unless the screenshot service lists it in
			// `Access-Control-Expose-Headers`. An empty `download` then lets the browser pick the name.
			const filename = getFilenameFromContentDisposition(contentDisposition);
			anchor.setAttribute('download', filename ?? '');

			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(objectUrl);
		} catch (error) {
			console.error('Failed to download map image:', error);
		} finally {
			setIsGenerating(false);
		}
	};


	// Generate download section URL with dataset and variable parameters
	const getDownloadUrl = useMemo(() => {
		const downloadBaseUrl = INTERNAL_URLS[`download-${currentLocale}`] || '';

		if (!dataset || !climateVariableData || !climateVariableData.id) {
			return downloadBaseUrl;
		}

		return `${downloadBaseUrl}?dataset=${encodeURIComponent(dataset.term_id.toString())}&var=${encodeURIComponent(climateVariableData.id)}`;
	}, [dataset, climateVariableData, currentLocale]);

	return {
		imageDownloadButtonWorking: isGenerating,
		imageDownloadOnClick: handleDownloadClick,
		downloadDataHref: getDownloadUrl,
	}
};
