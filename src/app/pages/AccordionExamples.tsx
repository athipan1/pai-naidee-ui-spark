import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionItemData,
} from "@/components/ui/accordion";

/**
 * Example page demonstrating the enhanced accordion component
 */
const AccordionExamples: React.FC = () => {
  // Dynamic items example
  const faqItems: AccordionItemData[] = [
    {
      id: "faq-1",
      title: "What is Pai Nai Dee?",
      content:
        "Pai Nai Dee is a comprehensive travel platform for discovering amazing destinations in Thailand.",
    },
    {
      id: "faq-2",
      title: "How do I book attractions?",
      content:
        "You can book attractions directly through our platform by selecting your preferred dates and following the booking process.",
    },
    {
      id: "faq-3",
      title: "Are there group discounts available?",
      content:
        "Yes, we offer special group discounts for bookings of 5 or more people. Contact our support team for more details.",
    },
  ];

  const handleAccordionChange = (value: string | string[]) => {
    console.log("Accordion value changed:", value);
  };

  const handleItemOpen = (value: string) => {
    console.log("Item opened:", value);
  };

  const handleItemClose = (value: string) => {
    console.log("Item closed:", value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Enhanced Accordion Component
        </h1>
        <p className="text-muted-foreground">
          Demonstrating advanced features and capabilities
        </p>
      </div>

      {/* Basic Single Mode */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Single Mode</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="basic-1">
            <AccordionTrigger>What is an accordion?</AccordionTrigger>
            <AccordionContent>
              An accordion is a vertically stacked list of items, such as labels
              or thumbnails, where each item can be expanded or collapsed to
              reveal additional content.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="basic-2">
            <AccordionTrigger>Why use accordions?</AccordionTrigger>
            <AccordionContent>
              Accordions help organize content in a space-efficient way,
              allowing users to focus on specific sections while keeping other
              content accessible.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Multiple Mode */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Multiple Mode</h2>
        <Accordion
          type="multiple"
          variant="outlined"
          onValueChange={handleAccordionChange}
          onOpen={handleItemOpen}
          onClose={handleItemClose}
        >
          <AccordionItem value="multi-1">
            <AccordionTrigger>Feature 1: Multiple Items Open</AccordionTrigger>
            <AccordionContent>
              In multiple mode, you can have several accordion items open
              simultaneously. This is useful for comparing content or viewing
              multiple sections at once.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="multi-2">
            <AccordionTrigger>Feature 2: Callback Support</AccordionTrigger>
            <AccordionContent>
              The enhanced accordion supports onValueChange, onOpen, and onClose
              callbacks. Check the browser console to see these callbacks in
              action.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="multi-3">
            <AccordionTrigger>Feature 3: Styled Variants</AccordionTrigger>
            <AccordionContent>
              This accordion uses the &apos;outlined&apos; variant, which
              provides a more prominent border. Other variants include
              &apos;default&apos; and &apos;ghost&apos;.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Dynamic Items */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dynamic Items from Array</h2>
        <Accordion
          type="single"
          collapsible
          items={faqItems}
          variant="default"
          size="md"
          animationType="fade"
          animationDuration={300}
        />
      </section>

      {/* Different Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Size Variants</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Small Size</h3>
            <Accordion type="single" size="sm" collapsible>
              <AccordionItem value="size-sm">
                <AccordionTrigger>Small accordion example</AccordionTrigger>
                <AccordionContent>
                  This is a small-sized accordion with reduced padding and text
                  size.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Large Size</h3>
            <Accordion type="single" size="lg" collapsible>
              <AccordionItem value="size-lg">
                <AccordionTrigger>Large accordion example</AccordionTrigger>
                <AccordionContent>
                  This is a large-sized accordion with increased padding and
                  text size.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Animation Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Animation Types</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Slide (Default)</h3>
            <Accordion type="single" animationType="slide" collapsible>
              <AccordionItem value="anim-slide">
                <AccordionTrigger>Slide Animation</AccordionTrigger>
                <AccordionContent>
                  Smooth height transition animation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Fade</h3>
            <Accordion type="single" animationType="fade" collapsible>
              <AccordionItem value="anim-fade">
                <AccordionTrigger>Fade Animation</AccordionTrigger>
                <AccordionContent>
                  Opacity transition with vertical movement.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Bounce</h3>
            <Accordion type="single" animationType="bounce" collapsible>
              <AccordionItem value="anim-bounce">
                <AccordionTrigger>Bounce Animation</AccordionTrigger>
                <AccordionContent>
                  Playful bounce effect with scaling.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Custom Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Custom Icons</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">
              Custom Icon (Plus/Minus)
            </h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="icon-plus">
                <AccordionTrigger
                  customIcon={<span className="text-xl font-bold">+</span>}
                >
                  Custom Plus Icon
                </AccordionTrigger>
                <AccordionContent>
                  This accordion uses a custom plus/minus icon instead of the
                  default chevron.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Icon on Left</h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="icon-left">
                <AccordionTrigger
                  customIcon={<span className="text-xl">→</span>}
                  iconPosition="left"
                >
                  Icon on Left Side
                </AccordionTrigger>
                <AccordionContent>
                  The icon can be positioned on either the left or right side of
                  the trigger.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">No Icon</h3>
            <Accordion type="single" collapsible>
              <AccordionItem value="icon-hidden">
                <AccordionTrigger hideIcon>
                  Clean Look Without Icon
                </AccordionTrigger>
                <AccordionContent>
                  Sometimes you might want a cleaner look without any expansion
                  indicator icon.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Ghost Variant */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Ghost Variant</h2>
        <Accordion type="single" variant="ghost" collapsible>
          <AccordionItem value="ghost-1">
            <AccordionTrigger>Minimal Ghost Style</AccordionTrigger>
            <AccordionContent>
              The ghost variant provides a minimal appearance without borders,
              perfect for cleaner layouts or when the accordion is used within
              other containers.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ghost-2">
            <AccordionTrigger>Another Ghost Item</AccordionTrigger>
            <AccordionContent>
              Ghost variants work well in sidebars, cards, or any context where
              you want the content to stand out more than the container.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>
          Open the browser console to see callback logs when interacting with
          accordions that have callbacks enabled.
        </p>
      </div>
    </div>
  );
};

export default AccordionExamples;
