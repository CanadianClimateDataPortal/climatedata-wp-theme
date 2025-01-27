/**
 * AnimatedPanel
 *
 * A reusable, animated sliding panel component that can slide in from any direction.
 * It supports custom positioning, animation directions, and additional styling via class names.
 *
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X as CloseIcon } from "lucide-react";
import { useI18n } from "@wordpress/react-i18n";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { AnimatedPanelProps } from "@/types/types";

const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
  isOpen,
  onClose,
  direction = 'right',
  position,
  className,
  children
}) => {
  const { __ } = useI18n();

  // TODO: allow for custom animations other than "slide"
  const getAnimationProps = () => {
    switch (direction) {
      case 'right':
        return { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };
      case 'left':
        return { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } };
      case 'top':
        return { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } };
      case 'bottom':
        return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };
      default:
        return {};
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...getAnimationProps()}
          transition={{ duration: 0.25 }}
          style={{
            left: direction === 'left' ? 0 : undefined, // default to all the way to the left
            right: direction === 'right' ? 0 : undefined, // default to all the way to the right
            ...position, // may override left/right defaults if provided
          }}
          className={cn(
            'absolute bg-white shadow-sm z-[99998]',
            className,
          )}
        >
          <Button onClick={onClose}
                  variant="link"
                  className="absolute top-4 right-4 text-zinc-900 hover:text-dark-purple h-auto p-0 [&_svg]:size-6"
          >
            <span className="sr-only">{__('Close panel')}</span>
            <CloseIcon aria-hidden="true" focusable="false" />
          </Button>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
AnimatedPanel.displayName = "AnimatedPanel";

export default AnimatedPanel;