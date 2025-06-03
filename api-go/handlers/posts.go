package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/middleware"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
)

// ListPosts returns a list of posts with optional filtering
func ListPosts(c *gin.Context) {
	category := c.Query("category")
	publishedOnly := c.DefaultQuery("published_only", "true") == "true"
	authorID := c.Query("author_id")
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 50 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Build filter string for Supabase REST API
	var filters []string

	if publishedOnly {
		filters = append(filters, "published=eq.true")
	}

	if category != "" {
		filters = append(filters, "category_id=eq."+category)
	}

	if authorID != "" {
		filters = append(filters, "author_id=eq."+authorID)
	}

	// Add ordering and limit/offset
	filters = append(filters, "order=created_at.desc")
	filters = append(filters, fmt.Sprintf("limit=%d", limit))
	filters = append(filters, fmt.Sprintf("offset=%d", offset))

	filterString := strings.Join(filters, "&")

	data, err := database.Select("posts", "*", filterString, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: err.Error(),
		})
		return
	}

	var posts []models.Post
	if err := json.Unmarshal(data, &posts); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// CreatePost creates a new post
func CreatePost(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	var req models.PostCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	currentTime := time.Now()
	published := false
	if req.Published != nil {
		published = *req.Published
	}

	postData := map[string]interface{}{
		"title":         req.Title,
		"content":       req.Content,
		"slug":          req.Slug,
		"author_id":     profile.ID,
		"category_id":   req.CategoryID,
		"published":     published,
		"thumbnail_url": req.ThumbnailURL,
		"created_at":    currentTime,
		"updated_at":    currentTime,
	}

	data, err := database.Insert("posts", postData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "creation_failed",
			Message: err.Error(),
		})
		return
	}

	var posts []models.Post
	if err := json.Unmarshal(data, &posts); err != nil || len(posts) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, posts[0])
}

// GetPost returns a specific post by ID
func GetPost(c *gin.Context) {
	postID := c.Param("id")

	data, err := database.Select("posts", "*", "id=eq."+postID, false)
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

	c.JSON(http.StatusOK, posts[0])
}

// UpdatePost updates a post
func UpdatePost(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	postID := c.Param("id")

	// Check if user owns the post or is admin
	data, err := database.Select("posts", "author_id", "id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	var existingPosts []models.Post
	if err := json.Unmarshal(data, &existingPosts); err != nil || len(existingPosts) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	existingPost := existingPosts[0]
	if existingPost.AuthorID != profile.ID && (profile.IsAdmin == nil || !*profile.IsAdmin) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "You can only edit your own posts",
		})
		return
	}

	var req models.PostCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	published := false
	if req.Published != nil {
		published = *req.Published
	}

	updateData := map[string]interface{}{
		"title":         req.Title,
		"content":       req.Content,
		"slug":          req.Slug,
		"category_id":   req.CategoryID,
		"published":     published,
		"thumbnail_url": req.ThumbnailURL,
		"updated_at":    time.Now(),
	}

	updatedData, err := database.Update("posts", "id=eq."+postID, updateData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "update_failed",
			Message: err.Error(),
		})
		return
	}

	var updatedPosts []models.Post
	if err := json.Unmarshal(updatedData, &updatedPosts); err != nil || len(updatedPosts) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, updatedPosts[0])
}

// DeletePost deletes a post
func DeletePost(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	postID := c.Param("id")

	// Check if user owns the post or is admin
	data, err := database.Select("posts", "author_id", "id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	var existingPosts []models.Post
	if err := json.Unmarshal(data, &existingPosts); err != nil || len(existingPosts) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Post not found",
		})
		return
	}

	existingPost := existingPosts[0]
	if existingPost.AuthorID != profile.ID && (profile.IsAdmin == nil || !*profile.IsAdmin) {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "You can only delete your own posts",
		})
		return
	}

	err = database.Delete("posts", "id=eq."+postID, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "deletion_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
