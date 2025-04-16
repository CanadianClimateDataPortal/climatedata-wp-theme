// Here we can define global types and interfaces that can be used throughout the application
import React from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/lib/format';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { LucideIcon } from 'lucide-react';
import L from 'leaflet';

/**
 * Represents valid locale values.
 */
export type Locale = 'en' | 'fr';

/**
 * Represents valid dataset keys.
 */
export type DatasetKey = 'cmip5' | 'cmip6' | 'humidex';

/**
 * Represents valid emission scenario keys.
 */
export type EmissionScenarioKey = 'low' | 'medium' | 'high';

/**
 * Represents a field with multilingual support.
 */
export interface MultilingualField<T = string> {
	en: T;
	fr?: T;
}

/**
 * Represents the structure used as props for the RelatedCard component.
 */
export interface RelatedCardData {
	id: number;
	title: string;
	description: string;
	url: string;
}

/**
 * Represents the properties of the RelatedCard component.
 */
export interface RelatedCardProps {
	data: RelatedCardData;
}

/**
 * Represents the structure received from the WordPress API for related data.
 */
export interface RelatedData {
	datasets: RelatedCardData[];
	sectors: RelatedCardData[];
	training: RelatedCardData[];
}

/**
 * Represents data returned from WordPress for a taxonomy.
 *
 * This type is used to define the structure of taxonomy data objects,
 * which may include predefined fields like `id`, `name`, `slug`, etc.
 * Additional dynamic properties can also be included.
 *
 * @type {TaxonomyData}
 */
export type TaxonomyData = {
	term_id: number;
	title: MultilingualField;
	card?: {
		description?: MultilingualField;
		link?: MultilingualField<{
			title: string;
			url: string;
			target: string;
		}>;
	};
};

/**
 * Represents an individual term with multilingual title and term id.
 */
export type TermItem = {
	term_id: number;
	title: MultilingualField;
};

/**
 * Represents data returned from WordPress for a post.
 *
 * This type is used to define the structure of post data objects coming from the API
 */
export type ApiPostData = {
	id: string | number;
	post_id: number;
	meta: {
		updated_on?: string;
		content: {
			title: MultilingualField;
			card?: {
				description?: MultilingualField;
				link?: MultilingualField<{
					title: string;
					url: string;
					target: string;
				}>;
			};
			thumbnail?: string;
		};
		taxonomy: Record<
			string,
			{
				terms: TermItem[];
			}
		>;
	};
};

/**
 * Represents a normalized version of ApiPostData to be used in the application.
 */
export type PostData = {
	id: string | number;
	postId: number;
	title: string;
	description?: string;
	link?: { title: string; url: string; target: string };
	thumbnail?: string;
	taxonomies?: Record<string, { id: number; title: string }[]>;
};

/**
 * Used in the MapEvents map layer component
 */
export interface MapEventsProps {
	onMapReady?: (map: L.Map) => void;
	onUnmount?: () => void;
	onLocationModalClose?: () => void;
}

/**
 * Represents a map location object in redux store.
 */
export type MapLocation = {
	id: string;
	title: string;
	lat: number;
	lng: number;
};

/**
 * Represents the properties of the `MapItems` for the map.
 */
export interface MapItemsOpacity {
	mapData: number;
	labels: number;
}

/**
 * Represents the properties of the Labels available for the Slider.
 */
export type SliderLabelsMap = {
	mapData: string;
	labels: string;
};

/**
 * Represents the map state in redux store.
 */
export interface MapState {
	interactiveRegion: string;
	thresholdValue: number;
	frequency: string;
	timePeriodEnd: number[]; // using an array because the slider that uses it expects an array
	recentLocations: MapLocation[];
	variable: ApiPostData | string;
	dataset?: TaxonomyData;
	decade: string;
	pane: string;
	mapColor: string;
	legendData: WMSLegendData;
	opacity: {
		mapData: number;
		labels: number;
	};
	variableList: PostData[];
	variableListLoading: boolean;
}

/**
 * Represents the download app state in redux store.
 */
export interface DownloadState {
	dataset: TaxonomyData | null;
	variable: PostData | null;
	version: string;
	degrees: number;
	interactiveRegion: string;
	startYear: number;
	endYear: number;
	frequency: string;
	emissionScenarios: string[];
	selectionMode: string;
	selection: number[];
	selectionCount: number;
	zoom: number;
	center: L.LatLngExpression;
	percentiles: string[];
	decimalPlace: number;
	format: string;
	email: string;
	subscribe: boolean;
}

/**
 * Represents an individual entry in a WMS legend colormap.
 */
export interface WMSLegendEntry {
	label: string;
	color: string;
	opacity: string;
	quantity: number;
}

/**
 * Represents the structure of WMS legend data.
 */
export interface WMSLegendData {
	Legend?: {
		rules?: {
			symbolizers?: {
				Raster?: {
					colormap?: {
						entries: WMSLegendEntry[];
					};
				};
			}[];
		}[];
	}[];
}

/**
 * Represents a processed legend entry with parsed data.
 */
export interface TransformedLegendEntry {
	label: string;
	color: string;
	opacity: number;
}

/**
 * Represents the properties of the `Sheet` component.
 */
export interface SheetContentProps
	extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
	side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Extends the default HTML anchor `<a>` tag attributes to include additional
 * properties for enhanced functionality, such as supporting an icon component.
 *
 * @interface AnchorProps
 * @extends AnchorHTMLAttributes<HTMLAnchorElement>
 */
export interface AnchorProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	icon?: React.ReactNode;
}

/**
 * Defines the props for a `RadioCard` component, which represents a selectable card.
 * The interface extends the base HTML attributes for a `<div>` element, providing
 * additional properties specific to its functionality.
 *
 * @interface RadioCardProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface RadioCardProps extends React.HTMLAttributes<HTMLDivElement> {
	value: unknown; // this value may be very specific to the use case, so it's left as unknown
	title: string;
	radioGroup: string;
	description?: string;
	thumbnail?: string;
	selected: boolean;
	onSelect: () => void;
}

/**
 * Defines the props for a `Grid` component.
 *
 * @interface GridProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
	columns?: number; // number of columns, eg, 1, 2, 3
}

/**
 * Defines the props for a `Button` component.
 *
 * @interface ButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 */
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

/**
 * Extends the default HTML `<a>` tag attributes to include additional properties
 * for enhanced functionality, such as supporting an icon component.
 */
type CombinedAnchorButtonAttributes = Omit<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	'onAbort' | 'onAbortCapture'
> &
	Omit<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		'onAbort' | 'onAbortCapture'
	>;

export interface LinkWithIconProps extends CombinedAnchorButtonAttributes {
	icon: LucideIcon;
	children: React.ReactNode;
}

/**
 * Represents the properties of the `Modal` component.
 */
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
}

/**
 * Props for the MapInfo component.
 */
export interface MapInfoProps {
	data: MapInfoData;
}

/**
 * Represents a single color palette option.
 */
export interface ColorPaletteOption {
	name: string;
	colors: string[]; // Array of color strings in the palette
}

/**
 * Represents the properties of the ColorSelect component.
 */
export interface ColorSelectProps {
	options: ColorPaletteOption[];
	onChange?: (selectedOption: ColorPaletteOption) => void;
}

/**
 * SearchControlResponse represents the response data from the custom cdc location_search endpoint to the search control.
 */
export interface SearchControlResponse {
	draw: number;
	recordsFiltered: string;
	recordsTotal: string;
	items: SearchControlLocationItem[];
}

/**
 * Represents an individual location item in the search control.
 */
export interface SearchControlLocationItem {
	id: string;
	text: string;
	term: string;
	location: string;
	province: string;
	lat: string;
	lon: string;
}

/**
 * Represents an individual option in a dropdown menu.
 *
 * This type is used to define the structure of custom Dropdown component options.
 *
 * @interface {DropdownOption}
 *
 */
export interface DropdownOption {
	label: string;
	value: string;
}

/**
 * Extends the default HTML `<select>` tag attributes to include additional
 * properties for advanced functionality, such as making it searchable, or a
 * Dropdown custom component with a label and tooltip.
 *
 * It can accept an array of DropdownOption objects or just an array of strings as options. Also,
 * it overrides the default onChange prop so that it expects a string instead of an event for type safety.
 *
 * @interface {DropdownProps}
 *
 */
export interface DropdownProps<T = string> // generic default type is string
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		'onChange' | 'value'
	> {
	options: { value: T; label: string }[] | T[];
	placeholder?: string;
	label?: string | React.ReactNode;
	tooltip?: string | React.ReactNode;
	searchable?: boolean;
	searchPlaceholder?: string;
	onChange: (value: T) => void;
	value?: T;
}

/**
 * Extends the default HTML `<div>` tag attributes to include additional
 * properties for advanced functionality, such as a title and tooltip.
 *
 * @interface {ControlTitleProps}
 *
 */
export interface ControlTitleProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
	title: string | React.ReactNode;
	tooltip?: React.ReactNode;
}

/**
 * Represents the properties of the ZoomControl component.
 */
export interface ZoomControlProps {
	className?: string;
	wrapperClass?: string;
	onZoomIn: () => void;
	onZoomOut: () => void;
}

export interface ClimateDataProps {
	observations: number[][];
	modeled_historical_median: number[][];
	modeled_historical_range: number[][];
	ssp126_median: number[][];
	ssp126_range: number[][];
	ssp245_median: number[][];
	ssp245_range: number[][];
	ssp585_median: number[][];
	ssp585_range: number[][];
	'30y_observations'?: Record<string, number[]>;
	'30y_ssp126_median'?: Record<string, number[]>;
	'30y_ssp126_range'?: Record<string, number[]>;
	'30y_ssp245_median'?: Record<string, number[]>;
	'30y_ssp245_range'?: Record<string, number[]>;
	'30y_ssp585_median'?: Record<string, number[]>;
	'30y_ssp585_range'?: Record<string, number[]>;
	delta7100_ssp126_median?: Record<string, number[]>;
	delta7100_ssp126_range?: Record<string, number[]>;
	delta7100_ssp245_median?: Record<string, number[]>;
	delta7100_ssp245_range?: Record<string, number[]>;
	delta7100_ssp585_median?: Record<string, number[]>;
	delta7100_ssp585_range?: Record<string, number[]>;
}

/**
 * Represents style position properties. Used to control the position of a component like the AnimatedPanel component.
 */
export interface ProviderPanelProps {
	direction?: 'left' | 'right' | 'top' | 'bottom';
	position?: { top?: number; left?: number; right?: number; bottom?: number };
	className?: string;
}

/**
 * Represents the properties of the `AnimatedPanel` context.
 */
export interface AnimatedPanelContextType {
	activePanel: React.ReactNode | null;
	openPanel: (content: React.ReactNode, props?: ProviderPanelProps) => void;
	togglePanel: (content: React.ReactNode, props?: ProviderPanelProps) => void;
	closePanel: () => void;
}

/**
 * Represents the properties of the `AnimatedPanel` component.
 */
export interface AnimatedPanelProps extends ProviderPanelProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

/**
 * Represents the properties of custom `SidebarPanel` components with interactive children, such
 * as `DatasetsPanel` and `VariablesPanel` where items are selected and some action is taken.
 */
export interface InteractivePanelProps<T> {
	selected: T | null;
	onSelect: (selected: T) => void;
}

/**
 * Represents the options for the request to fetch chart data.
 */
export interface ChartDataOptions {
	latlng: L.LatLng;
	variable: string;
	dataset: string;
	frequency: string;
}

export interface DeltaValuesOptions {
	endpoint: string;
	varName: string;
	frequency: string;
	params: string;
}

export interface PercentileData {
	p10?: number;
	p50?: number;
	p90?: number;
}

/**
 * Represents the properties of a cell in the maps's grid layer.
 */
export interface MapFeatureProps {
	latlng: L.LatLng;
	layer: {
		properties: {
			gid?: number;
			id?: number;
		};
	};
}

/**
 * Represents the properties of the arguments used for a request to get ChoroData for interactive region data.
 */
export interface ChoroValuesOptions {
	variable: string;
	dataset: string;
	decade: string;
	frequency: string;
	interactiveRegion: string;
	emissionScenario: string;
	decimals: number;
}

export interface ColourScheme {
	type: string;
	colours: string[],
	quantities?: number[],
}

// A translatable string object with English and French variants
export interface LocalizedString {
	en: string;
	fr: string;
}

// Represents a sector with localized name and description, plus a generated link
export interface Sector {
	term_id: number;
	name: LocalizedString;
	description: LocalizedString;
	link: string;
}

// Represents a training with localized title, description, and a localized link
export interface Training {
	term_id: number;
	title: LocalizedString;
	description: LocalizedString;
	link: LocalizedString;
}

// Image asset references in multiple sizes for responsive support
export interface FeaturedImage {
	thumbnail: string;
	medium: string;
	large: string;
	full: string;
}

// Represents a taxonomy term from variable-dataset
export interface DatasetTerm {
	term_id: number;
	title: LocalizedString;
}

/**
* Represents the structure used as props for MapInfo component.
*/
export interface MapInfoData {
	title: LocalizedString;
	tagline: LocalizedString;
	fullDescription: LocalizedString;
	techDescription: LocalizedString;
	relevantSectors: Sector[];
	relevantTrainings: Training[];
	featuredImage: FeaturedImage;
	dataset: DatasetTerm[];
}

/**
 * Represents the properties of the VariableFilterCount component.
 */
export interface VariableFilterCountProps {
    filteredCount: number;
    totalCount: number; 
    className?: string;
}
