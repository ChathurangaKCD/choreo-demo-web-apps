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
	mux.HandleFunc("/upload", handleUpload)
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	r.ParseMultipartForm(100 << 20) // Set max upload size to 50MB
	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fmt.Printf("Uploaded file size: %d bytes\n", handler.Size)
	fmt.Fprintf(w, "File %s uploaded successfully. Size: %d bytes", handler.Filename, handler.Size)
}

func generateHTML(title string, r *http.Request) string {
	return fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<title>%s</title>
	</head>
	<body>
		<h1>Host: %s</h1>
		<h1>X-Forwarded-Host: %s</h1>
		<h1>X-Forwarded-Proto: %s</h1>
		<h1>Route: %s</h1>
		<nav>
			<ul>
				<li><a href="/">/</a></li>
				<li><a href="/home">/home</a></li>
				<li><a href="/users">/users</a></li>
				<li><a href="/user/1">/user/1</a></li>
				<li><a href="/user/2">/user/2</a></li>
			</ul>
		</nav>
		<h2>Upload a File</h2>
		<form action="/upload" method="post" enctype="multipart/form-data">
			<input type="file" name="file" />
			<br>
			<input type="submit" value="Upload File (Max: 50MB)" />
		</form>
	</body>
	</html>`,
		title,
		r.Host,
		r.Header.Get("X-Forwarded-Host"),
		r.Header.Get("X-Forwarded-Proto"),
		r.RequestURI,
	)
}
