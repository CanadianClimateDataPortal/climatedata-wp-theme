/**
 * @description Component to render a list of social media share buttons
 * using react-share for proper sharing functionality.
 */

import { useI18n } from '@wordpress/react-i18n';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailShareButton } from "react-share";
import { MultilingualField } from '@/types/types';
import { useLocale } from '@/hooks/use-locale';

interface SocialShareButtonsProps {
	url?: string;
	title?: string | MultilingualField;
}

// SVG Icon Components
function FacebookIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
    );
}

function TwitterIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
    );
}

function LinkedinIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </svg>
    );
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
	const description = __('Check out the Canadian climate data map');
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
					<FacebookIcon />
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
					<TwitterIcon />
				</TwitterShareButton>
			</li>
			<li className="social-share-buttons__list-item">
				<LinkedinShareButton
					url={url}
					className="hover:opacity-80"
					aria-label={__('Share on LinkedIn (opens in a new tab)')}
				>
					<LinkedinIcon />
				</LinkedinShareButton>
			</li>
			<li className="social-share-buttons__list-item">
				<EmailShareButton
					url={url}
					subject={stringTitle}
					body={description}
					className="hover:opacity-80"
					aria-label={__('Share via Email (opens in the same tab)')}
				>
					<EmailIcon />
				</EmailShareButton>
			</li>
		</ul>
	);
}
