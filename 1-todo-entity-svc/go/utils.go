package swagger

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"
)

func logRequest(r *http.Request, name string, body interface{}) {
	logrus.WithFields(logrus.Fields{
		"method":         r.Method,
		"uri":            r.RequestURI,
		"name":           name,
		"body":           body,
		"query":          r.URL.Query(),
		"correlation-id": r.Header.Get("X-Correlation-ID"),
	}).Info("New request")
}

func logResponse(r *http.Request, name string, responseBody interface{}, status int) {
	logrus.WithFields(logrus.Fields{
		"method":         r.Method,
		"uri":            r.RequestURI,
		"name":           name,
		"body":           responseBody,
		"status":         status,
		"correlation-id": r.Header.Get("X-Correlation-ID"),
	}).Info("Response")
}

func writeJSONResponse(name string, r *http.Request, w http.ResponseWriter, data interface{}, status int) {
	logResponse(r, name, data, http.StatusOK)
	response, _ := json.Marshal(data)
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(status)
	_, _ = w.Write(response)
}

func writeErrorResponse(name string, r *http.Request, w http.ResponseWriter, status int, message string) {
	logResponse(r, name, message, status)
	respBody := map[string]string{"error": message}
	response, _ := json.Marshal(respBody)
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(status)
	_, _ = w.Write(response)
}

func makeSampleTodos(userId string) []TodoResponse {
	items := []TodoResponse{}
	items = append(items, TodoResponse{
		Id:          1,
		UserId:      userId,
		Title:       "Buy milk",
		Description: "Buy 2 gallons of milk from the market",
	})
	items = append(items, TodoResponse{
		Id:          2,
		UserId:      userId,
		Title:       "Buy eggs",
		Description: "Buy 2 dozens of eggs from the market",
	})
	items = append(items, TodoResponse{
		Id:          3,
		UserId:      userId,
		Title:       "Buy bread",
		Description: "Buy 2 loaves of bread from the market",
	})
	return items
}
