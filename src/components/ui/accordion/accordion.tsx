import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  AccordionItemData,
  AccordionAnimationType,
} from "./accordion.types";

/**
 * Accordion component variants for styling
 */
const accordionVariants = cva("border rounded-lg", {
  variants: {
    variant: {
      default: "border-border",
      outlined: "border-2 border-border",
      ghost: "border-transparent",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    theme: {
      light: "bg-background text-foreground",
      dark: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    theme: "light",
  },
});

/**
 * Accordion trigger variants for styling
 */
const triggerVariants = cva(
  "flex flex-1 items-center font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "justify-between",
        outlined: "justify-between px-1",
        ghost: "justify-between",
      },
      size: {
        sm: "py-2 text-sm",
        md: "py-4 text-base",
        lg: "py-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Animation styles for different animation types
 */
const getAnimationClasses = (
  animationType: AccordionAnimationType,
  duration: number
) => {
  const durationClass = `duration-${duration}`;

  switch (animationType) {
    case "fade":
      return `overflow-hidden transition-all ${durationClass} data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in`;
    case "bounce":
      return `overflow-hidden transition-all ${durationClass} data-[state=closed]:animate-bounce-out data-[state=open]:animate-bounce-in`;
    case "slide":
    default:
      return `overflow-hidden transition-all ${durationClass} data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down`;
  }
};

/**
 * Enhanced Accordion Root Component
 *
 * @description A flexible accordion component that supports multiple modes, themes, animations, and customization options.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *     <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 *
 * // Advanced usage with dynamic items
 * <Accordion
 *   type="multiple"
 *   variant="outlined"
 *   size="lg"
 *   animationType="bounce"
 *   items={dynamicItems}
 *   onValueChange={(values) => console.log(values)}
 * />
 * ```
 */
const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(
  (
    {
      className,
      type = "single",
      collapsible,
      variant = "default",
      size = "md",
      theme = "light",
      animationType = "slide",
      animationDuration = 200,
      onValueChange,
      onOpen,
      onClose,
      items,
      children,
      customIcon,
      iconPosition = "right",
      hideIcon = false,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [openItems, setOpenItems] = React.useState<string[]>([]);

    // Handle value changes and trigger callbacks
    const handleValueChange = React.useCallback(
      (value: string | string[]) => {
        onValueChange?.(value);

        if (type === "single") {
          const newValue = value as string;
          const prevValue = openItems[0];

          if (newValue && newValue !== prevValue) {
            onOpen?.(newValue);
          }
          if (prevValue && prevValue !== newValue) {
            onClose?.(prevValue);
          }

          setOpenItems(newValue ? [newValue] : []);
        } else {
          const newValues = value as string[];
          const prevValues = openItems;

          // Find newly opened items
          newValues.forEach((val) => {
            if (!prevValues.includes(val)) {
              onOpen?.(val);
            }
          });

          // Find newly closed items
          prevValues.forEach((val) => {
            if (!newValues.includes(val)) {
              onClose?.(val);
            }
          });

          setOpenItems(newValues);
        }
      },
      [type, onValueChange, onOpen, onClose, openItems]
    );

    const accordionClasses = cn(
      accordionVariants({ variant, size, theme }),
      className
    );

    // If items are provided, render them dynamically
    if (items && items.length > 0) {
      if (type === "single") {
        return (
          <AccordionPrimitive.Root
            ref={ref}
            type="single"
            collapsible={collapsible}
            value={value as string}
            defaultValue={defaultValue as string}
            className={accordionClasses}
            onValueChange={handleValueChange}
            {...props}
          >
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                className={item.className}
              >
                <AccordionTrigger
                  customIcon={customIcon}
                  iconPosition={iconPosition}
                  hideIcon={hideIcon}
                  size={size}
                  variant={variant}
                >
                  {item.title}
                </AccordionTrigger>
                <AccordionContent
                  animationType={animationType}
                  animationDuration={animationDuration}
                >
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </AccordionPrimitive.Root>
        );
      } else {
        return (
          <AccordionPrimitive.Root
            ref={ref}
            type="multiple"
            value={value as string[]}
            defaultValue={defaultValue as string[]}
            className={accordionClasses}
            onValueChange={handleValueChange}
            {...props}
          >
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                className={item.className}
              >
                <AccordionTrigger
                  customIcon={customIcon}
                  iconPosition={iconPosition}
                  hideIcon={hideIcon}
                  size={size}
                  variant={variant}
                >
                  {item.title}
                </AccordionTrigger>
                <AccordionContent
                  animationType={animationType}
                  animationDuration={animationDuration}
                >
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </AccordionPrimitive.Root>
        );
      }
    }

    // Default children rendering
    if (type === "single") {
      return (
        <AccordionPrimitive.Root
          ref={ref}
          type="single"
          collapsible={collapsible}
          value={value as string}
          defaultValue={defaultValue as string}
          className={accordionClasses}
          onValueChange={handleValueChange}
          {...props}
        >
          {children}
        </AccordionPrimitive.Root>
      );
    } else {
      return (
        <AccordionPrimitive.Root
          ref={ref}
          type="multiple"
          value={value as string[]}
          defaultValue={defaultValue as string[]}
          className={accordionClasses}
          onValueChange={handleValueChange}
          {...props}
        >
          {children}
        </AccordionPrimitive.Root>
      );
    }
  }
);

Accordion.displayName = "Accordion";

/**
 * Accordion Item Component
 *
 * @description Individual accordion item wrapper
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b last:border-b-0", className)}
    {...props}
  />
));

AccordionItem.displayName = "AccordionItem";

/**
 * Accordion Trigger Component
 *
 * @description Clickable header that toggles the accordion item
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      className,
      children,
      customIcon,
      iconPosition = "right",
      hideIcon = false,
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const icon = customIcon || (
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    );

    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            triggerVariants({ variant, size }),
            iconPosition === "left" && !hideIcon && "flex-row-reverse",
            className
          )}
          {...props}
        >
          {iconPosition === "left" && !hideIcon && icon}
          <span
            className={cn(
              "text-left",
              iconPosition === "left" && !hideIcon && "mr-auto",
              iconPosition === "right" && !hideIcon && "mr-auto"
            )}
          >
            {children}
          </span>
          {iconPosition === "right" && !hideIcon && icon}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);

AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

/**
 * Accordion Content Component
 *
 * @description Collapsible content area of the accordion item
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(
  (
    {
      className,
      children,
      animationType = "slide",
      animationDuration = 200,
      ...props
    },
    ref
  ) => (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "text-sm",
        getAnimationClasses(animationType, animationDuration),
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  )
);

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionVariants,
  triggerVariants,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
  type AccordionItemData,
};
