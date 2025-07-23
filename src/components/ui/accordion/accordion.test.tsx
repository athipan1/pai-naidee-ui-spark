import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from './accordion';

describe('Enhanced Accordion Component', () => {
  it('renders basic accordion structure', () => {
    render(
      <Accordion type="single" data-testid="accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger>Test Trigger</AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('accordion')).toBeInTheDocument();
    expect(screen.getByText('Test Trigger')).toBeInTheDocument();
  });

  it('supports single mode', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');

    fireEvent.click(trigger1);
    expect(screen.getByText('Content 1')).toBeVisible();

    fireEvent.click(trigger2);
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('supports multiple mode', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');

    fireEvent.click(trigger1);
    fireEvent.click(trigger2);

    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('renders dynamic items from array', () => {
    const items = [
      { id: 'item-1', title: 'Dynamic Title 1', content: 'Dynamic Content 1' },
      { id: 'item-2', title: 'Dynamic Title 2', content: 'Dynamic Content 2' }
    ];

    render(
      <Accordion type="single" items={items} />
    );

    expect(screen.getByText('Dynamic Title 1')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Title 2')).toBeInTheDocument();
  });

  it('triggers callbacks on value change', () => {
    const onValueChange = vi.fn();
    const onOpen = vi.fn();
    const onClose = vi.fn();

    render(
      <Accordion 
        type="single" 
        collapsible
        onValueChange={onValueChange}
        onOpen={onOpen}
        onClose={onClose}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Test Trigger</AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Test Trigger');
    fireEvent.click(trigger);

    expect(onValueChange).toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalledWith('item-1');
  });

  it('applies variant styles correctly', () => {
    const { container } = render(
      <Accordion type="single" variant="outlined" size="lg">
        <AccordionItem value="item-1">
          <AccordionTrigger>Test Trigger</AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const accordion = container.firstChild as HTMLElement;
    expect(accordion).toHaveClass('border-2');
    expect(accordion).toHaveClass('text-lg');
  });

  it('supports custom icon and positioning', () => {
    const CustomIcon = () => <span data-testid="custom-icon">+</span>;
    
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger 
            customIcon={<CustomIcon />} 
            iconPosition="left"
          >
            Test Trigger
          </AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('can hide icons', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger hideIcon>Test Trigger</AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Should not have the default ChevronDown icon
    const trigger = screen.getByText('Test Trigger').closest('button');
    expect(trigger).not.toContainHTML('ChevronDown');
  });

  it('supports different animation types', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Test Trigger</AccordionTrigger>
          <AccordionContent animationType="fade" animationDuration={300}>
            Test Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const content = screen.getByText('Test Content').closest('[data-radix-accordion-content]');
    expect(content).toHaveClass('duration-300');
  });
});