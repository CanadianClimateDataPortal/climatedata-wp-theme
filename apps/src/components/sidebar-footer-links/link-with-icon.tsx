/**
 * LinkWithIcon component
 *
 * Component that renders a link with left LucideReact icon.
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { LinkWithIconProps } from '@/types/types';

const LinkWithIcon: React.FC<LinkWithIconProps> = ({
	icon: Icon,
	children,
	href,
	...props
}) => {
	const Tag = href ? 'a' : 'button';

	// separate props for `<a>` and `<button>` to avoid type conflicts
	const anchorProps = href ? { ...props, href } : {};

	const buttonProps = !href ? { ...props, type: 'button' } : {};

	const contentClasses = 'text-brand-blue hover:text-dark-purple';

	return (
		<Button
			asChild
			variant="link"
			className="justify-start p-2 text-dark-purple cursor-pointer hover:-underline"
		>
			{Tag === 'a' ? (
				<a {...anchorProps}>
					<Icon size={16} />
					<span className={contentClasses}>{children}</span>
				</a>
			) : (
				<button {...buttonProps}>
					<Icon size={16} />
					<span className={contentClasses}>{children}</span>
				</button>
			)}
		</Button>
	);
};
LinkWithIcon.displayName = 'LinkWithIcon';

export default LinkWithIcon;
