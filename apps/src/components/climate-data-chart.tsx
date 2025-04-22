import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Highcharts, {
	Options,
	SeriesOptionsType,
	SeriesLineOptions,
	SeriesArearangeOptions,
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

type TabValue = 'annual-values' | '30-year-averages' | '30-year-changes';

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
	const version = climateVariable?.getVersion();
	const scenario = climateVariable?.getScenario();
	const unit = climateVariable?.getUnit();

	const [activeTab, setActiveTab] = useState<TabValue>('annual-values');
	const [activeSeries, setActiveSeries] = useState<string[]>([]);
	const [activeChartTooltip, setActiveChartTooltip] = useState<Highcharts.TooltipOptions>({});
	const [activeChartPlotOptions, setActiveChartPlotOptions] = useState<Highcharts.PlotOptions>({});

	// Subtitle displayed info
	const datasetLabel = dataset?.title.en;
	const versionLabel = appConfig.versions.filter((version) => version.value === climateVariable?.getVersion())[0].label;

	// Helper to sort an array of tuples by the first element (x-value / timestamp).
	const sortByTimestamp = useCallback((seriesData: number[][] | Record<string, number[]> | undefined) => {
		return Array.isArray(seriesData) ? seriesData.slice().sort((a, b) => a[0] - b[0]) : [];
	}, []);

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

	// Chart data colors
	const chartDataOptions: Record<string, { name: string; color: string; type?: string }> = {
		'observations': {
			name: __('Gridded Historical Data'),
			color: 'gray',
			type: 'line',
		},
		'modeled_historical_median': {
			name: __('Modeled Historical'),
			color: 'black',
			type: 'line',
		},
		'modeled_historical_range': {
			name: __('Historical Range'),
			color: 'gray',
			type: 'arearange',
		},
		'ssp126_median': {
			name: __('SSP1-2.6 Median'),
			color: '#0000ff',
			type: 'line',
		},
		'ssp126_range': {
			name: __('SSP1-2.6 Range'),
			color: '#0000ff',
			type: 'arearange',
		},
		'ssp245_median': {
			name: __('SSP2-4.5 Median'),
			color: '#00640c',
			type: 'line',
		},
		'ssp245_range': {
			name: __('SSP2-4.5 Range'),
			color: '#00640c',
			type: 'arearange',
		},
		'ssp585_median': {
			name: __('SSP5-8.5 Median'),
			color: '#ff0000',
			type: 'line',
		},
		'ssp585_range': {
			name: __('SSP5-8.5 Range'),
			color: '#ff0000',
			type: 'arearange',
		},
		'rcp26_median': {
			name: __('RCP 2.6 Median'),
			color: '#0000ff',
			type: 'line',
		},
		'rcp26_range': {
			name: __('RCP 2.6 Range'),
			color: '#0000ff',
			type: 'arearange',
		},
		'rcp45_median': {
			name: __('RCP 4.5 Median'),
			color: '#00640c',
			type: 'line',
		},
		'rcp45_range': {
			name: __('RCP 4.5 Range'),
			color: '#00640c',
			type: 'arearange',
		},
		'rcp85_median': {
			name: __('RCP 8.5 Median'),
			color: '#ff0000',
			type: 'line',
		},
		'rcp85_range': {
			name: __('RCP 8.5 Range'),
			color: '#ff0000',
			type: 'arearange',
		},
	};

	// Chart serie
	const seriesObject = useMemo<
		(SeriesLineOptions | SeriesArearangeOptions)[]
	>(() => {
		switch (version) {
			case 'cmip5':
				return [
					{
						custom: { key: 'observations' },
						name: chartDataOptions['observations'].name,
						type: chartDataOptions['observations'].type,
						data: sortByTimestamp(data.observations),
						color: chartDataOptions['observations'].color,
						lineWidth: 1.5,
						dashStyle: 'ShortDash',
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_median' },
						name: chartDataOptions['modeled_historical_median'].name,
						type: chartDataOptions['modeled_historical_median'].type,
						data: sortByTimestamp(data.modeled_historical_median),
						color: chartDataOptions['modeled_historical_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_range' },
						name: chartDataOptions['modeled_historical_range'].name,
						type: chartDataOptions['modeled_historical_range'].type,
						data: sortByTimestamp(data.modeled_historical_range),
						color: chartDataOptions['modeled_historical_range'].color,
						fillOpacity: 0.5,
						lineWidth: 0,
						zIndex: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'rcp26_median' },
						name: chartDataOptions['rcp26_median'].name,
						type: chartDataOptions['rcp26_median'].type,
						data: sortByTimestamp(data.rcp26_median),
						color: chartDataOptions['rcp26_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'rcp26_range' },
						name: chartDataOptions['rcp26_range'].name,
						type: chartDataOptions['rcp26_range'].type,
						data: sortByTimestamp(data.rcp26_range),
						color: chartDataOptions['rcp26_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'rcp45_median' },
						name: chartDataOptions['rcp45_median'].name,
						type: chartDataOptions['rcp45_median'].type,
						data: sortByTimestamp(data.rcp45_median),
						color: chartDataOptions['rcp45_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'rcp45_range' },
						name: chartDataOptions['rcp45_range'].name,
						type: chartDataOptions['rcp45_range'].type,
						data: sortByTimestamp(data.rcp45_range),
						color: chartDataOptions['rcp45_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'rcp85_median' },
						name: chartDataOptions['rcp85_median'].name,
						type: chartDataOptions['rcp85_median'].type,
						data: sortByTimestamp(data.rcp85_median),
						color: chartDataOptions['rcp85_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'rcp85_range' },
						name: chartDataOptions['rcp85_range'].name,
						type: chartDataOptions['rcp85_range'].type,
						data: sortByTimestamp(data.rcp85_range),
						color: chartDataOptions['rcp85_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
				];
			case 'cmip6':
				return [
					{
						custom: { key: 'observations' },
						name: chartDataOptions['observations'].name,
						type: chartDataOptions['observations'].type,
						data: sortByTimestamp(data.observations),
						color: chartDataOptions['observations'].color,
						lineWidth: 1.5,
						dashStyle: 'ShortDash',
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_median' },
						name: chartDataOptions['modeled_historical_median'].name,
						type: chartDataOptions['modeled_historical_median'].type,
						data: sortByTimestamp(data.modeled_historical_median),
						color: chartDataOptions['modeled_historical_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'modeled_historical_range' },
						name: chartDataOptions['modeled_historical_range'].name,
						type: chartDataOptions['modeled_historical_range'].type,
						data: sortByTimestamp(data.modeled_historical_range),
						color: chartDataOptions['modeled_historical_range'].color,
						fillOpacity: 0.3,
						lineWidth: 0,
						zIndex: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp126_median' },
						name: chartDataOptions['ssp126_median'].name,
						type: chartDataOptions['ssp126_median'].type,
						data: sortByTimestamp(data.ssp126_median),
						color: chartDataOptions['ssp126_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp126_range' },
						name: chartDataOptions['ssp126_range'].name,
						type: chartDataOptions['ssp126_range'].type,
						data: sortByTimestamp(data.ssp126_range),
						color: chartDataOptions['ssp126_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp245_median' },
						name: chartDataOptions['ssp245_median'].name,
						type: chartDataOptions['ssp245_median'].type,
						data: sortByTimestamp(data.ssp245_median),
						color: chartDataOptions['ssp245_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp245_range' },
						name: chartDataOptions['ssp245_range'].name,
						type: chartDataOptions['ssp245_range'].type,
						data: sortByTimestamp(data.ssp245_range),
						color: chartDataOptions['ssp245_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
					{
						custom: { key: 'ssp585_median' },
						name: chartDataOptions['ssp585_median'].name,
						type: chartDataOptions['ssp585_median'].type,
						data: sortByTimestamp(data.ssp585_median),
						color: chartDataOptions['ssp585_median'].color,
						lineWidth: 2,
					} as SeriesLineOptions,
					{
						custom: { key: 'ssp585_range' },
						name: chartDataOptions['ssp585_range'].name,
						type: chartDataOptions['ssp585_range'].type,
						data: sortByTimestamp(data.ssp585_range),
						color: chartDataOptions['ssp585_range'].color,
						fillOpacity: 0.2,
						lineWidth: 0,
					} as SeriesArearangeOptions,
				];
			default:
				return [];
		}
	}, [data, sortByTimestamp]);

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
		let tooltip = `<b>${startYear} - ${endYear}</b><br/>`;

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

					return points?.map((point: TooltipPoint) => {
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
					default:
						return baseSeries;
				}
			}) || []
		);
	}, [activeTab, activeSeries, seriesObject]);

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

		return formatForFilename(title)
			+ '-' + formatForFilename(datasetLabel)
			+ '-' + formatForFilename(climateVariable?.getTitle())
			+ '-' + formatForFilename(versionLabel);
	};

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
						text: title,
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
			legend: {
				enabled: false, // using our own legend at the bottom with custom checkboxes
			},
			navigator: {
				enabled: true,
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
			plotOptions: {
				...activeChartPlotOptions,
				series: {
					...activeChartPlotOptions.series,
					marker: {
						symbol: 'circle',
						radius: 6,
						lineWidth: 0,
						opacity: 0.6,
						states: {
							hover: { // enable on hover
								enabled: true,
								lineWidth: 0,
								opacity: 0,
							},
						},
					},
				},
			},
			xAxis: {
				crosshair: false,
				type: 'datetime',
			},
			yAxis: {
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
			series: filteredSeries,
		};
	}, [climateVariable, locale, title, filteredSeries, activeChartTooltip, activeChartPlotOptions]);

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
					chart.downloadCSV();
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
						{datasetLabel} - {climateVariable?.getTitle()} - {versionLabel}
					</p>
				</div>

				<div className='mr-10'>
					{ climateVariable?.getLocationModalContent(latlng, featureId, "panel") }
				</div>
			</div>
			<div className="flex justify-between items-center mb-4">
				<div className="flex justify-center">
					<button
						className={cn(
							'text-xs font-semibold uppercase cursor-pointer border w-44 py-1 transition-colors duration-300 ease-out',
							activeTab === 'annual-values'
								? 'bg-dark-purple text-white border-dark-purple'
								: 'bg-white text-dark-purple border-white hover:border-dark-purple'
						)}
						onClick={() => setActiveTab('annual-values')}
					>
						{__('Annual Values')}
					</button>
					<button
						className={cn(
							'text-xs font-semibold uppercase cursor-pointer border w-44 py-1 transition-colors duration-300 ease-out',
							activeTab === '30-year-averages'
								? 'bg-dark-purple text-white border-dark-purple'
								: 'bg-white text-dark-purple border-white hover:border-dark-purple'
						)}
						onClick={() => setActiveTab('30-year-averages')}
					>
						{__('30 Year Averages')}
					</button>
					<button
						className={cn(
							'text-xs font-semibold uppercase cursor-pointer border w-44 py-1 transition-colors duration-300 ease-out',
							activeTab === '30-year-changes'
								? 'bg-dark-purple text-white border-dark-purple'
								: 'bg-white text-dark-purple border-white hover:border-dark-purple'
						)}
						onClick={() => setActiveTab('30-year-changes')}
					>
						{__('30 Year Changes')}
					</button>
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

			{/* toggle visibility of series points */}
			<div className="flex flex-wrap items-center justify-center gap-4 my-2 mx-12">
				{filteredSeries.map((s: SeriesOptionsType, index: number) => (
					<label
						key={index}
						className="flex items-center gap-1 cursor-pointer select-none"
					>
						{/* toggle input */}
						<input
							type="checkbox"
							checked={s.visible}
							onChange={() => {
								setActiveSeries((prev) =>
									prev.includes(s.custom?.key ?? '')
										? prev.filter(
												(key) => key !== s.custom?.key
											)
										: [...prev, s.custom?.key ?? '']
								);
							}}
							className="hidden peer"
						/>

						{/* series dot indicator */}
						<span
							className="w-4 h-4 rounded-full"
							style={{
								backgroundColor:
									'color' in s && typeof s.color === 'string'
										? s.color
										: 'transparent',
							}}
						/>

						{/* series label */}
						<span className="text-sm text-neutral-grey-medium leading-5 peer-checked:no-underline line-through">
							{s.name}
						</span>
					</label>
				))}
			</div>
		</div>
	);
};
ClimateDataChart.displayName = 'ClimateDataChart';

export default ClimateDataChart;
