import { ReactNode } from 'react';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'outlined' | 'ghost';
export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionTheme = 'light' | 'dark';
export type AccordionAnimationType = 'slide' | 'fade' | 'bounce';
export type IconPosition = 'left' | 'right';

export interface AccordionItemData {
  id: string;
  title: string | ReactNode;
  content: string | ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface AccordionProps {
  type?: AccordionType;
  collapsible?: boolean;
  variant?: AccordionVariant;
  size?: AccordionSize;
  theme?: AccordionTheme;
  animationType?: AccordionAnimationType;
  animationDuration?: number;
  onValueChange?: (value: string | string[]) => void;
  onOpen?: (value: string) => void;
  onClose?: (value: string) => void;
  items?: AccordionItemData[];
  className?: string;
  children?: ReactNode;
  value?: string | string[];
  defaultValue?: string | string[];
  disabled?: boolean;
  // Icon customization
  customIcon?: ReactNode;
  iconPosition?: IconPosition;
  hideIcon?: boolean;
  // Accessibility
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface AccordionItemProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export interface AccordionTriggerProps {
  className?: string;
  children?: ReactNode;
  customIcon?: ReactNode;
  iconPosition?: IconPosition;
  hideIcon?: boolean;
  size?: AccordionSize;
  variant?: AccordionVariant;
}

export interface AccordionContentProps {
  className?: string;
  children?: ReactNode;
  animationType?: AccordionAnimationType;
  animationDuration?: number;
}

// For backward compatibility
export interface LegacyAccordionProps {
  className?: string;
  children?: ReactNode;
}