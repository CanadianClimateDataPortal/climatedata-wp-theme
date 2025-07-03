import {__} from "@/context/locale-provider.tsx";

const appConfig = {
	versions: [
		{
			value: "cmip5",
			label: "CMIP5",
		},
		{
			value: "cmip6",
			label: "CMIP6",
		},
		{
			value: "humidex",
			label: "Humidex",
		},
		{
			value: "ahccd",
			label: "AHCCD",
		},
	],
	scenarios: [
		{
			value: "rcp26",
			label: "RCP 2.6",
		},
		{
			value: "rcp45",
			label: "RCP 4.5",
		},
		{
			value: "rcp85",
			label: "RCP 8.5",
		},
		{
			value: "ssp126",
			label: "SSP1-2.6",
		},
		{
			value: "ssp245",
			label: "SSP2-4.5",
		},
		{
			value: "ssp370",
			label: "SSP3-7.0",
		},
		{
			value: "ssp585",
			label: "SSP5-8.5",
		},
		{
			value: "rcp85plus65-p50",
			label: __("RCP8.5 enhanced scenario"),
		},
		{
			value: "rcp85-p05",
			label: __("RCP8.5 lower (5th percentile)"),
		},
		{
			value: "rcp85-p50",
			label: __("RCP8.5 median (50th percentile)"),
		},
		{
			value: "rcp85-p95",
			label: __("RCP8.5 upper (95th percentile)"),
		},
		{
			value: "rcp45-p05",
			label: __("RCP4.5 lower (5th percentile)"),
		},
		{
			value: "rcp45-p50",
			label: __("RCP4.5 median (50th percentile)"),
		},
		{
			value: "rcp45-p95",
			label: __("RCP4.5 upper (95th percentile)"),
		},
		{
			value: "rcp26-p05",
			label: __("RCP2.6 lower (5th percentile)"),
		},
		{
			value: "rcp26-p50",
			label: __("RCP2.6 median (50th percentile)"),
		},
		{
			value: "rcp26-p95",
			label: __("RCP2.6 upper (95th percentile)"),
		},
		{
			value: "ssp585lowConf-p83",
			label: __("SSP5-8.5 High ice sheet loss A"),
		},
		{
			value: "ssp585highEnd-p98",
			label: __("SSP5-8.5 High ice sheet loss B"),
		},
	],
	frequencies: [
		{
			value: "ann",
			label: "Annual",
		},
		{
			value: "annual_jul_jun",
			label: "Annual (July to June)",
		},
		{
			value: "daily",
			label: "Daily",
		},
		{
			value: "allMonths",
			label: "All months",
		},
		{
			value: "jan",
			label: "January",
		},
		{
			value: "feb",
			label: "February",
		},
		{
			value: "mar",
			label: "March",
		},
		{
			value: "apr",
			label: "April",
		},
		{
			value: "may",
			label: "May",
		},
		{
			value: "jun",
			label: "June",
		},
		{
			value: "jul",
			label: "July",
		},
		{
			value: "aug",
			label: "August",
		},
		{
			value: "sep",
			label: "September",
		},
		{
			value: "oct",
			label: "October",
		},
		{
			value: "nov",
			label: "November",
		},
		{
			value: "dec",
			label: "December",
		},
		{
			value: "spring",
			label: "Spring",
		},
		{
			value: "summer",
			label: "Summer",
		},
		{
			value: "fall",
			label: "Fall",
		},
		{
			value: "winter",
			label: "Winter",
		},
		{
			value: "months",
			label: "Monthly",
		},
		{
			value: "seasons",
			label: "Seasonal",
		},
	],
}

export default appConfig;
