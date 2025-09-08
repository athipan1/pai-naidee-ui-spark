// src/services/paiNaiDeeService.ts

import axios from 'axios';

/**
 * =============================================================================
 * Service for Interacting with the PaiNaiDee Backend
 * =============================================================================
 * This service provides methods for making API calls to the external PaiNaiDee backend.
 *
 * Base URL: https://Athipan01-PaiNaiDee-Backend.hf.space
 *
 * Functions:
 * - getUsers(): Fetches a list of all users.
 * - createTask(taskData): Creates a new task.
 *
 * Usage Example:
 * import paiNaiDeeService from './paiNaiDeeService';
 *
 * const users = await paiNaiDeeService.getUsers();
 * const newTask = await paiNaiDeeService.createTask({ title: 'My Task', description: 'Details' });
 * =============================================================================
 */

// 1. Define the base URL for the PaiNaiDee backend API.
const API_BASE_URL = 'https://Athipan01-PaiNaiDee-Backend.hf.space/api';

// 2. Create an axios instance with the base URL configured.
// This simplifies API calls as we don't have to type the full URL every time.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Define the structure of a User object for TypeScript type safety.
export interface User {
  id: number;
  name: string;
  email: string;
}

// 4. Define the structure for the data required to create a new Task.
export interface NewTaskData {
  title: string;
  description: string;
  // Add other fields as required by the backend API
}

// 5. Define the structure of a created Task object.
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

/**
 * Fetches a list of users from the backend.
 * @returns {Promise<User[]>} A promise that resolves to an array of user objects.
 * @throws {Error} Throws an error if the API call fails.
 */
const getUsers = async (): Promise<User[]> => {
  // DEPRECATED: Endpoint /users does not exist on the backend.
  console.warn("DEPRECATED: getUsers called, but endpoint does not exist.");
  return Promise.resolve([]);
};

/**
 * Creates a new task by sending data to the backend.
 * @param {NewTaskData} taskData - The data for the new task.
 * @returns {Promise<Task>} A promise that resolves to the newly created task object.
 * @throws {Error} Throws an error if the API call fails.
 */
const createTask = async (taskData: NewTaskData): Promise<Task> => {
  // DEPRECATED: Endpoint /tasks does not exist on the backend.
  console.warn("DEPRECATED: createTask called, but endpoint does not exist.");
  // Return a mock Task object that matches the expected type
  const mockTask: Task = {
    id: 0,
    title: taskData.title,
    description: taskData.description,
    completed: false
  };
  return Promise.resolve(mockTask);
};

// 6. Export the functions as part of a service object.
const paiNaiDeeService = {
  getUsers,
  createTask,
};

export default paiNaiDeeService;
