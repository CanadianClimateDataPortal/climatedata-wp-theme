/**
 * Share Modal
 *
 * A modal component that allows users to copy the map link or share on social media.
 *
 */
import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialShareButtons } from '@/components/social-share-buttons';
import {
	ModalSection,
	ModalSectionBlock,
	ModalSectionBlockTitle,
	ModalSectionBlockDescription,
} from '@/components/map-info/modal-section';
import Modal from '@/components/ui/modal';
import { useAppSelector } from '@/app/hooks';

const ShareMapModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	const [copyLinkVariant, setCopyLinkVariant] = useState<
		'destructive' | 'secondary'
	>('destructive');
	const [currentUrl, setCurrentUrl] = useState<string>('');
	const inputRef = useRef<HTMLInputElement>(null);

	const { __ } = useI18n();

	// Get the URL sync state to ensure URL parameters are loaded
	const isUrlSyncInitialized = useAppSelector((state) => state.urlSync.isInitialized);

	useEffect(() => {
		if (isOpen && typeof window !== 'undefined') {
			setCurrentUrl(window.location.href);
		}
	}, [isOpen, isUrlSyncInitialized]);

	const copyLinkHandler = () => {
		if (inputRef.current) {
			inputRef.current.select();
			navigator.clipboard.writeText(currentUrl);
			
			setCopyLinkVariant('secondary');
			setTimeout(() => {
				setCopyLinkVariant('destructive');
			}, 2000);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalSection className="share-map-modal">
				<ModalSectionBlock className="mb-4">
					<ModalSectionBlockTitle>
						{__('Sharing this map')}
					</ModalSectionBlockTitle>
					<ModalSectionBlockDescription>
						{__(
							'You can copy-paste this link anywhere you want; it will keep all your data options and your map position.'
						)}
					</ModalSectionBlockDescription>
					<div className="flex gap-4">
						<Input
							type="text"
							value={currentUrl}
							ref={inputRef}
							readOnly
							className="text-neutral-grey-medium placeholder:text-neutral-grey-medium border-cold-grey-4 rounded-none"
						/>
						<Button
							className="rounded-full uppercase"
							variant={copyLinkVariant}
							onClick={copyLinkHandler}
						>
							{copyLinkVariant === 'secondary'
								? __('Copied')
								: __('Copy Link')}
						</Button>
					</div>
				</ModalSectionBlock>
				<ModalSectionBlock>
					<ModalSectionBlockTitle>
						{__('Or click one of these social links:')}
					</ModalSectionBlockTitle>
					<ModalSectionBlockDescription>
						{__('Clicking on icons will launch a new window.')}
					</ModalSectionBlockDescription>
					<SocialShareButtons />
				</ModalSectionBlock>
			</ModalSection>
		</Modal>
	);
};
ShareMapModal.displayName = 'ShareMapModal';

export default ShareMapModal;
