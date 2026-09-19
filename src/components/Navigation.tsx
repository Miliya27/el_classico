'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Fixtures', href: '/fixtures' },
    { label: 'Groups', href: '/groups' },
    { label: 'Bracket', href: '/bracket' },
    { label: 'Rankings', href: '/rankings' },
    { label: 'Media', href: '/media' },
    { label: 'Admin', href: '/admin' },
]

export function Navigation() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md group-hover:bg-emerald-400 transition-colors">
                            JC
                        </div>
                        <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                            Jwala - El Classico
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-slate-800 text-emerald-400 border border-slate-700/50'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Status link indicator */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/status"
                            className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
                        >
                            System Status
                        </Link>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                        className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu dropdown */}
            {mobileMenuOpen && (
                <nav className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive
                                        ? 'bg-slate-800 text-emerald-400 border-l-4 border-emerald-500'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                    <div className="pt-2 border-t border-slate-800">
                        <Link
                            href="/status"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm text-slate-400 hover:text-emerald-400"
                        >
                            System Status
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    )
}
