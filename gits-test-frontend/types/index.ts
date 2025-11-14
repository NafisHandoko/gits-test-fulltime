export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: number;
  name: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Publisher {
  id: number;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  author_id: number;
  publisher_id: number;
  created_at: string;
  updated_at: string;
  author?: Author;
  publisher?: Publisher;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface AuthError {
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

