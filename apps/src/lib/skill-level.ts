const SKILL_LEVEL = [
	'no skill',
	'low',
	'medium',
	'high',
] as const;

export type SkillLevel = (typeof SKILL_LEVEL)[number];

export type SkillLevelIndex = keyof typeof SKILL_LEVEL & number;

export const isSkillLevelLabel = (input: unknown): input is SkillLevel => {
	const skillLevel = String(input).toLowerCase();
	return (
		typeof input === 'string' &&
		SKILL_LEVEL.includes(skillLevel as SkillLevel)
	);
};

/**
 * Which numeric value to use for visualizing the skill level.
 */
export const skillLevelIndexFor = (input: number): number => {
	/**
	 * As given by Xavier:
	 *
	 * ```
	 * <=0:     "no skill"
	 * >0 à 1:  "low"
	 * >1 à 2:  "medium"
	 * >2 :     "high"
	 * ```
	 */
	if (input <= 0) return 0; // no skill
	if (input <= 1) return 1; // low
	if (input <= 2) return 2; // medium
	return 3; // high
};

export const skillLevelIndexOfLabel = (input: unknown): SkillLevelIndex => {
	const normalized = String(input).toLowerCase();
	if (!isSkillLevelLabel(normalized)) {
		throw new Error(
			`Invalid input '${input}', expected one of: ${SKILL_LEVEL.join(', ')}`
		);
	}
	return SKILL_LEVEL.indexOf(normalized as SkillLevel) as SkillLevelIndex;
};

export const skillLevelLabelFor = (input: number): SkillLevel => {
	const index = skillLevelIndexFor(input);
	return SKILL_LEVEL[index];
};
