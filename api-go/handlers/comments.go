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

// ListComments returns all comments for a specific post
func ListComments(c *gin.Context) {
	postID := c.Param("id")

	// Note: Supabase REST API doesn't support nested selects like the Go client
	// We'll need to do separate queries or modify the database structure
	data, err := database.Select("comments", "*", "post_id=eq."+postID+"&order=created_at", false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: err.Error(),
		})
		return
	}

	var comments []models.Comment
	if err := json.Unmarshal(data, &comments); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, comments)
}

// CreateComment creates a new comment on a post
func CreateComment(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	postID := c.Param("id")

	var req models.CommentCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}
	currentTime := time.Now()
	commentData := map[string]interface{}{
		"content":    req.Content,
		"post_id":    postID,
		"user_id":    profile.ID,
		"created_at": currentTime,
		"updated_at": currentTime,
	}

	data, err := database.Insert("comments", commentData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "creation_failed",
			Message: err.Error(),
		})
		return
	}

	var comments []models.Comment
	if err := json.Unmarshal(data, &comments); err != nil || len(comments) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, comments[0])
}

// DeleteComment deletes a comment (only by author or admin)
func DeleteComment(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}
	commentID := c.Param("comment_id")

	// Check if user owns the comment or is admin
	data, err := database.Select("comments", "user_id", "id=eq."+commentID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Comment not found",
		})
		return
	}

	var existingComments []models.Comment
	if err := json.Unmarshal(data, &existingComments); err != nil || len(existingComments) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Comment not found",
		})
		return
	}

	existingComment := existingComments[0]
	if existingComment.UserID != profile.ID && (profile.IsAdmin == nil || !*profile.IsAdmin) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "You can only delete your own comments",
		})
		return
	}
	err = database.Delete("comments", "id=eq."+commentID, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "deletion_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}
