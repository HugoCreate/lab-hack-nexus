package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
)

// Register creates a new user account
func Register(c *gin.Context) {
	var req models.UserCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	// Register with Supabase Auth
	authResponse, err := database.SignUp(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "registration_failed",
			Message: err.Error(),
		})
		return
	}

	if authResponse == nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "registration_failed",
			Message: "User creation failed",
		})
		return
	}

	// Create profile
	username := req.Email
	if req.Username != nil {
		username = *req.Username
	} else {
		// Extract username from email
		if atIndex := strings.Index(req.Email, "@"); atIndex > 0 {
			username = req.Email[:atIndex]
		}
	}

	currentTime := time.Now()
	isAdmin := false
	profileData := map[string]interface{}{
		"id":         authResponse.User.ID,
		"username":   username,
		"avatar_url": nil,
		"bio":        nil,
		"is_admin":   isAdmin,
		"created_at": currentTime,
		"updated_at": currentTime,
	}

	// Use service role to bypass RLS when creating profile
	profileResult, err := database.Insert("profiles", profileData, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "profile_creation_failed",
			Message: err.Error(),
		})
		return
	}

	var profiles []models.Profile
	if err := json.Unmarshal(profileResult, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "profile_creation_failed",
			Message: "Failed to parse profile data",
		})
		return
	}

	user := models.User{
		ID:    authResponse.User.ID,
		Email: authResponse.User.Email,
	}

	c.JSON(http.StatusCreated, models.RegisterResponse{
		Message: "User registered successfully",
		User:    user,
		Profile: profiles[0],
	})
}

// Login authenticates a user
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	authResponse, err := database.SignIn(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "authentication_failed",
			Message: err.Error(),
		})
		return
	}

	if authResponse == nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "authentication_failed",
			Message: "Invalid credentials",
		})
		return
	}

	user := models.User{
		ID:    authResponse.User.ID,
		Email: authResponse.User.Email,
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		AccessToken: authResponse.AccessToken,
		User:        user,
	})
}
