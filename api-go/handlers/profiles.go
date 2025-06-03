package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/middleware"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
)

// GetProfile returns a user's profile
func GetProfile(c *gin.Context) {
	userID := c.Param("id")

	data, err := database.Select("profiles", "*", "id=eq."+userID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Profile not found",
		})
		return
	}

	var profiles []models.Profile
	if err := json.Unmarshal(data, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, profiles[0])
}

// UpdateProfile updates a user's profile
func UpdateProfile(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	userID := c.Param("id")

	// Check if user is updating their own profile or is admin
	if profile.ID != userID && (profile.IsAdmin == nil || !*profile.IsAdmin) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "You can only update your own profile",
		})
		return
	}

	var req models.ProfileUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	updateData := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if req.Username != nil {
		updateData["username"] = *req.Username
	}
	if req.Bio != nil {
		updateData["bio"] = *req.Bio
	}
	if req.AvatarURL != nil {
		updateData["avatar_url"] = *req.AvatarURL
	}

	data, err := database.Update("profiles", "id=eq."+userID, updateData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "update_failed",
			Message: err.Error(),
		})
		return
	}

	var updatedProfiles []models.Profile
	if err := json.Unmarshal(data, &updatedProfiles); err != nil || len(updatedProfiles) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedProfiles[0])
}

// GetCurrentProfile returns the authenticated user's profile
func GetCurrentProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	data, err := database.Select("profiles", "*", "id=eq."+userID.(string), false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Profile not found",
		})
		return
	}

	var profiles []models.Profile
	if err := json.Unmarshal(data, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, profiles[0])
}
