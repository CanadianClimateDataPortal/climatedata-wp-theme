/**
 * Download map modal component.
 *
 * A modal component that allows users to download the map as an image.
 *
 */
import React, { useMemo, useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { toPng } from 'html-to-image';
import { Download, ExternalLink } from 'lucide-react';

// components
import Modal from '@/components/ui/modal';
import {
	ModalSection,
	ModalSectionBlock,
	ModalSectionBlockTitle,
	ModalSectionBlockDescription,
} from '@/components/map-info/modal-section';

// TODO: replace mapRef with a reference coming from MapContext or the useLeafetMap hook if possible
const DownloadMapModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	title: string;
	mapRef: React.RefObject<HTMLElement>;
}> = ({ isOpen, onClose, title, mapRef }) => {
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);

	const { __ } = useI18n();

	/**
	 * Called when the user first clicks the "Download" link.
	 * Dynamically generates the map image URL and sets it to `downloadUrl`.
	 */
	const handleDownloadClick = async (
		e: React.MouseEvent<HTMLAnchorElement>
	) => {
		const anchor = e.currentTarget;

		if (!downloadUrl && mapRef.current) {
			e.preventDefault();

			setIsGenerating(true);
			try {
				const url = await toPng(mapRef.current, { cacheBust: true });
				setDownloadUrl(url);

				// set the href dynamically and trigger the click manually
				anchor.href = url;
				anchor.click();
			} catch (error) {
				console.error('Failed to generate download URL:', error);
			} finally {
				setIsGenerating(false);
			}
		}
	};

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
					<a
						href={downloadUrl || '#'}
						target="_blank"
						aria-label={__(
							'Download current map image (opens in a new tab)'
						)}
						className={`inline-flex text-md font-normal leading-6 tracking-[0.8px] uppercase rounded-full px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
							isGenerating ? 'opacity-50 pointer-events-none' : ''
						}`}
						download={`${title}-map.png`}
						onClick={handleDownloadClick}
					>
						{buttonText}
					</a>
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
						href="#"
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
