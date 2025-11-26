import { useClimateVariable } from '@/hooks/use-climate-variable';
import { useEffect, useMemo, useRef } from 'react';
import S2DClimateVariable from '@/lib/s2d-climate-variable';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
	selectReleaseDateCache,
	selectReleaseDateLoading,
	setReleaseDate,
	setReleaseDateIsLoading,
} from '@/features/s2d/s2d-slice';
import { FetchError, fetchS2DReleaseDate } from '@/services/services';
import { utc } from '@/lib/utils';
import { ClimateVariableInterface } from '@/types/climate-variable-interface';


export type UseS2DHook = {
	/**
	 * Check whether the instance of {@see ClimateVariableInterface} is an {@see S2DClimateVariable}.
	 */
	isS2DVariable: boolean;
	/**
	 * The release date for the current S2D variable and frequency. Null if the
	 * current variable is not loaded, or not an S2D variable.
	 */
	releaseDate: Date | null;
};

/**
 * Generate a unique release date key for a climate variable and its selected
 * frequency.
 *
 * Return null if no frequency is selected.
 *
 * @param climateVariable
 */
function generateReleaseDateKey(
	climateVariable: ClimateVariableInterface
): string | null {
	const selectedFrequency = climateVariable.getFrequency();
	const climateVariableID = climateVariable.getId();

	return selectedFrequency
		? `${climateVariableID}__${selectedFrequency}`
		: null;
}

/**
 * Hook containing S2D-related state and functions.
 *
 * Calling this hook automatically triggers a fetch of the release date for
 * the current S2D variable and frequency. If the current variable is not an
 * S2D variable, nothing happens. It can thus be included even if a non-S2D
 * variable is selected.
 */
export const useS2D = (): UseS2DHook => {
	const dispatch = useAppDispatch();
	const { climateVariable } = useClimateVariable();

	const isS2DVariable =
		!!(climateVariable && climateVariable instanceof S2DClimateVariable);

	const selectedFrequency = climateVariable?.getFrequency();
	const climateVariableID = climateVariable?.getId();
	const releaseDateKey = isS2DVariable
		? generateReleaseDateKey(climateVariable)
		: null;

	const cachedReleaseDate = useAppSelector(
		releaseDateKey ? selectReleaseDateCache(releaseDateKey) : () => null
	);
	const releaseDateIsLoading = useAppSelector(
		releaseDateKey ? selectReleaseDateLoading(releaseDateKey) : () => false
	);

	const lastKeyRef = useRef<string | null>(null);

	/**
	 * Fetch and save in the cache store the release date for the current S2D
	 * variable and frequency.
	 *
	 * Do nothing if the current variable is not an S2D variable or if the
	 * cache store already contains the desired release date.
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

		// Since `releaseDateKey` is set (checked above), it implies that
		// `selectedFrequency` and `climateVariableID` are strings, and not null
		const frequency = selectedFrequency as string;
		const variable = climateVariableID as string;

		dispatch(
			setReleaseDateIsLoading({ key: releaseDateKey, isLoading: true })
		);

		(async () => {
			try {
				const releaseDate = await fetchS2DReleaseDate(
					variable,
					frequency,
					{ signal: abortController.signal }
				);

				if (releaseDate && !abortController.signal.aborted) {
					dispatch(
						setReleaseDate({
							key: releaseDateKey,
							value: releaseDate,
						})
					);
				}
			} catch (error) {
				if (error instanceof FetchError) {
					// In case of a fetch error, we show it in the console, but
					// we don't propagate it to avoid blocking the rest of the
					// app.
					console.error(error);
				} else {
					const originalError = error as Error;
					throw new Error(originalError.message, { cause: error });
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
			? utc(cachedReleaseDate)
			: null;
	}, [releaseDateKey, cachedReleaseDate]);

	return {
		releaseDate,
		isS2DVariable,
	};
};

export default useS2D;
