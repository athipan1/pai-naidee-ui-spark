// src/app/pages/PaiNaiDeeUsers.tsx

import React, { useState, useEffect } from 'react';
import paiNaiDeeService, { User } from '@/services/paiNaiDeeService';

// Import existing UI components for a consistent look and feel
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { LucideAlertTriangle } from 'lucide-react';

/**
 * =============================================================================
 * PaiNaiDeeUsers Page
 * =============================================================================
 * This page component fetches and displays a list of users from the PaiNaiDee backend.
 *
 * It demonstrates the following key concepts:
 * 1. Data fetching in a React component using `useEffect`.
 * 2. Managing and displaying loading state.
 * 3. Managing and displaying error state.
 * 4. Rendering a list of data from an API.
 * =============================================================================
 */
const PaiNaiDeeUsers: React.FC = () => {
  // 1. State management
  //    - `users`: Stores the array of user data fetched from the API.
  //    - `loading`: Tracks whether the data is currently being fetched.
  //    - `error`: Stores any error message if the API call fails.
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Data fetching logic
  //    - `useEffect` with an empty dependency array `[]` runs once when the component mounts.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true); // Ensure loading is true at the start of the fetch
        setError(null); // Reset previous errors

        const fetchedUsers = await paiNaiDeeService.getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        // If the service throws an error, catch it and update the error state.
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        // This block runs whether the fetch succeeded or failed.
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty array means this effect runs only once on mount.

  // 3. Conditional rendering logic
  //    - Based on the `loading` and `error` states, we render different UI.

  //    - If loading, show a spinner.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner text="Fetching users..." />
      </div>
    );
  }

  //    - If an error occurred, show an alert message.
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <LucideAlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  //    - If data is fetched successfully, display the list of users.
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>PaiNaiDee User List</CardTitle>
          <CardDescription>
            This is a list of users fetched from the example backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="py-4 flex flex-col">
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaiNaiDeeUsers;
