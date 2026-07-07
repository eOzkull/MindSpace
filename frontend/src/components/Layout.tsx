import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    Brain, House, ChartPie, ListChecks, Crosshair, GitCompare, Moon, Sun,
    Sparkles, ShieldAlert, Lightbulb
} from 'lucide-react';
import { useAppStore, selectTheme, selectIsDarkMode } from '../store/appStore';

const Layout: React.FC = () => {
    const theme = useAppStore(selectTheme);
    const isDark = useAppStore(selectIsDarkMode);
    const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
    const setTheme = useAppStore((s) => s.setTheme);

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

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/':
                return {
                    title: 'Intelligence Hub',
                    subtitle:
                        'Analyze and predict student burnout with precision analytics.',
                };

            case '/dashboard':
                return {
                    title: 'Dashboard',
                    subtitle: 'Detailed overview of your dataset metrics.',
                };

            case '/results':
                return {
                    title: 'Results',
                    subtitle: 'View the final analysis.',
                };

            case '/evaluate':
                return {
                    title: 'Evaluation',
                    subtitle: 'Model performance metrics.',
                };

            case '/compare':
                return {
                    title: 'Compare',
                    subtitle: 'Compare multiple datasets.',
                };

            case '/predict':
                return {
                    title: 'Student Predictor',
                    subtitle: 'Run single-student burnout diagnostic evaluations.',
                };

            case '/anomalies':
                return {
                    title: 'Anomaly Detection',
                    subtitle: 'Identify statistical outliers and behavioral anomalies.',
                };

            case '/recommendations':
                return {
                    title: 'Action Guidelines',
                    subtitle: 'Actionable intervention protocols for student cohort welfare.',
                };

            default:
                return {
                    title: 'MindSpace',
                    subtitle: '',
                };
        }
    };

    const { title, subtitle } = getPageTitle(location.pathname);

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="brand">
                    <Brain size={24} />
                    <span>MindSpace</span>
                </div>

                <ul className="nav-menu">
                    <li className="nav-item">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <House size={18} />
                            <span>Home</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <ChartPie size={18} />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/results"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <ListChecks size={18} />
                            <span>Results</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/evaluate"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Crosshair size={18} />
                            <span>Evaluation</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/compare"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <GitCompare size={18} />
                            <span>Compare</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/predict"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Sparkles size={18} />
                            <span>Predictor</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/anomalies"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <ShieldAlert size={18} />
                            <span>Anomalies</span>
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/recommendations"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <Lightbulb size={18} />
                            <span>Guidelines</span>
                        </NavLink>
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <span className="version-tag">v2.1 Stable</span>

                    <button
                        onClick={toggleDarkMode}
                        className="theme-toggle-btn"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <Moon size={18} />
                        ) : (
                            <Sun size={18} />
                        )}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="page-title">
                        <h1>{title}</h1>
                        <p>{subtitle}</p>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    );
};

export default Layout;