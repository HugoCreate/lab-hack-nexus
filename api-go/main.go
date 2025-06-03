package main

import (
	"log"
	"net/http"
	"os"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/handlers"
	"lab-hack-nexus-api/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.InitDatabase()

	// Create Gin router
	r := gin.Default()

	// CORS middleware
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowCredentials = true
	config.AllowHeaders = []string{"*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	r.Use(cors.New(config))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "Lab Hack Nexus API",
		})
	})

	// Auth routes (public)
	auth := r.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}
	// Posts routes
	posts := r.Group("/posts")
	{
		posts.GET("", handlers.ListPosts)                                      // Public
		posts.GET("/:id", handlers.GetPost)                                    // Public
		posts.POST("", middleware.AuthMiddleware(), handlers.CreatePost)       // Protected
		posts.PUT("/:id", middleware.AuthMiddleware(), handlers.UpdatePost)    // Protected
		posts.DELETE("/:id", middleware.AuthMiddleware(), handlers.DeletePost) // Protected

		// Comments on posts
		posts.GET("/:id/comments", handlers.ListComments)                                              // Public
		posts.POST("/:id/comments", middleware.AuthMiddleware(), handlers.CreateComment)               // Protected
		posts.DELETE("/:id/comments/:comment_id", middleware.AuthMiddleware(), handlers.DeleteComment) // Protected

		// Save/Unsave posts
		posts.POST("/:id/save", middleware.AuthMiddleware(), handlers.SavePost)       // Protected
		posts.DELETE("/:id/unsave", middleware.AuthMiddleware(), handlers.UnsavePost) // Protected
	}

	// Categories routes
	categories := r.Group("/categories")
	{
		categories.GET("", handlers.ListCategories)                                                                   // Public
		categories.GET("/:id", handlers.GetCategory)                                                                  // Public
		categories.POST("", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.CreateCategory)       // Admin only
		categories.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.UpdateCategory)    // Admin only
		categories.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.DeleteCategory) // Admin only
	}

	// Profiles routes
	profiles := r.Group("/profiles")
	{
		profiles.GET("/me", middleware.AuthMiddleware(), handlers.GetCurrentProfile) // Protected
		profiles.GET("/:id", handlers.GetProfile)                                    // Public
		profiles.PUT("/:id", middleware.AuthMiddleware(), handlers.UpdateProfile)    // Protected (own profile only)
	}
	// Saved posts routes
	r.GET("/saved-posts", middleware.AuthMiddleware(), handlers.ListSavedPosts) // Protected

	// Website content routes
	content := r.Group("/website-content")
	{
		content.GET("/:page_name", handlers.GetWebsiteContent)                                                                  // Public
		content.POST("", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.CreateWebsiteContent)              // Admin only
		content.PUT("/:page_name", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.UpdateWebsiteContent)    // Admin only
		content.DELETE("/:page_name", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.DeleteWebsiteContent) // Admin only
	}
	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}
	port = ":" + port

	log.Printf("Server starting on port %s", port)
	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
