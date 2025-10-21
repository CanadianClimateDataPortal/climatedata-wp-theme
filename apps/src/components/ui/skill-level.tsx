import React from 'react';

const STAR_COLOR = `#6900b5`;

const SVG_STAR_SIZE = 20;

export interface SkillLevelStarsProps {
	skillLevel?: number;
}

const StarFilled = (): React.ReactNode => (
	<svg
		width={SVG_STAR_SIZE}
		height={SVG_STAR_SIZE}
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
	</svg>
);

const StarEmpty = (): React.ReactNode => (
	<svg
		width={SVG_STAR_SIZE}
		height={SVG_STAR_SIZE}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
	</svg>
);

const SkillLevelStars: React.FC<SkillLevelStarsProps> = ({
	skillLevel,
}): React.ReactNode => {
	const MAX_STARS = 3;
	let level = !skillLevel ? 0 : skillLevel;
	if (level > MAX_STARS) {
		level = MAX_STARS;
	}

	return (
		<div
			role="meter"
			aria-valuemin={0}
			aria-valuemax={MAX_STARS}
			aria-valuenow={level}
			className="flex gap-1"
			data-skill-level={level}
		>
			{Array.from({ length: MAX_STARS }, (_, index) => (
				<div
					key={index}
					style={{ color: STAR_COLOR }}
					aria-hidden="true"
				>
					{index < level ? <StarFilled /> : <StarEmpty />}
				</div>
			))}
		</div>
	);
};

SkillLevelStars.displayName = 'SkillLevelStars';

export default SkillLevelStars;
