/**
 * @description Component to render a list of social media share buttons. The button links
 * are placehodlers currently, can be changed in this component.
 */

import { Facebook, Linkedin, Mail, Twitter } from 'lucide-react';
import { useI18n } from '@wordpress/react-i18n';

/**
 * SocialShareButtons component
 * @description Renders a list of social media icons that allow sharing content on
 * different platforms. Each link opens in a new tab and includes appropriate
 * accessibility labels.
 */
export function SocialShareButtons(): JSX.Element {
	const { __ } = useI18n();

	// Placeholder URLs for social sharing links
	const shareUrls = {
		facebook: '#', // Placeholder for Facebook share URL
		twitter: '#', // Placeholder for Twitter share URL
		linkedin: '#', // Placeholder for LinkedIn share URL
		mail: '#', // Placeholder for Email share URL
	};

	return (
		<ul className="social-share-buttons flex gap-2">
			<li className="social-share-buttons__list-item">
				<a
					href={shareUrls.facebook}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={__('Share on Facebook (opens in a new tab)')}
					className="hover:text-blue-700"
				>
					<Facebook color="blue" className="h-6 w-6" />
				</a>
			</li>
			<li className="social-share-buttons__list-item">
				<a
					href={shareUrls.twitter}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={__('Share on Twitter (opens in a new tab)')}
					className="hover:text-blue-700"
				>
					<Twitter color="blue" className="h-6 w-6" />
				</a>
			</li>
			<li className="social-share-buttons__list-item">
				<a
					href={shareUrls.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={__('Share on LinkedIn (opens in a new tab)')}
					className="hover:text-blue-700"
				>
					<Linkedin color="blue" className="h-6 w-6" />
				</a>
			</li>
			<li className="social-share-buttons__list-item">
				<a
					href={shareUrls.mail}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={__('Share via Email (opens in a new tab)')}
					className="hover:text-blue-700"
				>
					<Mail color="blue" className="h-6 w-6" />
				</a>
			</li>
		</ul>
	);
}
