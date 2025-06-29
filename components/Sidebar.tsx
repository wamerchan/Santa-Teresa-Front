import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
    currentView: AppView;
    setView: (view: AppView) => void;
}

const NavItem: React.FC<{
    view: AppView;
    currentView: AppView;
    setView: (view: AppView) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ view, currentView, setView, icon, label }) => {
    const isActive = currentView === view;
    return (
        <li
            onClick={() => setView(view)}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="ml-3 font-medium">{label}</span>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    const iconClass = "w-6 h-6";
    const navItems: { view: AppView; label: string; icon: React.ReactNode; }[] = [
        { view: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        { view: 'reservations', label: 'Reservas', icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { view: 'reports', label: 'Reportes', icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
        { view: 'expenses', label: 'Gastos', icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { view: 'photos', label: 'Fotos', icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { view: 'services', label: 'Servicios', icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m2 10h-4m2 4v-4m6-2a2 2 0 100-4 2 2 0 000 4zm-2-7a2 2 0 100-4 2 2 0 000 4z" /></svg> },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex-shrink-0">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-500 text-center">
                    Cabaña Gestor
                </h1>
            </div>
            <nav className="mt-4 px-2">
                <ul>
                    {navItems.map(item => (
                        <NavItem key={item.view} {...item} currentView={currentView} setView={setView} />
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;