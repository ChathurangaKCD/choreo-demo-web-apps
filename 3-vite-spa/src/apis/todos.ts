import { AuthContextInterface } from "@asgardeo/auth-react";
import axios, { AxiosResponse } from "axios";

const BASE_URL = window.config.todoApiUrl;

type AuthCtx = AuthContextInterface;

export interface TodoResponse {
  id: number;
  userId: string;
  title: string;
  description: string;
  completed?: boolean;
}

export interface TodoRequest {
  title: string;
  description: string;
  completed?: boolean;
}

// List all todos for a user
export const listTodosForUser = async (
  ctx: AuthCtx
): Promise<TodoResponse[]> => {
  const token = await ctx.getAccessToken();
  try {
    const response: AxiosResponse<TodoResponse[]> = await axios.get(
      `${BASE_URL}/todos`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    refreshAccessTokenOn401(ctx, error);
    console.error("Error fetching todos:", error);
    throw error;
  }
};

// Create a new todo for a user
export const createTodoForUser = async (
  ctx: AuthCtx,
  todoData: TodoRequest
): Promise<TodoResponse> => {
  const token = await ctx.getAccessToken();
  try {
    const response: AxiosResponse<TodoResponse> = await axios.post(
      `${BASE_URL}/todos`,
      todoData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    refreshAccessTokenOn401(ctx, error);
    console.error("Error creating todo:", error);
    throw error;
  }
};

// Get a todo by ID for a user
export const getTodoByIdForUser = async (
  ctx: AuthCtx,
  todoId: number
): Promise<TodoResponse> => {
  const token = await ctx.getAccessToken();
  try {
    const response: AxiosResponse<TodoResponse> = await axios.get(
      `${BASE_URL}/todos/${todoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    refreshAccessTokenOn401(ctx, error);
    console.error("Error fetching todo:", error);
    throw error;
  }
};

// Update a todo by ID for a user
export const updateTodoForUser = async (
  ctx: AuthCtx,
  todoId: number,
  updatedTodoData: TodoRequest
): Promise<TodoResponse> => {
  try {
    const token = await ctx.getAccessToken();
    const response: AxiosResponse<TodoResponse> = await axios.put(
      `${BASE_URL}/todos/${todoId}`,
      updatedTodoData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    refreshAccessTokenOn401(ctx, error);
    console.error("Error updating todo:", error);
    throw error;
  }
};

// Delete a todo by ID for a user
export const deleteTodoForUser = async (
  ctx: AuthCtx,
  todoId: number
): Promise<number> => {
  try {
    const token = await ctx.getAccessToken();
    const response: AxiosResponse<void> = await axios.delete(
      `${BASE_URL}/todos/${todoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status;
  } catch (error) {
    refreshAccessTokenOn401(ctx, error);
    console.error("Error deleting todo:", error);
    throw error;
  }
};

function refreshAccessTokenOn401(ctx: AuthCtx, err: unknown) {
  if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
    ctx.refreshAccessToken();
  }
}
