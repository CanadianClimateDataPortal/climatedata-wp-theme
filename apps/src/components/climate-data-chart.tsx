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

	const [activeTab, setActiveTab] = useState('annual-values');
	const [activeSeries, setActiveSeries] = useState<string[]>([]);

	// Subtitle displayed info
	const datasetLabel = dataset?.title.en;
	const versionLabel = appConfig.versions.filter((version) => version.value === climateVariable?.getVersion())[0].label;

	// Helper to sort an array of tuples by the first element (x-value / timestamp).
	const sortByTimestamp = useCallback((seriesData: number[][]) => {
		return seriesData.slice().sort((a, b) => a[0] - b[0]);
	}, []);

	const formatData = useCallback((dataset: Record<string, number[]> = {}) => {
		return Object.entries(dataset).map(([timestamp, values]) => [
			parseInt(timestamp, 10),
			...values,
		]);
	}, []);

	const seriesObject = useMemo<
		Record<string, (SeriesLineOptions | SeriesArearangeOptions)[]>
	>(
		() => ({
			'annual-values': [
				{
					custom: { key: 'gridded-historical' },
					name: __('Gridded Historical Data'),
					type: 'line',
					data: sortByTimestamp(data.observations),
					color: 'gray',
					lineWidth: 1.5,
					dashStyle: 'ShortDash',
				} as SeriesLineOptions,
				{
					custom: { key: 'modeled-historical' },
					name: __('Modeled Historical'),
					type: 'line',
					data: sortByTimestamp(data.modeled_historical_median),
					color: 'black',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'historical-range' },
					name: __('Historical Range'),
					type: 'arearange',
					data: sortByTimestamp(data.modeled_historical_range),
					color: 'lightgray',
					fillOpacity: 0.3,
					zIndex: 0,
				} as SeriesArearangeOptions,
				{
					custom: { key: 'ssp126-median' },
					name: __('SSP1-2.6 Median'),
					type: 'line',
					data: sortByTimestamp(data.ssp126_median),
					color: 'blue',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'ssp126-range' },
					name: __('SSP1-2.6 Range'),
					type: 'arearange',
					data: sortByTimestamp(data.ssp126_range),
					color: 'lightblue',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
				{
					custom: { key: 'ssp245-median' },
					name: __('SSP2-4.5 Median'),
					type: 'line',
					data: sortByTimestamp(data.ssp245_median),
					color: 'green',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'ssp245-range' },
					name: __('SSP2-4.5 Range'),
					type: 'arearange',
					data: sortByTimestamp(data.ssp245_range),
					color: 'lightgreen',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
				{
					custom: { key: 'ssp585-median' },
					name: __('SSP5-8.5 Median'),
					type: 'line',
					data: sortByTimestamp(data.ssp585_median),
					color: 'red',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'ssp585-range' },
					name: __('SSP5-8.5 Range'),
					type: 'arearange',
					data: sortByTimestamp(data.ssp585_range),
					color: 'pink',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
			],
			'30-year-averages': [
				{
					custom: { key: '30y-observations' },
					name: __('30y Observations'),
					type: 'line',
					data: sortByTimestamp(formatData(data['30y_observations'])),
					color: 'black',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: '30y-ssp126-median' },
					name: __('30y SSP1-2.6 Median'),
					type: 'line',
					data: sortByTimestamp(
						formatData(data['30y_ssp126_median'])
					),
					color: 'blue',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: '30y-ssp126-range' },
					name: __('30y SSP1-2.6 Range'),
					type: 'arearange',
					data: sortByTimestamp(formatData(data['30y_ssp126_range'])),
					color: 'lightblue',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
				{
					custom: { key: '30y-ssp245-median' },
					name: __('30y SSP2-4.5 Median'),
					type: 'line',
					data: sortByTimestamp(
						formatData(data['30y_ssp245_median'])
					),
					color: 'green',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: '30y-ssp245-range' },
					name: __('30y SSP2-4.5 Range'),
					type: 'arearange',
					data: sortByTimestamp(formatData(data['30y_ssp245_range'])),
					color: 'lightgreen',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
				{
					custom: { key: '30y-ssp585-median' },
					name: __('30y SSP5-8.5 Median'),
					type: 'line',
					data: sortByTimestamp(
						formatData(data['30y_ssp585_median'])
					),
					color: 'red',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: '30y-ssp585-range' },
					name: __('30y SSP5-8.5 Range'),
					type: 'arearange',
					data: sortByTimestamp(formatData(data['30y_ssp585_range'])),
					color: 'pink',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
			],
			'30-year-changes': [
				{
					custom: { key: 'delta7100-ssp126-median' },
					name: __('Delta 7100 SSP1-2.6 Median'),
					type: 'line',
					data: sortByTimestamp(
						formatData(data['delta7100_ssp126_median'])
					),
					color: 'blue',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'delta7100-ssp126-range' },
					name: __('Delta 7100 SSP1-2.6 Range'),
					type: 'arearange',
					data: sortByTimestamp(
						formatData(data['delta7100_ssp126_range'])
					),
					color: 'lightblue',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
				{
					custom: { key: 'delta7100-ssp245-median' },
					name: __('Delta 7100 SSP2-4.5 Median'),
					type: 'line',
					data: sortByTimestamp(
						formatData(data['delta7100_ssp245_median'])
					),
					color: 'green',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'delta7100-ssp245-range' },
					name: __('Delta 7100 SSP2-4.5 Range'),
					type: 'arearange',
					data: sortByTimestamp(
						formatData(data['delta7100_ssp245_range'])
					),
					color: 'lightgreen',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
				{
					custom: { key: 'delta7100-ssp585-median' },
					name: __('Delta 7100 SSP5-8.5 Median'),
					type: 'line',
					data: sortByTimestamp(
						formatData(data['delta7100_ssp585_median'])
					),
					color: 'red',
					lineWidth: 2,
				} as SeriesLineOptions,
				{
					custom: { key: 'delta7100-ssp585-range' },
					name: __('Delta 7100 SSP5-8.5 Range'),
					type: 'arearange',
					data: sortByTimestamp(
						formatData(data['delta7100_ssp585_range'])
					),
					color: 'pink',
					fillOpacity: 0.3,
				} as SeriesArearangeOptions,
			],
		}),
		[__, data, sortByTimestamp, formatData]
	);

	// adds visible property to each series
	const filteredSeries = useMemo<SeriesOptionsType[]>(() => {
		return (
			seriesObject[activeTab]?.map((s) => {
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
		setActiveSeries(
			seriesObject[activeTab]?.map((s) => s.custom?.key) || []
		);
	}, [activeTab, seriesObject]);

	const getExportFilename = () => {
		const formatForFilename = (str: string | undefined | null) => {
			return (str !== undefined && str !== null) ? str.toLowerCase().replace(/\s+/g, '-') : '';
		};

		return formatForFilename(title)
			+ '-' + formatForFilename(datasetLabel)
			+ '-' + formatForFilename(climateVariable?.getTitle())
			+ '-' + formatForFilename(versionLabel);
	};

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
			tooltip: {
				crosshairs: true,
				shared: true,
				split: false,
				padding: 4,
				formatter: function(this: Point) {
					const unit = climateVariable?.getUnit();
					const formatValue = (value: number | undefined) => {
						if (value === undefined) return '';
						if(unit === "doy") {
							return doyFormatter(Number(value), locale);
						} else {
							const formattedValue = Number(value).toFixed(decimals);
							// Check if this is a delta value (series name starts with 'Delta')
							const isDelta = this.series.name?.startsWith('Delta');
							// Add "+" prefix for positive delta values
							if (isDelta && Number(value) > 0) {
								return `+${formattedValue} ${unit}`;
							}
							return `${formattedValue} ${unit}`;
						}
					};

					const points = (this as unknown as { points?: TooltipPoint[] }).points;
					return points?.map((point: TooltipPoint) => {
						if (point.series.type === 'arearange') {
							return `<span style="color:${point.series.color}">●</span> ${point.series.name}: <b>${formatValue(point.low)}</b> - <b>${formatValue(point.high)}</b><br/>`;
						} else {
							return `<span style="color:${point.series.color}">●</span> ${point.series.name}: <b>${formatValue(point.y)}</b><br/>`;
						}
					}).join('') || '';
				}
			},
			xAxis: {
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
	}, [climateVariable, locale, title, filteredSeries]);

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
