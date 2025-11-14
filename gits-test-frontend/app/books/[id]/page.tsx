'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { booksApi, authorsApi, publishersApi } from '@/lib/api';
import type { Book, Author, Publisher } from '@/types';
import { ApiError } from '@/lib/api';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id ? parseInt(params.id as string) : null;
    const isNew = params?.id === 'new';

    const [book, setBook] = useState<Partial<Book>>({
        title: '',
        description: '',
        author_id: 0,
        publisher_id: 0,
    });
    const [authors, setAuthors] = useState<Author[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(isNew);

    useEffect(() => {
        fetchAuthors();
        fetchPublishers();
        if (!isNew && id) {
            fetchBook();
        } else {
            setLoading(false);
        }
    }, [id, isNew]);

    const fetchBook = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await booksApi.get(id);
            setBook(data);
        } catch (error) {
            console.error('Failed to fetch book:', error);
            setError('Failed to load book');
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

    const handleSave = async () => {
        if (!book.title || !book.author_id || !book.publisher_id) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (isNew) {
                await booksApi.create({
                    title: book.title!,
                    description: book.description,
                    author_id: book.author_id!,
                    publisher_id: book.publisher_id!,
                });
                router.push('/books');
            } else if (id) {
                await booksApi.update(id, {
                    title: book.title!,
                    description: book.description,
                    author_id: book.author_id!,
                    publisher_id: book.publisher_id!,
                });
                setIsEditing(false);
                await fetchBook();
            }
        } catch (err) {
            if (err instanceof ApiError) {
                const errorData = err.data;
                if (errorData?.errors) {
                    const errorMessages = Object.values(errorData.errors).flat();
                    setError(errorMessages.join(', '));
                } else {
                    setError(errorData?.error || err.message || 'Failed to save book');
                }
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="ml-64 flex-1">
                        <Topbar />
            <main className="p-8 pt-24">
                <div className="text-center text-black">Loading...</div>
            </main>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="ml-64 flex-1">
                    <Topbar />
                    <main className="p-8 pt-24">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isNew ? 'New Book' : 'Book Details'}
                            </h1>
                            <div className="flex gap-2">
                                {!isNew && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                )}
                                {isEditing && (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (isNew) {
                                                    router.push('/books');
                                                } else {
                                                    setIsEditing(false);
                                                    fetchBook();
                                                }
                                            }}
                                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="rounded-lg bg-white p-6 shadow-md">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={book.title}
                                        onChange={(e) => setBook({ ...book, title: e.target.value })}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black disabled:bg-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={book.description || ''}
                                        onChange={(e) => setBook({ ...book, description: e.target.value })}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Author <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={book.author_id || ''}
                                        onChange={(e) => setBook({ ...book, author_id: parseInt(e.target.value) })}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">Select an author</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Publisher <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={book.publisher_id || ''}
                                        onChange={(e) => setBook({ ...book, publisher_id: parseInt(e.target.value) })}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">Select a publisher</option>
                                        {publishers.map((publisher) => (
                                            <option key={publisher.id} value={publisher.id}>
                                                {publisher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {!isNew && !isEditing && (
                                    <div className="mt-4 border-t pt-4">
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(book.created_at || '').toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Updated: {new Date(book.updated_at || '').toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

