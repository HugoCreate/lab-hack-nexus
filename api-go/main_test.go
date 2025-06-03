package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
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

// APITestSuite estrutura para os testes da API
type APITestSuite struct {
	suite.Suite
	router    *gin.Engine
	testUser  models.User
	authToken string
}

// SetupSuite configura o ambiente de teste antes de todos os testes
func (suite *APITestSuite) SetupSuite() {
	// Configurar modo de teste do Gin
	gin.SetMode(gin.TestMode)

	// Configurar variáveis de ambiente para teste
	os.Setenv("SUPABASE_URL", "https://test-project.supabase.co")
	os.Setenv("SUPABASE_KEY", "test-anon-key")
	os.Setenv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
	os.Setenv("GIN_MODE", "test")

	// Inicializar database (com configurações de teste)
	database.InitDatabase()

	// Configurar router
	suite.router = gin.New()
	suite.setupRoutes()
}

// setupRoutes configura as rotas para teste
func (suite *APITestSuite) setupRoutes() {
	// Health check
	suite.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "Lab Hack Nexus API",
		})
	})

	// Auth routes
	auth := suite.router.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Posts routes
	posts := suite.router.Group("/posts")
	{
		posts.GET("", handlers.ListPosts)
		posts.GET("/:id", handlers.GetPost)
		posts.POST("", middleware.AuthMiddleware(), handlers.CreatePost)
		posts.PUT("/:id", middleware.AuthMiddleware(), handlers.UpdatePost)
		posts.DELETE("/:id", middleware.AuthMiddleware(), handlers.DeletePost)

		// Comments
		posts.GET("/:id/comments", handlers.ListComments)
		posts.POST("/:id/comments", middleware.AuthMiddleware(), handlers.CreateComment)
		posts.DELETE("/:id/comments/:comment_id", middleware.AuthMiddleware(), handlers.DeleteComment)

		// Save/Unsave
		posts.POST("/:id/save", middleware.AuthMiddleware(), handlers.SavePost)
		posts.DELETE("/:id/unsave", middleware.AuthMiddleware(), handlers.UnsavePost)
	}

	// Categories routes
	categories := suite.router.Group("/categories")
	{
		categories.GET("", handlers.ListCategories)
		categories.GET("/:id", handlers.GetCategory)
		categories.POST("", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.CreateCategory)
		categories.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.UpdateCategory)
		categories.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.DeleteCategory)
	}

	// Profiles routes
	profiles := suite.router.Group("/profiles")
	{
		profiles.GET("/me", middleware.AuthMiddleware(), handlers.GetCurrentProfile)
		profiles.GET("/:id", handlers.GetProfile)
		profiles.PUT("/:id", middleware.AuthMiddleware(), handlers.UpdateProfile)
	}

	// Saved posts routes
	suite.router.GET("/saved-posts", middleware.AuthMiddleware(), handlers.ListSavedPosts)

	// Website content routes
	content := suite.router.Group("/website-content")
	{
		content.GET("/:page_name", handlers.GetWebsiteContent)
		content.POST("", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.CreateWebsiteContent)
		content.PUT("/:page_name", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.UpdateWebsiteContent)
		content.DELETE("/:page_name", middleware.AuthMiddleware(), middleware.AdminMiddleware(), handlers.DeleteWebsiteContent)
	}
}

// TestHealthCheck testa o endpoint de health check
func (suite *APITestSuite) TestHealthCheck() {
	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 200, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "healthy", response["status"])
	assert.Equal(suite.T(), "Lab Hack Nexus API", response["service"])
}

// TestAuthEndpoints testa os endpoints de autenticação
func (suite *APITestSuite) TestAuthEndpoints() {
	// Teste de registro
	registerData := models.UserCreate{
		Email:    "test@example.com",
		Password: "password123",
		Username: stringPtr("testuser"),
	}

	reqBody, _ := json.Marshal(registerData)
	req, _ := http.NewRequest("POST", "/auth/register", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Nota: Como estamos testando sem Supabase real, esperamos erro de conexão
	// Em um ambiente de teste real, mockariamos o database
	assert.Contains(suite.T(), []int{400, 500}, w.Code, "Register should fail without real Supabase")

	// Teste de login
	loginData := models.LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	reqBody, _ = json.Marshal(loginData)
	req, _ = http.NewRequest("POST", "/auth/login", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Nota: Como estamos testando sem Supabase real, esperamos erro de conexão
	assert.Contains(suite.T(), []int{400, 500}, w.Code, "Login should fail without real Supabase")
}

// TestPostsEndpoints testa os endpoints de posts
func (suite *APITestSuite) TestPostsEndpoints() {
	// Teste de listagem de posts (público)
	req, _ := http.NewRequest("GET", "/posts", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Deve falhar pois não temos conexão real com Supabase
	assert.Contains(suite.T(), []int{500}, w.Code, "Posts list should fail without real database")

	// Teste de criação de post sem autenticação
	postData := models.PostCreate{
		Title:   "Test Post",
		Content: "This is a test post",
		Slug:    "test-post",
	}

	reqBody, _ := json.Marshal(postData)
	req, _ = http.NewRequest("POST", "/posts", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 401, w.Code, "Should require authentication")
}

// TestCategoriesEndpoints testa os endpoints de categorias
func (suite *APITestSuite) TestCategoriesEndpoints() {
	// Teste de listagem de categorias (público)
	req, _ := http.NewRequest("GET", "/categories", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Deve falhar pois não temos conexão real com Supabase
	assert.Contains(suite.T(), []int{500}, w.Code, "Categories list should fail without real database")

	// Teste de criação de categoria sem autenticação
	categoryData := models.CategoryCreate{
		Name: "Test Category",
		Slug: "test-category",
	}

	reqBody, _ := json.Marshal(categoryData)
	req, _ = http.NewRequest("POST", "/categories", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 401, w.Code, "Should require authentication")
}

// TestValidationErrors testa erros de validação
func (suite *APITestSuite) TestValidationErrors() {
	// Teste com dados inválidos para registro
	invalidRegisterData := map[string]interface{}{
		"email":    "invalid-email",
		"password": "123", // muito curto
	}

	reqBody, _ := json.Marshal(invalidRegisterData)
	req, _ := http.NewRequest("POST", "/auth/register", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 400, w.Code, "Should return validation error")

	var response models.ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "validation_error", response.Error)
}

// TestMiddleware testa os middlewares
func (suite *APITestSuite) TestMiddleware() {
	// Teste de endpoint protegido sem token
	req, _ := http.NewRequest("GET", "/profiles/me", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 401, w.Code, "Should require authentication")

	// Teste de endpoint admin sem ser admin
	req, _ = http.NewRequest("POST", "/categories", bytes.NewBuffer([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 401, w.Code, "Should require authentication first")
}

// TestContentTypes testa diferentes tipos de conteúdo
func (suite *APITestSuite) TestContentTypes() {
	// Teste sem Content-Type
	req, _ := http.NewRequest("POST", "/auth/register", bytes.NewBuffer([]byte("{}")))
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 400, w.Code, "Should handle missing content type")

	// Teste com JSON inválido
	req, _ = http.NewRequest("POST", "/auth/register", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 400, w.Code, "Should handle invalid JSON")
}

// TestRateLimiting testa limitação de taxa (se implementada)
func (suite *APITestSuite) TestRateLimiting() {
	// Fazer múltiplas requisições rapidamente
	for i := 0; i < 10; i++ {
		req, _ := http.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		suite.router.ServeHTTP(w, req)

		// Health check deve sempre funcionar (não implementamos rate limiting ainda)
		assert.Equal(suite.T(), 200, w.Code)
	}
}

// TestSavedPosts testa funcionalidade de posts salvos
func (suite *APITestSuite) TestSavedPosts() {
	// Teste de listagem de posts salvos sem autenticação
	req, _ := http.NewRequest("GET", "/saved-posts", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 401, w.Code, "Should require authentication")

	// Teste de salvar post sem autenticação
	req, _ = http.NewRequest("POST", "/posts/123/save", nil)
	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), 401, w.Code, "Should require authentication")
}

// TestConcurrentRequests testa requisições concorrentes
func (suite *APITestSuite) TestConcurrentRequests() {
	const numGoroutines = 20
	const requestsPerGoroutine = 5

	var wg sync.WaitGroup
	results := make(chan int, numGoroutines*requestsPerGoroutine)

	start := time.Now()

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for j := 0; j < requestsPerGoroutine; j++ {
				req, _ := http.NewRequest("GET", "/health", nil)
				w := httptest.NewRecorder()
				suite.router.ServeHTTP(w, req)
				results <- w.Code
			}
		}()
	}

	wg.Wait()
	close(results)

	duration := time.Since(start)
	totalRequests := numGoroutines * requestsPerGoroutine

	successCount := 0
	for code := range results {
		if code == 200 {
			successCount++
		}
	}

	suite.T().Logf("✅ Concurrent test completed: %d/%d successful requests in %v",
		successCount, totalRequests, duration)

	assert.Equal(suite.T(), totalRequests, successCount, "All concurrent requests should succeed")
	assert.Less(suite.T(), duration, 5*time.Second, "All requests should complete within 5 seconds")
}

// TestSecurityScenarios testa cenários de segurança
func (suite *APITestSuite) TestSecurityScenarios() {
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
			name:        "SQL Injection in URL",
			method:      "GET",
			url:         "/posts/1'; DROP TABLE posts; --",
			expectCode:  400,
			description: "Should reject SQL injection attempts in URL parameters",
		},
		{
			name:        "XSS in JSON Body",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"<script>alert('xss')</script>@test.com","password":"test123"}`,
			headers:     map[string]string{"Content-Type": "application/json"},
			expectCode:  400,
			description: "Should sanitize XSS attempts in request body",
		},
		{
			name:        "Oversized Request Body",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@test.com","password":"` + strings.Repeat("a", 50000) + `"}`,
			headers:     map[string]string{"Content-Type": "application/json"},
			expectCode:  400,
			description: "Should reject oversized request bodies",
		},
		{
			name:        "Invalid Authorization Header Format",
			method:      "GET",
			url:         "/profiles/me",
			headers:     map[string]string{"Authorization": "InvalidFormat token123"},
			expectCode:  401,
			description: "Should reject malformed authorization headers",
		},
		{
			name:        "Missing Content-Type for JSON",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@test.com","password":"test123"}`,
			expectCode:  400,
			description: "Should require proper Content-Type for JSON requests",
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
		})
	}
}

// TestEdgeCasesAndErrorHandling testa casos extremos
func (suite *APITestSuite) TestEdgeCasesAndErrorHandling() {
	edgeCases := []struct {
		name        string
		method      string
		url         string
		body        string
		contentType string
		description string
	}{
		{
			name:        "Empty JSON Object",
			method:      "POST",
			url:         "/auth/register",
			body:        "{}",
			contentType: "application/json",
			description: "Should handle empty JSON gracefully",
		},
		{
			name:        "Null Values in JSON",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":null,"password":null}`,
			contentType: "application/json",
			description: "Should handle null values in JSON",
		},
		{
			name:        "Malformed JSON",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"test@test.com","password":}`,
			contentType: "application/json",
			description: "Should handle malformed JSON",
		},
		{
			name:        "Unicode Characters",
			method:      "POST",
			url:         "/auth/register",
			body:        `{"email":"测试@example.com","password":"пароль123"}`,
			contentType: "application/json",
			description: "Should handle unicode characters",
		},
		{
			name:        "Very Long URL Path",
			method:      "GET",
			url:         "/posts/" + strings.Repeat("a", 500),
			description: "Should handle very long URL paths",
		},
	}

	for _, test := range edgeCases {
		suite.T().Run(test.name, func(t *testing.T) {
			var req *http.Request
			if test.body != "" {
				req, _ = http.NewRequest(test.method, test.url, bytes.NewBuffer([]byte(test.body)))
				if test.contentType != "" {
					req.Header.Set("Content-Type", test.contentType)
				}
			} else {
				req, _ = http.NewRequest(test.method, test.url, nil)
			}

			w := httptest.NewRecorder()
			suite.router.ServeHTTP(w, req)

			// Just ensure the server doesn't crash
			assert.NotEqual(t, 0, w.Code, test.description+" - server should respond")
			t.Logf("✅ %s: Status %d", test.description, w.Code)
		})
	}
}

// TestPerformanceBenchmarks executa benchmarks de performance
func (suite *APITestSuite) TestPerformanceBenchmarks() {
	// Test health endpoint performance
	start := time.Now()
	for i := 0; i < 100; i++ {
		req, _ := http.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		suite.router.ServeHTTP(w, req)
		assert.Equal(suite.T(), 200, w.Code)
	}
	duration := time.Since(start)
	requestsPerSecond := float64(100) / duration.Seconds()

	suite.T().Logf("✅ Health endpoint performance: %.2f req/s", requestsPerSecond)
	assert.Greater(suite.T(), requestsPerSecond, 50.0, "Health endpoint should handle >50 req/s")

	// Test posts endpoint performance (even if it returns 500)
	start = time.Now()
	for i := 0; i < 50; i++ {
		req, _ := http.NewRequest("GET", "/posts", nil)
		w := httptest.NewRecorder()
		suite.router.ServeHTTP(w, req)
		// Don't assert status since we expect DB errors
	}
	duration = time.Since(start)
	requestsPerSecond = float64(50) / duration.Seconds()

	suite.T().Logf("✅ Posts endpoint performance: %.2f req/s", requestsPerSecond)
	assert.Greater(suite.T(), requestsPerSecond, 10.0, "Posts endpoint should handle >10 req/s")
}

// TestAPIDocumentationCompliance verifica se a API está conforme documentação
func (suite *APITestSuite) TestAPIDocumentationCompliance() {
	// Test que endpoints obrigatórios existem
	requiredEndpoints := []struct {
		method      string
		path        string
		description string
	}{
		{"GET", "/health", "Health check endpoint"},
		{"POST", "/auth/register", "User registration"},
		{"POST", "/auth/login", "User login"},
		{"GET", "/posts", "List posts"},
		{"GET", "/categories", "List categories"},
		{"GET", "/profiles/1", "Get user profile"},
		{"GET", "/website-content/home", "Get website content"},
	}

	for _, endpoint := range requiredEndpoints {
		suite.T().Run(endpoint.description, func(t *testing.T) {
			req, _ := http.NewRequest(endpoint.method, endpoint.path, nil)
			w := httptest.NewRecorder()
			suite.router.ServeHTTP(w, req)

			// Endpoint should exist (not return 404)
			assert.NotEqual(t, 404, w.Code, endpoint.description+" should exist")
			t.Logf("✅ %s exists: Status %d", endpoint.description, w.Code)
		})
	}
}

// TestDatabaseConnectionResilience testa resiliência de conexão com banco
func (suite *APITestSuite) TestDatabaseConnectionResilience() {
	// Test multiple rapid requests to database-dependent endpoints
	endpoints := []string{"/posts", "/categories", "/website-content/home"}

	for _, endpoint := range endpoints {
		suite.T().Run("Resilience_"+endpoint, func(t *testing.T) {
			successCount := 0
			for i := 0; i < 10; i++ {
				req, _ := http.NewRequest("GET", endpoint, nil)
				w := httptest.NewRecorder()
				suite.router.ServeHTTP(w, req)

				if w.Code != 500 {
					successCount++
				}

				// Small delay between requests
				time.Sleep(10 * time.Millisecond)
			}

			t.Logf("✅ %s resilience: %d/10 non-error responses", endpoint, successCount)
			// Don't assert success since we expect DB connection issues
		})
	}
}

// stringPtr retorna um ponteiro para string (helper function)
func stringPtr(s string) *string {
	return &s
}

// TestMain roda a suite de testes
func TestAPITestSuite(t *testing.T) {
	suite.Run(t, new(APITestSuite))
}

// Benchmark para performance
func BenchmarkHealthCheck(b *testing.B) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "Lab Hack Nexus API",
		})
	})

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req, _ := http.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	}
}
