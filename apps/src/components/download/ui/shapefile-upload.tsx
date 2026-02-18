import React from 'react';
import { MessageCircleQuestion } from 'lucide-react';

import { __ } from '@/context/locale-provider';
import Modal from '@/components/ui/modal';
import { ControlTitle } from '@/components/ui/control-title';
import { useShapefile } from '@/hooks/use-shapefile';
import FileInput from '@/components/ui/file-input';

interface ShapefileUploadComponentProps {
	file: File | null;
	isFileValid: boolean;
	isProcessingFile: boolean;
	isModalOpened: boolean;
	onModalClose: () => void;
	onSupportedFilesClick: () => void;
	onChangeFile: (file: File | null) => void;
	onRemoveFile: () => void;
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
	} = useShapefile();

	return (
		<ShapefileUploadComponent
			file={file}
			isProcessingFile={isProcessingFile}
			isFileValid={isFileValid}
			isModalOpened={isModalOpened}
			onModalClose={() => setModalOpened(false)}
			onSupportedFilesClick={() => setModalOpened(true)}
			onChangeFile={setFile}
			onRemoveFile={reset}
		/>
	);
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
}: ShapefileUploadComponentProps): React.ReactElement {
	const tooltip = __(
		'This feature allows you to upload a shapefile of your custom ' +
		'region. Once your shapefile is uploaded, the shapes will appear on ' +
		'the map. Click the shape of interest to continue.'
	);

	const modalContent = __(
		'All uploads must be a ZIP file containing at least the .shp and ' +
		'.prj files. The file’s shapes must be closed polygons and be, at ' +
		'least partially, within Canada (data is available only for land ' +
		'areas of Canada). Files must use the WGS84 coordinate system, this ' +
		'is the most common system and the default for most files.'
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
				<div className="sm:w-80">
					<div className="relative">
						<FileInput
							file={file}
							isInvalid={isFileInvalid}
							accept=".zip"
							isProcessing={isProcessingFile}
							onChange={onChangeFile}
							onClear={onRemoveFile}
						/>
					</div>
					{isFileInvalid && (
						<div className="text-xs text-red-600 mt-1">
							{__('The selected file is not a supported shapefile')}
						</div>
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
