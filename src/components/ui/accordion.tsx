/**
 * Enhanced Accordion Component
 * 
 * This file provides backward compatibility while exporting the enhanced accordion components.
 * For full feature access, import directly from './accordion/accordion.tsx'
 * 
 * @version 2.0.0 - Enhanced with advanced features
 * @version 1.0.0 - Original simple implementation
 */

// Export enhanced components (backward compatible)
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
} from "./accordion/accordion";

// Export types for external usage
export type {
  AccordionType,
  AccordionVariant,
  AccordionSize,
  AccordionTheme,
  AccordionAnimationType,
  IconPosition,
} from "./accordion/accordion.types";
