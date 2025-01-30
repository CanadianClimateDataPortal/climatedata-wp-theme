/**
 * ControlTitle Component
 *
 * A custom component for rendering a title with an optional tooltip.
 * Designed to be used as a header or label in UI controls.
 *
 */
import { forwardRef } from "react";
import { InfoIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { ControlTitleProps } from "@/types/types";
import { cn } from "@/lib/utils";

const ControlTitle = forwardRef<HTMLDivElement, ControlTitleProps>(
  ({ title, tooltip, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "control-title",
        "flex flex-row gap-2 my-2 text-dark-purple",
        className
      )}
      {...props}
    >
      <div className="text-sm font-semibold uppercase">{title}</div>
      {tooltip && (
        <Popover>
          <PopoverTrigger>
            <InfoIcon size={16} />
          </PopoverTrigger>
          <PopoverContent>
            {tooltip}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
);

ControlTitle.displayName = "ControlTitle";

export { ControlTitle };
