/**
 * Variable info panel component.
 *
 * This component displays a detailed description and related data for the selected variable.
 */
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { __ } from '@/context/locale-provider';
import parse from 'html-react-parser';

// components
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';

// other
import { MapInfoData, Training, Sector } from '@/types/types';
import { useLocale } from '@/hooks/use-locale';
import { useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';
import { INTERNAL_URLS } from '@/lib/constants';

/**
 * VariableDetailsPanel component, displaying details such as description and related data
 * for the selected variable.
 */
const VariableDetailsPanel: React.FC<{ mapInfo: MapInfoData }> = ({
	mapInfo,
}) => {
	const { locale } = useLocale();
	const dataset = useAppSelector((state) => state.map.dataset);
	const datasetName = dataset && (locale === 'fr' && dataset.title.fr
		? dataset.title.fr
		: dataset.title.en);

	// @todo Add title and alt image text for accessibility.
	return (
		<div className="variable-details-panel max-w-lg">
			<div className="divide-soft-purple divide-y divide-solid p-4">
				<div className="flex justify-between items-start pb-4">
					<div className="flex items-center space-x-4">
                        {mapInfo?.featuredImage?.thumbnail && (
                          <img alt={mapInfo.title[locale]} className="w-16 h-16" src={mapInfo.featuredImage.thumbnail} />
                        )}
						<div>
							<div className="text-sm text-cdc-black">
								{datasetName}
							</div>
							<h2 className="text-2xl font-semibold">
								{mapInfo?.title?.[locale] && mapInfo.title[locale]}
							</h2>
							<div className="text-xs text-neutral-grey-medium">
								{mapInfo?.tagline?.[locale] && mapInfo.tagline[locale]}
							</div>
						</div>
					</div>
				</div>

                {mapInfo?.fullDescription?.[locale] && (
                  <div className="py-4 formatted-content">
                    <SectionHeading>{__('Description')}</SectionHeading>
                    <SectionText content={mapInfo.fullDescription[locale]} />
                  </div>
                )}
                {mapInfo?.techDescription?.[locale] && (
                  <div className="py-4 formatted-content">
                    <SectionHeading>
                      {__('Technical description')}
                    </SectionHeading>
                    <SectionText content={mapInfo.techDescription[locale]} />
                  </div>
                )}

				{mapInfo.relevantSectors?.length > 0 && (
					<div className="py-4 formatted-content">
						<SectionHeading>
							{__('Relevant sectors')}
						</SectionHeading>
						<SectionText
							content={__(
								'Click on the following to get sector-specific insights.'
							)}
						/>
						<SectorsArea items={mapInfo.relevantSectors} />
					</div>
				)}

				{mapInfo.relevantTrainings?.length > 0 && (
					<div className="py-4 formatted-content">
						<SectionHeading>
							{__('Relevant articles')}
						</SectionHeading>
						<SectionText
							content={__('To help you get more of our data.')}
						/>
						<RelevantTrainings items={mapInfo.relevantTrainings} />
					</div>
				)}
			</div>
		</div>
	);
};
VariableDetailsPanel.displayName = 'VariableDetailsPanel';

/**
 * Custom component for displaying a heading for the panel sections.
 * No need to export this component since it's only used in the main VariableDetailsPanel.
 */
const SectionHeading: React.FC<{
	as?: keyof JSX.IntrinsicElements;
	className?: string;
	children: React.ReactNode;
}> = ({ as: Tag = 'h3', children, className }) => (
	<Tag className={className}>
		{children}
	</Tag>
);
SectionHeading.displayName = 'SectionHeading';

/**
 * Custom component for displaying content for the panel sections.
 * No need to export this component since it's only used in the main VariableDetailsPanel.
 */
const SectionText: React.FC<{
	content: string;
	className?: string;
}> = ({ content, className }) => {
	// parse content to check if it's plain text or html
	const parsedContent = parse(content);

	// base class name for both plain text and html content
	const baseClassName =
		'text-sm text-neutral-grey-medium';

	// then we want to apply specific class names for plain strings and html
	if (typeof parsedContent === 'string') {
		return (
			<p className={cn(baseClassName, className)}>
				{parsedContent}
			</p>
		);
	}

	return (
		<div className={cn(baseClassName, '[&>p:empty]:hidden', className)}>
			{parsedContent}
		</div>
	);
};
SectionText.displayName = 'SectionText';

/**
 * Custom component for displaying relevant articles for the selected variable.
 * No need to export this component since it's only used in the main VariableDetailsPanel.
 */
const RelevantTrainings: React.FC<{ items: Training[] }> = ({
	items,
}) => {
    const { locale } = useLocale();
    return (
    <ul className="ms-4 marker:text-brand-blue">
        {items.map((item: Training, index: number) => (
            <li key={index} className='my-2'>
                <Button
                    asChild
                    variant="longLink"
                    className="font-normal text-brand-blue px-0"
                >
                    <a href={item.link[locale]} className="h-auto">
                        {item.title[locale]}
                    </a>
                </Button>
            </li>
        ))}
    </ul>
    );
};
RelevantTrainings.displayName = 'RelevantTrainings';

/**
 * Custom component for displaying relevant sectors for the selected variable.
 * No need to export this component since it's only used in the main VariableDetailsPanel.
 */
const SectorsArea: React.FC<{ items: Sector[] }> = ({ items }) => {
	const [selectedItem, setSelectedItem] = useState(items[0] || null);

	const { locale } = useLocale();
	const sectorBaseUrl = INTERNAL_URLS[`sector-page-${locale}`] || '';
	const sectorLink = selectedItem
		? sectorBaseUrl.replace('{sector}', selectedItem.slug)
		: '';

	return (
		<>
			<div className="flex flex-wrap gap-3.5">
				{items.map((item: Sector, index: number) => (
					<Button
						key={index}
						variant="outline"
						size="sm"
						onClick={() => setSelectedItem(item)}
						className={cn(
							'font-semibold text-dark-purple tracking-wide uppercase',
							'border-cold-grey-4 shadow rounded-full',
							'hover:bg-dark-purple hover:text-primary-foreground',
							'transition-colors duration-250',
							selectedItem.name === item.name
								? 'bg-dark-purple text-primary-foreground'
								: ''
						)}
					>
						{item.name[locale]}
					</Button>
				))}
			</div>

			{selectedItem && (
				<div className="bg-neutral-grey-light border border-soft-purple p-2 rounded-lg mt-5 mb-2">
					<p className="text-sm font-semibold text-dark-purple">
						<span className="mr-1">{selectedItem.description[locale]}</span>
						<Link
							href={sectorLink}
							icon={<ExternalLink size={12} />}
							className="text-brand-blue"
						>
							{__('Learn more')}
						</Link>
					</p>
				</div>
			)}
		</>
	);
};
SectorsArea.displayName = 'SectorsArea';

export default VariableDetailsPanel;
