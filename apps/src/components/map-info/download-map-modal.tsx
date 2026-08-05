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
	installDebugPayloadAccessor,
	installPrepareRasterStub,
	prepareRaster,
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

// Loads `create-raster-debugger.ts` only once someone actually assigns
// `window.mapPrepareRasterPostHttpPayload` — see `install-debug-payload-accessor.ts`.
//
// KNOWN RACE: clicking Download between assigning a payload and the import
// resolving finds `window.mapPrepareRasterPostHttpPayloadDebugger` still
// undefined, so that one click behaves as though debug mode were off.
// The payload survives — the accessor stashes it synchronously — it is
// applied on the next click. A limitation that we will keep that way.
installDebugPayloadAccessor();

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

	// Map handles `prepareRaster` used to replay the captured popup and marker.
	const { map, comparisonMap } = useMap();
	const { addMarker, clearMarkers } = useMapMarker();

	// Used by the Download Image Map server.
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
			// Keep the injected readiness callback when the debugger is absent.
			// We are deliberately not providing a fallback `?? ...`: `resolveSignalReady` always returns a function.
			let signalReady = signalRasterReady;
			if (window.mapPrepareRasterPostHttpPayloadDebugger) {
				signalReady = window.mapPrepareRasterPostHttpPayloadDebugger.resolveSignalReady(signalRasterReady);
			}

			// Do not signal readiness after a preparation failure. We let its wait time out.
			// It means the `.to-raster` className to trigger screenshot and it should have had waited longer.
			prepareRaster(payload, { map, comparisonMap, addMarker, clearMarkers }, signalReady)
				.catch((error) => {
					console.error('prepareRaster failed:', error);
				});
		}
		window.$.fn.prepare_raster = prepare_raster;

		return () => {
			// Reinstalls the polling stub in place of the real implementation.
			// Fixes a genuine defect independent of any registration race: a
			// screenshot-service call arriving after this unmount used to hit
			// a deleted key and crash outright.
			// It is now captured and forwarded once a later mount registers
			// the real implementation again.
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
	 * Handles the click event for the "Download" button from the modal.
	 *
	 * Sends the current map state to the screenshot service.
	 * Uses `createPrepareRasterPostHttpPayload`, unless we've supplied
	 * `window.mapPrepareRasterPostHttpPayloadDebugger` with an override.
	 */
	const handleDownloadClick = async () => {
		const mapUrl = new URL(window.location.href);
		// Make sure to remove addition hashes.
		mapUrl.hash = '';

		if (window.mapPrepareRasterPostHttpPayloadDebugger?.isSetup) {
			// When debugging against another screenshot backend, make HTTP call to that other host.
			// fixUrlHost rewrites mapUrl's host in place, so the POST below travels cross-origin.
			// That is the debugger's own intended behavior — it exists to target a different
			// screenshot-service deployment than the same-origin proxy this fetchTarget otherwise reaches.
			window.mapPrepareRasterPostHttpPayloadDebugger?.fixUrlHost(mapUrl);
		}

		// The encoded target sends this request straight to the screenshot service.
		// A same-origin PHP proxy answering `POST /maps/` and `POST /cartes/` also exists
		// (`framework/resources/functions/map-raster-proxy.php`), and it derives both path
		// and query string from the request URI, so posting to `mapUrl.href` would carry
		// everything it needs and make this encoding step unnecessary.
		// That proxy returns 503 until its backend is configured, and the configuration
		// flag that lets this call site choose between the two paths is still to come,
		// so this keeps the direct target until that flag exists.
		const fetchTarget = createFetchTargetToRasterWithEncodedUrl(mapUrl.href);

		setIsGenerating(true);

		// No selected location means that no `LocationModal` is open.
		let payload: PrepareRasterPostHttpPayload | undefined = undefined;
		if (selectedLocation !== null) {
			payload = createPrepareRasterPostHttpPayload(selectedLocation);
		}
		// Preserve an explicit undefined debug payload.
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
