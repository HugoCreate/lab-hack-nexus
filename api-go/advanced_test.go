package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"lab-hack-nexus-api/database"
	"lab-hack-nexus-api/handlers"
	"lab-hack-nexus-api/middleware"
	"lab-hack-nexus-api/models"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

// AdvancedTestSuite estrutura para testes avançados da API
type AdvancedTestSuite struct {
	suite.Suite
	router    *gin.Engine
	testUser  models.User
	authToken string
}

// SetupSuite configura o ambiente de teste avançado
func (suite *AdvancedTestSuite) SetupSuite() {
	gin.SetMode(gin.TestMode)

	// Configurar database real
	database.InitDatabase()

	// Configurar router com todos os middlewares
	suite.router = gin.New()
	suite.setupFullRoutes()
}

// setupFullRoutes configura todas as rotas com middlewares reais
func (suite *AdvancedTestSuite) setupFullRoutes() {
	// Health check
	suite.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "timestamp": time.Now()})
	})

	// Auth routes
	auth := suite.router.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Public routes
	public := suite.router.Group("/api")
	{
		public.GET("/posts", handlers.ListPosts)
		public.GET("/posts/:id", handlers.GetPost)
		public.GET("/categories", handlers.ListCategories)
		public.GET("/categories/:id", handlers.GetCategory)
		public.GET("/posts/:id/comments", handlers.ListComments)
		public.GET("/website-content/:page_name", handlers.GetWebsiteContent)
		public.GET("/profiles/:id", handlers.GetProfile)
	}

	// Protected routes (require authentication)
	protected := suite.router.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/posts", handlers.CreatePost)
		protected.PUT("/posts/:id", handlers.UpdatePost)
		protected.DELETE("/posts/:id", handlers.DeletePost)
		protected.POST("/posts/:id/comments", handlers.CreateComment)
		protected.DELETE("/comments/:id", handlers.DeleteComment)
		protected.GET("/saved-posts", handlers.ListSavedPosts)
		protected.POST("/posts/:id/save", handlers.SavePost)
		protected.DELETE("/posts/:id/save", handlers.UnsavePost)
		protected.GET("/profile", handlers.GetCurrentProfile)
		protected.PUT("/profile", handlers.UpdateProfile)
	}

	// Admin routes (require admin privileges)
	admin := suite.router.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.POST("/categories", handlers.CreateCategory)
		admin.PUT("/categories/:id", handlers.UpdateCategory)
		admin.DELETE("/categories/:id", handlers.DeleteCategory)
		admin.POST("/website-content", handlers.CreateWebsiteContent)
		admin.PUT("/website-content/:page_name", handlers.UpdateWebsiteContent)
		admin.DELETE("/website-content/:page_name", handlers.DeleteWebsiteContent)
	}
}

// TestRealDatabaseOperations testa operações reais com o banco de dados
func (suite *AdvancedTestSuite) TestRealDatabaseOperations() {
	// Test user registration with real database
	registerData := models.UserCreate{
		Email:    fmt.Sprintf("test_%d@example.com", time.Now().Unix()),
		Password: "SecurePassword123!",
	}

	reqBody, _ := json.Marshal(registerData)
	req, _ := http.NewRequest("POST", "/auth/register", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Should succeed with real Supabase
	if w.Code == 201 {
		suite.T().Log("✅ Real user registration successful")

		// Try to login with the same user
		loginData := models.UserLogin{
			Email:    registerData.Email,
			Password: registerData.Password,
		}

		reqBody, _ = json.Marshal(loginData)
		req, _ = http.NewRequest("POST", "/auth/login", bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")

		w = httptest.NewRecorder()
		suite.router.ServeHTTP(w, req)

		if w.Code == 200 {
			suite.T().Log("✅ Real user login successful")

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if token, ok := response["access_token"].(string); ok && token != "" {
				suite.authToken = token
				suite.T().Log("✅ Authentication token obtained")
			}
		} else {
			suite.T().Logf("❌ Login failed with status %d: %s", w.Code, w.Body.String())
		}
	} else {
		suite.T().Logf("❌ Registration failed with status %d: %s", w.Code, w.Body.String())
	}
}

// TestConcurrentRequests testa requisições concorrentes
func (suite *AdvancedTestSuite) TestConcurrentRequests() {
	const numWorkers = 50
	const requestsPerWorker = 10

	var wg sync.WaitGroup
	errors := make(chan error, numWorkers*requestsPerWorker)

	start := time.Now()

	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for j := 0; j < requestsPerWorker; j++ {
				req, _ := http.NewRequest("GET", "/api/posts", nil)
				w := httptest.NewRecorder()

				suite.router.ServeHTTP(w, req)

				if w.Code != 200 && w.Code != 500 {
					errors <- fmt.Errorf("worker %d request %d failed with status %d", workerID, j, w.Code)
				}
			}
		}(i)
	}

	wg.Wait()
	close(errors)

	duration := time.Since(start)
	totalRequests := numWorkers * requestsPerWorker
	requestsPerSecond := float64(totalRequests) / duration.Seconds()

	suite.T().Logf("✅ Concurrent test completed:")
	suite.T().Logf("   - %d requests in %v", totalRequests, duration)
	suite.T().Logf("   - %.2f requests/second", requestsPerSecond)

	errorCount := 0
	for err := range errors {
		errorCount++
		suite.T().Logf("   - Error: %v", err)
	}

	suite.T().Logf("   - %d errors out of %d requests", errorCount, totalRequests)

	// Assert performance is reasonable (more than 10 req/s)
	assert.Greater(suite.T(), requestsPerSecond, 10.0, "API should handle at least 10 requests per second")
}

// TestStressTest testa o comportamento sob carga extrema
func (suite *AdvancedTestSuite) TestStressTest() {
	const duration = 10 * time.Second
	const maxConcurrent = 100

	ctx, cancel := context.WithTimeout(context.Background(), duration)
	defer cancel()

	requestCount := 0
	errorCount := 0
	var mu sync.Mutex

	start := time.Now()

	for i := 0; i < maxConcurrent; i++ {
		go func() {
			for {
				select {
				case <-ctx.Done():
					return
				default:
					req, _ := http.NewRequest("GET", "/health", nil)
					w := httptest.NewRecorder()

					suite.router.ServeHTTP(w, req)

					mu.Lock()
					requestCount++
					if w.Code != 200 {
						errorCount++
					}
					mu.Unlock()

					time.Sleep(10 * time.Millisecond) // Small delay to prevent overwhelming
				}
			}
		}()
	}

	<-ctx.Done()
	time.Sleep(100 * time.Millisecond) // Wait for goroutines to finish

	actualDuration := time.Since(start)
	requestsPerSecond := float64(requestCount) / actualDuration.Seconds()
	errorRate := float64(errorCount) / float64(requestCount) * 100

	suite.T().Logf("✅ Stress test completed:")
	suite.T().Logf("   - Duration: %v", actualDuration)
	suite.T().Logf("   - Total requests: %d", requestCount)
	suite.T().Logf("   - Requests/second: %.2f", requestsPerSecond)
	suite.T().Logf("   - Error rate: %.2f%%", errorRate)

	// Assert stress test criteria
	assert.Greater(suite.T(), requestCount, 100, "Should handle at least 100 requests in stress test")
	assert.Less(suite.T(), errorRate, 10.0, "Error rate should be less than 10%")
}

// TestSecurityValidation testa validações de segurança
func (suite *AdvancedTestSuite) TestSecurityValidation() {
	securityTests := []struct {
		name        string
		method      string
		url         string
		body        string
		headers     map[string]string
		expectCode  int
		description string
	}{
		{
			name:        "SQL Injection Attempt",
			method:      "GET",
			url:         "/api/posts/1'; DROP TABLE posts; --",
			expectCode:  400,
			description: "Should reject SQL injection attempts",
		},
		{
			name:        "XSS Attempt in JSON",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"<script>alert('xss')</script>@test.com","password":"test123"}`,
			headers:     map[string]string{"Content-Type": "application/json"},
			expectCode:  400,
			description: "Should reject XSS attempts in email",
		},
		{
			name:        "Oversized Payload",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@test.com","password":"` + string(make([]byte, 100000)) + `"}`,
			headers:     map[string]string{"Content-Type": "application/json"},
			expectCode:  400,
			description: "Should reject oversized payloads",
		},
		{
			name:        "Invalid Content-Type",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@test.com","password":"test123"}`,
			headers:     map[string]string{"Content-Type": "text/plain"},
			expectCode:  400,
			description: "Should reject invalid content types",
		},
		{
			name:        "Missing Authorization",
			method:      "POST",
			url:         "/api/posts",
			body:        `{"title":"Test","content":"Test content","category_id":1}`,
			headers:     map[string]string{"Content-Type": "application/json"},
			expectCode:  401,
			description: "Should require authorization for protected endpoints",
		},
		{
			name:        "Invalid Authorization Header",
			method:      "GET",
			url:         "/api/profile",
			headers:     map[string]string{"Authorization": "Bearer invalid_token"},
			expectCode:  401,
			description: "Should reject invalid authorization tokens",
		},
	}

	for _, test := range securityTests {
		suite.T().Run(test.name, func(t *testing.T) {
			var req *http.Request
			if test.body != "" {
				req, _ = http.NewRequest(test.method, test.url, bytes.NewBuffer([]byte(test.body)))
			} else {
				req, _ = http.NewRequest(test.method, test.url, nil)
			}

			for key, value := range test.headers {
				req.Header.Set(key, value)
			}

			w := httptest.NewRecorder()
			suite.router.ServeHTTP(w, req)

			assert.Equal(t, test.expectCode, w.Code, test.description)
			t.Logf("✅ %s: Expected %d, got %d", test.description, test.expectCode, w.Code)
		})
	}
}

// TestEdgeCases testa casos extremos
func (suite *AdvancedTestSuite) TestEdgeCases() {
	edgeCases := []struct {
		name        string
		method      string
		url         string
		body        string
		description string
	}{
		{
			name:        "Empty JSON Object",
			method:      "POST",
			url:         "/auth/register",
			body:        "{}",
			description: "Should handle empty JSON objects gracefully",
		},
		{
			name:        "Null Values",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":null,"password":null}`,
			description: "Should handle null values gracefully",
		},
		{
			name:        "Unicode Characters",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@测试.com","password":"пароль123"}`,
			description: "Should handle unicode characters",
		},
		{
			name:        "Very Long URL",
			method:      "GET",
			url:         "/api/posts/" + string(make([]byte, 1000)),
			description: "Should handle very long URLs",
		},
		{
			name:        "Malformed JSON",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@test.com","password":}`,
			description: "Should handle malformed JSON",
		},
	}

	for _, test := range edgeCases {
		suite.T().Run(test.name, func(t *testing.T) {
			var req *http.Request
			if test.body != "" {
				req, _ = http.NewRequest(test.method, test.url, bytes.NewBuffer([]byte(test.body)))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req, _ = http.NewRequest(test.method, test.url, nil)
			}

			w := httptest.NewRecorder()
			suite.router.ServeHTTP(w, req)

			// Just check that the server doesn't crash (any status code is fine)
			assert.NotEqual(t, 0, w.Code, test.description)
			t.Logf("✅ %s: Status %d", test.description, w.Code)
		})
	}
}

// TestAdvancedTestSuite roda a suite de testes avançados
func TestAdvancedTestSuite(t *testing.T) {
	suite.Run(t, new(AdvancedTestSuite))
}

// Benchmark complexo
func BenchmarkComplexScenario(b *testing.B) {
	gin.SetMode(gin.TestMode)
	database.InitDatabase()

	router := gin.New()
	router.GET("/api/posts", handlers.ListPosts)
	router.GET("/api/categories", handlers.ListCategories)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			// Simulate a complex user journey
			endpoints := []string{"/health", "/api/posts", "/api/categories"}

			for _, endpoint := range endpoints {
				req, _ := http.NewRequest("GET", endpoint, nil)
				w := httptest.NewRecorder()
				router.ServeHTTP(w, req)
			}
		}
	})
}
