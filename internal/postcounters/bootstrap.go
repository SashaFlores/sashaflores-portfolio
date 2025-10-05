package postcounters

import (
    "context"
    "fmt"
)

// EnsureCounters walks the counter map and creates any missing counters in Counter API.
func EnsureCounters(ctx context.Context, workspace, token string) error {
    for slug, pair := range counters {
        if err := EnsureExists(ctx, workspace, pair.Likes, token); err != nil {
            return fmt.Errorf("ensure likes for %s: %w", slug, err)
        }
        if err := EnsureExists(ctx, workspace, pair.Views, token); err != nil {
            return fmt.Errorf("ensure views for %s: %w", slug, err)
        }
    }
    return nil
}
