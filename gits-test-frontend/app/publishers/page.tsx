'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { publishersApi } from '@/lib/api';
import type { Publisher, PaginatedResponse } from '@/types';

export default function PublishersPage() {
    const [publishers, setPublishers] = useState<PaginatedResponse<Publisher> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('');

    const router = useRouter();

    useEffect(() => {
        fetchPublishers();
    }, [currentPage, filter]);

    const fetchPublishers = async () => {
        try {
            setLoading(true);
            const data = await publishersApi.list(currentPage, filter ? { name: filter } : undefined);
            setPublishers(data);
        } catch (error) {
            console.error('Failed to fetch publishers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this publisher?')) return;

        try {
            await publishersApi.delete(id);
            fetchPublishers();
        } catch (error) {
            alert('Failed to delete publisher');
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
                            <h1 className="text-3xl font-bold text-gray-900">Publishers</h1>
                            <button
                                onClick={() => router.push('/publishers/new')}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Add New Publisher
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
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black"
                                placeholder="Search by name..."
                            />
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
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {publishers?.data.map((publisher) => (
                                                <tr
                                                    key={publisher.id}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => router.push(`/publishers/${publisher.id}`)}
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {publisher.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {publisher.address ? (publisher.address.length > 100 ? publisher.address.substring(0, 100) + '...' : publisher.address) : 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(publisher.id);
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
                                {publishers && publishers.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {publishers.from} to {publishers.to} of {publishers.total} results
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
                                                onClick={() => setCurrentPage((p) => Math.min(publishers.last_page, p + 1))}
                                                disabled={currentPage === publishers.last_page}
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

