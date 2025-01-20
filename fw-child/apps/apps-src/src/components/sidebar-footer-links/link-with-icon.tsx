/**
 * LinkWithIcon component
 *
 * Component that renders a link with left LucideReact icon.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { LinkWithIconProps } from "@/types/types";

const LinkWithIcon: React.FC<LinkWithIconProps> = ({ icon: Icon, children, ...props }) => {
  const Tag = props.href ? "a" : "button";
  return (
    <Button asChild variant="link" className="justify-start p-2 text-dark-purple cursor-pointer hover:-underline">
      <Tag {...props}>
        <Icon size={16} />
        <span className="text-brand-blue hover:text-dark-purple">
          {children}
        </span>
      </Tag>
    </Button>
  );
}
LinkWithIcon.displayName = "LinkWithIcon";

export default LinkWithIcon;