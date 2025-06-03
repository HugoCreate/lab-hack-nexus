package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT token and gets user profile
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid authorization header format",
			})
			c.Abort()
			return
		}
		token := parts[1]
		// Get user from Supabase Auth
		user, err := database.GetUser(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid authentication credentials",
			})
			c.Abort()
			return
		}

		if user == nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid user data",
			})
			c.Abort()
			return
		}
		// Get user's profile from the profiles table
		profileData, err := database.Select("profiles", "*", fmt.Sprintf("id=eq.%s", user.ID), false)
		if err != nil {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "not_found",
				Message: "Profile not found",
			})
			c.Abort()
			return
		}

		var profiles []models.Profile
		if err := json.Unmarshal(profileData, &profiles); err != nil || len(profiles) == 0 {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "not_found",
				Message: "Profile not found",
			})
			c.Abort()
			return
		}

		profile := profiles[0]
		// Store user info in context
		c.Set("user", user)
		c.Set("profile", &profile)

		c.Next()
	}
}

// GetCurrentUser helper to get user from context
func GetCurrentUser(c *gin.Context) (*models.Profile, bool) {
	if profile, exists := c.Get("profile"); exists {
		if p, ok := profile.(*models.Profile); ok {
			return p, true
		}
	}
	return nil, false
}

// AdminMiddleware ensures the user is an admin
func AdminMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		profile, exists := GetCurrentUser(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Authentication required",
			})
			c.Abort()
			return
		}

		if profile.IsAdmin == nil || !*profile.IsAdmin {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error:   "forbidden",
				Message: "Admin access required",
			})
			c.Abort()
			return
		}

		c.Next()
	})
}
