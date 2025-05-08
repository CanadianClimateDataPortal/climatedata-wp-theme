import { useEffect, useRef, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setDataset } from '@/features/download/download-slice';
import { TaxonomyData } from '@/types/types';
import { useClimateVariable } from '@/hooks/use-climate-variable';
import { fetchTaxonomyData } from '@/services/services';
import { DownloadContext } from '@/context/download-provider';

/**
 * Hook to synchronize download app state with URL parameters
 * Handles bidirectional sync between URL and application state for dataset and variable
 */
export const useDownloadUrlSync = () => {
	const dispatch = useAppDispatch();
	const { climateVariable, selectClimateVariable } = useClimateVariable();
	const downloadState = useAppSelector(state => state.download);
	const dataset = downloadState.dataset;
	const { variableList } = useAppSelector(state => state.map);
	const isUrlInitialized = useRef(false);
	const updatingFromUrl = useRef(false);
	const downloadContext = useContext(DownloadContext);
	const currentStep = downloadContext?.currentStep || 1;
	const previousStep = useRef(1);

	// Update URL when dataset is manually selected (only in step 1)
	useEffect(() => {
		if (!dataset || updatingFromUrl.current) return;

		const params = new URLSearchParams(window.location.search);
		
		if (dataset.term_id) {
			params.set('dataset', dataset.term_id.toString());
		}
		
		// We don't want to add variable param in step 1
		if (currentStep === 1 && params.has('var')) {
			// Remove variable parameter if we're in step 1
			params.delete('var');
		}

		// Replace current URL with new parameters
		window.history.replaceState(null, '', `?${params.toString()}`);
	}, [dataset, currentStep]);

	// Update URL when variable changes and we're in step 2+
	useEffect(() => {
		if (!climateVariable || !dataset || updatingFromUrl.current || currentStep < 2) return;

		const params = new URLSearchParams(window.location.search);
		
		if (dataset.term_id) {
			params.set('dataset', dataset.term_id.toString());
		}
		
		const variableId = climateVariable.getId();
		if (variableId) {
			params.set('var', variableId.toString());
		}

		// Replace current URL with new parameters
		window.history.replaceState(null, '', `?${params.toString()}`);
	}, [climateVariable, currentStep, dataset]);

	useEffect(() => {
		// Detect when moving from step 1 to step 2
		if (previousStep.current === 1 && currentStep === 2 && !updatingFromUrl.current) {
			if (climateVariable && dataset) {
				const params = new URLSearchParams(window.location.search);
				
				if (dataset.term_id) {
					params.set('dataset', dataset.term_id.toString());
				}
				
				const variableId = climateVariable.getId();
				if (variableId) {
					params.set('var', variableId.toString());
				}
				
				window.history.replaceState(null, '', `?${params.toString()}`);
			}
		}
		
		// Update previous step
		previousStep.current = currentStep;
	}, [currentStep, climateVariable, dataset]);

	// Load state from URL on initial load
	useEffect(() => {
		if (isUrlInitialized.current || !variableList.length) return;
		
		const params = new URLSearchParams(window.location.search);
		const datasetId = params.get('dataset');
		const variableId = params.get('var');

		if (!datasetId && !variableId) {
			isUrlInitialized.current = true;
			return;
		}

		updatingFromUrl.current = true;

		const processParams = async () => {
			try {
				let selectedDataset: TaxonomyData | null = null;
				
				if (datasetId) {
					const datasetIdNum = parseInt(datasetId);
					if (!isNaN(datasetIdNum)) {
						try {
							const datasets = await fetchTaxonomyData('datasets', 'download');
							const matchedDataset = datasets.find(d => d.term_id === datasetIdNum);
							
							if (matchedDataset) {
								dispatch(setDataset(matchedDataset));
								selectedDataset = matchedDataset;
							}
						} catch (error) {
							console.error('Error fetching datasets:', error);
						}
					}
				}
				
				if (variableId && selectedDataset) {
					const variableToSelect = variableList.find(v => v.id.toString() === variableId);
					
					if (variableToSelect) {
						selectClimateVariable(variableToSelect, selectedDataset);
					}
				}
			} finally {
				updatingFromUrl.current = false;
				isUrlInitialized.current = true;
			}
		};

		processParams();
	}, [dispatch, variableList, selectClimateVariable]);

	// Listen for URL changes (browser back/forward)
	useEffect(() => {
		const handlePopState = () => {
			if (!variableList.length) return;
			
			const params = new URLSearchParams(window.location.search);
			const datasetId = params.get('dataset');
			const variableId = params.get('var');

			if (!datasetId && !variableId) return;

			updatingFromUrl.current = true;

			// Process the URL parameters
			const processParams = async () => {
				try {
					let selectedDataset: TaxonomyData | null = null;
					
					// Process dataset if present
					if (datasetId) {
						const datasetIdNum = parseInt(datasetId);
						if (!isNaN(datasetIdNum)) {
							try {
								// Fetch datasets
								const datasets = await fetchTaxonomyData('datasets', 'download');
								const matchedDataset = datasets.find(d => d.term_id === datasetIdNum);
								
								if (matchedDataset) {
									dispatch(setDataset(matchedDataset));
									selectedDataset = matchedDataset;
								}
							} catch (error) {
								console.error('Error fetching datasets:', error);
							}
						}
					}
					
					// Process variable if present and we have a dataset
					if (variableId && selectedDataset) {
						const variableToSelect = variableList.find(v => v.id.toString() === variableId);
						
						if (variableToSelect) {
							selectClimateVariable(variableToSelect, selectedDataset);
						}
					}
				} finally {
					updatingFromUrl.current = false;
				}
			};

			processParams();
		};

		window.addEventListener('popstate', handlePopState);
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, [dispatch, variableList, selectClimateVariable]);

	return null;
};