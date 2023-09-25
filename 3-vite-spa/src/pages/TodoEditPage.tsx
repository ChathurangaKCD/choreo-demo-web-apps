import { useNavigate, useParams } from "react-router";
import { useGetTodoById } from "../apis/todo_queries";
import { TodoResponse } from "../apis/todos";
import { useState } from "react";
import { useUpdateTodo } from "../apis/todo_mutations";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
} from "@mui/material";
import OutletContainer from "../layout/OutletContainer";

export function TodoEditPage() {
  const param = useParams()["id"];
  const todoId = parseInt(param || "", 10);
  const query = useGetTodoById(todoId);
  return (
    <OutletContainer
      title="Edit Item"
      isLoading={query.isLoading}
      breadcrumbs={[
        { label: "Home", link: "/" },
        { label: "To Do List", link: "/todos" },
        { label: query.data?.title || "Edit Item", link: "#" },
      ]}
    >
      {query.isError && <Alert severity="error">Something went wrong</Alert>}
      {query.isSuccess && query.data && <TodoEditForm item={query.data} />}
    </OutletContainer>
  );
}

function TodoEditForm({ item }: { item: TodoResponse }) {
  const navigate = useNavigate();
  const updateMutation = useUpdateTodo(item.id);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  return (
    <Box>
      {updateMutation.isError && (
        <Alert severity="error">Something went wrong</Alert>
      )}
      <Card variant="outlined">
        <CardContent>
          <Box p={3}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  title,
                  description,
                  completed: item.completed,
                });
                navigate("/todos");
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    id="todo-add-title"
                    label="Title"
                    variant="outlined"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    id="todo-add-description"
                    label="Description"
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item flexGrow={1}>
                  <Button
                    disabled={title.length == 0}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
