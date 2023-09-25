package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

var todoAPIURL string
var authHeader string

func init() {
	if os.Getenv("TODO_API_URL") != "" {
		todoAPIURL = os.Getenv("TODO_API_URL")
		logrus.WithField("todo_api_url", todoAPIURL).Info("Using TODO_API_URL environment variable")
	} else {
		todoAPIURL = "http://localhost:8080"
		logrus.WithField("todo_api_url", todoAPIURL).Info("Using default TODO_API_URL")
	}
	authHeader = os.Getenv("AUTH_HEADER")
	if authHeader == "" {
		authHeader = "x-jwt-assertion"
		logrus.WithField("auth_header", authHeader).Info("Using default AUTH_HEADER")
	}
	logrus.SetFormatter(&logrus.JSONFormatter{})
}

func extractUserIDFromJWT(tokenString string) (string, error) {
	base64UrlDecode := func(data string) ([]byte, error) {
		// Add padding if necessary
		padding := len(data) % 4
		if padding > 0 {
			data += strings.Repeat("=", 4-padding)
		}

		data = strings.ReplaceAll(data, "-", "+")
		data = strings.ReplaceAll(data, "_", "/")
		return base64.URLEncoding.DecodeString(data)
	}

	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid jwt, failed to parse, found %d parts", len(parts))
	}

	payload, err := base64UrlDecode(parts[1])
	if err != nil {
		fmt.Println("Failed to decode payload:", err)
		return "", fmt.Errorf("invalid jwt, failed to decode payload: %v", err)
	}

	var claims map[string]interface{}
	if err := json.Unmarshal(payload, &claims); err != nil {
		fmt.Println("Failed to unmarshal payload:", err)
		return "", fmt.Errorf("invalid jwt, failed to unmarshal payload: %v", err)
	}
	sub := claims["sub"].(string)
	if sub == "" {
		return "", fmt.Errorf("invalid jwt, `sub` claim not found or not a string: %v", claims["sub"])
	}
	return sub, nil
}

func ProxyHandler(c *fiber.Ctx) error {
	requestId := c.Get("x-request-id", "")
	if requestId == "" {
		id, _ := uuid.NewRandom()
		requestId = id.String()
	}
	logger := logrus.WithField("request_id", requestId)
	logger.WithField("path", c.Path()).WithField("method", c.Method()).Info("Proxying request to Todo API")
	jwt := c.Get(authHeader, "")
	jwt = strings.ReplaceAll(jwt, "Bearer ", "")
	if jwt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing x-jwt-assertion header"})
	}

	userID, err := extractUserIDFromJWT(jwt)
	if err != nil {
		logger.WithField("jwt", jwt).WithError(err).Error("Error extracting user ID from JWT")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid jwt"})
	}

	// Construct the new request URL
	requestURL := todoAPIURL + "/users/" + userID + c.Path()

	// Create a new request
	req, err := http.NewRequest(c.Method(), requestURL, bytes.NewReader(c.Request().Body()))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	req.Header.Set("x-correlation-id", requestId)
	q := req.URL.Query()
	for k, v := range c.Queries() {
		q.Add(k, v)
	}
	req.URL.RawQuery = q.Encode()

	v, _ := httputil.DumpRequest(req, true)
	fmt.Printf("%s\n", v)

	// Make the request to the original Todo API
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	defer resp.Body.Close()

	_, err = io.Copy(c.Response().BodyWriter(), resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	c.Response().Header.SetContentType(resp.Header.Get("Content-Type"))
	return c.SendStatus(resp.StatusCode)
}

func main() {
	app := fiber.New(fiber.Config{
		ReadBufferSize: 16 * 1024,
		Immutable:      true,
	})

	// Setting up proxy routes
	app.Get("/todos", ProxyHandler)
	app.Post("/todos", ProxyHandler)
	app.Get("/todos/:id", ProxyHandler)
	app.Put("/todos/:id", ProxyHandler)
	app.Delete("/todos/:id", ProxyHandler)

	log.Fatal(app.Listen(":4000"))
}
