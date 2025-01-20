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
  const [variables, setVariables] = useState<PostData[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [filterOptions, setFilterOptions] = useState<{
    label: string;
    slug: string;
    tooltip: string;
    placeholder: string;
    options: TaxonomyData[];
    onChange: (value: string) => void;
  }[]>([]);

  const { __ } = useI18n();

  const { activePanel, isPanelActive } = useSidebar();

  useEffect(() => {
    if (! isPanelActive(slug))  {
      return;
    }

    // fetch filter options once the panel is active
    (async () => {
      const options = await Promise.all([
        {
          label: __('Variable Types'),
          slug: 'var-type',
          tooltip: __('Select a variable type'),
          placeholder: __('All'),
          options: await fetchTaxonomyData('var-type'),
          onChange: (value: string) =>
            setFilterValues((prev) => ({
              ...prev,
              ['var-type']: value === __('All') ? '' : value,
            })),
        },
        {
          label: __('Sectors'),
          slug: 'sector',
          tooltip: __('Select a sector'),
          placeholder: __('All'),
          options: await fetchTaxonomyData('sector'),
          onChange: (value: string) =>
            setFilterValues((prev) => ({
              ...prev,
              ['sector']: value === __('All') ? '' : value,
            })),
        },
      ]);

      setFilterOptions(options);
    })();
  }, [activePanel]);

  useEffect(() => {
    if (! filterValues)  {
      return;
    }

    // fetch variables once filters are set
    (async () => {
      const data = await fetchPostsData(slug, filterValues);
      const normalizedData = await normalizeRadioCardProps(data, 'post');

      setVariables(normalizedData);
    })();
  }, [filterValues]);

  // don't render if there are no variables set
  if (! variables) {
    return null;
  }

  return (
    <SidebarPanel id={slug} className="w-[36rem]">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{__('Select a variable')}</CardTitle>
          <CardDescription>
            {__('Here you can browse all the variables contained in the selected dataset.')}
          </CardDescription>
          <Grid columns={filterOptions.length} className="gap-4 mt-4">
            {filterOptions.map((filter, index) => (
              <Dropdown
                key={index}
                searchable
                label={filter.label}
                tooltip={filter.tooltip}
                placeholder={filter.placeholder}
                options={filter.options.map((option: TaxonomyData) => ({
                  value: String(option.id),
                  label: option.name,
                }))}
                onChange={(value) => filter.onChange(value)}
              />
            ))}
          </Grid>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Grid columns={2} className="gap-4">
            {variables.map((item) => (
              <RadioCard
                key={item.id}
                value={item.id}
                radioGroup="variable"
                title={item.title}
                description={item.description}
                thumbnail={item.thumbnail}
                selected={selected === String(item.id)}
                onSelect={() => onSelect(String(item.id))}
              >
                <RadioCardFooter>
                  <Link
                    icon={<ExternalLink size={16} />}
                    href={item.link}
                    className="text-sm text-brand-blue"
                  >
                    {__('Learn more')}
                  </Link>
                </RadioCardFooter>
              </RadioCard>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </SidebarPanel>
  );
};
VariablesPanel.displayName = "VariablesPanel";

export { VariablesMenuItem, VariablesPanel };