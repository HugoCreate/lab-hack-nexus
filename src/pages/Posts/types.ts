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