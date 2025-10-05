package postcounters

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "net/http"
    "strings"
    "time"
)

const apiBaseURL = "https://api.counterapi.dev/v2"

var (
    httpClient  = &http.Client{Timeout: 5 * time.Second}
    ErrNotFound = errors.New("counter api: not found")
)

type counterResponse struct {
    Workspace string `json:"workspace"`
    Name      string `json:"name"`
    Value     int64  `json:"value"`
    UpdatedAt string `json:"updated_at"`
}

func FetchValue(ctx context.Context, workspace, counterName, token string) (int64, error) {
    url := fmt.Sprintf("%s/%s/%s", apiBaseURL, workspace, counterName)
    resp, err := doRequest(ctx, http.MethodGet, url, token, nil)
    if err != nil {
        return 0, err
    }
    defer resp.Body.Close()

    if resp.StatusCode == http.StatusNotFound {
        return 0, ErrNotFound
    }

    if resp.StatusCode >= 400 {
        return 0, fmt.Errorf("counter api: status %d", resp.StatusCode)
    }

    var parsed counterResponse
    if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
        return 0, err
    }

    return parsed.Value, nil
}

func Increment(ctx context.Context, workspace, counterName, token string) (int64, error) {
    url := fmt.Sprintf("%s/%s/%s/up", apiBaseURL, workspace, counterName)
    resp, err := doRequest(ctx, http.MethodGet, url, token, nil)
    if err != nil {
        return 0, err
    }
    defer resp.Body.Close()

    if resp.StatusCode == http.StatusNotFound {
        return 0, ErrNotFound
    }

    if resp.StatusCode >= 400 {
        return 0, fmt.Errorf("counter api: status %d", resp.StatusCode)
    }

    var parsed counterResponse
    if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
        return 0, err
    }

    return parsed.Value, nil
}

func EnsureExists(ctx context.Context, workspace, counterName, token string) error {
    _, err := FetchValue(ctx, workspace, counterName, token)
    if err == nil {
        return nil
    }

    if !errors.Is(err, ErrNotFound) {
        return err
    }

    body := strings.NewReader(`{"value":0}`)
    url := fmt.Sprintf("%s/%s/%s", apiBaseURL, workspace, counterName)
    resp, err := doRequest(ctx, http.MethodPost, url, token, body)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 400 {
        return fmt.Errorf("counter api: create status %d", resp.StatusCode)
    }

    return nil
}

func doRequest(ctx context.Context, method, url, token string, body io.Reader) (*http.Response, error) {
    req, err := http.NewRequestWithContext(ctx, method, url, body)
    if err != nil {
        return nil, err
    }

    if body != nil {
        req.Header.Set("Content-Type", "application/json")
    }

    if token != "" {
        req.Header.Set("Authorization", "Bearer "+token)
    }

    return httpClient.Do(req)
}
