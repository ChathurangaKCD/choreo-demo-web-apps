import { useAuthContext } from "@asgardeo/auth-react";
import { Button, Stack, Typography } from "@mui/material";

export function LoginPage() {
  const { signIn } = useAuthContext();
  return (
    <Stack spacing={2} alignItems="center" sx={{ m: 1 }}>
      <Typography variant="h4" align="center">
        Todo List
      </Typography>
      <Button variant="contained" onClick={() => signIn()}>
        Login
      </Button>
    </Stack>
  );
}
