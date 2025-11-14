'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function Topbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="fixed right-0 top-0 z-10 flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-500 text-white">
                        <span className="text-sm font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                <div className="font-medium">{user?.name}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

