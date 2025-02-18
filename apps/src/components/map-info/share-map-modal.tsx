/**
 * Share Modal
 *
 * A modal component that allows users to copy the map link or share on social media.
 *
 */
import React, { useState } from 'react';
import { useI18n } from '@wordpress/react-i18n';

// components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialShareButtons } from '@/components/social-share-buttons';
import Modal from '@/components/ui/modal';

const ShareMapModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	const [copyLinkVariant, setCopyLinkVariant] = useState<
		'destructive' | 'secondary'
	>('destructive');

	const { __ } = useI18n();

	// TODO: implement correct logic for copying the link
	/**
	 * Simulated link copying logic for demonstration.
	 */
	const copyLinkHandler = () => {
		setCopyLinkVariant('secondary');
		setTimeout(() => {
			setCopyLinkVariant('destructive');
		}, 2000);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div>
				<h3 className="font-semibold">{__('Sharing this map')}</h3>
				<p className="text-gray-400 my-2 text-sm">
					{__(
						'You can copy-paste this link anywhere you want; it will keep all your data options and your map position.'
					)}
				</p>
				<div className="flex gap-4">
					<Input
						type="text"
						placeholder="crim.ca/map/?coords=62.5102..."
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
			</div>
			<div>
				<p className="font-bold">
					{__('Or click one of these social links:')}
				</p>
				<p className="text-gray-400 my-2 text-sm">
					{__('Clicking on icons will launch a new window.')}
				</p>
				<SocialShareButtons />
			</div>
		</Modal>
	);
};
ShareMapModal.displayName = 'ShareMapModal';

export default ShareMapModal;
