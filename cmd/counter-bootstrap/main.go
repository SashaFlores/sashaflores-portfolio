package main

import (
    "context"
    "log"
    "os"
    "strings"
    "time"

    "sashafloresportfolio/internal/postcounters"
)

func main() {
    workspace := os.Getenv("WORKSPACE")
    if strings.TrimSpace(workspace) == "" {
        log.Fatal("WORKSPACE environment variable is required")
    }

    token := os.Getenv("COUNTER_API_TOKEN")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := postcounters.EnsureCounters(ctx, workspace, token); err != nil {
        log.Fatalf("failed to ensure counters: %v", err)
    }

    log.Println("All counters verified")
}
