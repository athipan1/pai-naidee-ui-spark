import type { Meta, StoryObj } from '@storybook/react';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent,
  type AccordionProps 
} from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible accordion component with advanced features including multiple modes, animations, themes, and dynamic content support.'
      }
    }
  },
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['single', 'multiple'],
      description: 'Accordion mode - single allows one item open at a time, multiple allows multiple items'
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'ghost'],
      description: 'Visual variant of the accordion'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant affecting text size and padding'
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
      description: 'Theme variant for light or dark appearance'
    },
    animationType: {
      control: { type: 'select' },
      options: ['slide', 'fade', 'bounce'],
      description: 'Animation type for expand/collapse transitions'
    },
    animationDuration: {
      control: { type: 'range', min: 100, max: 1000, step: 50 },
      description: 'Animation duration in milliseconds'
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with basic accordion
export const Default: Story = {
  args: {
    type: 'single',
    variant: 'default',
    size: 'md',
    theme: 'light',
    animationType: 'slide'
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args} collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern and includes proper keyboard navigation and screen reader support.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that can be easily customized through variants and custom CSS classes.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. It includes smooth animations with customizable animation types and durations.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// Multiple mode story
export const Multiple: Story = {
  args: {
    type: 'multiple',
    variant: 'default',
    size: 'md'
  },
  render: (args) => (
    <div className="w-[500px]">
      <Accordion {...args}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Features</AccordionTrigger>
          <AccordionContent>
            Multiple items can be open simultaneously in this mode.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Benefits</AccordionTrigger>
          <AccordionContent>
            Users can compare content between different sections easily.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Use Cases</AccordionTrigger>
          <AccordionContent>
            Perfect for FAQs, settings panels, and content comparisons.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// Variants showcase
export const Variants: Story = {
  render: () => (
    <div className="space-y-6 w-[500px]">
      <div>
        <h3 className="text-lg font-semibold mb-2">Default Variant</h3>
        <Accordion type="single" variant="default" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Default styling</AccordionTrigger>
            <AccordionContent>Standard border and background.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Outlined Variant</h3>
        <Accordion type="single" variant="outlined" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Outlined styling</AccordionTrigger>
            <AccordionContent>Thicker border for emphasis.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Ghost Variant</h3>
        <Accordion type="single" variant="ghost" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Ghost styling</AccordionTrigger>
            <AccordionContent>Minimal styling without borders.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// Sizes showcase
export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 w-[500px]">
      <div>
        <h3 className="text-lg font-semibold mb-2">Small Size</h3>
        <Accordion type="single" size="sm" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Small accordion</AccordionTrigger>
            <AccordionContent>Compact size with reduced padding.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Medium Size (Default)</h3>
        <Accordion type="single" size="md" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Medium accordion</AccordionTrigger>
            <AccordionContent>Standard size with normal padding.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Large Size</h3>
        <Accordion type="single" size="lg" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Large accordion</AccordionTrigger>
            <AccordionContent>Large size with increased padding.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// Animation types showcase
export const Animations: Story = {
  render: () => (
    <div className="space-y-6 w-[500px]">
      <div>
        <h3 className="text-lg font-semibold mb-2">Slide Animation (Default)</h3>
        <Accordion type="single" animationType="slide" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Slide animation</AccordionTrigger>
            <AccordionContent>Smooth height transition.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Fade Animation</h3>
        <Accordion type="single" animationType="fade" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Fade animation</AccordionTrigger>
            <AccordionContent>Opacity transition with slight vertical movement.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Bounce Animation</h3>
        <Accordion type="single" animationType="bounce" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Bounce animation</AccordionTrigger>
            <AccordionContent>Playful bounce effect with scale transformation.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// Dynamic items from array
export const DynamicItems: Story = {
  args: {
    type: 'single',
    variant: 'default',
    size: 'md'
  },
  render: (args) => {
    const items = [
      {
        id: 'faq-1',
        title: 'What is this component?',
        content: 'This is an enhanced accordion component with dynamic item support.'
      },
      {
        id: 'faq-2', 
        title: 'How do I use dynamic items?',
        content: 'Pass an array of items to the items prop with id, title, and content properties.'
      },
      {
        id: 'faq-3',
        title: 'Can I mix static and dynamic content?',
        content: 'Yes, you can use either the items prop for dynamic content or children for static content, but not both simultaneously.'
      }
    ];
    
    return (
      <div className="w-[500px]">
        <Accordion {...args} items={items} collapsible />
      </div>
    );
  },
};

// Custom icon example
export const CustomIcon: Story = {
  render: () => (
    <div className="space-y-6 w-[500px]">
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Icon (Right)</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger 
              customIcon={<span className="text-xl">+</span>}
              iconPosition="right"
            >
              Custom plus icon
            </AccordionTrigger>
            <AccordionContent>Content with custom icon on the right.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Icon (Left)</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger 
              customIcon={<span className="text-xl">→</span>}
              iconPosition="left"
            >
              Custom arrow icon
            </AccordionTrigger>
            <AccordionContent>Content with custom icon on the left.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">No Icon</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger hideIcon>
              No icon at all
            </AccordionTrigger>
            <AccordionContent>Content without any icon.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};

// With callbacks
export const WithCallbacks: Story = {
  render: () => (
    <div className="w-[500px]">
      <Accordion 
        type="single" 
        collapsible
        onValueChange={(value) => console.log('Value changed:', value)}
        onOpen={(value) => console.log('Opened:', value)}
        onClose={(value) => console.log('Closed:', value)}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Check console for callbacks</AccordionTrigger>
          <AccordionContent>
            Open the browser console to see the callback logs when you interact with this accordion.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second item</AccordionTrigger>
          <AccordionContent>
            Each open/close action will trigger the appropriate callbacks.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};