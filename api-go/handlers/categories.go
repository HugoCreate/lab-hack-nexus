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

// ListCategories returns all categories
func ListCategories(c *gin.Context) {
	data, err := database.Select("categories", "*", "order=name.asc", false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: err.Error(),
		})
		return
	}

	var categories []models.Category
	if err := json.Unmarshal(data, &categories); err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// CreateCategory creates a new category (admin only)
func CreateCategory(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	// Check if user is admin
	if profile.IsAdmin == nil || !*profile.IsAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "Only admins can create categories",
		})
		return
	}

	var req models.CategoryCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}
	currentTime := time.Now()
	categoryData := map[string]interface{}{
		"name":        req.Name,
		"slug":        req.Slug,
		"description": req.Description,
		"created_at":  currentTime,
		"updated_at":  currentTime,
	}

	data, err := database.Insert("categories", categoryData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "creation_failed",
			Message: err.Error(),
		})
		return
	}

	var categories []models.Category
	if err := json.Unmarshal(data, &categories); err != nil || len(categories) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, categories[0])
}

// GetCategory returns a specific category by ID
func GetCategory(c *gin.Context) {
	categoryID := c.Param("id")

	data, err := database.Select("categories", "*", "id=eq."+categoryID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Category not found",
		})
		return
	}

	var categories []models.Category
	if err := json.Unmarshal(data, &categories); err != nil || len(categories) == 0 {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "not_found",
			Message: "Category not found",
		})
		return
	}

	c.JSON(http.StatusOK, categories[0])
}

// UpdateCategory updates a category (admin only)
func UpdateCategory(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	// Check if user is admin
	if profile.IsAdmin == nil || !*profile.IsAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "Only admins can update categories",
		})
		return
	}

	categoryID := c.Param("id")

	var req models.CategoryCreate // Reusing the same struct for simplicity
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}
	updateData := map[string]interface{}{
		"name":        req.Name,
		"slug":        req.Slug,
		"description": req.Description,
		"updated_at":  time.Now(),
	}

	data, err := database.Update("categories", "id=eq."+categoryID, updateData, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "update_failed",
			Message: err.Error(),
		})
		return
	}

	var categories []models.Category
	if err := json.Unmarshal(data, &categories); err != nil || len(categories) == 0 {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "parse_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, categories[0])
}

// DeleteCategory deletes a category (admin only)
func DeleteCategory(c *gin.Context) {
	profile, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "unauthorized",
		})
		return
	}

	// Check if user is admin
	if profile.IsAdmin == nil || !*profile.IsAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{
			Error:   "forbidden",
			Message: "Only admins can delete categories",
		})
		return
	}
	categoryID := c.Param("id")

	err := database.Delete("categories", "id=eq."+categoryID, false)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "deletion_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}
