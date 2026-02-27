'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard/dashboard', icon: '📊' },
  { name: 'Workflows', href: '/dashboard/workflows', icon: '🔄' },
  { name: 'Executions', href: '/dashboard/executions', icon: '⚡' },
  { name: 'Templates', href: '/dashboard/templates', icon: '📋' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userStr)

      // Check if parsedUser is a valid user object (not an error response)
      // Error responses often have keys like: type, loc, msg, input
      if (parsedUser && typeof parsedUser === 'object' && !('type' in parsedUser && 'loc' in parsedUser && 'msg' in parsedUser)) {
        setUser(parsedUser)
      } else {
        // Invalid user object, clear storage and redirect
        console.error('Invalid user object stored:', parsedUser)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/dashboard/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              AI Workflows
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard/dashboard' && pathname === '/dashboard')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {(typeof user?.email === 'string' ? user.email[0]?.toUpperCase() : user?.username?.[0]?.toUpperCase()) || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {typeof user?.full_name === 'string' ? user.full_name : (typeof user?.email === 'string' ? user.email.split('@')[0] : user?.username || 'User')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {typeof user?.email === 'string' ? user.email : user?.username || ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {children}
      </div>
    </div>
  )
}
