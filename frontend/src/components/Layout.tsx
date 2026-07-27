import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Brain, Moon, Sun, Menu, X, ChevronRight
} from 'lucide-react';
import { useAppStore, selectTheme, selectIsDarkMode } from '../store/appStore';
import { NAV_GROUPS, getPageMeta } from '../constants/navigation';
import { pageTransition } from '../lib/motion';

const Layout: React.FC = () => {
  const theme = useAppStore(selectTheme);
  const isDark = useAppStore(selectIsDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const setTheme = useAppStore((s) => s.setTheme);

  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (stored && stored !== theme) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const meta = getPageMeta(location.pathname);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <Brain size={20} style={{ color: 'var(--brand-primary)' }} />
          <span>MindSpace</span>
        </div>
        <button onClick={toggleDarkMode} className="theme-toggle-btn-mobile" aria-label="Toggle theme">
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-backdrop"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'inline-flex' }}>
              <Brain size={22} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }} className="text-gradient">
              MindSpace
            </span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close Menu">
            <X size={20} />
          </button>
        </div>

        <nav className="nav-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="nav-group">
              {group.title && (
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', padding: '0 0.75rem 0.5rem 0.75rem' }}>
                  {group.title}
                </div>
              )}
              <ul className="nav-menu" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path} className="nav-item">
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          background: isActive ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                          borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                          boxShadow: isActive ? 'inset 0 0 0 1px rgba(139, 92, 246, 0.25)' : 'none',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.9rem',
                          transition: 'all 0.15s ease',
                          textDecoration: 'none'
                        })}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)', transition: 'color 0.15s ease' }} />
                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="version-tag">v2.1 Enterprise</span>

          <button
            onClick={toggleDarkMode}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" aria-label={meta.title}>
        <header className="top-bar">
          <div className="page-title">
            {meta.section && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>MindSpace</Link>
                <ChevronRight size={12} />
                <span>{meta.section}</span>
              </div>
            )}
            <h1>{meta.title}</h1>
            {meta.subtitle && <p>{meta.subtitle}</p>}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} {...pageTransition}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;