/**
 * @description Component to render a list of social media share buttons
 * using react-share for proper sharing functionality.
 */

import { useI18n } from '@wordpress/react-i18n';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailShareButton, FacebookIcon, TwitterIcon, LinkedinIcon, EmailIcon } from "react-share";
import { MultilingualField } from '@/types/types';
import { useLocale } from '@/hooks/use-locale';

interface SocialShareButtonsProps {
	url?: string;
	title?: string | MultilingualField;
}

/**
 * SocialShareButtons component
 * @description Renders a list of social media buttons that allow sharing content on
 * different platforms using the react-share library.
 */
export function SocialShareButtons({ 
	url = window.location.href, 
	title = document.title 
}: SocialShareButtonsProps): JSX.Element {
	const { __ } = useI18n();
	const { locale } = useLocale();
	
	// Process the title to ensure it's a string in the current language
	const getStringTitle = (): string => {
		if (typeof title === 'string') {
			return title;
		} else if (title && typeof title === 'object') {
			if (locale === 'fr' && title.fr) {
				return title.fr;
			}
			
			return title.en;
		}
		return document.title;
	};
	
	// Prepare description text
	const description = __('Check out this climate data map');
	const stringTitle = getStringTitle();

	return (
		<ul className="social-share-buttons flex gap-2">
			<li className="social-share-buttons__list-item">
				<FacebookShareButton 
					url={url}
					hashtag="#ClimateData"
					className="hover:opacity-80"
					aria-label={__('Share on Facebook (opens in a new tab)')}
				>
					<FacebookIcon size={32} round />
				</FacebookShareButton>
			</li>
			<li className="social-share-buttons__list-item">
				<TwitterShareButton
					url={url}
					title={`${stringTitle}\n${description}: `}
					hashtags={["ClimateData"]}
					className="hover:opacity-80"
					aria-label={__('Share on Twitter (opens in a new tab)')}
				>
					<TwitterIcon size={32} round />
				</TwitterShareButton>
			</li>
			<li className="social-share-buttons__list-item">
				<LinkedinShareButton
					url={url}
					className="hover:opacity-80"
					aria-label={__('Share on LinkedIn (opens in a new tab)')}
				>
					<LinkedinIcon size={32} round />
				</LinkedinShareButton>
			</li>
			<li className="social-share-buttons__list-item">
				<EmailShareButton
					url={url}
					subject={stringTitle}
					body={description}
					className="hover:opacity-80"
					aria-label={__('Share via Email (opens in a new tab)')}
				>
					<EmailIcon size={32} round />
				</EmailShareButton>
			</li>
		</ul>
	);
}
