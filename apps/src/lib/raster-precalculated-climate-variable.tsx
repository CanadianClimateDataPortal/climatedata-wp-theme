import ClimateVariableBase from "@/lib/climate-variable-base";
import { ClimateVariables } from '@/config/climate-variables.config';
import {
	AveragingType,
	DateRangeConfig,
	DownloadType,
	FileFormatType,
	FrequencyConfig,
	FrequencyDisplayModeOption,
	FrequencyType,
	InteractiveRegionConfig,
	InteractiveRegionDisplay,
	InteractiveRegionOption,
	LocationModalContentParams,
	ScenariosConfig,
} from '@/types/climate-variable-interface';
import RasterPrecalcultatedClimateVariableValues from '../components/map-layers/raster-precalculated-climate-variable-values'
import { getFrequencyCode } from '@/lib/utils.ts';

interface DownloadPayloadProps {
	dataset_name: string | null;
	dataset_type: string;
	format: FileFormatType | null;
	month: string | null;
	var: string | null;
	zipped: boolean;
	bbox?: [number, number, number, number];
	points?: [number, number][];
}

class RasterPrecalculatedClimateVariable extends ClimateVariableBase {

	getVersions(): string[] {
		return super.getVersions().length > 0
			? super.getVersions()
			: [
				"cmip6",
				"cmip5",
			];
	}

	getScenariosConfig(): ScenariosConfig | null {
		return super.getScenariosConfig()
			? super.getScenariosConfig()
			: {
				cmip5: [
					"rcp26",
					"rcp45",
					"rcp85",
				],
				cmip6: [
					"ssp126",
					"ssp245",
					"ssp370",
					"ssp585",
				],
			};
	}

	getInteractiveRegionConfig(): InteractiveRegionConfig | null {
		return super.getInteractiveRegionConfig()
			? super.getInteractiveRegionConfig()
			: {
				[InteractiveRegionOption.GRIDDED_DATA]: InteractiveRegionDisplay.ALWAYS,
				[InteractiveRegionOption.CENSUS]: InteractiveRegionDisplay.MAP,
				[InteractiveRegionOption.HEALTH]: InteractiveRegionDisplay.MAP,
				[InteractiveRegionOption.WATERSHED]: InteractiveRegionDisplay.MAP,
			};
	}

	getFrequencyConfig(): FrequencyConfig | null {
		return super.getFrequencyConfig()
			? super.getFrequencyConfig()
			: {
				[FrequencyType.ANNUAL]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.MONTHLY]: FrequencyDisplayModeOption.ALWAYS,
				[FrequencyType.ALL_MONTHS]: FrequencyDisplayModeOption.DOWNLOAD,
			};
	}

	getGridType(): string | null {
		if (super.getGridType()) {
			// Prioritize getting value from config.
			return super.getGridType()
		} else {
			// Fallback based on the version.
			if (this.getVersion() === "cmip6") {
				return "canadagrid-m6";
			} else {
				return "canadagrid";
			}
		}
	}

	hasDelta(): boolean | undefined {
		return super.hasDelta() !== undefined
			? super.hasDelta()
			: true;
	}

	getAveragingOptions(): AveragingType[] {
		return super.getAveragingOptions().length > 0
			? super.getAveragingOptions()
			: [
				AveragingType.ALL_YEARS,
				AveragingType.THIRTY_YEARS
			];
	}

	getFileFormatTypes(): FileFormatType[] {
		return super.getFileFormatTypes().length > 0
			? super.getFileFormatTypes()
			: [
				FileFormatType.CSV,
				FileFormatType.JSON,
				FileFormatType.NetCDF,
			];
	}

	getDateRangeConfig(): DateRangeConfig | null {
		return super.getDateRangeConfig()
			? super.getDateRangeConfig()
			: {
				min: "1950",
				max: "2100",
				interval: 30
			};
	}

	getDownloadType(): DownloadType | null {
		return super.getDownloadType() ?? DownloadType.PRECALCULATED;
	}

	getAllCanDCSVariable(): string[] {
		return  [
			'tx_max',
			'tg_mean',
			'tn_mean',
			'tx_mean',
			'tnlt_-15',
			'tnlt_-25',
			'txgt_25',
			'txgt_27',
			'txgt_29',
			'txgt_30',
			'txgt_32',
			'tn_min',
			'last_spring_frost',
			'first_fall_frost',
			'frost_free_season',
			'r1mm',
			'r10mm',
			'r20mm',
			'rx1day',
			'prcptot',
			'rx5day',
			'cdd',
			'nr_cdd',
			'frost_days',
			'dlyfrzthw_tx0_tn-1',
			'cddcold_18',
			'tr_18',
			'tr_20',
			'tr_22',
			'gddgrow_5',
			'gddgrow_0',
			'hddheat_18',
			'ice_days'
		];
	}

	/**
	 * Sends a POST request to the download endpoint with the provided payload,
	 * receives a Blob in response (usually a ZIP file), and returns a temporary
	 * object URL that can be used to trigger a file download in the browser.
	 *
	 * @param payload - The data specifying what file(s) to download (variable, region, format, etc.)
	 * @returns A temporary blob URL as a string, or null if the request fails
	 * @throws Any network or HTTP error that occurs during the fetch
	 */
	async fetchDownloadUrl(payload: DownloadPayloadProps): Promise<string | null> {
		const url = `${window.DATA_URL}/download`;

		try {
			// Send the POST request with the payload as JSON
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload)
			});

			// Throw an error if the response is not OK (4xx or 5xx)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Convert the response to a Blob (usually a ZIP file)
			const blob = await response.blob();

			// Return a temporary object URL to be used for downloading
			return window.URL.createObjectURL(blob);
		} catch (error) {
			// Log and rethrow any errors during the request
			console.error('Download error:', error);
			throw error;
		}
	}

	// TODO: it seems this method is only used for gridded_data + drawn region
	// 	if that's the case, remove the `points` key from DownloadPayloadProps and
	// 	the logic below that handles selectedPoints
	async getDownloadUrl(): Promise<string | null> {
		const downloadUrl = await super.getDownloadUrl();
		if (downloadUrl) {
			return downloadUrl;
		}

		let frequencyCode;
		switch (this.getFrequency()) {
			case FrequencyType.ALL_MONTHS:
				frequencyCode = "all";
				break;
			default:
				frequencyCode = this.getFrequency();
		}


		const selectedRegion = this.getSelectedRegion?.(); // For a drawn region
		const selectedPoints = this.getSelectedPoints?.(); // For selected points/cells

		let payload: DownloadPayloadProps = {
			dataset_name: this.getVersion(),
			dataset_type: this.getAveragingType() === AveragingType.ALL_YEARS
				? "allyears"
				: "30ygraph",
			format: this.getFileFormat(),
			month: frequencyCode,
			var: this.getThreshold(),
			zipped: true,
		};

		if (selectedRegion && selectedRegion.bounds) {
			// Region (bbox) selection
			const bounds = selectedRegion.bounds as [[number, number], [number, number]];
			payload = {
				...payload,
				bbox: [
					bounds[0][0], // minLat
					bounds[0][1], // minLng
					bounds[1][0], // maxLat
					bounds[1][1], // maxLng
				],
			};
		} else if (selectedPoints && Object.keys(selectedPoints).length > 0) {
			payload = {
				...payload,
				points: selectedPoints && Object.keys(selectedPoints).length > 0
					? Object.values(selectedPoints).map(({ lat, lng }) => [lat, lng])
					: [],
			};
		}

		if (payload.var !== 'all') {
			return await this.fetchDownloadUrl(payload);
		} else {
			// Get the full list of variables to download (e.g., tx_max, rx5day, etc.)
			const allCanDcsVars = this.getAllCanDCSVariable();

			// Filter the list of allCanDcsVars to only include those with available configuration
			const availableVars = allCanDcsVars.filter((allCanDcsVar) => {
				let frequencyCode = '';
				let matchedConfig: typeof ClimateVariables[number] | undefined;

				if (payload.month) {
					frequencyCode = getFrequencyCode(payload.month);
					matchedConfig = ClimateVariables.find(
						(config) =>
							config.temporalThresholdConfig?.thresholds?.[allCanDcsVar]?.[frequencyCode] !== undefined
					);
				}

				return matchedConfig !== undefined;
			});
			// Create a list of promises for each variable's download request
			const downloadPromises = availableVars.map(async (allCanDcsVar) => {
					const payloadCopy = { ...payload, var: allCanDcsVar };
					return this.fetchDownloadUrl(payloadCopy); // Returns a blob URL or null
			});

			// Wait for all download requests to resolve
			const downloadUrls = await Promise.all(downloadPromises);


			// If more than one valid file was downloaded, combine them into a single ZIP
			if (downloadUrls.length > 1) {
				const JSZip = (await import('jszip')).default;
				const finalZip = new JSZip();

				// For each variable and its corresponding download URL:
				const fetchAndUnzip = availableVars.map(async (varName, index) => {
					const url = downloadUrls[index];
					if (!url) return;

					// Fetch the blob from the URL
					const response = await fetch(url);
					const blob = await response.blob();

					// Check if the blob is a ZIP file
					const isZip = blob.type.includes('zip');

					if (isZip) {
						// Create a folder in the final ZIP named after the variable (e.g., tx_max/)
						const folder = finalZip.folder(varName);
						if (!folder) {
							console.warn(`Could not create folder for variable: ${varName}`);
							return;
						}

						// Unzip the inner contents and place them into the folder
						const innerZip = await JSZip.loadAsync(blob);
						await Promise.all(
							Object.keys(innerZip.files).map(async (innerFileName) => {
								const fileData = await innerZip.files[innerFileName].async('blob');
								folder.file(innerFileName, fileData);
							})
						);
					} else {
						// File is not a ZIP — place it at the root of the final ZIP
						const fileName = `${varName}.nc`;
						finalZip.file(fileName, blob); // Added at root
					}
				});


				// Wait for all folders/files to be processed
				await Promise.all(fetchAndUnzip);

				// Generate the final ZIP blob and create a URL for it
				const finalZipBlob = await finalZip.generateAsync({
					type: 'blob',
					compression: 'DEFLATE',
				});
				const finalZipUrl = window.URL.createObjectURL(finalZipBlob);

				// Trigger download via a temporary <a> tag
				const a = document.createElement('a');
				a.href = finalZipUrl;
				a.download = 'all_variables.zip';
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(finalZipUrl); // Clean up the blob URL

				return null;
			}
		}
		return null;
	}

	getLocationModalContent({
		latlng,
		featureId,
		mode = "modal",
		scenario
	}: LocationModalContentParams): React.ReactNode {
		return (
			<RasterPrecalcultatedClimateVariableValues latlng={latlng} featureId={featureId} mode={mode} scenario={scenario ?? ''} />
		);
	}
}

export default RasterPrecalculatedClimateVariable;
