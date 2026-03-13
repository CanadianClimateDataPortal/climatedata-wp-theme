import React from 'react';
import { MessageCircleQuestion, TriangleAlert } from 'lucide-react';

import { __ } from '@/context/locale-provider';
import Modal from '@/components/ui/modal';
import { ControlTitle } from '@/components/ui/control-title';

import ShapefileWarningsMessage from '@/components/download/ui/shapefile-warnings-message';
import { useShapefile } from '@/hooks/use-shapefile';
import FileInput from '@/components/ui/file-input';
import type { PipelineWarning } from '@/lib/shapefile';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { sprintf } from '@wordpress/i18n';

interface ShapefileUploadComponentProps {
	warnings: PipelineWarning[];
	file: File | null;
	isFileValid: boolean;
	isProcessingFile: boolean;
	isModalOpened: boolean;
	onModalClose: () => void;
	onSupportedFilesClick: () => void;
	onChangeFile: (file: File | null) => void;
	onRemoveFile: () => void;
}

interface WarningsPopoverProps {
	warnings: PipelineWarning[];
	className?: string;
}

/**
 * Component displaying the "custom shapefile" upload section.
 *
 * It uses and updates the shapefile state machine.
 */
export default function ShapefileUpload(): React.ReactElement {
	const [isModalOpened, setModalOpened] = React.useState<boolean>(false);

	const {
		isProcessingFile,
		isFileValid,
		file,
		reset,
		setFile,
		warnings,
	} = useShapefile();

	const onChangeFile = (file: File | null) => {
		// In Chromium browsers, the `file` will be null if the user cancels
		// the file selection dialog. In other browsers, this callback will
		// simply not be called in that case. To uniformize, we thus ignore the
		// change if the file is null.
		if (file !== null) {
			setFile(file);
		}
	}

	return (
		<ShapefileUploadComponent
			file={file}
			isProcessingFile={isProcessingFile}
			isFileValid={isFileValid}
			isModalOpened={isModalOpened}
			onModalClose={() => setModalOpened(false)}
			onSupportedFilesClick={() => setModalOpened(true)}
			onChangeFile={onChangeFile}
			onRemoveFile={reset}
			warnings={warnings}
		/>
	);
}

/**
 * If there are warnings, display a warning icon with a popover listing the
 * warnings.
 */
function WarningsPopover({
	warnings,
	className,
}: WarningsPopoverProps): React.ReactNode {
	if (warnings.length === 0) {
		return null;
	}

	return (
		<div className={className}>
			<Popover>
				<PopoverTrigger>
					<TriangleAlert className="text-amber-700" size={16} />
				</PopoverTrigger>
				<PopoverContent>
					<ShapefileWarningsMessage warnings={warnings} />
				</PopoverContent>
			</Popover>
		</div>
	)
}

/**
 * Component doing the actual rendering of the shapefile upload section.
 */
function ShapefileUploadComponent({
	file,
	isProcessingFile,
	isFileValid,
	isModalOpened,
	onModalClose,
	onSupportedFilesClick,
	onChangeFile,
	onRemoveFile,
	warnings,
}: ShapefileUploadComponentProps): React.ReactElement {
	const tooltip = __(
		'This feature allows you to upload a shapefile of your custom region ' +
		'which must be at least partially within Canada. Once your shapefile ' +
		'is uploaded, the shapes will appear on the map. Click the shape of ' +
		'interest to continue. Lower (100 km² – one grid cell) and upper ' +
		'limits (500,000 km² - approx., the size of the Yukon) exist to ' +
		'prevent unintended precision and server overload.'
	);

	const modalContent = __(
		'All uploads must be a ZIP file containing at least .shp and .prj ' +
		'files. The file’s shapes must be closed polygons and be, at least ' +
		'partially, within Canada (data is available only for land areas of ' +
		'Canada; if the shape file contains areas outside of Canada the ' +
		'returned value is an average of the Canadian area only). Files must ' +
		'use the WGS84 coordinate system, this is the most common system and ' +
		'the default for most files.'
	);

	const hasFile = file != null;
	const isFileInvalid = hasFile && !isFileValid;

	const modal = (
		<Modal isOpen={isModalOpened} onClose={onModalClose}>
			<div className="formatted-content text-sm">
				<h4>{__('Which file types are supported?')}</h4>
				<div className="text-neutral-grey-medium text-sm">
					{modalContent}
				</div>
			</div>
		</Modal>
	);

	return (
		<div className="flex flex-col mb-8">
			<ControlTitle
				title={__('Upload a Custom Shapefile')}
				tooltip={tooltip}
			/>
			<div className="flex flex-col gap-2 sm:flex-row sm:gap-4 sm:items-start">
				<div>
					<div className="relative flex gap-1 items-center">
						<FileInput
							file={file}
							isInvalid={isFileInvalid}
							accept=".zip"
							isProcessing={isProcessingFile}
							onChange={onChangeFile}
							onClear={onRemoveFile}
							className="sm:w-80"
						/>
						<WarningsPopover className="mt-1" warnings={warnings} />
					</div>
					{isFileInvalid && (
						<div
							className="text-xs text-red-600 mt-1 sm:w-80"
							dangerouslySetInnerHTML={{ __html: sprintf(
								__(
									'The selected file is not a supported shapefile. For tools ' +
									'to convert a .geojson file to .shp, please consult ' +
									'<a href="https://mapshaper.org" %s>mapshaper.org</a>.'
								),
								'target="_blank" rel="noopener noreferrer" class="underline"',
							)}} />
					)}
				</div>
				<div
					className="text-sm flex flex-row items-center gap-1 text-neutral-grey-medium sm:mt-2 hover:text-dark-purple cursor-pointer"
					onClick={onSupportedFilesClick}
				>
					<MessageCircleQuestion size={16} />
					<span className="underline">
						{__('Which file types are supported?')}
					</span>
				</div>
			</div>
			{modal}
		</div>
	);
}
