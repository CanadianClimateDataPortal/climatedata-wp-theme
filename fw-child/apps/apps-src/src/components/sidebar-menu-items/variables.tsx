/**
 * A menu item and panel component that displays a list of variables with some custom filters.
 * TODO: make this work with the new AnimatedPanel component
 */
import React, { useState, useEffect } from "react";
import { Map, ChevronRight, ExternalLink } from "lucide-react";
import { useI18n } from "@wordpress/react-i18n";

// components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioCard, RadioCardFooter } from "@/components/ui/radio-card";
import { SidebarMenuItem, SidebarMenuButton, SidebarPanel, useSidebar } from "@/components/ui/sidebar";
import Dropdown from "@/components/ui/dropdown";
import Grid from "@/components/ui/grid";
import Link from "@/components/ui/link";

// other
import { fetchPostsData, fetchTaxonomyData } from "@/services/services";
import { normalizeRadioCardProps } from "@/lib/format";
import { InteractivePanelProps, TaxonomyData, PostData } from "@/types/types";
import TaxonomyDropdownFilter from "@/components/taxonomy-dropdown-filter";
import VariableRadioCards from "@/components/variable-radio-cards";

// menu and panel slug
const slug = 'variable';

/**
 * A menu item link component that toggles the variables panel.
 */
const VariablesMenuItem: React.FC = () => {
  const { togglePanel, isPanelActive } = useSidebar();
  const { __ } = useI18n();

  const handleClick = () => {
    togglePanel(slug);
  }

  return (
    <SidebarMenuItem className="cursor-pointer">
      <SidebarMenuButton size="md" isActive={isPanelActive(slug)} onClick={handleClick}>
        <Map size={16}/>
        <span className="grow">{__('Variables')}</span>
        <ChevronRight className="text-brand-blue"/>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
};
VariablesMenuItem.displayName = "VariablesMenuItem";

/**
 * A panel component that displays a list of variables.
 */
const VariablesPanel: React.FC<InteractivePanelProps> = ({ selected, onSelect }) => {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const { __ } = useI18n();

  return (
    <SidebarPanel id={slug} className="w-[36rem]">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{__('Select a variable')}</CardTitle>
          <CardDescription>
            {__('Here you can browse all the variables contained in the selected dataset.')}
          </CardDescription>
          <Grid columns={2} className="gap-4 mt-4">
            <TaxonomyDropdownFilter
              className="sm:w-52"
              onFilterChange={(value) =>
                setFilterValues((prev) => ({ ...prev, 'var-type': value }))
              }
              slug="var-type"
              label="Variable Types"
              tooltip="Select a variable type"
              placeholder="All"
              value={filterValues["var-type"] || ""}
            />
            <TaxonomyDropdownFilter
              className="sm:w-52"
              onFilterChange={(value) =>
                setFilterValues((prev) => ({ ...prev, sector: value }))
              }
              slug="sector"
              label="Sectors"
              tooltip="Select a sector"
              placeholder="All"
              value={filterValues.sector || ""}
            />
          </Grid>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Grid columns={2} className="gap-4">
            <VariableRadioCards
              filterValues={filterValues}
              selected={selected}
              onSelect={onSelect}
            />
          </Grid>
        </CardContent>
      </Card>
    </SidebarPanel>
  );
};
VariablesPanel.displayName = "VariablesPanel";

export { VariablesMenuItem, VariablesPanel };