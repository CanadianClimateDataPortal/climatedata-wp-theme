import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

import { RadioCard, RadioCardFooter } from "@/components/ui/radio-card";
import Link from "@/components/ui/link";

import { fetchPostsData } from "@/services/services";
import { normalizeRadioCardProps } from "@/lib/format";
import { PostData } from "@/types/types";

const VariableRadioCards: React.FC<{
  filterValues: Record<string, string>;
  selected: PostData | null;
  onSelect: (variable: PostData) => void;
}> = ({ filterValues, selected, onSelect }) => {
  const [variables, setVariables] = useState<PostData[]>([]);

  useEffect(() => {
    (async () => {
      if (! filterValues) {
        return;
      }

      const data = await fetchPostsData('variable', filterValues);
      const normalizedData = await normalizeRadioCardProps(data, 'post');
      setVariables(normalizedData);
    })();
  }, [filterValues]);

  if (! variables) {
    return null;
  }

  return (
    <>
      {variables.map((item, index) => (
        <RadioCard
          key={index}
          value={item}
          radioGroup="variable"
          title={item.title}
          description={item?.description}
          thumbnail={item?.thumbnail}
          selected={selected?.id === item.id}
          onSelect={() => onSelect(item)}
        >
          <RadioCardFooter>
            <Link
              icon={<ExternalLink size={16} />}
              href={item.link}
              className="text-base text-brand-blue leading-6"
            >
              Learn more
            </Link>
          </RadioCardFooter>
        </RadioCard>
      ))}
    </>
  );
};
VariableRadioCards.displayName = "VariableRadioCards";

export default VariableRadioCards;