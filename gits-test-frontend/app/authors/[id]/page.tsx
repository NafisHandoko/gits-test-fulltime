'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { authorsApi } from '@/lib/api';
import type { Author } from '@/types';
import { ApiError } from '@/lib/api';

export default function AuthorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id ? parseInt(params.id as string) : null;
    const isNew = params?.id === 'new';

    const [author, setAuthor] = useState<Partial<Author>>({
        name: '',
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(isNew);

    useEffect(() => {
        if (!isNew && id) {
            fetchAuthor();
        } else {
            setLoading(false);
        }
    }, [id, isNew]);

    const fetchAuthor = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await authorsApi.get(id);
            setAuthor(data);
        } catch (error) {
            console.error('Failed to fetch author:', error);
            setError('Failed to load author');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!author.name) {
            setError('Name is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (isNew) {
                await authorsApi.create({
                    name: author.name!,
                    bio: author.bio || '',
                });
                router.push('/authors');
            } else if (id) {
                await authorsApi.update(id, {
                    name: author.name!,
                    bio: author.bio || '',
                });
                setIsEditing(false);
                await fetchAuthor();
            }
        } catch (err) {
            if (err instanceof ApiError) {
                const errorData = err.data;
                if (errorData?.errors) {
                    const errorMessages = Object.values(errorData.errors).flat();
                    setError(errorMessages.join(', '));
                } else {
                    setError(errorData?.error || err.message || 'Failed to save author');
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
                            <div className="text-center">Loading...</div>
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
                                {isNew ? 'New Author' : 'Author Details'}
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
                                                    router.push('/authors');
                                                } else {
                                                    setIsEditing(false);
                                                    fetchAuthor();
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
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={author.name}
                                        onChange={(e) => setAuthor({ ...author, name: e.target.value })}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                                    <textarea
                                        value={author.bio || ''}
                                        onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
                                        disabled={!isEditing}
                                        rows={6}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                                    />
                                </div>

                                {!isNew && !isEditing && (
                                    <div className="mt-4 border-t pt-4">
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(author.created_at || '').toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Updated: {new Date(author.updated_at || '').toLocaleString()}
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

