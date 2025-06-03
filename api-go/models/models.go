package models

import (
	"time"
)

type User struct {
	ID    string `json:"id" db:"id"`
	Email string `json:"email" db:"email"`
}

type Profile struct {
	ID        string     `json:"id" db:"id"`
	Username  string     `json:"username" db:"username"`
	AvatarURL *string    `json:"avatar_url,omitempty" db:"avatar_url"`
	Bio       *string    `json:"bio,omitempty" db:"bio"`
	IsAdmin   *bool      `json:"is_admin,omitempty" db:"is_admin"`
	CreatedAt *time.Time `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty" db:"updated_at"`
}

type Post struct {
	ID           *string    `json:"id,omitempty" db:"id"`
	Title        string     `json:"title" db:"title"`
	Content      string     `json:"content" db:"content"`
	Slug         string     `json:"slug" db:"slug"`
	AuthorID     string     `json:"author_id" db:"author_id"`
	CategoryID   *string    `json:"category_id,omitempty" db:"category_id"`
	Published    *bool      `json:"published,omitempty" db:"published"`
	ThumbnailURL *string    `json:"thumbnail_url,omitempty" db:"thumbnail_url"`
	CreatedAt    *time.Time `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt    *time.Time `json:"updated_at,omitempty" db:"updated_at"`
}

type Comment struct {
	ID        *string    `json:"id,omitempty" db:"id"`
	Content   string     `json:"content" db:"content"`
	PostID    string     `json:"post_id" db:"post_id"`
	UserID    string     `json:"user_id" db:"user_id"`
	CreatedAt *time.Time `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty" db:"updated_at"`
}

type Category struct {
	ID          *string    `json:"id,omitempty" db:"id"`
	Name        string     `json:"name" db:"name"`
	Slug        string     `json:"slug" db:"slug"`
	Description *string    `json:"description,omitempty" db:"description"`
	CreatedAt   *time.Time `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty" db:"updated_at"`
}

type SavedPost struct {
	ID        *string    `json:"id,omitempty" db:"id"`
	PostID    string     `json:"post_id" db:"post_id"`
	UserID    string     `json:"user_id" db:"user_id"`
	CreatedAt *time.Time `json:"created_at,omitempty" db:"created_at"`
}

type WebsiteContent struct {
	ID        *string                `json:"id,omitempty" db:"id"`
	PageName  string                 `json:"page_name" db:"page_name"`
	Content   map[string]interface{} `json:"content" db:"content"`
	UpdatedBy string                 `json:"updated_by" db:"updated_by"`
	CreatedAt *time.Time             `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt *time.Time             `json:"updated_at,omitempty" db:"updated_at"`
}

// Request/Response DTOs
type UserCreate struct {
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required,min=8"`
	Username *string `json:"username,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type PostCreate struct {
	Title        string  `json:"title" binding:"required"`
	Content      string  `json:"content" binding:"required"`
	Slug         string  `json:"slug" binding:"required"`
	CategoryID   *string `json:"category_id,omitempty"`
	Published    *bool   `json:"published,omitempty"`
	ThumbnailURL *string `json:"thumbnail_url,omitempty"`
}

type PostUpdate struct {
	Title        *string `json:"title,omitempty"`
	Content      *string `json:"content,omitempty"`
	CategoryID   *string `json:"category_id,omitempty"`
	Published    *bool   `json:"published,omitempty"`
	ThumbnailURL *string `json:"thumbnail_url,omitempty"`
}

type CommentCreate struct {
	Content string `json:"content" binding:"required"`
}

type CategoryCreate struct {
	Name        string  `json:"name" binding:"required"`
	Slug        string  `json:"slug" binding:"required"`
	Description *string `json:"description,omitempty"`
}

type ProfileUpdate struct {
	Username  *string `json:"username,omitempty"`
	Bio       *string `json:"bio,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
}

type WebsiteContentCreate struct {
	PageName string                 `json:"page_name" binding:"required"`
	Content  map[string]interface{} `json:"content" binding:"required"`
}

// Response DTOs
type AuthResponse struct {
	AccessToken string  `json:"access_token"`
	User        User    `json:"user"`
	Profile     Profile `json:"profile,omitempty"`
}

type RegisterResponse struct {
	Message string  `json:"message"`
	User    User    `json:"user"`
	Profile Profile `json:"profile"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}
