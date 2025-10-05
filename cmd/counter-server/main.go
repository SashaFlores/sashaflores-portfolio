package main

import (
    "log"
    "net/http"
    "os"
    "strings"

    handler "sashafloresportfolio/api"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/api/counter", handler.Handler)

    addr := os.Getenv("PORT")
    if strings.TrimSpace(addr) == "" {
        addr = ":8080"
    } else if !strings.HasPrefix(addr, ":") {
        addr = ":" + addr
    }

    log.Printf("counter API listening on %s", addr)
    if err := http.ListenAndServe(addr, mux); err != nil {
        log.Fatalf("server terminated: %v", err)
    }
}
