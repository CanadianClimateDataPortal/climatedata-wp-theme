/**
 * Grid Component
 *
 * A grid layout component that uses the CSS Grid to dynamically
 * generate columns based on the `columns` prop.
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { GridProps } from "@/types/types";

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
     className = '',
     columns = 1,
     children,
     ...props
   }, ref) => {
    return (
      <div
        ref={ref}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        className={cn(`grid`, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
);
Grid.displayName = "Grid";

export default Grid;