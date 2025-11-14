'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { booksApi, authorsApi, publishersApi } from '@/lib/api';
import type { Book, Author, Publisher, PaginatedResponse } from '@/types';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function BooksPage() {
    const [books, setBooks] = useState<PaginatedResponse<Book> | null>(null);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        author_id: '',
        publisher_id: '',
        title: '',
    });
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchBooks();
            fetchAuthors();
            fetchPublishers();
        }
    }, [currentPage, filters, isAuthenticated, authLoading]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filters.author_id) params.author_id = parseInt(filters.author_id);
            if (filters.publisher_id) params.publisher_id = parseInt(filters.publisher_id);
            if (filters.title) params.title = filters.title;

            const data = await booksApi.list(currentPage, params);
            setBooks(data);
        } catch (error) {
            console.error('Failed to fetch books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const data = await authorsApi.list(1);
            setAuthors(data.data);
        } catch (error) {
            console.error('Failed to fetch authors:', error);
        }
    };

    const fetchPublishers = async () => {
        try {
            const data = await publishersApi.list(1);
            setPublishers(data.data);
        } catch (error) {
            console.error('Failed to fetch publishers:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await booksApi.delete(id);
            fetchBooks();
        } catch (error) {
            alert('Failed to delete book');
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="ml-64 flex-1">
                    <Topbar />
                    <main className="p-8 pt-24">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">Books</h1>
                            <button
                                onClick={() => router.push('/books/new')}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Add New Book
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow-md md:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={filters.title}
                                    onChange={(e) => handleFilterChange('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                    placeholder="Search by title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Author</label>
                                <select
                                    value={filters.author_id}
                                    onChange={(e) => handleFilterChange('author_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                >
                                    <option value="">All Authors</option>
                                    {authors.map((author) => (
                                        <option key={author.id} value={author.id}>
                                            {author.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Publisher</label>
                                <select
                                    value={filters.publisher_id}
                                    onChange={(e) => handleFilterChange('publisher_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                >
                                    <option value="">All Publishers</option>
                                    {publishers.map((publisher) => (
                                        <option key={publisher.id} value={publisher.id}>
                                            {publisher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({ author_id: '', publisher_id: '', title: '' })}
                                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

            {loading ? (
                <div className="text-center text-black">Loading...</div>
            ) : (
                            <>
                                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Author
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Publisher
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {books?.data.map((book) => (
                                                <tr
                                                    key={book.id}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => router.push(`/books/${book.id}`)}
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {book.title}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {book.author?.name || 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {book.publisher?.name || 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(book.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {books && books.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {books.from} to {books.to} of {books.total} results
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(books.last_page, p + 1))}
                                                disabled={currentPage === books.last_page}
                                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

