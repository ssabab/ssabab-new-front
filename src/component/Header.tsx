'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/main', label: '소개' },
    { href: '/analysis', label: '분석보기' },
    { href: '/mypage', label: '마이페이지' }
  ];

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800 rounded-lg">SSABAB</Link>
        <nav>
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`rounded-lg ${
                    isActive(item.href) 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-600 hover:text-blue-600 font-medium'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
