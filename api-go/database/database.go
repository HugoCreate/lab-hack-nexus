package database

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

var (
	SupabaseURL    string
	SupabaseKey    string
	ServiceRoleKey string
	Client         *http.Client
)

func InitDatabase() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	SupabaseURL = os.Getenv("SUPABASE_URL")
	SupabaseKey = os.Getenv("SUPABASE_KEY")
	ServiceRoleKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if SupabaseURL == "" || SupabaseKey == "" || ServiceRoleKey == "" {
		log.Fatal("Missing Supabase credentials in environment variables")
	}

	Client = &http.Client{}

	log.Println("Database connections initialized successfully")
}

// AuthRequest represents authentication request
type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

// User represents a user from Supabase
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// SignUp creates a new user
func SignUp(email, password string) (*AuthResponse, error) {
	url := fmt.Sprintf("%s/auth/v1/signup", SupabaseURL)

	reqBody := AuthRequest{
		Email:    email,
		Password: password,
	}

	jsonData, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", SupabaseKey)

	resp, err := Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("signup failed: %s", string(body))
	}

	var authResp AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return nil, err
	}

	return &authResp, nil
}

// SignIn authenticates a user
func SignIn(email, password string) (*AuthResponse, error) {
	url := fmt.Sprintf("%s/auth/v1/token?grant_type=password", SupabaseURL)

	reqBody := AuthRequest{
		Email:    email,
		Password: password,
	}

	jsonData, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", SupabaseKey)

	resp, err := Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("signin failed: %s", string(body))
	}

	var authResp AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return nil, err
	}

	return &authResp, nil
}

// GetUser gets user info from token
func GetUser(token string) (*User, error) {
	url := fmt.Sprintf("%s/auth/v1/user", SupabaseURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("apikey", SupabaseKey)

	resp, err := Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user")
	}

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// QueryResult represents a generic query result
type QueryResult struct {
	Data  json.RawMessage `json:"data,omitempty"`
	Error string          `json:"error,omitempty"`
}

// Select performs a SELECT query on a table
func Select(table, columns, filter string, useServiceRole bool) (json.RawMessage, error) {
	url := fmt.Sprintf("%s/rest/v1/%s?select=%s", SupabaseURL, table, columns)
	if filter != "" {
		url += "&" + filter
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	if useServiceRole {
		req.Header.Set("Authorization", "Bearer "+ServiceRoleKey)
	} else {
		req.Header.Set("Authorization", "Bearer "+SupabaseKey)
	}
	req.Header.Set("apikey", SupabaseKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("query failed: %s", string(body))
	}

	return json.RawMessage(body), nil
}

// Insert performs an INSERT query on a table
func Insert(table string, data interface{}, useServiceRole bool) (json.RawMessage, error) {
	url := fmt.Sprintf("%s/rest/v1/%s", SupabaseURL, table)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	if useServiceRole {
		req.Header.Set("Authorization", "Bearer "+ServiceRoleKey)
	} else {
		req.Header.Set("Authorization", "Bearer "+SupabaseKey)
	}
	req.Header.Set("apikey", SupabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("insert failed: %s", string(body))
	}

	return json.RawMessage(body), nil
}

// Update performs an UPDATE query on a table
func Update(table, filter string, data interface{}, useServiceRole bool) (json.RawMessage, error) {
	url := fmt.Sprintf("%s/rest/v1/%s?%s", SupabaseURL, table, filter)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	if useServiceRole {
		req.Header.Set("Authorization", "Bearer "+ServiceRoleKey)
	} else {
		req.Header.Set("Authorization", "Bearer "+SupabaseKey)
	}
	req.Header.Set("apikey", SupabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("update failed: %s", string(body))
	}

	return json.RawMessage(body), nil
}

// Delete performs a DELETE query on a table
func Delete(table, filter string, useServiceRole bool) error {
	url := fmt.Sprintf("%s/rest/v1/%s?%s", SupabaseURL, table, filter)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	if useServiceRole {
		req.Header.Set("Authorization", "Bearer "+ServiceRoleKey)
	} else {
		req.Header.Set("Authorization", "Bearer "+SupabaseKey)
	}
	req.Header.Set("apikey", SupabaseKey)

	resp, err := Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("delete failed: %s", string(body))
	}

	return nil
}
