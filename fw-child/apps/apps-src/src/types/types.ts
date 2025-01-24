// Here we can define global types and interfaces that can be used throughout the application
import React from "react";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { LucideIcon } from "lucide-react";

/**
 * Represents valid locale values.
 */
export type Locale = 'en' | 'fr';

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
  data: RelatedCardData
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
  id: string | number;
  name: string;
  slug: string;
  description: string;
  link: string;
  [key: string]: any;
};

/**
 * Represents data returned from WordPress for a post.
 *
 * This type is used to define the structure of post data objects,
 * which may include predefined fields like `id`, `title`, `link`, etc.
 * Additional dynamic properties can also be included.
 */
export type ApiPostData = {
  id: string | number;
  title: { rendered: string };
  link: string;
  featured_media?: number;
  [key: string]: any;
};

/**
 * Represents a normalized version of ApiPostData to be used in the application, with a plain string title.
 */
export type PostData = Omit<ApiPostData, 'title'> & {
  title: string;
};

/**
 * Represents the structure used as props for MapInfo component.
 */
export interface MapInfoData {
  title: string;
  relatedData?: RelatedData;
  en: {
    title: string;
    description: string;
    techDescription: string;
  };
  fr: {
    title: string;
    description: string;
    techDescription: string;
  };
}

/**
 * Used in the MapEvents map layer component
 */
export interface MapEventsProps {
  onMapReady?: (map: any) => void;
  onUnmount?: () => void;
}

/**
 * Used in the MapEvents map layer component
 */
export interface MapEventsProps {
  onMapReady?: (map: any) => void;
  onUnmount?: () => void;
}

/**
 * Used in the MapEvents map layer component
 */
export interface MapEventsProps {
  onMapReady?: (map: any) => void;
  onUnmount?: () => void;
}

/**
 * Used in the MapEvents map layer component
 */
export interface MapEventsProps {
  onMapReady?: (map: any) => void;
  onUnmount?: () => void;
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
 * Represents the map state in redux store.
 */
export interface MapState {
  emissionScenario: string;
  emissionScenarioCompare: boolean;
  emissionScenarioCompareTo: string;
  interactiveRegion: string | null;
  thresholdValue: number | null;
  frequency: string;
  timePeriodEnd: number[]; // using an array because the slider that uses it expects an array
  recentLocations: MapLocation[];
  dataset: string;
  decade: string;
  pane: string;
  opacity: MapItemsOpacity;
}

/**
 * Represents an individual entry in a WMS legend colormap.
 */
export interface WMSLegendEntry {
  label: string;
  color: string;
  opacity: string;
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
  value: string | number;
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
  columns?: number // number of columns, eg, 1, 2, 3
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
type CombinedAnchorButtonAttributes = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onAbort' | 'onAbortCapture'> & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAbort' | 'onAbortCapture'>;

export interface LinkWithIconProps extends CombinedAnchorButtonAttributes {
  icon: LucideIcon;
  children: React.ReactNode;
}

/**
 * Represents the properties of the `Modal` component.
 */
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement>{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode
  className?: string
}

/**
 * Props for the MapInfo component.
 */
export interface MapInfoProps {
  data: MapInfoData;
  mapRef: React.RefObject<HTMLDivElement>;
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
 * SearchControl Props
 * ---------------------------
 * @property {string} [placeholder] - The placeholder text for the search input. Default is "Zoom to a location, region, city, coordinates...".
 * @property {number} [zoom] - The zoom level to apply when moving to a location. Default is 10.
 * @property {string} [countryCodes] - The country codes (comma-separated) to limit the search results. Default is "ca".
 */
export interface SearchControlProps {
  placeholder?: string;
  zoom?: number;
  countryCodes?: string;
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
export interface DropdownProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: DropdownOption[] | string[]
  placeholder?: string
  label?: string | React.ReactNode
  tooltip?: string | React.ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  onChange: (value: string) => void
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
    data: {
        // If you have your own typed interface, use that here instead
        observations: number[][];
        modeled_historical_median: number[][];
        modeled_historical_range: number[][];
        ssp126_median: number[][];
        ssp126_range: number[][];
        ssp245_median: number[][];
        ssp245_range: number[][];
        ssp585_median: number[][];
        ssp585_range: number[][];
        "30y_observations"?: Record<string, number[]>;
        "30y_ssp126_median"?: Record<string, number[]>;
        "30y_ssp126_range"?: Record<string, number[]>;
        "30y_ssp245_median"?: Record<string, number[]>;
        "30y_ssp245_range"?: Record<string, number[]>;
        "30y_ssp585_median"?: Record<string, number[]>;
        "30y_ssp585_range"?: Record<string, number[]>;
        "delta7100_ssp126_median"?: Record<string, number[]>;
        "delta7100_ssp126_range"?: Record<string, number[]>;
        "delta7100_ssp245_median"?: Record<string, number[]>;
        "delta7100_ssp245_range"?: Record<string, number[]>;
        "delta7100_ssp585_median"?: Record<string, number[]>;
        "delta7100_ssp585_range"?: Record<string, number[]>;
    };
}

/**
 * Represents style position properties. Used to control the position of a component like the AnimatedPanel component.
 */
export interface ProviderPanelProps  {
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
export interface InteractivePanelProps {
  selected: string;
  onSelect: (id: string) => void;
}

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