import React, { useState } from 'react';
import { X } from 'lucide-react';

import { __ } from '@/context/locale-provider';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/modal.tsx';

interface WarningBannerProps extends React.HTMLProps<HTMLDivElement> {
	display: boolean;
	onHide: () => void;
	bannerContent: React.ReactNode;
	modalContent?: React.ReactNode;
	modalTitle?: React.ReactNode;
}

/**
 * Closable banner with a "warning" style. Can open a "read more" modal.
 *
 * The component is the *container* of the banner. It can be styled/positioned
 * with `className` and `style` (and can have any other <div> attributes). The
 * banner will be horizontally centered if it's smaller than the container.
 *
 * @param display Boolean indicating if the banner is shown.
 * @param onHide Callback called when the user clicks on the banner's close
 *               button.
 * @param bannerContent Content of the banner.
 * @param modalContent Content of the modal shown when clicking on "Read more".
 *                     If not specified, no "Read more" button is shown.
 * @param modalTitle Title of the modal.
 * @param props All props passed to the <div> container.
 */
export default function WarningBanner({
	display = true,
	onHide = () => {},
	bannerContent,
	modalContent,
	modalTitle,
	...props
}: WarningBannerProps) {
	const hasModal = !!modalContent;
	const [isModalOpened, setModalOpened] = useState(false);

	if (!display) {
		return null;
	}

	let modal = null;

	if (hasModal) {
		modal = (
			<Modal isOpen={isModalOpened} onClose={() => setModalOpened(false)}>
				<div className="formatted-content text-sm">
					{modalTitle && <h4>{modalTitle}</h4>}
					<div className="text-neutral-grey-medium text-sm">
						{modalContent}
					</div>
				</div>
			</Modal>
		);
	}

	return (
		<>
			<div {...props}>
				<div className="flex justify-center text-sm">
					<div
						className={cn(
							'flex flex-row items-center gap-x-3',
							'bg-warning-background text-warning-foreground',
							'border border-warning-border rounded-sm shadow-md',
							'px-2 py-1'
						)}
					>
						<div>{bannerContent}</div>
						{hasModal && (
							<button
								className="underline cursor-pointer hover:opacity-80 text-nowrap"
								onClick={() => setModalOpened(true)}
							>
								{__('Read more')}
							</button>
						)}
						<button
							className="cursor-pointer hover:opacity-80"
							onClick={onHide}
						>
							<X size={16} />
						</button>
					</div>
				</div>
			</div>
			{hasModal && modal}
		</>
	);
}
