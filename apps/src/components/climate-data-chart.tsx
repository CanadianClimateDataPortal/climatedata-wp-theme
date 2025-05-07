import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Highcharts, {
	Options,
	SeriesOptionsType,
	SeriesLineOptions,
	SeriesArearangeOptions,
	SeriesColumnOptions,
	numberFormat,
	Point,
	Series,
} from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsStock from 'highcharts/modules/stock';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import 'highcharts/modules/offline-exporting';

import { cn } from '@/lib/utils';
import { ClimateDataProps } from '@/types/types.ts';
import { useLocale } from '@/hooks/use-locale';
import { useI18n } from '@wordpress/react-i18n';
import { useAppSelector } from '@/app/hooks';
import { useClimateVariable } from "@/hooks/use-climate-variable";
import appConfig from '@/config/app.config';
import { doyFormatter } from '@/lib/format';
import { getChartDataOptions, getSeriesObject } from '@/config/chart-config';
import { AveragingType } from "@/types/climate-variable-interface";

type TabValue = 'annual-values' | '30-year-averages' | '30-year-changes';

interface Tab {
	value: TabValue;
	label: string;
	enabled: boolean;
}

// necessary for highcharts to show the navigator area at the bottom of the chart
if (typeof HighchartsStock === 'function') {
	HighchartsStock(Highcharts);
}

interface TooltipPoint extends Point {
	series: Series;
	low?: number;
	high?: number;
}

/**
 * Component to render a chart using Highcharts with climate data.
 */
const ClimateDataChart: React.FC<{ title: string; latlng: L.LatLng; featureId: number, data: ClimateDataProps }> = ({
	title,
	latlng,
	featureId,
	data,
}) => {
	const { __ } = useI18n();
	const { locale } = useLocale();
	const { climateVariable } = useClimateVariable();
	const decimals = 1;
	const { dataset } = useAppSelector((state) => state.map);
	const chartRef = useRef<HighchartsReact.RefObject>(null);
	const climateVariableId = climateVariable?.getId();
	const version = climateVariable?.getVersion();
	const scenario = climateVariable?.getScenario();
	const unit = climateVariable?.getUnit();
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const [enableTabs, setEnableTabs] = useState(true);
	const [activeTab, setActiveTab] = useState<TabValue>('annual-values');
	const [activeSeries, setActiveSeries] = useState<string[]>([]);
	const [activeChartTooltip, setActiveChartTooltip] = useState<Highcharts.TooltipOptions>({});
	const [activeChartPlotOptions, setActiveChartPlotOptions] = useState<Highcharts.PlotOptions>({});
	const [enableChartNavigator, setEnableChartNavigator] = useState(true);

	// Subtitle displayed info
	const datasetLabel = dataset?.title.en ?? '';
	const versionLabel = appConfig.versions.filter((version) => version.value === climateVariable?.getVersion())[0]?.label;

	// Tooltip format value helper
	const formatValue = (value: number | undefined, isDelta:boolean = false) => {
		if (value === undefined) return '';

		if(unit === "doy") {
			return doyFormatter(Number(value), locale);
		} else {
			const formattedValue = Number(value).toFixed(decimals);
			// Add "+" prefix for positive delta values
			if (isDelta && Number(value) > 0) {
				return `+${formattedValue} ${unit}`;
			}
			return `${formattedValue} ${unit}`;
		}
	};

	// Tooltip: find closest timestamp for 30 years options
	const findClosetTimestamp = (timestamp: number, data: Record<string, number[]> | undefined) => {
		if (!data) return null;
		const sortedKeys = Object.keys(data)
			.map(Number)
			.sort((a, b) => a - b);
		const validKeys = sortedKeys.filter(key => key <= timestamp);
		return validKeys.length > 0 ? validKeys[validKeys.length - 1] : null;
	};

	// Get chart data options
	const chartDataOptions = useMemo(() => getChartDataOptions(__), [__]);

	// Get series object
	const seriesObject = useMemo<(SeriesLineOptions | SeriesArearangeOptions | SeriesColumnOptions)[]>(() => 
		getSeriesObject(data, version, climateVariableId, chartDataOptions),
		[data, version, climateVariableId, chartDataOptions]
	);

	// Tooltip formatter for 30 years averages and changes
	const tooltip30yFormatter = (x: number, prefix: string, isDelta: boolean, currentActiveSeries: string[]) => {
		// Chart reference
		const chart = chartRef.current?.chart;
		if (!chart) return;
		// Remove previous plot band
		chart.xAxis[0].removePlotBand('30y-plot-band',);

		// Get current range
		const currentTimestamp = x;
		const dataKey = prefix + scenario + '_median';
		const dataRecord = data[dataKey];
		if (!dataRecord) return '';
		
		const timestampKey = findClosetTimestamp(currentTimestamp, dataRecord as Record<string, number[]>);
		if(timestampKey === null) return '';

		// Displayed period
		const startYear = new Date(timestampKey).getFullYear() + 1;
		const endYear = startYear + 29;

		// Add plot band on 30 years range
		chart.xAxis[0].addPlotBand({
			from: Date.UTC(startYear, 0, 1),
			to: Date.UTC(startYear + 29, 11, 31),
			id: '30y-plot-band',
		});

		// Tooltip content
		let tooltip = `<b>${startYear} - ${endYear}`;
		if(prefix === "delta7100_") tooltip += ` (${__('Change from ')} 1971-2000)`;
		tooltip += `</b><br/>`;

		// Iterate on 30y data
		Object.keys(data)
			.filter((key) => key.startsWith(prefix))
			.forEach((key) => {
				const dataKey = key.replace(prefix, '');

				if(currentActiveSeries.includes(dataKey) === false) return;

				const currentData = data[key];
				if (!currentData || !chartDataOptions[dataKey]) return;

				const recordData = currentData as Record<string, number[]>;
				const timestampData = recordData[timestampKey];
				if (!timestampData) return;

				if (chartDataOptions[dataKey].type === 'arearange') {
					tooltip += `<span style="color:${chartDataOptions[dataKey].color}">&bull;</span> ${chartDataOptions[dataKey].name}: <b>${formatValue(timestampData[0], isDelta)}</b> - <b>${formatValue(timestampData[1], isDelta)}</b><br/>`;
				} else {
					tooltip += `<span style="color:${chartDataOptions[dataKey].color}">&bull;</span> ${chartDataOptions[dataKey].name}: <b>${formatValue(timestampData[0], isDelta)}</b><br/>`;
				}
			});

		return tooltip;
	};

	// Chart tooltips
	const chartTooltips = useMemo(() => 
		() => ({
			'annual-values': {
				crosshairs: true,
				shared: true,
				split: false,
				padding: 4,
				formatter: function(this: Point) {
					const points = (this as unknown as { points?: TooltipPoint[] }).points;
					
					// For MSC Climate Normals variable
					if (climateVariableId === 'msc_climate_normals') {
						return `<b>${months[this.x]}</b><br/>` + 
							points?.map((point: TooltipPoint) => {
								const unit = point.series.type === 'column' ? 'mm' : '°C';
								return `<span style="color:${point.series.color}">&bull;</span> ${point.series.name}: <b>${formatValue(point.y)} ${unit}</b><br/>`;
							}).join('') || '';
					}

					const year = new Date(this.x).getFullYear() + 1;
					return `<b>${year}</b><br/>` + 
						points?.map((point: TooltipPoint) => {
							if (point.series.type === 'arearange') {
								return `<span style="color:${point.series.color}">&bull;</span> ${point.series.name}: <b>${formatValue(point.low)}</b> - <b>${formatValue(point.high)}</b><br/>`;
							} else {
								return `<span style="color:${point.series.color}">&bull;</span> ${point.series.name}: <b>${formatValue(point.y)}</b><br/>`;
							}
						}).join('') || '';
				}
			},
			'30-year-averages': {
				followPointer: true,
				formatter: function (this: Point) {
					return tooltip30yFormatter(this.x, '30y_', false, activeSeries);
				},
			},
			'30-year-changes': {
				followPointer: true,
				formatter: function (this: Point) {
					return tooltip30yFormatter(this.x, 'delta7100_', true, activeSeries);
				},
			},
		}),
		[climateVariable, locale, decimals, activeSeries]
	);

	// Chart plot options
	const chartPlotOptions = useMemo<() => Record<TabValue, Highcharts.PlotOptions>>(() => 
		() => ({
			'annual-values': {
				series: {
					states: {
						hover: {
							enabled: true,
						},
						inactive: {
							enabled: true,
						},
					},
				},
			},
			'30-year-averages': {
				series: {
					states: {
						hover: {
							enabled: false,
						},
						inactive: {
							enabled: false,
						},
					},
				},
			},
			'30-year-changes': {
				series: {
					states: {
						hover: {
							enabled: false,
						},
						inactive: {
							enabled: false,
						},
					},
				},
			},
		}),
		[]
	);

	// Update plot bands when the active tab changes
	useEffect(() => {
		// Chart reference
		const chart = chartRef.current?.chart;
		if (!chart) return;
		// Remove previous plot bands when we change tab
		chart.xAxis[0].removePlotBand('30y-plot-band',);
		chart.xAxis[0].removePlotBand('delta-plot-band');

		if(activeTab === '30-year-changes') {
			// Add plot band for 30y changes
			chart.xAxis[0].addPlotBand({
				from: Date.UTC(1971, 0, 1),
				to: Date.UTC(2000, 11, 31),
				color: 'rgba(51,63,80,0.05)',
				id: 'delta-plot-band',
			});
		}
	}, [activeTab]);

	// adds visible property to each series
	const filteredSeries = useMemo<SeriesOptionsType[]>(() => {
		return (
			seriesObject.map((s) => {
				const baseSeries = {
					...s,
					visible: activeSeries.includes(s.custom?.key),
				};

				switch (s.type) {
					case 'line':
						return baseSeries as SeriesLineOptions;
					case 'arearange':
						return baseSeries as SeriesArearangeOptions;
					case 'column':
						return baseSeries as SeriesColumnOptions;
					default:
						return baseSeries;
				}
			}) || []
		);
	}, [activeTab, activeSeries, seriesObject]);

	// Initialize enableTabs state based on the climate variable
	useEffect(() => {
		setEnableTabs(climateVariableId !== 'msc_climate_normals');
		setEnableChartNavigator(climateVariableId !== 'msc_climate_normals');
	}
	, [climateVariableId]);

	// initialize activeSeries state with all leys  from the first tab
	useEffect(() => {
		setActiveSeries(seriesObject.map((s) => s.custom?.key) || []);
	}, [seriesObject]);
	
	// Initialize activeChartTooltip and activeChartPlotOptions
	useEffect(() => {
		setActiveChartTooltip(chartTooltips()[activeTab]);
		setActiveChartPlotOptions(chartPlotOptions()[activeTab]);
	}, [activeSeries, activeTab, chartTooltips, chartPlotOptions]);

	// Export filename
	const getExportFilename = () => {
		const formatForFilename = (str: string | undefined | null) => {
			return (str !== undefined && str !== null) ? str.toLowerCase().replace(/\s+/g, '-') : '';
		};

		return formatForFilename([
			__(title),
			__(datasetLabel),
			__(climateVariable?.getTitle() ?? ''),
			__(versionLabel),
			enableTabs ? __(activeTab) : null,
		].filter(Boolean).join('-'));
	};

	// Tabs configuration
	const isThirtyYearAveragingEnabled = useCallback(() => {
		const averagingOptions = climateVariable?.getAveragingOptions() ?? [];
		return averagingOptions.length > 0 && averagingOptions.includes(AveragingType.THIRTY_YEARS);
	}, [climateVariable]);

	// Tabs configuration
	const tabs: Tab[] = useMemo(() => [
		{
			value: 'annual-values',
			label: __('Annual Values'),
			enabled: true,
		},
		{
			value: '30-year-averages',
			label: __('30 Year Averages'),
			enabled: isThirtyYearAveragingEnabled(),
		},
		{
			value: '30-year-changes',
			label: __('30 Year Changes'),
			enabled: isThirtyYearAveragingEnabled(),
		},
	], [isThirtyYearAveragingEnabled, __]);

	// Chart options
	const chartOptions = useMemo<Options>(() => {
		return {
			chart: {
				backgroundColor: 'transparent',
				numberFormatter: function (num) {
					return numberFormat(num, decimals);
				},
				style: {
					fontFamily: 'CDCSans',
				},
				marginTop: 30,
				zoomType: 'x',
				panning: {
					enabled: true,
					type: 'x'
				},
				panKey: 'shift'
			},
			exporting: {
				filename: getExportFilename(),
				chartOptions: {
					legend: {
						enabled: true,
						align: 'center',
						verticalAlign: 'bottom',
						layout: 'horizontal',
						itemStyle: {
							fontWeight: 'normal',
							color: '#333',
						},
						itemHoverStyle: {
							color: '#000',
						},
					},
					title: {
						text: [
							__(title),
							__(climateVariable?.getTitle() ?? ''),
						].filter(Boolean).join(' - '),
					},
					yAxis: {
						title: {
							text: title,
						},
					},
				},
				csv: {
					dateFormat: '%Y-%m-%d',
				},
			},
			navigator: {
				enabled: enableChartNavigator,
				adaptToUpdatedData: true,
				height: 40,
				margin: 30,
			},
			navigation: {
				buttonOptions: {
					enabled: false, // disable highcharts hamburger context menu since we're using our own buttons
				},
			},
			rangeSelector: {
				enabled: false, // disable highcharts range selector, which shows zoom controls and range buttons
			},
			subtitle: {
				align: 'left',
				text: '',
			},
			title: {
				text: '',
			},
			tooltip: activeChartTooltip,
			plotOptions: activeChartPlotOptions,
			xAxis: climateVariableId === 'msc_climate_normals' ? {
				categories: months,
				crosshair: false,
			} : {
				crosshair: false,
				type: 'datetime',
			},
			yAxis: climateVariableId === 'msc_climate_normals' ? [
				{
					title: {
						text: 'Temperature (°C)',
						rotation: 270,
						align: 'middle',
						margin: 20,
						style: {
							fontSize: '12px'
						}
					},
					opposite: false,
					labels: {
						align: 'right',
						formatter: function () {
							return Number(this.value).toFixed(0);
						}
					},
				},
				{
					title: {
						text: 'Precipitation (mm)',
						rotation: -270,
						align: 'middle',
						margin: 20,
						style: {
							fontSize: '12px'
						}
					},
					opposite: true,
					labels: {
						align: 'left',
						formatter: function () {
							return Number(this.value).toFixed(0);
						}
					},
				}
			] : {
				title: {
					text: '',
				},
				opposite: true,
				labels: {
					align: 'left',
					formatter: function () {
						const unit = climateVariable?.getUnit();
						
						switch (unit) {
							case "doy":
									return doyFormatter(Number(this.value), locale);
							default:
									return Number(this.value).toFixed(decimals) + ' ' + unit;
						}
					}
				},
			},
			series: filteredSeries.map(series => {
				const baseSeries = {
					...series,
					marker: {
						enabled: false,
						symbol: 'circle',
						radius: 6,
						lineWidth: 0,
						opacity: 0.6,
						states: {
							hover: {
								enabled: activeTab === 'annual-values',
								lineWidth: 0,
								opacity: 0,
							},
						},
					},
				};

				if (climateVariableId === 'msc_climate_normals') {
					// Assign yAxis based on series type
					if (series.custom?.key === 'precipitation') {
						return {
							...baseSeries,
							yAxis: 1,
							pointWidth: 20,
							borderWidth: 0,
							zIndex: 0,
						} as SeriesOptionsType;
					} else {
						return {
							...baseSeries,
							yAxis: 0,
							zIndex: 1,
						} as SeriesOptionsType;
					}
				}

				if (series.custom?.key === 'rcp85_enhanced') {
					return {
						...baseSeries,
						marker: {
							enabled: true,
							symbol: 'diamond',
							radius: 12,
							lineWidth: 0,
							opacity: 0.6,
						},
					} as SeriesOptionsType;
				}

				return baseSeries as SeriesOptionsType;
			}),
		};
	}, [climateVariable, locale, title, filteredSeries, activeChartTooltip, activeChartPlotOptions]);

	// Export CSV from data
	const exportCsvFromData = (data: Record<string, Record<string, number[]>>): string => {
		// Get all ranges
		const rangesSet = new Set<string>();
		for (const scenario of Object.values(data)) {
			Object.keys(scenario).forEach(period => rangesSet.add(period));
		}
		const sortedRanges = Array.from(rangesSet).sort();
	
		// Headers
		const headers: string[] = ['DateTime'];
		const scenarioKeys: { key: string; columns: string[] }[] = [];
	
		for (const scenarioName of Object.keys(data)) {
			const anyValue = Object.values(data[scenarioName])[0];
			if (anyValue.length === 2) {
				headers.push(`${scenarioName}_p10`);
				headers.push(`${scenarioName}_p90`);
				scenarioKeys.push({ key: scenarioName, columns: ['low', 'high'] });
			} else {
				headers.push(scenarioName);
				scenarioKeys.push({ key: scenarioName, columns: ['value'] });
			}
		}
	
		// Build rows
		const rows = sortedRanges.map(range => {
			const row: (string | number)[] = [range];
			for (const scenario of scenarioKeys) {
				const values = data[scenario.key]?.[range];
	
				if (!values) {
					// Empty cell
					row.push(...scenario.columns.map(() => ''));
				} else if (scenario.columns.length === 2) {
					// Range -> two values
					row.push(values[0], values[1]);
				} else {
					// Median value
					row.push(values[0]);
				}
			}
			return row;
		});
	
		// Convert to CSV string
		const csvString = [headers, ...rows]
			.map(row => row.map(cell => `"${cell}"`).join(','))
			.join('\n');
	
		return csvString;
	};

	// Export method
	const handleExport = (format: string) => {
		const chart = chartRef.current?.chart;
		if (!chart) return;

		try {
			switch (format) {
				case 'pdf':
					chart.exportChartLocal({
						type: 'application/pdf',
					}, {
						chart: {
							backgroundColor: '#ffffff'
						}
					});
					break;
				case 'png':
					chart.exportChartLocal({
						type: 'image/png',
					}, {
						chart: {
							backgroundColor: '#ffffff'
						}
					});
					break;
					case 'csv':
						if(activeTab === 'annual-values') {
							chart.downloadCSV();
						} else {
							const prefixes: string[] = ['30y_', 'delta7100_'];
	
							// Get only data we want with the rights keys
							const csvData = Object.keys(data)
								.filter((key) => {
									return prefixes.some((prefix) => key.startsWith(prefix));
								})
								.reduce((acc: Record<string, Record<string, number[]>>, key) => {
									if(key === '30y_observations') return acc;

									const newKey = key.replace('_median', '_p50')
										.replace('_range', '');

									acc[newKey] = Object.fromEntries(
										Object.entries(data[key] ?? {}).map(([timestamp, value]) => {
											const year = new Date(Number(timestamp)).getFullYear();
											return [(year + 1) + "-" + (year + 30), value as number[]];
										})
									);
									return acc;
								}, {} as Record<string, Record<string, number[]>>);
	
							const csvString = exportCsvFromData(csvData);
	
							// Trigger download
							const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
							const link = document.createElement('a');
							link.href = URL.createObjectURL(blob);
							link.setAttribute('download', getExportFilename());
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						}
						break;
				case 'print':
					chart.print();
					break;
				default:
					console.warn(`Unsupported export format: ${format}`);
			}
		} catch (error) {
			console.error('Export failed:', error);
			alert(__('Export failed. Please try again.'));
		}
	};

	return (
		<div className="climate-chart z-[500] px-5 py-5">
			<div className="flex justify-between items-start mb-4">
				<div className="text-left">
					<h2 className="text-2xl text-cdc-black font-semibold leading-7 m-0">
						{title}
					</h2>
					<p className="text-sm text-neutral-grey-medium leading-5 m-0">
						{
							[
								__(datasetLabel),
								__(climateVariable?.getTitle() ?? ''),
								__(versionLabel)
							].filter(Boolean).join(' - ')
						}
					</p>
				</div>

				<div className='mr-10'>
					{ climateVariableId !== 'sea_level' && climateVariable?.getLocationModalContent(latlng, featureId, "panel") }
				</div>
			</div>
			<div className="flex justify-between items-center mb-4">
				<div className="flex justify-center">
					{enableTabs && tabs.map((tab) => (
						<button
							key={tab.value}
							className={cn(
								'text-xs font-semibold uppercase cursor-pointer border w-44 py-1 transition-colors duration-300 ease-out',
								activeTab === tab.value
									? 'bg-dark-purple text-white border-dark-purple'
									: 'bg-white text-dark-purple border-white ',
								activeTab !== tab.value && tab.enabled ? 'hover:border-dark-purple' : '',
								!tab.enabled && 'opacity-50 cursor-not-allowed'
							)}
							onClick={() => tab.enabled && setActiveTab(tab.value)}
							disabled={!tab.enabled}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="flex justify-end items-center gap-2">
					<span className="text-dark-purple text-xs font-semibold uppercase leading-4">
						{__('Export')}
					</span>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('pdf')}
					>
						{__('PDF')}
					</button>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('png')}
					>
						{__('PNG')}
					</button>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('csv')}
					>
						{__('CSV')}
					</button>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('print')}
					>
						{__('Print')}
					</button>
				</div>
			</div>

			<HighchartsReact 
				ref={chartRef}
				highcharts={Highcharts} 
				options={chartOptions} 
			/>

			{climateVariableId === 'msc_climate_normals' && (<p>
				{__('Additional Climate Normals variables are available from the')} <a href="https://climate-change.canada.ca/climate-data/#/climate-normals" target="_blank" className='text-dark-purple'>{__('Canadian Centre for Climate Services')}</a> {__('and the')} <a href="https://climate.weather.gc.ca/climate_normals/index_e.html" target="_blank" className='text-dark-purple'>{__('Government of Canada Historical Climate Data')}</a> {__('websites.')}
			</p>)}
		</div>
	);
};
ClimateDataChart.displayName = 'ClimateDataChart';

export default ClimateDataChart;
