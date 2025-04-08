import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Highcharts, {
	Options,
	SeriesOptionsType,
	SeriesLineOptions,
	SeriesArearangeOptions,
	numberFormat,
} from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsStock from 'highcharts/modules/stock';

import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';

import { cn } from '@/lib/utils';
import { ClimateDataProps } from '@/types/types.ts';
import { useI18n } from '@wordpress/react-i18n';

// necessary for highcharts to show the navigator area at the bottom of the chart
if (typeof HighchartsStock === 'function') {
	HighchartsStock(Highcharts);
}

/**
 * Component to render a chart using Highcharts with climate data.
 */
const ClimateDataChart: React.FC<{ title: string; data: ClimateDataProps }> = ({
	title,
	data,
}) => {
	const [activeTab, setActiveTab] = useState('annual-values');
	const [activeSeries, setActiveSeries] = useState<string[]>([]);

	const { __ } = useI18n();

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

	const chartOptions = useMemo<Options>(() => {
		return {
			chart: {
				backgroundColor: 'transparent',
				numberFormatter: function (num) {
					return numberFormat(num, 2); // TODO: second arg should be dynamic
				},
				style: {
					fontFamily: 'CDCSans',
				},
				marginTop: 30,
			},
			exporting: {
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
				valueDecimals: 1,
				valueSuffix: ' °C',
				// pointFormatter: function() {
				// 	if (this.series.type === 'line') {
				// 		return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
				// 			+ value_formatter(this.y, options.chart.unit, var_fields.decimals, false, options.lang)
				// 			+ '</b><br/>';
				// 	} else {
				// 		return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
				// 			+ value_formatter(this.low, options.chart.unit, var_fields.decimals, false, options.lang)
				// 			+ '</b> - <b>'
				// 			+ value_formatter(this.high, options.chart.unit, var_fields.decimals, false, options.lang)
				// 			+ '</b><br/>';
				// 	}
				// }
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
						return this.value + ' °C';
					},
					// formatter: function () {
					// 	const value = this.axis.defaultLabelFormatter.call(this);
					// 	if (localized_chart_unit === 'doy') {
					// 		return value_formatter(value, options.chart.unit, var_fields.decimals, false, options.lang);
					// 	} else {
					// 		return value + ' ' + localized_chart_unit;
					// 	}
					// }
				},
			},
			// series: [{ name: 'Test Series', type: 'line', data: [[0, 1], [1, 2], [2, 3]], color: 'blue' }]
			series: filteredSeries,
		};
	}, [title, filteredSeries]);

	const handleExport = (format: string) => {
		alert(__(`Exporting chart as ${format}`));
	};

	const medianTemp: string = '35.5 °C';
	const medianLabel: string = 'Median (2011–2040)';
	const relativeToBaselineTemp: string = '+2.1 °C';
	const relativeToBaselineLabel: string = 'Relative to Baseline (1971–2000)';
	const rangeTemp: string = '31.2 °C to 34.8 °C';
	const rangeLabel: string = 'Range';

	return (
		<div className="climate-chart z-[500] px-5 py-5">
			<div className="flex justify-between items-start mb-4">
				<div className="text-left">
					<h2 className="text-2xl text-cdc-black font-semibold leading-7 m-0">
						{title}
					</h2>
					<p className="text-sm text-neutral-grey-medium leading-5 m-0">
						{__(
							'Historical Canadian Climate Normals – Hottest Day – CMIP6'
						)}
					</p>
				</div>
				<div className="flex justify-end items-center gap-5 mr-10 text-sm text-gray-500">
					<div className="flex-col">
						<div className="text-brand-blue text-base font-semibold leading-4">
							{medianTemp}
						</div>
						<div className="text-neutral-grey-medium text-xs uppercase font-semibold leading-4">
							{medianLabel}
						</div>
					</div>
					<div className="flex-col">
						<div className="text-brand-blue text-base font-semibold leading-4">
							{relativeToBaselineTemp}
						</div>
						<div className="text-neutral-grey-medium text-xs uppercase font-semibold leading-4">
							{relativeToBaselineLabel}
						</div>
					</div>
					<div className="flex-col">
						<div className="text-brand-blue text-base font-semibold leading-4">
							{rangeTemp}
						</div>
						<div className="text-neutral-grey-medium text-xs uppercase font-semibold leading-4">
							{rangeLabel}
						</div>
					</div>
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
						onClick={() => handleExport('PDF')}
					>
						{__('PDF')}
					</button>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('PNG')}
					>
						{__('PNG')}
					</button>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('CSV')}
					>
						{__('CSV')}
					</button>
					<button
						className="text-xs text-cdc-black font-semibold leading-4 tracking-wide py-1 px-3 border border-soft-purple uppercase cursor-pointer"
						onClick={() => handleExport('PRINT')}
					>
						{__('Print')}
					</button>
				</div>
			</div>

			<HighchartsReact highcharts={Highcharts} options={chartOptions} />

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
