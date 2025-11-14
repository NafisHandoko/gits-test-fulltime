'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    BookOpenIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/books', label: 'Books', icon: BookOpenIcon },
    { href: '/authors', label: 'Authors', icon: UserGroupIcon },
    { href: '/publishers', label: 'Publishers', icon: BuildingOfficeIcon },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b border-gray-800 px-6">
                    <h1 className="text-xl font-bold">Publishing Platform</h1>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

