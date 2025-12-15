// Here we can define global types and interfaces that can be used throughout the application
import React from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/lib/format';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { LucideIcon } from 'lucide-react';
import L from 'leaflet';
import { ClimateVariableConfigInterface, DownloadFile, InteractiveRegionOption } from '@/types/climate-variable-interface';

/**
 * Represents valid locale values.
 */
export type Locale = 'en' | 'fr';

/**
 * Represents valid dataset keys.
 */
export type DatasetKey = 'cmip5' | 'cmip6';

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
	dataset_type?: string;
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
 * Represents map coordinates with latitude, longitude and zoom level.
 */
export interface MapCoordinates {
	lat: number;
	lng: number;
	zoom: number;
}

/**
 * Represents the state of a UI overlay component on the map (e.g., legend, location modal).
 * These are UI elements that sit on top of the map and may obscure each other.
 */
export interface MapOverlayState {
	/**
	 * Whether the overlay is open/expanded (true) or closed/collapsed (false).
	 */
	isOpen: boolean;
	// Future properties for overlap detection and positioning:
	// width?: number;       // Overlay width in pixels
	// height?: number;      // Overlay height in pixels
	// x?: number;           // X coordinate relative to map container
	// y?: number;           // Y coordinate relative to map container
	// bounds?: DOMRect;     // Complete bounding box for precise overlap calculation
}

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
	transformedLegendEntry: TransformedLegendEntry[];
	opacity: {
		mapData: number;
		labels: number;
	};
	variableList: PostData[];
	variableListLoading: boolean;
	mapCoordinates: MapCoordinates;
	messageDisplayStates: {[key: string]: boolean};
	isLowSkillVisible: boolean;
	/**
	 * Represents the state of the map legend overlay.
	 * The graphical legend that explains the map's color coding.
	 */
	legend: MapOverlayState;
	/**
	 * Represents the state of the location modal overlay.
	 * When we've clicked on a location on the map and want to show details.
	 */
	locationModal: MapOverlayState;
}

/**
 * When requesting a download, represents the possible final statuses.
 *
 * @example 'success' - The download request parameters was accepted by the backend and it returned something we're expecting
 * @example 'error' - There was an error processing the download request or parameters had something unexpected by the backend
 * @example 'no-data' - The request was valid but there was no data available (i.e. an empty result) for the requested parameters
 */
export type DownloadRequestFinalStatus = 'success' | 'error' | 'no-data';

/**
 * Represents the possible statuses during a download request.
 *
 * @see {@link DownloadRequestFinalStatus} - The possible final statuses after loading
 */
export type DownloadRequestStatus = 'idle' | 'loading' | DownloadRequestFinalStatus;

/**
 * Represents the download app state in redux store.
 */
export interface DownloadState {
	dataset: TaxonomyData | null;
	selectionMode: string;
	selection: number[];
	selectionCount: number;
	zoom: number;
	center: L.LatLngExpression;
	email: string;
	subscribe: boolean;
	variableListLoading: boolean;
	requestStatus?: DownloadRequestStatus;
	requestResult?: any;
	requestError?: string | null;
	captchaValue: string;
	downloadLinks?: DownloadFile[];
	currentStep: number;
	selectedStation?: Station;
	messageDisplayStates: {[key: string]: boolean}
}

/**
 * Individual entry in a {@link WMSLegendData} colormap from GeoServer's
 * GetLegendGraphic.
 *
 * **Format variants:**
 * - **Standard**: Regular numeric quantities (e.g., "-150", "6", "83.3")
 * - **S2D Multi-band**: GXYY-encoded quantities (e.g., "1040", "2050", "3100")
 *
 * @see {@link WMSLegendData} - Parent structure
 * @see {@link transformColorMapToMultiBandLegend} in `@/lib/multi-band-legend` - Transforms S2D format
 *
 * @example Standard format
 * ```typescript
 * const entry: WMSLegendEntry = {
 *   label: "6days",
 *   quantity: "6",
 *   color: "#FFFFE7",
 *   opacity: "1.0"
 * };
 * ```
 *
 * @example S2D Multi-band format
 * ```typescript
 * const entry: WMSLegendEntry = {
 *   label: "L1-0",
 *   quantity: "1040",  // GXYY: Group 1, 40%
 *   color: "#FFFFFF",
 *   opacity: "0.0"
 * };
 * ```
 */
export interface WMSLegendEntry {
	/**
	 * Entry identifier
	 */
	label: string;
	/**
	 * Hex color code
	 * @example `#FFFFFF`
	 */
	color: string;
	/**
	 * Opacity value, as string, in range [0.0, 1.0]
	 * @example `"0.0"`
	 */
	opacity: string;
	/**
	 * Numeric value as string
	 */
	quantity: string;
}

/**
 * WMS legend data structure from GeoServer GetLegendGraphic endpoint.
 *
 * Supports both standard legends and S2D multi-band variants (GXYY-encoded).
 * Variant detection happens downstream via {@link transformColorMapToMultiBandLegend}.
 *
 * @see EXAMPLE_COLOR_MAP_DISCRETE_SINGLE in `@/hooks/use-color-map.examples` - Standard format
 * @see EXAMPLE_COLOR_MAP_S2D_MULTIBAND in `@/hooks/use-color-map.examples` - S2D multi-band format
 */
export interface WMSLegendData {
	Legend?: {
		layerName?: string;
		title?: string;
		rules?: {
			symbolizers?: {
				Raster?: {
					colormap?: {
						entries: WMSLegendEntry[];
						type?: string;
					};
					opacity?: string;
				};
			}[];
		}[];
	}[];
}

/**
 * Represents a processed legend entry with parsed data.
 */
export interface TransformedLegendEntry {
	label: string | number;
	color: string;
	opacity: number;
	quantity?: number;
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
	data: MapInfoData | null;
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
	observations?: number[][];
	modeled_historical_median?: number[][];
	modeled_historical_range?: number[][];
	ssp126_median?: number[][];
	ssp126_range?: number[][];
	ssp245_median?: number[][];
	ssp245_range?: number[][];
	ssp370_median?: number[][];
	ssp370_range?: number[][];
	ssp585_median?: number[][];
	ssp585_range?: number[][];
	'30y_observations'?: Record<string, number[]>;
	'30y_ssp126_median'?: Record<string, number[]>;
	'30y_ssp126_range'?: Record<string, number[]>;
	'30y_ssp245_median'?: Record<string, number[]>;
	'30y_ssp245_range'?: Record<string, number[]>;
	'30y_ssp370_median'?: Record<string, number[]>;
	'30y_ssp370_range'?: Record<string, number[]>;
	'30y_ssp585_median'?: Record<string, number[]>;
	'30y_ssp585_range'?: Record<string, number[]>;
	delta7100_ssp126_median?: Record<string, number[]>;
	delta7100_ssp126_range?: Record<string, number[]>;
	delta7100_ssp245_median?: Record<string, number[]>;
	delta7100_ssp245_range?: Record<string, number[]>;
	delta7100_ssp370_median?: Record<string, number[]>;
	delta7100_ssp370_range?: Record<string, number[]>;
	delta7100_ssp585_median?: Record<string, number[]>;
	delta7100_ssp585_range?: Record<string, number[]>;
	daily_average_temperature?: number[];
	daily_maximum_temperature?: number[];
	daily_minimum_temperature?: number[];
	precipitation?: number[];
	[key: string]: number[][] | Record<string, number[]> | number[] | undefined;
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
	interactiveRegion: InteractiveRegionOption;
	latlng?: L.LatLng;
	featureId?: number;
	variable: string;
	dataset: string;
	frequency: string;
	unit?: string;
	unitDecimals: number;
}

export interface DeltaValuesOptions {
	endpoint: string;
	varName: string | null;
	frequency: string | null;
	params: Record<string, string>;
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
			label_en?: string;
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
	isDelta7100: boolean;
}

export enum ColourSchemeType {
	SEQUENTIAL = 'sequential',
	DIVERGENT = 'divergent',
}

export interface ColourScheme {
	type: ColourSchemeType;
	colours: string[];
	quantities?: number[];
	isDivergent?: boolean;
}

export interface ColourMap {
	type: ColourSchemeType;
	colours: string[];
	quantities: number[];
	isDivergent: boolean;
}

/**
 * Essential colour-to-quantity mapping extracted from ColourMap.
 *
 * Contains the subset of ColourMap fields which are generally enough for legend
 * transformations and rendering.
 *
 * @property colours - Hex color codes in order
 * @property quantities - Numeric values corresponding to each color
 *
 * @see {ColourMap} - Full type with metadata fields
 * @see {transformColorMapToMultiBandLegend} - Primary consumer of this type
 *
 * @example
 * ```typescript
 * const input: ColourQuantitiesMap = {
 *   colours: ['#FFFFFF', '#FF0000', '#00FF00'],
 *   quantities: [1040, 1050, 1060],
 * }
 * ```
 */
export type ColourQuantitiesMap = Pick<ColourMap, 'colours' | 'quantities'>;

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

/**
 * Represents a climate station with id, name, and coordinates.
 */
export interface Station {
	id: string;
	name: string;
	type?: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	filename?: { [key: string]: string };
}

// -----------------------------------------------------------------------------
// Downloads Specifics Types
// -----------------------------------------------------------------------------
// This section includes types related to components and structures used in
// download configuration and variable-specific behavior.
// -----------------------------------------------------------------------------

/**
 * Props for the AnalyzedField component.
 *
 * Renders either an input or dropdown (select) field for configuring a climate variable.
 */
export interface AnalyzedFieldProps {
	keyName: string;
	type: 'input' | 'select';
	label: string;
	description?: string;
	help?: string;
	format?: string;
	attributeType?: string;
	placeholder?: string;
	value: string | readonly string[] | number | undefined;
	onChange: (key: string, value: string) => void;
	__: (text: string) => string;
	options?: { value: string; label: string }[];
}

/**
 * Props for the InputAnalyzedField component.
 *
 * Represents a single text input used to configure a specific aspect
 * of a climate variable in the analyzed download type.
 */
export interface InputAnalyzedFieldProps {
	className: string;
	keyName: string; // The key used to identify this input's value
	label?: string;
	value?: string | readonly string[] | number | undefined;
	description?: string;
	tooltip?: string | React.ReactNode;
	placeholder?: string;
	attributeType?: string; // Optional input type, defaults to 'text'
	onChange: (key: string, value: string) => void; // Emits changes upward
}

/**
 * Props for the SelectAnalyzedField component.
 *
 * Represents a dropdown (select) field used to configure a climate variable
 * option in the analyzed download type.
 */
export interface SelectAnalyzedFieldProps<T = string> {
	name: string;
	label?: string;
	description?: string;
	attributeType?: string; // (Unused here, but kept for future extensibility)
	placeholder?: string;
	value: string | readonly string[] | number | undefined;
	tooltip?: string | React.ReactNode;
	onChange: ((key: string, value: string) => void) | ((value: string) => void);
	options: { value: T; label: string }[];
}

/**
 * Props for the DownloadDropdown component.
 *
 * A flexible dropdown (select) component used for configuring
 * download-related options. It supports generic value types,
 * placeholder rendering, and tooltips.
 */
export interface DownloadDropdownProps<T = string> // generic default type is string
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		'onChange' | 'value'
	> {
	name: string,
	options: { value: string; label: string }[];
	value: string | T;
	placeholder?: string;
	label?: string | React.ReactNode;
	tooltip?: string | React.ReactNode;
	onChange: (key: string, value: string) => void;
}

/**
 * Defines the configuration for mapping state keys to URL parameters.
 */
export type URLParamConfig<T extends keyof ClimateVariableConfigInterface> = {
	urlKey: string;
	transform?: {
		toURL?: <V extends NonNullable<ClimateVariableConfigInterface[T]>>(
			value: V
		) => string;
		fromURL?: (value: string) => ClimateVariableConfigInterface[T];
	};
};

/**
 * Represents climate variable state for URL state management.
 */
export type ClimateVariableState = {
	data?: Partial<ClimateVariableConfigInterface> | null;
	searchQuery?: string;
};

/**
 * Represents partial state for URL state management.
 */
export type PartialState = {
	climateVariable?: ClimateVariableState;
	map?: Partial<MapState>;
};

/**
 * Type for map action creators used in URL state hook.
 */
export type MapActionType = {
	[key: string]: (value: any) => { type: string; payload: any };
};

/**
 * Represents the parameters for the WMS layer.
 */
export interface WMSParams {
	format: string;
	transparent: boolean;
	tiled: boolean;
	version: string;
	layers: string;
	styles?: string;
	TIME?: string;
	opacity: number;
	pane: string;
	bounds: L.LatLngBounds;
	sld_body?: string;
}

export interface SelectedLocationInfo {
	featureId: number;
	title: string;
	latlng: L.LatLng;
}

export interface FetchOptions {
	signal?: AbortSignal;
}

export enum MapDisplayType {
	ABSOLUTE = 'absolute',
	DELTA = 'delta',
}

/**
 * Describe on a map a region.
 *
 * The 4 coordinate points forming a rectangle on a map.
 *
 * It's in the following order:
 * - minLat
 * - minLng
 * - maxLat
 * - maxLng
 */
export type MapBoundaryBox = [number, number, number, number];

/**
 * Describe on a map a region as a set of points.
 *
 * Each point is represented as a tuple of [longitude, latitude].
 */
export type MapPointsList = [number, number][];

export type HighChartSeries = {
	visible: boolean;
	type: string;
	name: string;
}

export type ParsedLatLon = {
	lat: number;
	lon: number;
	isPartial: boolean,
}
