import React, { useState } from 'react';
import { X } from 'lucide-react';

import { __ } from '@/context/locale-provider';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/modal.tsx';

interface NoticeBannerProps extends React.HTMLProps<HTMLDivElement> {
	type: 'info' | 'success' | 'warning' | 'error';
	display: boolean;
	onHide: () => void;
	bannerContent: React.ReactNode;
	modalContent?: React.ReactNode;
	modalTitle?: React.ReactNode;
}

/**
 * Closable "notice" banner. Can open a "read more" modal.
 *
 * The notice banner's style can be adjusted for different message types: info,
 * success, warning, or error.
 *
 * The component is the *container* of the banner. It can be styled/positioned
 * with `className` and `style` (and can have any other <div> attributes). The
 * banner will be horizontally centered if it's smaller than the container.
 *
 * @param type Style of the banner (e.g. "info", "success", "warning", "error")
 * @param display Boolean indicating if the banner is shown.
 * @param onHide Callback called when the user clicks on the banner's close
 *               button.
 * @param bannerContent Content of the banner.
 * @param modalContent Content of the modal shown when clicking on "Read more".
 *                     If not specified, no "Read more" button is shown.
 * @param modalTitle Title of the modal.
 * @param props All props passed to the <div> container.
 */
export default function NoticeBanner({
	type = 'info',
	display = true,
	onHide = () => {},
	bannerContent,
	modalContent,
	modalTitle,
	...props
}: NoticeBannerProps) {
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

	// Because of how Tailwind finds classes in source code, we cannot build
	// dynamic class names using the `type`. So, we use a map with explicit
	// class names for each type.
	const typeClasses = {
		info: 'bg-info-background text-info-foreground border-info-border',
		success: 'bg-success-background text-success-foreground border-success-border',
		warning: 'bg-warning-background text-warning-foreground border-warning-border',
		error: 'bg-error-background text-error-foreground border-error-border',
	}

	return (
		<>
			<div {...props}>
				<div className="flex justify-center text-sm">
					<div
						className={cn(
							'flex flex-row items-center gap-x-3',
							'border rounded-sm shadow-md',
							typeClasses[type],
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
