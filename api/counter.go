package main

import (
    "net/http"

    "sashafloresportfolio/internal/handlers"
)

// Handler is the entry point used by Vercel's Go runtime.
func Handler(w http.ResponseWriter, r *http.Request) {
    handlers.Counter(w, r)
}
