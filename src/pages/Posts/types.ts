export interface Profile {
    username: string 
    id: string,
    bio: string | null
    avatarURL: string | null
    createdAt: string | null,
    updatedAt: string | null,
    isAdmin: boolean | null,
}

export interface Author {
    userId?: string,
    username: string
    avatarUrl: string
}

export interface Category {
    id?: string, 
    name: string,
    description?: string,
    slug: string
    createdAt?: string,
    updatedAt?: string
}

export interface Post {
    id: string
    title: string
    content: string
    thumbnail_url: string | null
    slug: string
    author: {
        username: string,
        avatar_url: string
    },
    category: {
        name: string,
        slug: string
    },
    created_at: string
    published: boolean
    updated_at: string
}
