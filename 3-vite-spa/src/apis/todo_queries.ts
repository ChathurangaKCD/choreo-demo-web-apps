import { useAuthContext } from "@asgardeo/auth-react";
import { useQuery } from "react-query";
import { getTodoByIdForUser, listTodosForUser } from "./todos";
import axios from "axios";

export function useGetTodos() {
  const ctx = useAuthContext();
  return useQuery({
    queryKey: "todos",
    queryFn: async () => {
      return listTodosForUser(ctx);
    },
    refetchOnMount: true,
    staleTime: 1000 * 20,
    cacheTime: 0,
  });
}

export function useGetTodoById(todoId: number) {
  const ctx = useAuthContext();
  return useQuery({
    queryKey: ["todos", todoId],
    queryFn: async () => {
      return getTodoByIdForUser(ctx, todoId);
    },
    cacheTime: 0,
    retry(failureCount, error) {
      if (!axios.isAxiosError(error) || !error.response) return true;
      if (error.response.status === 404) return false;
      else if (failureCount < 2) return true;
      else return false;
    },
  });
}
