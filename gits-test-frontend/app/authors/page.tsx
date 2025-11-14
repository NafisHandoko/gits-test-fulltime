'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { authorsApi } from '@/lib/api';
import type { Author, PaginatedResponse } from '@/types';

export default function AuthorsPage() {
    const [authors, setAuthors] = useState<PaginatedResponse<Author> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('');

    const router = useRouter();

    useEffect(() => {
        fetchAuthors();
    }, [currentPage, filter]);

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const data = await authorsApi.list(currentPage, filter ? { name: filter } : undefined);
            setAuthors(data);
        } catch (error) {
            console.error('Failed to fetch authors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this author?')) return;

        try {
            await authorsApi.delete(id);
            fetchAuthors();
        } catch (error) {
            alert('Failed to delete author');
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="ml-64 flex-1">
                    <Topbar />
                    <main className="p-8 pt-24">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
                            <button
                                onClick={() => router.push('/authors/new')}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Add New Author
                            </button>
                        </div>

                        {/* Filter */}
                        <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                                placeholder="Search by name..."
                            />
                        </div>

                        {loading ? (
                            <div className="text-center">Loading...</div>
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Bio
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {authors?.data.map((author) => (
                                                <tr
                                                    key={author.id}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => router.push(`/authors/${author.id}`)}
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {author.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {author.bio ? (author.bio.length > 100 ? author.bio.substring(0, 100) + '...' : author.bio) : 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(author.id);
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
                                {authors && authors.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {authors.from} to {authors.to} of {authors.total} results
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
                                                onClick={() => setCurrentPage((p) => Math.min(authors.last_page, p + 1))}
                                                disabled={currentPage === authors.last_page}
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

