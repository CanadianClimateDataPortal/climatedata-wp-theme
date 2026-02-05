import React from 'react';

import {
	type Story,
	type StoryDefault,
} from '@ladle/react';

import {
	LadleMockLocaleProvider,
	createLadleMockLocaleStoryArgTypes,
	type StoryWithLocale,
} from '@/lib/ladle';


import FileInput from '@/components/ui/file-input'

const styleForFirstChildOfLegendWrapperLeafletControl: React.CSSProperties = {
	width: 500,
};

export default {
	title: 'components/ui/file-upload',
	decorators: [
		(Component) => (
			<div
				className="relative space-y-[5px]"
				style={styleForFirstChildOfLegendWrapperLeafletControl}
			>
				<div className="p-12 bg-white border rounded-md border-cold-grey-3">
					<Component />
				</div>
			</div>
		),
	],
} satisfies StoryDefault;

// Mocked translation specific for this component
const translatedFrench = {
	'Choose file': 'Choisir un fichier',
	'No file selected': 'Aucun fichier sélectionné',
};

interface FileUploadStory extends StoryWithLocale {
	isInvalid?: boolean;
	isProcessing?: boolean;
	className?: string;
	accept?: string;
	disabled?: boolean;
	translatedFrench: Record<string, string>;
}

export const StoryAlpha: Story<FileUploadStory> = ({
	accept,
	isInvalid,
	isProcessing,
	className,
	disabled,
	locale,
	translatedFrench,
}) => {
	const [file, setFile] = React.useState<File | null>(null);

	const handleFileChange = (file: File | null) => {
		setFile(file);
	}

	const handleClear = () => {
		setFile(null);
	}

	return (
		<LadleMockLocaleProvider
			locale={locale}
			translatedFrench={translatedFrench}
		>
			<FileInput
				file={file}
				onChange={handleFileChange}
				onClear={handleClear}
				accept={accept}
				isInvalid={isInvalid}
				isProcessing={isProcessing}
				className={className}
				disabled={disabled}
			/>
		</LadleMockLocaleProvider>
	);
};

StoryAlpha.storyName = 'Default';

StoryAlpha.args = {
	accept: '',
	isInvalid: false,
	isProcessing: false,
	className: '',
	disabled: false,
	locale: 'en',
	translatedFrench,
};

StoryAlpha.argTypes = {
	...createLadleMockLocaleStoryArgTypes(),
}
