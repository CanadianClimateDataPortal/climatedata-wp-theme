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
import { encodeURL } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setRasterMode, setLegendOpen } from '@/features/map/map-slice';
import { type PrepareRasterPostHttpPayload, prepareRaster } from '@/lib/prepare-raster';

// components
import Modal from '@/components/ui/modal';
import {
	ModalSection,
	ModalSectionBlock,
	ModalSectionBlockDescription,
	ModalSectionBlockTitle,
} from '@/components/map-info/modal-section';

import { INTERNAL_URLS } from '@/lib/constants';


// Extend the global Window interface to allow simulation of jQuery-style API.
// This is used to expose a `prepare_raster` function on `$.fn`
declare global {
	interface Window {
		$?: {
			fn?: {
				prepare_raster?: (payload?: PrepareRasterPostHttpPayload) => void;
			};
		};
		URL_ENCODER_SALT: string;
		DATA_URL: string;
	}
}

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

	// Get Salt and Data URL to download Image Map from Server API.
	const salt: string = window.URL_ENCODER_SALT;
	const data_url: string = window.DATA_URL;

	// Used by the Download Image Map server.
	useEffect(() => {
		// Ensure window.$ and window.$.fn exist
		window.$ = window.$ || {};
		window.$.fn = window.$.fn || {};

		/**
		 * The single entry point the server-side screenshot service uses to tell
		 * this page it is about to be photographed.
		 *
		 * It is a closure rather than a bare reference to `prepareRaster` because
		 * entering raster mode is now two things:
		 *
		 * 1. Flip the app into raster mode, so React can render the page as the
		 *    exported image. This is a *set*, never a toggle, so it is safe if
		 *    raster mode is already on (a developer previewing with `?raster=1`).
		 * 2. Run `prepareRaster`, the existing imperative pass that strips chrome
		 *    and fires a `resize` so the map re-lays out.
		 *
		 * **The two are NOT sequential, despite reading that way.** `dispatch` only
		 * schedules a re-render; React commits it after this function has already
		 * returned. So `prepareRaster` — including its `resize` — runs first, and
		 * the raster-mode commit lands afterwards. Today that is harmless, because
		 * nothing renders differently under the flag yet. It stops being harmless
		 * as soon as something does: see the ordering note on the `data-raster`
		 * carrier in `App.tsx`, which has to be resolved then, not here.
		 *
		 * How long the service waits after this returns is defined by the
		 * screenshot service, which lives in another repository. Do not assume a
		 * settle window from this side.
		 *
		 * Keeping the `$.fn.prepare_raster` name is what makes this a zero-change
		 * addition on the service's side — it still evaluates the same expression
		 * it always has. The name is a fake-jQuery shim; this app has no jQuery.
		 */
		window.$.fn.prepare_raster = (payload?: PrepareRasterPostHttpPayload) => {
			dispatch(setLegendOpen(true));
			dispatch(setRasterMode(true));
			prepareRaster(payload);
		};

		return () => {
			// Clean up if needed
			if (window.$?.fn?.prepare_raster) {
				delete window.$.fn.prepare_raster;
			}
		};
	}, [dispatch]);

	/**
	 * Handles the click event for the "Download" link.
	 * Fetches the image from the provided downloadUrl as a Blob and triggers a file download in the browser.
	 * Sets a loading state while the request is in progress.
	 * Includes an artificial delay for demonstration/testing purposes.
	 */
	const handleDownloadClick = async () => {
		const mapUrl = new URL(window.location.href);
		// Make sure to remove addition hashes.
		mapUrl.hash = '';
		// Encode the URL
		const encoded_url = encodeURL(mapUrl.toString(), salt).encoded;
		// Generate the generateMap URL.
		const api_url = data_url + '/raster?url=' + encoded_url;
		if (!api_url) {
			return;
		}

		setIsGenerating(true);
		window.open(api_url, '_blank');
		setIsGenerating(false);
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
	}, [isGenerating, __]);

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
