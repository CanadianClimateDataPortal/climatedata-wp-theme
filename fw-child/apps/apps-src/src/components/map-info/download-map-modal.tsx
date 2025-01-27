/**
 * Download map modal component.
 *
 * A modal component that allows users to download the map as an image.
 *
 */
import React, { useState } from "react";
import { useI18n } from "@wordpress/react-i18n";
import { toPng } from "html-to-image";

// components
import Modal from "@/components/ui/modal";

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
  const handleDownloadClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    const anchor = e.currentTarget;

    if (! downloadUrl && mapRef.current) {
      e.preventDefault();

      setIsGenerating(true);
      try {
        const url = await toPng(mapRef.current, { cacheBust: true });
        setDownloadUrl(url);

        // set the href dynamically and trigger the click manually
        anchor.href = url;
        anchor.click();
      }
      catch (error) {
        console.error('Failed to generate download URL:', error);
      }
      finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="download-map-modal">
        <h3 className="font-semibold">{__('Download image from viewport')}</h3>
        <p className="text-gray-400 my-2 text-sm">
          {__('Your export will showcase your various data options. The map position will be the one you see on your screen.')}
        </p>
        <a
          href={downloadUrl || '#'}
          target="_blank"
          aria-label={__('Download current map image (opens in a new tab)')}
          className={`px-4 py-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
            isGenerating ? 'opacity-50 pointer-events-none' : ''
          }`}
          download={`${title}-map.png`}
          onClick={handleDownloadClick}
        >
          {isGenerating ? __('Generating...') : __('Download')}
        </a>
      </div>
      <div>
        <p className="font-bold">{__('Need control over your own data?')}</p>
        <p className="text-gray-400 my-2 text-sm">
          {__('Head over to the download section where you can select multiple grid cells and personalize more data options.')}
        </p>
        <a
          href="#"
          target="_blank"
          aria-label={__('Go to download sections (opens in a new tab)')}
          className="text-blue-500"
        >
          {__('Go to download section')}
        </a>
      </div>
    </Modal>
  );
};
DownloadMapModal.displayName = "DownloadMapModal";

export default DownloadMapModal;