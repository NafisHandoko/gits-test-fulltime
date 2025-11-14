'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { statsApi } from '@/lib/api';
import {
    BookOpenIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        books: 0,
        authors: 0,
        publishers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statsApi.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="ml-64 flex-1">
                    <Topbar />
                    <main className="p-8 pt-24">
                        <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

                        {loading ? (
                            <div className="text-center">Loading statistics...</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <StatCard
                                    title="Books"
                                    value={stats.books}
                                    icon={BookOpenIcon}
                                    color="blue"
                                />
                                <StatCard
                                    title="Authors"
                                    value={stats.authors}
                                    icon={UserGroupIcon}
                                    color="green"
                                />
                                <StatCard
                                    title="Publishers"
                                    value={stats.publishers}
                                    icon={BuildingOfficeIcon}
                                    color="purple"
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'purple';
}) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-full ${colorClasses[color]} p-3`}>
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
        </div>
    );
}

