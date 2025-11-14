import type {
    Author,
    Book,
    Publisher,
    PaginatedResponse,
    LoginResponse,
    RegisterResponse,
    AuthError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: AuthError
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
    } catch (error) {
        // Network error or CORS issue
        throw new ApiError(
            'Failed to connect to server. Please check your connection.',
            0,
            { error: 'Network error' }
        );
    }

    let data: any;
    try {
        data = await response.json();
    } catch (error) {
        // Invalid JSON response
        throw new ApiError(
            'Invalid response from server',
            response.status,
            { error: 'Invalid JSON' }
        );
    }

    if (!response.ok) {
        throw new ApiError(
            data.message || data.error || 'An error occurred',
            response.status,
            data
        );
    }

    return data;
}

// Auth API
export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return request<LoginResponse>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    register: async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ): Promise<RegisterResponse> => {
        return request<RegisterResponse>('/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
                password_confirmation,
            }),
        });
    },

    logout: async (): Promise<{ message: string }> => {
        return request<{ message: string }>('/logout', {
            method: 'POST',
        });
    },

    me: async (): Promise<{ id: number; name: string; email: string }> => {
        return request<{ id: number; name: string; email: string }>('/me');
    },
};

// Authors API
export const authorsApi = {
    list: async (page: number = 1, filters?: { name?: string }): Promise<PaginatedResponse<Author>> => {
        const params = new URLSearchParams({ page: page.toString() });
        if (filters?.name) {
            params.append('name', filters.name);
        }
        return request<PaginatedResponse<Author>>(`/authors?${params.toString()}`);
    },

    get: async (id: number): Promise<Author> => {
        return request<Author>(`/authors/${id}`);
    },

    create: async (data: { name: string; bio: string }): Promise<Author> => {
        return request<Author>('/authors', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: number, data: { name: string; bio: string }): Promise<Author> => {
        return request<Author>(`/authors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: number): Promise<{ message: string }> => {
        return request<{ message: string }>(`/authors/${id}`, {
            method: 'DELETE',
        });
    },
};

// Publishers API
export const publishersApi = {
    list: async (page: number = 1, filters?: { name?: string }): Promise<PaginatedResponse<Publisher>> => {
        const params = new URLSearchParams({ page: page.toString() });
        if (filters?.name) {
            params.append('name', filters.name);
        }
        return request<PaginatedResponse<Publisher>>(`/publishers?${params.toString()}`);
    },

    get: async (id: number): Promise<Publisher> => {
        return request<Publisher>(`/publishers/${id}`);
    },

    create: async (data: { name: string; address: string }): Promise<Publisher> => {
        return request<Publisher>('/publishers', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: number, data: { name: string; address: string }): Promise<Publisher> => {
        return request<Publisher>(`/publishers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: number): Promise<{ message: string }> => {
        return request<{ message: string }>(`/publishers/${id}`, {
            method: 'DELETE',
        });
    },
};

// Books API
export const booksApi = {
    list: async (
        page: number = 1,
        filters?: { author_id?: number; publisher_id?: number; title?: string }
    ): Promise<PaginatedResponse<Book>> => {
        const params = new URLSearchParams({ page: page.toString() });
        if (filters?.author_id) {
            params.append('author_id', filters.author_id.toString());
        }
        if (filters?.publisher_id) {
            params.append('publisher_id', filters.publisher_id.toString());
        }
        if (filters?.title) {
            params.append('title', filters.title);
        }
        return request<PaginatedResponse<Book>>(`/books?${params.toString()}`);
    },

    get: async (id: number): Promise<Book> => {
        return request<Book>(`/books/${id}`);
    },

    create: async (data: {
        title: string;
        description?: string;
        author_id: number;
        publisher_id: number;
    }): Promise<Book> => {
        return request<Book>('/books', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (
        id: number,
        data: {
            title: string;
            description?: string;
            author_id: number;
            publisher_id: number;
        }
    ): Promise<Book> => {
        return request<Book>(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: number): Promise<{ message: string }> => {
        return request<{ message: string }>(`/books/${id}`, {
            method: 'DELETE',
        });
    },
};

// Statistics API
export const statsApi = {
    getStats: async (): Promise<{
        books: number;
        authors: number;
        publishers: number;
    }> => {
        const [books, authors, publishers] = await Promise.all([
            booksApi.list(1).then((res) => res.total),
            authorsApi.list(1).then((res) => res.total),
            publishersApi.list(1).then((res) => res.total),
        ]);

        return { books, authors, publishers };
    },
};

export { ApiError };

