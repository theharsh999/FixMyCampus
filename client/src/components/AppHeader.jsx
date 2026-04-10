import { LogOut, Wrench, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/store';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

export default function AppHeader({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const navItems = user.role === 'admin'
    ? [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Profile', path: '/profile' },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'New Complaint', path: '/submit' },
        { label: 'Profile', path: '/profile' },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Fix<span className="text-gradient">My</span>Campus</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map(item => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
          <div className="ml-4 flex items-center gap-3 border-l border-border pl-4">
            <span className="text-sm text-muted-foreground">
              {user.name} <span className="text-xs">({user.role})</span>
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </nav>

        {/* Mobile hamburger */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2 animate-fade-in">
          {navItems.map(item => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
            >
              {item.label}
            </Button>
          ))}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{user.name} ({user.role})</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
