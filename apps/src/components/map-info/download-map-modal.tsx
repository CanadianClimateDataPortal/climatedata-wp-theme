/**
 * Modal offering an image export of the map the user is currently looking at.
 *
 * "Download" here means that image export, produced by a screenshot service.
 * The Download SPA at `/download`, which exports climate data files, is a
 * separate feature living under `components/download/`.
 *
 * @see `apps/src/lib/map/image-rastering/README.md` for the full round trip.
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { __, LocaleContext } from '@/context/locale-provider';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectSelectedLocation, setLegendOpen } from '@/features/map/map-slice';
import {
	createFetchRequestInitOptions,
	createPrepareRasterPostHttpPayload,
	installDebugPayloadAccessor,
	installPrepareRasterStub,
	prepareRaster,
	resolveRasterFetchTarget,
	signalRasterReady,
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

/**
 * Installs the `window.mapPrepareRasterPostHttpPayload` accessor.
 * Assigning that global a defined value lazy-loads {@link createRasterDebugger},
 * which keeps the debugger out of the main bundle until someone asks for it.
 *
 * KNOWN RACE: a Download click landing between that assignment and the dynamic
 * import resolving still reads `window.mapPrepareRasterPostHttpPayloadDebugger`
 * as undefined, so that one click behaves as though debug mode were off.
 * The payload survives, because the accessor stashes it synchronously, and it
 * applies on the next click.
 * We accept this limitation.
 */
installDebugPayloadAccessor();

const DownloadMapModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const localeContext = useContext(LocaleContext);
	const currentLocale = localeContext?.locale || 'en';

	const dispatch = useAppDispatch();
	// Dataset and variable feed the Download SPA link that `getDownloadUrl` builds.
	const dataset = useAppSelector((state) => state.map.dataset);
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);
	// The open location, whose markup travels in the screenshot service's POST payload.
	const selectedLocation = useAppSelector(selectSelectedLocation);

	// Map handles that `prepareRaster` uses to replay the captured popup and marker.
	const { map, comparisonMap } = useMap();
	const { addMarker, clearMarkers } = useMapMarker();

	// Registers `window.$.fn.prepare_raster`, the entry point the screenshot
	// service calls from inside its own headless browser session.
	useEffect(() => {
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
			// `signalRasterReady` stands as the readiness callback while no debugger is loaded.
			// `resolveSignalReady` always returns a function, so a `?? ...` fallback would be dead code.
			let signalReady = signalRasterReady;
			if (window.mapPrepareRasterPostHttpPayloadDebugger) {
				signalReady = window.mapPrepareRasterPostHttpPayloadDebugger.resolveSignalReady(signalRasterReady);
			}

			// A failed preparation leaves `to-raster` off `#map-root`, so the screenshot
			// service's readiness wait times out instead of firing.
			// Timing out beats capturing a map that never finished preparing.
			prepareRaster(payload, { map, comparisonMap, addMarker, clearMarkers }, signalReady)
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
	 * Handles the click on the modal's "Download" button.
	 *
	 * POSTs the current map view to the screenshot service, then hands the
	 * returned image to the browser as a file download.
	 * The body comes from {@link createPrepareRasterPostHttpPayload}, unless
	 * `window.mapPrepareRasterPostHttpPayloadDebugger` supplies an override.
	 */
	const handleDownloadClick = async () => {
		const mapUrl = new URL(window.location.href);
		// The screenshot service reloads this URL, and the fragment adds nothing it can use.
		mapUrl.hash = '';

		if (window.mapPrepareRasterPostHttpPayloadDebugger?.isSetup) {
			// `fixUrlHost` rewrites `mapUrl`'s host in place, before the fetch target
			// is resolved below, so the POST reaches a different screenshot-service
			// deployment.
			// With the proxy enabled that POST goes cross-origin rather than through
			// the local proxy, which is the point of pointing the debugger elsewhere.
			window.mapPrepareRasterPostHttpPayloadDebugger?.fixUrlHost(mapUrl);
		}

		// The page render sets `window.MAP_RASTER_PROXYPHP_DATA_URL` where the same-origin
		// raster proxy is configured, and `resolveRasterFetchTarget` then posts to the
		// page's own URL; otherwise it falls back to the salted, encoded
		// screenshot-service URL.
		// Round trip and vocabulary: `apps/src/lib/map/image-rastering/README.md`.
		const fetchTarget = resolveRasterFetchTarget(mapUrl, window.MAP_RASTER_PROXYPHP_DATA_URL);

		setIsGenerating(true);

		// A selected location means a `LocationModal` is open, and its markup
		// becomes the payload the service replays.
		let payload: PrepareRasterPostHttpPayload | undefined = undefined;
		if (selectedLocation !== null) {
			payload = createPrepareRasterPostHttpPayload(selectedLocation);
		}
		// `resolvePostHttpPayload` may return undefined on purpose, so its answer
		// replaces the payload outright rather than merging with it.
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
