/**
 * A menu item and panel component that displays a list of datasets.
 * TODO: make this work with the new AnimatedPanel component
 */
import React, { useState, useEffect } from "react";
import { Database, ChevronRight, ExternalLink } from "lucide-react";
import { useI18n } from "@wordpress/react-i18n";

// components
import { SidebarMenuButton, SidebarMenuItem, SidebarPanel, useSidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioCard, RadioCardFooter } from "@/components/ui/radio-card";
import Grid from "@/components/ui/grid";
import Link from "@/components/ui/link";

// other
import { fetchTaxonomyData } from "@/services/services";
import { InteractivePanelProps, TaxonomyData } from "@/types/types";

// menu and panel slug
const slug = 'variable-dataset';

/**
 * A menu item link component that toggles the datasets panel.
 */
const DatasetsMenuItem: React.FC = () => {
  const { togglePanel, isPanelActive } = useSidebar();
  const { __ } = useI18n();

  const handleClick = () => {
    togglePanel(slug);
  };

  return (
    <SidebarMenuItem className="cursor-pointer">
      <SidebarMenuButton size="md" isActive={isPanelActive(slug)} onClick={handleClick}>
        <Database size={16} />
        <span className="grow">{__('Datasets')}</span>
        <ChevronRight className="text-brand-blue" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
DatasetsMenuItem.displayName = "DatasetsMenuItem";

/**
 * A panel component that displays a list of datasets.
 */
const DatasetsPanel: React.FC<InteractivePanelProps> = ({ selected, onSelect }) => {
  const [datasets, setDatasets] = useState<TaxonomyData[]>([]);
  const { activePanel, isPanelActive } = useSidebar();
  const { __ } = useI18n();

  useEffect(() => {
    if (! isPanelActive(slug)) {
      return;
    }

    // fetch datasets once the panel is active
    (async () => {
      setDatasets(await fetchTaxonomyData(slug));
    })();
  }, [activePanel]);

  // don't render if there are no datasets set
  if (! datasets) {
    return null;
  }

  return (
    <SidebarPanel id={slug} className="w-96">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">{__('Select a dataset')}</CardTitle>
          <CardDescription>
            {__('Climate Data provides a selection of historical and future climate datasets.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Grid columns={1} className="gap-4">
            {datasets.map((item) => (
              <RadioCard
                key={item.id}
                value={item}
                radioGroup={slug}
                title={item.name ?? ''}
                description={item.description}
                selected={selected === item}
                onSelect={() => onSelect(item)}
              >
                <RadioCardFooter>
                  <Link
                    icon={<ExternalLink size={16} />}
                    href={item.link}
                    className="text-base text-brand-blue leading-6"
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
DatasetsPanel.displayName = "DatasetsPanel";

export { DatasetsMenuItem, DatasetsPanel };