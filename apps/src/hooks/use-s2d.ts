import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useEffect, useMemo, useRef } from 'react';
import SeasonalDecadalClimateVariable from '@/lib/seasonal-decadal-climate-variable';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	selectReleaseDateCache,
	selectReleaseDateLoading,
	setReleaseDate,
	setReleaseDateIsLoading,
} from '@/features/s2d/s2d-slice';
import { fetchS2DReleaseDate } from '@/services/services';
import { parseReleaseDate } from '@/lib/s2d';

/**
 * Hook related to S2D variables.
 *
 * Calling this hook will automatically trigger a fetch of the release date for
 * the current S2D variable and frequency. If the current variable is not an
 * S2D variable, nothing happens. It can thus be included even if a non-S2D
 * variable is selected.
 */
export const useS2D = () => {
	const dispatch = useAppDispatch();
	const { climateVariable } = useClimateVariable();

	const isS2DVariable =
		climateVariable &&
		climateVariable instanceof SeasonalDecadalClimateVariable;

	const selectedFrequency = climateVariable?.getFrequency();
	const climateVariableID = climateVariable?.getId();
	const releaseDateKey =
		isS2DVariable && selectedFrequency
			? `${climateVariableID}__${selectedFrequency}`
			: null;

	const cachedReleaseDate = useAppSelector(
		releaseDateKey ? selectReleaseDateCache(releaseDateKey) : () => null
	);
	const releaseDateIsLoading = useAppSelector(
		releaseDateKey ? selectReleaseDateLoading(releaseDateKey) : () => false
	);

	const lastKeyRef = useRef<string | null>(null);

	/**
	 * Fetch the release date for the current S2D variable and frequency.
	 *
	 * Returns immediately if the current variable is not an S2D variable.
	 */
	useEffect(() => {
		// The releaseDateKey is null if the current variable is not an S2D variable
		if (!releaseDateKey) {
			return;
		}

		// Do not fetch if the release date is already cached or being fetched
		if (
			cachedReleaseDate !== null ||
			releaseDateIsLoading ||
			lastKeyRef.current === releaseDateKey
		) {
			return;
		}

		const abortController = new AbortController();
		lastKeyRef.current = releaseDateKey;

		// If `releaseDateKey` is set, it implies that `selectedFrequency` and
		// `climateVariableID` are strings, and not null
		const frequency = selectedFrequency as string;
		const variable = climateVariableID as string;

		dispatch(
			setReleaseDateIsLoading({ key: releaseDateKey, isLoading: true })
		);

		(async () => {
			try {
				const releaseDate = await fetchS2DReleaseDate(
					{ variable, frequency },
					{ signal: abortController.signal }
				);
				if (!abortController.signal.aborted) {
					dispatch(
						setReleaseDate({
							key: releaseDateKey,
							value: releaseDate,
						})
					);
				}
			} finally {
				dispatch(
					setReleaseDateIsLoading({
						key: releaseDateKey,
						isLoading: false,
					})
				);
			}
		})();

		return () => {
			abortController.abort();
			lastKeyRef.current = null;
		};

		// About the following eslint disable: we don't put `releaseDateIsLoading` as a dependency,
		// even though it's used in the hook, because it's updated inside the hook, but it's also
		// used to decide whether to fetch or not. If we add it to the dependencies, it will cause
		// the useEffect() to be immediately reexecuted, cancelling the fetch and preventing
		// another fetch.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		releaseDateKey,
		climateVariableID,
		selectedFrequency,
		cachedReleaseDate,
		dispatch,
	]);

	/**
	 * The release date (as a Date instance) for the current S2D variable and
	 * frequency.
	 *
	 * If the current variable is not an S2D variable, or if the release date is
	 * not yet loaded, it's set to null.
	 */
	const releaseDate = useMemo<Date | null>(() => {
		return releaseDateKey && cachedReleaseDate
			? parseReleaseDate(cachedReleaseDate)
			: null;
	}, [releaseDateKey, cachedReleaseDate]);

	return { releaseDate };
};
