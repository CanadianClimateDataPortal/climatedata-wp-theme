import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setDataset } from '@/features/download/download-slice';
import { setClimateVariable } from '@/store/climate-variable-slice';
import { ClimateVariables } from '@/config/climate-variables.config';
import { ClimateVariableConfigInterface } from '@/types/climate-variable-interface';
import { fetchTaxonomyData, fetchPostsData } from '@/services/services';
import { initializeDownloadUrlSync, setDownloadUrlParamsLoaded } from '@/features/download/download-url-sync-slice';
import { normalizePostData } from '@/lib/format';

/**
 * Synchronizes download state with URL params
 * Simpler than the map URL sync since we only need dataset and variable
 */
export const useDownloadUrlSync = () => {
	const updateTimeoutRef = useRef<number | null>(null);
	const urlProcessingCompleteRef = useRef<boolean>(false);
	const dispatch = useAppDispatch();

	// Get the URL sync state
	const isInitialized = useAppSelector((state) => state.downloadUrlSync.isInitialized);
	const dataset = useAppSelector((state) => state.download.dataset);
	const climateVariableData = useAppSelector((state) => state.climateVariable.data);
	const currentStep = useAppSelector((state) => 
		state.download.currentStep !== undefined ? state.download.currentStep : 1
	);

	// Helper function to add parameters to URL
	const addParamsToUrl = (
		params: URLSearchParams
	) => {
		// Only include parameters if we're past step 1
		if (currentStep > 1) {
			if (dataset && dataset.term_id) {
				params.set('dataset', dataset.term_id.toString());
				
				// Only include variable if we're at step 2 or beyond and have a selected variable
				if (currentStep > 1 && climateVariableData?.id) {
					params.set('var', climateVariableData.id);
				}
			}
		} else {
			// Clear params when on step 1
			params.delete('var');
			params.delete('dataset');
		}
	};

	const updateUrlWithDebounce = useCallback(() => {
		if (typeof window === 'undefined' || !isInitialized) return;

		if (updateTimeoutRef.current !== null) {
			window.clearTimeout(updateTimeoutRef.current);
		}

		updateTimeoutRef.current = window.setTimeout(() => {
			const params = new URLSearchParams(window.location.search);

			addParamsToUrl(params);

			// Update URL without navigation
			const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
			window.history.replaceState({}, '', newUrl);

			updateTimeoutRef.current = null;
		}, 200);
	}, [
		climateVariableData,
		dataset,
		isInitialized,
		currentStep
	]);

	useEffect(() => {
		if (isInitialized || urlProcessingCompleteRef.current) return;
		const params = new URLSearchParams(window.location.search);

		dispatch(initializeDownloadUrlSync());

		// Mark as NOT loaded until processing completes
		dispatch(setDownloadUrlParamsLoaded(false));

		// Process URL parameters
		(async () => {
			try {
				const datasetParam = params.get('dataset');
				const variableParam = params.get('var');

				if (datasetParam) {
					const datasets = await fetchTaxonomyData('datasets', 'download');

					// Find dataset by term_id
					const datasetParamNum = parseInt(datasetParam);
					const matchedDataset = !isNaN(datasetParamNum) ? datasets.find(dataset => dataset.term_id === datasetParamNum) : null;

					if (matchedDataset) {
						dispatch(setDataset(matchedDataset));

						if (variableParam) {
							const variables = await fetchPostsData('variables', 'download', matchedDataset, {});
							const normalizedVariables = await normalizePostData(variables, 'en');

							// Find the matching config
							const matchedVariable = ClimateVariables.find(
								(config) => config.id === variableParam
							);

							if (matchedVariable) {
								const matchingPostData = normalizedVariables.find(post => post.id === variableParam);

								if (matchingPostData) {
									// Create a config that includes post data
									const variableConfig: ClimateVariableConfigInterface = {
										...matchedVariable,
										postId: matchingPostData.postId,
										title: matchingPostData.title,
										datasetType: matchedDataset?.dataset_type,
									};

									dispatch(setClimateVariable(variableConfig));
								} else {
									// Set the variable without post data
									dispatch(setClimateVariable(matchedVariable));
								}
							}
						}
					}
				}

				// Mark URL parameters as loaded
				urlProcessingCompleteRef.current = true;
				dispatch(setDownloadUrlParamsLoaded(true));
			} catch (error) {
				console.error('Error processing URL parameters:', error);
				urlProcessingCompleteRef.current = true;
				dispatch(setDownloadUrlParamsLoaded(true));
			}
		})();
	}, [dispatch, isInitialized]);

	useEffect(() => {
		if (!isInitialized) return;
		updateUrlWithDebounce();
	}, [
		climateVariableData,
		dataset,
		updateUrlWithDebounce,
		isInitialized,
		currentStep
	]);

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (updateTimeoutRef.current !== null) {
				window.clearTimeout(updateTimeoutRef.current);
			}
		};
	}, []);
};
