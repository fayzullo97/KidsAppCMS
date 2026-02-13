import Link from 'next/link';
import { LayoutDashboard, Layers } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Topics', href: '/topics', icon: Layers },
];

export function Sidebar() {
    return (
        <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
            <div className="flex h-16 items-center justify-center font-bold text-xl">
                Kids App CMS
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-700"
                    >
                        <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
