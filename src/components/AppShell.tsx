import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Home,
  BookOpen,
  FlaskConical,
  Calendar,
  AlertCircle,
  Users,
  BarChart3,
  Clock,
  Shield,
  Bookmark,
  ChevronDown,
  X
} from 'lucide-react';
import { AuthService } from '../lib/auth';
import { Role } from '../lib/types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface AppShellProps {
  children: React.ReactNode;
}

const navigation = {
  student: [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Book Library', href: '/student/library', icon: BookOpen },
    { name: 'Book Lab', href: '/student/lab', icon: FlaskConical },
    { name: 'My Bookings', href: '/student/bookings', icon: Calendar },
    { name: 'Penalties', href: '/student/penalties', icon: AlertCircle },
  ],
  faculty: [
    { name: 'Dashboard', href: '/faculty', icon: Home },
    { name: 'Book Room', href: '/faculty/book', icon: Calendar },
    { name: 'My Classes', href: '/faculty/classes', icon: Bookmark },
  ],
  staff: [
    { name: 'Check-in Portal', href: '/staff/checkin', icon: Shield },
    { name: "Today's Schedule", href: '/staff/today', icon: Clock },
  ],
  admin: [
    { name: 'Overview', href: '/admin', icon: Home },
    { name: 'Resources', href: '/admin/resources', icon: Settings },
    { name: 'Opening Hours', href: '/admin/hours', icon: Clock },
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
    { name: 'Penalties', href: '/admin/penalties', icon: AlertCircle },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);
  
  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const userNavigation = navigation[currentUser.role] || [];
  
  const handleSignOut = () => {
    AuthService.signOut();
    navigate('/');
  };

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== `/${currentUser.role}` && location.pathname.startsWith(href));
  };

  return (
    <div className="h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">EWU Hub</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {userNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          isActive(item.href)
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50',
                          'group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-medium'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive(item.href) ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600',
                            'h-6 w-6 shrink-0'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'lg:hidden fixed inset-0 z-50 flex',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="relative mr-16 flex w-full max-w-xs flex-1">
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button
              type="button"
              className="-m-2.5 p-2.5"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">EWU Hub</span>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {userNavigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            isActive(item.href)
                              ? 'bg-purple-50 text-purple-600'
                              : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50',
                            'group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-medium'
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon
                            className={cn(
                              isActive(item.href) ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600',
                              'h-6 w-6 shrink-0'
                            )}
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-slate-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 pl-3" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm bg-transparent"
                placeholder="Search..."
                type="search"
                disabled
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                Asia/Dhaka (UTC+6)
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-x-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="hidden lg:block">{currentUser.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-900/5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                    </div>
                    <button className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="mr-3 h-4 w-4" />
                      My Profile
                    </button>
                    <button className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2">
        <nav className="flex justify-around">
          {userNavigation.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center space-y-1 p-2 rounded-lg',
                isActive(item.href)
                  ? 'text-purple-600'
                  : 'text-slate-500'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}