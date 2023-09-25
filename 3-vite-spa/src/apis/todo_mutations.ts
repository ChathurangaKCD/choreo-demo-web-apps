import { useMutation, useQueryClient } from "react-query";
import {
  TodoRequest,
  TodoResponse,
  createTodoForUser,
  deleteTodoForUser,
  updateTodoForUser,
} from "./todos";
import { useAuthContext } from "@asgardeo/auth-react";

export function useCreateTodo(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const ctx = useAuthContext();
  return useMutation({
    mutationKey: "createTodo",
    mutationFn: async (todoData: TodoRequest) => {
      return createTodoForUser(ctx, todoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("todos");
      onSuccess();
    },
  });
}

export function useUpdateTodo(todoId: number) {
  const queryClient = useQueryClient();
  const ctx = useAuthContext();
  return useMutation({
    mutationKey: "updateTodo",
    mutationFn: async (todoData: TodoRequest) => {
      return updateTodoForUser(ctx, todoId, todoData);
    },
    // https://tanstack.com/query/v4/docs/react/guides/optimistic-updates
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      // Snapshot the previous value
      const previousTodoList = queryClient.getQueryData<TodoResponse[]>([
        "todos",
      ]);
      if (!previousTodoList) return;
      // update the todo list with the new todo without mutating the previous value
      const idx = previousTodoList.findIndex((t) => t.id === todoId);
      if (idx === -1) return;
      const previousTodo = previousTodoList[idx];
      const updatedTodo = { ...previousTodo, ...newTodo };
      const updatedList = previousTodoList.slice();
      updatedList[idx] = updatedTodo;
      // Optimistically update to the new value
      queryClient.setQueryData(["todos"], updatedList);

      // Return a context with the previous and new todo
      return { previousTodoList, updatedList };
    },
    // If the mutation fails, use the context we returned above
    onError: (_, _2, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodoList);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const ctx = useAuthContext();
  return useMutation({
    mutationKey: "deleteTodo",
    mutationFn: async (todoId: number) => {
      return deleteTodoForUser(ctx, todoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("todos");
    },
  });
}
