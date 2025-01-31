/**
 * RadioGroup Component
 *
 * A custom radio group component that uses the Radix RadioGroupPrimitive components
 * to render a group of radio buttons.
 */
import React, { forwardRef } from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import { normalizeOptions } from "@/lib/format"
import { ControlTitle } from "@/components/ui/control-title";

const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("radio-group grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "radio-group-item",
        "aspect-square h-4 w-4",
        "rounded-full border border-primary",
        "text-brand-red",
        "ring-offset-background",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3 w-3 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioGroupFactory = forwardRef<
  React.ElementRef<typeof RadioGroup>,
  React.ComponentPropsWithoutRef<typeof RadioGroup> & {
    name: string;
    options: { value: string; label: string }[] | string[] | number[];
    optionClassName?: string;
    title?: string;
    tooltip?: React.ReactNode;
    orientation?: "horizontal" | "vertical";
  }
  >(({
  name,
  title,
  tooltip,
  orientation = 'vertical',
  options,
  optionClassName,
  className,
  ...props
}, ref) => {
  // when receiving an array of strings or numbers as options we will convert them valid value/label objects
  const normalizedOptions = normalizeOptions(options)

  const orientationClasses = {
    vertical: 'sm:flex-col',
    horizontal: '',
  };

  return (
    <RadioGroup ref={ref} className={cn("radio-group-factory mb-4", className)} {...props}>
      {title && <ControlTitle title={title} tooltip={tooltip} className="my-0" />}
      <div className={cn('flex flex-wrap gap-y-2 gap-x-0', orientationClasses[orientation])}>
        {normalizedOptions.map((option, index) => (
          <div key={index}
               className={cn(
                 'flex items-center space-x-2',
                 optionClassName ?? ''
               )}
          >
            <RadioGroupItem value={option.value} id={`radio-${name}-${index}`} />
            <label
              htmlFor={`radio-${name}-${index}`}
              className="text-zinc-900 text-sm leading-5 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
});
RadioGroupFactory.displayName = "RadioGroupFactory";

export { RadioGroup, RadioGroupItem, RadioGroupFactory };
