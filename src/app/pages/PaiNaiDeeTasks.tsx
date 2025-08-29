// src/app/pages/PaiNaiDeeTasks.tsx

import React from 'react';
import CreateTaskForm from '@/components/painaidee/CreateTaskForm';

/**
 * =============================================================================
 * PaiNaiDeeTasks Page
 * =============================================================================
 * This page serves as the entry point for task-related features.
 *
 * Its primary responsibility is to render the `CreateTaskForm` component
 * within a standard page layout. This separation of concerns makes the
 * form component more reusable.
 * =============================================================================
 */
const PaiNaiDeeTasks: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      {/*
        The CreateTaskForm component is self-contained. It handles its own
        state and logic, so we just need to render it here.
      */}
      <CreateTaskForm />
    </div>
  );
};

export default PaiNaiDeeTasks;
