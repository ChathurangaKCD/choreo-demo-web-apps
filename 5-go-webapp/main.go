package main

import (
	"fmt"
	"net/http"
)

func main() {
	// Create a new ServeMux
	mux := http.NewServeMux()

	// Register handlers for specific routes
	registerRoutes(mux)

	// Create a custom handler
	customHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, pattern := mux.Handler(r); pattern == "" {
			// This means no specific pattern matched; handle as catch-all
			fmt.Fprintf(w, generateHTML("Unknown route", r))
		} else {
			// Pass control to the mux for specific routes
			mux.ServeHTTP(w, r)
		}
	})

	fmt.Println("Server starting on port :8080...")
	http.ListenAndServe(":8080", customHandler)
}

func registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/home", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, generateHTML("home", r))
	})
	mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, generateHTML("user list", r))
	})
	mux.HandleFunc("/user/1", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, generateHTML("user 1", r))
	})
	mux.HandleFunc("/user/2", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, generateHTML("user 2", r))
	})
	// Adding a redirect from /users/redirect to /users
	mux.HandleFunc("/users/relative-redirect", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/users", http.StatusMovedPermanently)
	})
	mux.HandleFunc("/users/absolute-redirect", func(w http.ResponseWriter, r *http.Request) {
		// Determine the scheme (http or https)
		scheme := "http"
		if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
			scheme = "https"
		}
		// Construct the absolute URL
		redirectURL := fmt.Sprintf("%s://%s/users", scheme, r.Host)
		http.Redirect(w, r, redirectURL, http.StatusMovedPermanently)
	})
}

func generateHTML(title string, r *http.Request) string {
	return fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<title>%s</title>
	</head>
	<body>
		<h1>host: %s</h1>
		<h1>route: %s</h1>
		<nav>
			<ul>
				<li><a href="/">/</a></li>
				<li><a href="/home">/home</a></li>
				<li><a href="/users">/users</a></li>
				<li><a href="/user/1">/user/1</a></li>
				<li><a href="/user/2">/user/2</a></li>
				<li><a href="/users/relative-redirect">/users/relative-redirect will redirect to /users</a></li>
				<li><a href="/users/absolute-redirect">/users/absolute-redirect will redirect to /users</a></li>
			</ul>
		</nav>
	</body>
	</html>`, title, r.Host, r.RequestURI)
}
