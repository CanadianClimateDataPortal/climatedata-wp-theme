/**
 * Link Component
 *
 * A custom `Link` component that extends the functionality of the native
 * HTML `<a>` tag to support other features like an icon component.
 */
import { forwardRef } from "react"

import { cn } from "@/lib/utils";
import { AnchorProps } from "@/types/types";

const Link = forwardRef<HTMLAnchorElement, AnchorProps>(
  ({
     className = '',
     href: url = '#',
     icon,
     children,
     ...props
   }, ref) => {
    // only applied if icon is present
    const hasIconClass = icon ? "inline-flex items-center gap-2" : "";

    return (
      <a
        ref={ref}
        href={url}
        className={cn(
          "link cursor-pointer",
          hasIconClass,
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {icon}
      </a>
    );
  }
);
Link.displayName = "Link";

export default Link;