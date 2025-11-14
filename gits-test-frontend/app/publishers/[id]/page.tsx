'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { publishersApi } from '@/lib/api';
import type { Publisher } from '@/types';
import { ApiError } from '@/lib/api';

export default function PublisherDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id ? parseInt(params.id as string) : null;
    const isNew = params?.id === 'new';

    const [publisher, setPublisher] = useState<Partial<Publisher>>({
        name: '',
        address: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(isNew);

    useEffect(() => {
        if (!isNew && id) {
            fetchPublisher();
        } else {
            setLoading(false);
        }
    }, [id, isNew]);

    const fetchPublisher = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await publishersApi.get(id);
            setPublisher(data);
        } catch (error) {
            console.error('Failed to fetch publisher:', error);
            setError('Failed to load publisher');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!publisher.name) {
            setError('Name is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (isNew) {
                await publishersApi.create({
                    name: publisher.name!,
                    address: publisher.address || '',
                });
                router.push('/publishers');
            } else if (id) {
                await publishersApi.update(id, {
                    name: publisher.name!,
                    address: publisher.address || '',
                });
                setIsEditing(false);
                await fetchPublisher();
            }
        } catch (err) {
            if (err instanceof ApiError) {
                const errorData = err.data;
                if (errorData?.errors) {
                    const errorMessages = Object.values(errorData.errors).flat();
                    setError(errorMessages.join(', '));
                } else {
                    setError(errorData?.error || err.message || 'Failed to save publisher');
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
                                {isNew ? 'New Publisher' : 'Publisher Details'}
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
                                                    router.push('/publishers');
                                                } else {
                                                    setIsEditing(false);
                                                    fetchPublisher();
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
                                        value={publisher.name}
                                        onChange={(e) => setPublisher({ ...publisher, name: e.target.value })}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black disabled:bg-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        value={publisher.address || ''}
                                        onChange={(e) => setPublisher({ ...publisher, address: e.target.value })}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black disabled:bg-gray-100"
                                    />
                                </div>

                                {!isNew && !isEditing && (
                                    <div className="mt-4 border-t pt-4">
                                        <p className="text-sm text-gray-500">
                                            Created: {new Date(publisher.created_at || '').toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Updated: {new Date(publisher.updated_at || '').toLocaleString()}
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

