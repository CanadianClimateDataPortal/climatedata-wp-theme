/**
 * Download map modal component.
 *
 * A modal component that allows users to download the map as an image.
 *
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { __, LocaleContext } from '@/context/locale-provider';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSelectedLocation, setLegendOpen } from '@/features/map/map-slice';
import {
	createFetchRequestInitOptions,
	createFetchTargetToRasterWithEncodedUrl,
	createPrepareRasterPostHttpPayload,
	prepareRaster,
	PrepareRasterPostHttpPayloadDebugger,
	type Prepare_Raster,
	type PrepareRasterPostHttpPayload,
} from '@/lib/map/image-rastering';
import { useMap } from '@/hooks/use-map';
import { useMapMarker } from '@/hooks/use-map-marker';

// components
import Modal from '@/components/ui/modal';
import {
	ModalSection,
	ModalSectionBlock,
	ModalSectionBlockDescription,
	ModalSectionBlockTitle,
} from '@/components/map-info/modal-section';

import { INTERNAL_URLS } from '@/lib/constants';

let debuggerInstance: null | PrepareRasterPostHttpPayloadDebugger = null;

const DownloadMapModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const localeContext = useContext(LocaleContext);
	const currentLocale = localeContext?.locale || 'en';

	// Get dataset and variable information for download URL
	const dispatch = useAppDispatch();
	const dataset = useAppSelector((state) => state.map.dataset);
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);
	const selectedLocation = useAppSelector(selectSelectedLocation);

	// Map handles `prepareRaster` needs to replay a popup and marker on the
	// screenshot service's browser, which has clicked nothing itself.
	const { map, comparisonMap } = useMap();
	const { addMarker, clearMarkers } = useMapMarker();

	if (debuggerInstance === null) {
		debuggerInstance = new PrepareRasterPostHttpPayloadDebugger();
		window.mapPrepareRasterPostHttpPayloadDebugger = debuggerInstance;
	}

	// Used by the Download Image Map server.
	useEffect(() => {
		// Ensure window.$ and window.$.fn exist
		window.$ = window.$ || {};
		window.$.fn = window.$.fn || {};

		const prepare_raster: Prepare_Raster = (
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
			// Do not signal readiness on failure: a half-prepared page would still get
			// the `to-raster` class and be captured as a silently wrong image. No class
			// means the service's own 10s wait times out instead — a visible failure.
			prepareRaster(payload, { map, comparisonMap, addMarker, clearMarkers })
				.catch((error) => {
					console.error('prepareRaster failed:', error);
				});
		}
		window.$.fn.prepare_raster = prepare_raster;

		return () => {
			// Clean up if needed
			if (window.$?.fn?.prepare_raster) {
				delete window.$.fn.prepare_raster;
			}
		};
	}, [
		addMarker,
		clearMarkers,
		comparisonMap,
		dispatch,
		map,
	]);

	/**
	 * Handles the click event for the "Download" button.
	 *
	 * POSTs to the screenshot service with this browser's own currently-open
	 * popup and selected location (see `createPrepareRasterPostHttpPayload`),
	 * receives the rendered PNG as the response body, and triggers a normal
	 * file download through an object URL — no `window.open`, no message
	 * passing between windows.
	 *
	 * In debug mode (`window.mapPrepareRasterPostHttpPayloadDebugger` set up —
	 * see `create-raster-debugger.ts`), a hand-authored `window.mapPrepareRasterPostHttpPayload`
	 * takes precedence over the live popup/location described above.
	 */
	const handleDownloadClick = async () => {
		const mapUrl = new URL(window.location.href);
		// Make sure to remove addition hashes.
		mapUrl.hash = '';

		if (window.mapPrepareRasterPostHttpPayloadDebugger?.isSetup) {
			// When trying to test another remote screenshot service
			window.mapPrepareRasterPostHttpPayloadDebugger?.fixUrlHost(mapUrl);
		}

		const fetchTarget = createFetchTargetToRasterWithEncodedUrl(mapUrl.href);

		setIsGenerating(true);

		/**
		 * This implies we have no LocationModal opened
		 */
		let payload: PrepareRasterPostHttpPayload | undefined = undefined;
		if (selectedLocation !== null) {
			payload = createPrepareRasterPostHttpPayload(selectedLocation);
		}
		// Not `?? payload`: outside debug mode `resolvePostHttpPayload` already returns
		// `payload` untouched, and inside it `undefined` is a deliberate answer meaning
		// "send no body" — coalescing here would silently reinstate the scrape above.
		if (window.mapPrepareRasterPostHttpPayloadDebugger) {
			payload = window.mapPrepareRasterPostHttpPayloadDebugger.resolvePostHttpPayload(payload);
		}

		const fetchInit = createFetchRequestInitOptions(payload);

		window.mapPrepareRasterPostHttpPayloadDebugger?.preFetchConsoleLog(fetchTarget, fetchInit);

		try {
			const response = await fetch(fetchTarget, fetchInit);
			if (!response.ok) {
				throw new Error(`Map image request failed with status ${response.status}`);
			}

			const blob = await response.blob();
			const objectUrl = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = objectUrl;
			anchor.download = '';
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

	const buttonText = useMemo(() => {
		if (isGenerating) {
			return __('Generating...');
		}

		return (
			<div className="flex items-center gap-2">
				{__('Download')}
				<Download className="w-4 h-4 text-[#FAFAFA] -mt-1" />
			</div>
		);
	}, [
		isGenerating,
	]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalSection className="download-map-modal">
				<ModalSectionBlock>
					<ModalSectionBlockTitle>
						{__('Download image from viewport')}
					</ModalSectionBlockTitle>
					<ModalSectionBlockDescription>
						{__(
							'Your export will showcase your various data options. The map position will be the one you see on your screen.'
						)}
					</ModalSectionBlockDescription>
					<Button
						aria-label={__(
							'Download current map image (opens in a new tab)'
						)}
						className={`inline-flex text-md font-normal leading-6 tracking-[0.8px] uppercase rounded-full px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
							isGenerating ? 'opacity-50 pointer-events-none' : ''
						}`}
						onClick={handleDownloadClick}
					>
						{buttonText}
					</Button>
				</ModalSectionBlock>

				<ModalSectionBlock>
					<ModalSectionBlockTitle>
						{__('Need control over your own data?')}
					</ModalSectionBlockTitle>
					<ModalSectionBlockDescription>
						{__(
							'Head over to the download section where you can select multiple grid cells and personalize more data options.'
						)}
					</ModalSectionBlockDescription>
					<a
						href={getDownloadUrl}
						target="_blank"
						aria-label={__(
							'Go to download sections (opens in a new tab)'
						)}
						className="text-brand-blue font-normal text-md leading-6"
					>
						<div className="flex items-center gap-2 ms-2">
							{__('Go to Download Section')}
							<ExternalLink className="w-4 h-4" />
						</div>
					</a>
				</ModalSectionBlock>
			</ModalSection>
		</Modal>
	);
};
DownloadMapModal.displayName = 'DownloadMapModal';

export default DownloadMapModal;
