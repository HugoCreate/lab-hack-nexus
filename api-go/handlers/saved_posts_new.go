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

// SavePost saves a post for a user
func SavePost(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	postID := c.Param("id")

	// Check if post exists
	data, err := database.Select("posts", "id", "id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	var posts []models.Post
	if err := json.Unmarshal(data, &posts); err != nil || len(posts) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	// Check if already saved
	savedData, err := database.Select("saved_posts", "*", "user_id=eq."+profile.ID+"&post_id=eq."+postID, false)
	if err == nil {
		var savedPosts []models.SavedPost
		if json.Unmarshal(savedData, &savedPosts) == nil && len(savedPosts) > 0 {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "already_saved",
				Message: "Post is already saved",
			})
			return
		}
	}

	currentTime := time.Now()
	saveData := map[string]interface{}{
		"user_id":    profile.ID,
		"post_id":    postID,
		"created_at": currentTime,
	}

	_, err = database.Insert("saved_posts", saveData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "save_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post saved successfully"})
}

// UnsavePost removes a saved post for a user
func UnsavePost(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	postID := c.Param("id")

	err := database.Delete("saved_posts", "user_id=eq."+profile.ID+"&post_id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "unsave_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post unsaved successfully"})
}

// ListSavedPosts returns all saved posts for the current user
func ListSavedPosts(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	// Note: This is simplified - in a real implementation you'd want to join with posts table
	data, err := database.Select("saved_posts", "*", "user_id=eq."+profile.ID+"&order=created_at.desc", false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: err.Error(),
		})
		return
	}

	var savedPosts []models.SavedPost
	if err := json.Unmarshal(data, &savedPosts); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, savedPosts)
}

// SavePostNew is a new function that calls the existing SavePost
func SavePostNew(c *gin.Context) {
	SavePost(c)
}

// UnsavePostNew is a new function that calls the existing UnsavePost
func UnsavePostNew(c *gin.Context) {
	UnsavePost(c)
}
