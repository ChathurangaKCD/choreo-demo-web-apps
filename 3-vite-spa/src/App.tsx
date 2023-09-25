import { Suspense } from "react";
import "./App.css";
import { useAuthContext } from "@asgardeo/auth-react";
import { PageLoader } from "./components/PageLoader";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { TodoEditPage } from "./pages/TodoEditPage";
import { TodoListPage } from "./pages/TodoListPage";
import { Home } from "./pages/Home";
import Layout from "./layout/Layout";

function App() {
  const { state } = useAuthContext();
  console.log(state);
  if (state.isLoading) {
    return <PageLoader />;
  }
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        {state.isAuthenticated ? (
          <Routes>
            <Route path="/signin" element={<Navigate to="/" />} />
            <Route path="/" element={<Layout />}>
              <Route path="/todos/:id" element={<TodoEditPage />} />
              <Route path="/todos" element={<TodoListPage />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<h1>Not Found</h1>} />
            </Route>
          </Routes>
        ) : (
          <Routes>
            <Route path="/signin" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        )}
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
