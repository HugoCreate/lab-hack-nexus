package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
)

// GetWebsiteContent returns content for a specific page
func GetWebsiteContent(c *gin.Context) {
	pageName := c.Param("page_name")

	data, err := database.Select("website_content", "*", "page_name=eq."+pageName, true)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Content not found",
		})
		return
	}

	var content []models.WebsiteContent
	if err := json.Unmarshal(data, &content); err != nil || len(content) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Content not found",
		})
		return
	}

	c.JSON(http.StatusOK, content[0])
}

// CreateWebsiteContent creates website content (admin only)
func CreateWebsiteContent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	// Get user profile to check admin status
	userData, err := database.Select("profiles", "*", "id=eq."+userID.(string), true)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found",
		})
		return
	}

	var profiles []models.Profile
	if err := json.Unmarshal(userData, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User profile not found",
		})
		return
	}

	profile := profiles[0]
	if profile.IsAdmin == nil || !*profile.IsAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "Only admins can create website content",
		})
		return
	}

	var content models.WebsiteContent
	if err := c.ShouldBindJSON(&content); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
		})
		return
	}

	currentTime := time.Now()
	content.CreatedAt = &currentTime
	content.UpdatedAt = &currentTime

	_, err = database.Insert("website_content", content, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to create content",
		})
		return
	}

	c.JSON(http.StatusCreated, content)
}

// UpdateWebsiteContent updates website content (admin only)
func UpdateWebsiteContent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	// Get user profile to check admin status
	userData, err := database.Select("profiles", "*", "id=eq."+userID.(string), true)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found",
		})
		return
	}

	var profiles []models.Profile
	if err := json.Unmarshal(userData, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User profile not found",
		})
		return
	}

	profile := profiles[0]
	if profile.IsAdmin == nil || !*profile.IsAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "Only admins can update website content",
		})
		return
	}

	pageName := c.Param("page_name")
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: err.Error(),
		})
		return
	}

	updates["updated_at"] = time.Now()

	_, err = database.Update("website_content", "page_name=eq."+pageName, updates, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to update content",
		})
		return
	}

	// Fetch updated content
	data, err := database.Select("website_content", "*", "page_name=eq."+pageName, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve updated content",
		})
		return
	}

	var content []models.WebsiteContent
	if err := json.Unmarshal(data, &content); err != nil || len(content) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to parse updated content",
		})
		return
	}

	c.JSON(http.StatusOK, content[0])
}

// DeleteWebsiteContent deletes website content (admin only)
func DeleteWebsiteContent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	// Get user profile to check admin status
	userData, err := database.Select("profiles", "*", "id=eq."+userID.(string), true)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not found",
		})
		return
	}

	var profiles []models.Profile
	if err := json.Unmarshal(userData, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "User profile not found",
		})
		return
	}

	profile := profiles[0]
	if profile.IsAdmin == nil || !*profile.IsAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "Only admins can delete website content",
		})
		return
	}

	pageName := c.Param("page_name")
	err = database.Delete("website_content", "page_name=eq."+pageName, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Content not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Content deleted successfully"})
}
