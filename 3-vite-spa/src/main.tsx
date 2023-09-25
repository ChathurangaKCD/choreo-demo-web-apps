import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@asgardeo/auth-react";
import { QueryClient, QueryClientProvider } from "react-query";
import { PageLoaderProvider } from "./components/PageLoader.tsx";

declare global {
  interface Window {
    config: {
      todoApiUrl: string;
      auth: {
        signInRedirectURL: string;
        signOutRedirectURL: string;
        clientID: string;
        baseUrl: string;
      };
    };
  }
}

const authConfig = {
  signInRedirectURL: window.config.auth.signInRedirectURL,
  signOutRedirectURL: window.config.auth.signOutRedirectURL,
  clientID: window.config.auth.clientID,
  baseUrl: window.config.auth.baseUrl,
  scope: ["openid", "profile", "email"],
};

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PageLoaderProvider>
      <AuthProvider config={authConfig}>
        <QueryClientProvider client={client}>
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </PageLoaderProvider>
  </React.StrictMode>
);
