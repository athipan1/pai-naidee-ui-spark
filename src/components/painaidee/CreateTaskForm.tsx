// src/components/painaidee/CreateTaskForm.tsx

import React, { useState } from 'react';
import paiNaiDeeService, { NewTaskData } from '@/services/paiNaiDeeService';

// Import existing UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideAlertTriangle, LucideCheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * =============================================================================
 * CreateTaskForm Component
 * =============================================================================
 * This component provides a form for creating a new task.
 *
 * It demonstrates:
 * 1. Handling form input state with `useState`.
 * 2. Form submission logic and API calls.
 * 3. Displaying feedback to the user (loading, success, error).
 * 4. Reusability, as it can be placed on any page.
 * =============================================================================
 */
const CreateTaskForm: React.FC = () => {
  // 1. Form input state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 2. Submission status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 3. Form submission handler
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default browser form submission

    // Reset state for a new submission
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!title) {
      setError('Title is required.');
      setIsSubmitting(false);
      return;
    }

    const taskData: NewTaskData = { title, description };

    try {
      const createdTask = await paiNaiDeeService.createTask(taskData);
      setSuccessMessage(`Task "${createdTask.title}" created successfully!`);
      // Reset form fields on success
      setTitle('');
      setDescription('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while creating the task.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Task</CardTitle>
        <CardDescription>
          Fill out the form below to add a new task via the PaiNaiDee backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a task title"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a task description (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Submission Button */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Create Task'}
          </Button>
        </form>

        {/* Feedback Messages */}
        <div className="mt-4 space-y-2">
          {error && (
            <Alert variant="destructive">
              <LucideAlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="bg-green-100 border-green-400 text-green-700">
                <LucideCheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateTaskForm;
