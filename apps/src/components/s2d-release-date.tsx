import type { ReactNode } from 'react';
import { useS2D } from '@/hooks/use-s2d';
import { useLocale } from '@/hooks/use-locale';
import { __ } from '@/context/locale-provider';
import { formatUTCDate } from '@/lib/utils';
import TooltipWidget from '@/components/ui/tooltip-widget';

interface S2DReleaseDateProps {
	tooltip?: ReactNode;
}

const tooltipReleaseDate = __(
	'The forecast was released on this date. Monthly and seasonal forecasts ' +
		'are updated each month and decadal forecasts are updated annually. ' +
		'Skill tends to be higher for time periods closer to the release date.'
);

/**
 * Component displaying the release date for the current S2D variable.
 *
 * Shows a loading message if the release date is not yet available.
 *
 * @param tooltip - Optional tooltip override.
 */
const S2DReleaseDate = ({ tooltip }: S2DReleaseDateProps) => {
	const { releaseDate } = useS2D();
	const { locale } = useLocale();

	let releaseDateElement = (
		<span className="font-medium text-gray-400">{__('Loading...')}</span>
	);

	if (releaseDate) {
		const formattedDate = releaseDate.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC',
		});

		releaseDateElement = (
			<time dateTime={formatUTCDate(releaseDate, 'yyyy-MM-dd')}>
				{formattedDate}
			</time>
		);
	}

	return (
		<div className="flex flex-row flex-nowrap gap-1 my-2 text-xs font-semibold tracking-wider uppercase text-dark-purple">
			<span>
				{__('Release date:')}&nbsp;
				{releaseDateElement}
			</span>
			<TooltipWidget tooltip={tooltip ?? tooltipReleaseDate} />
		</div>
	);
};

S2DReleaseDate.displayName = 'S2DReleaseDate';

export default S2DReleaseDate;
