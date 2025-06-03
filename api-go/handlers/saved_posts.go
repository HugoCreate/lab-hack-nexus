//go:build ignore
// +build ignore

package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
)

// SavePost saves a post for the authenticated user
func SavePost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	postID := c.Param("id")

	// Check if post exists
	postData, err := database.Select("posts", "id", "id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	var posts []models.Post
	if err := json.Unmarshal(postData, &posts); err != nil || len(posts) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	// Check if already saved
	existingData, err := database.Select("saved_posts", "id", "user_id=eq."+userID.(string)+"&post_id=eq."+postID, false)
	if err == nil {
		var existing []models.SavedPost
		if json.Unmarshal(existingData, &existing) == nil && len(existing) > 0 {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "already_exists",
				Message: "Post already saved",
			})
			return
		}
	}
	currentTime := time.Now()
	savedPost := models.SavedPost{
		UserID:    userID.(string),
		PostID:    postID,
		CreatedAt: &currentTime,
	}

	_, err = database.Insert("saved_posts", savedPost, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to save post",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Post saved successfully"})
}

// UnsavePost removes a saved post for the authenticated user
func UnsavePost(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	postID := c.Param("id")

	err := database.Delete("saved_posts", "user_id=eq."+userID.(string)+"&post_id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Saved post not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post unsaved successfully"})
}

// GetSavedPosts returns the authenticated user's saved posts
func GetSavedPosts(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "unauthorized",
			Message: "Authentication required",
		})
		return
	}

	data, err := database.Select("saved_posts", "*", "user_id=eq."+userID.(string), false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve saved posts",
		})
		return
	}

	var savedPosts []models.SavedPost
	if err := json.Unmarshal(data, &savedPosts); err != nil {
		c.JSON(http.StatusOK, gin.H{"saved_posts": []models.SavedPost{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"saved_posts": savedPosts})
}
