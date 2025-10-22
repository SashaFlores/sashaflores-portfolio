package handlers

import (
    "encoding/json"
    "errors"
    "net/http"
    "os"
    "strings"

    "sashafloresportfolio/internal/postcounters"
)

type apiResponse struct {
    Slug  string `json:"slug"`
    Likes int64  `json:"likes"`
    Views int64  `json:"views"`
}

type mutationRequest struct {
    Slug   string `json:"slug"`
    Metric string `json:"metric"`
    Action string `json:"action"`
}

// Counter exposes the HTTP handler used by the Vercel function and the local server.
func Counter(w http.ResponseWriter, r *http.Request) {
    workspace := strings.TrimSpace(os.Getenv("WORKSPACE"))
    token := strings.TrimSpace(os.Getenv("COUNTER_API_TOKEN"))

    if workspace == "" {
        writeError(w, http.StatusInternalServerError, "counter workspace not configured")
        return
    }

    w.Header().Set("Content-Type", "application/json")

    switch r.Method {
    case http.MethodGet:
        handleGetCounts(w, r, workspace, token)
    case http.MethodPost:
        handleMutateCount(w, r, workspace, token)
    default:
        w.WriteHeader(http.StatusMethodNotAllowed)
        _, _ = w.Write([]byte(`{"error":"method not allowed"}`))
    }
}

func handleGetCounts(w http.ResponseWriter, r *http.Request, workspace, token string) {
    slug := strings.TrimSpace(r.URL.Query().Get("slug"))
    if slug == "" {
        writeError(w, http.StatusBadRequest, "missing slug")
        return
    }

    pair, ok := postcounters.Lookup(slug)
    if !ok {
        writeError(w, http.StatusNotFound, "unknown slug")
        return
    }

    likes, err := postcounters.FetchValue(r.Context(), workspace, pair.Likes, token)
    if err != nil {
        respondWithCounterError(w, err)
        return
    }

    views, err := postcounters.FetchValue(r.Context(), workspace, pair.Views, token)
    if err != nil {
        respondWithCounterError(w, err)
        return
    }

    writeJSON(w, apiResponse{Slug: slug, Likes: likes, Views: views})
}

func handleMutateCount(w http.ResponseWriter, r *http.Request, workspace, token string) {
    defer r.Body.Close()

    var payload mutationRequest
    decoder := json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields()
    if err := decoder.Decode(&payload); err != nil {
        writeError(w, http.StatusBadRequest, "invalid payload")
        return
    }

    payload.Slug = strings.TrimSpace(payload.Slug)
    payload.Metric = strings.TrimSpace(strings.ToLower(payload.Metric))
    if payload.Action == "" {
        payload.Action = "up"
    }

    if payload.Slug == "" || payload.Metric == "" {
        writeError(w, http.StatusBadRequest, "missing slug or metric")
        return
    }

    pair, ok := postcounters.Lookup(payload.Slug)
    if !ok {
        writeError(w, http.StatusNotFound, "unknown slug")
        return
    }

    var counterName string
    switch payload.Metric {
    case "likes":
        counterName = pair.Likes
    case "views":
        counterName = pair.Views
    default:
        writeError(w, http.StatusBadRequest, "unsupported metric")
        return
    }

    if payload.Action != "up" {
        writeError(w, http.StatusBadRequest, "unsupported action")
        return
    }

    if _, err := postcounters.Increment(r.Context(), workspace, counterName, token); err != nil {
        respondWithCounterError(w, err)
        return
    }

    likes, err := postcounters.FetchValue(r.Context(), workspace, pair.Likes, token)
    if err != nil {
        respondWithCounterError(w, err)
        return
    }

    views, err := postcounters.FetchValue(r.Context(), workspace, pair.Views, token)
    if err != nil {
        respondWithCounterError(w, err)
        return
    }

    writeJSON(w, apiResponse{Slug: payload.Slug, Likes: likes, Views: views})
}

func respondWithCounterError(w http.ResponseWriter, err error) {
    if errors.Is(err, postcounters.ErrNotFound) {
        writeError(w, http.StatusNotFound, err.Error())
        return
    }

    writeError(w, http.StatusBadGateway, err.Error())
}

func writeJSON(w http.ResponseWriter, payload apiResponse) {
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}
