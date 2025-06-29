
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppView, Reservation } from '../types';

interface DashboardProps {
    setView: (view: AppView) => void;
}

const InfoCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center border-l-4 ${color}`}>
        <div className="mr-4 text-gray-500 dark:text-gray-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const NavCard: React.FC<{ title: string; description: string; view: AppView; setView: (view: AppView) => void; icon: React.ReactNode }> = ({ title, description, view, setView, icon }) => (
    <div
        onClick={() => setView(view)}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 cursor-pointer"
    >
        <div className="flex items-center mb-3">
            <div className="text-emerald-500 mr-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { reservations, expenses } = context;

    const upcomingReservations = reservations.filter(r => new Date(r.checkIn) >= new Date()).length;
    
    const monthlyIncome = reservations
        .filter(r => new Date(r.checkIn).getMonth() === new Date().getMonth())
        .reduce((acc, r) => acc + (r.totalPaid - r.commission - r.taxes), 0);
        
    const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((acc, e) => acc + e.amount, 0);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    const iconClass = "w-10 h-10";
    const navIconClass = "w-8 h-8";

    return (
        <div>
            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">Bienvenido de Nuevo!</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Aquí tienes un resumen rápido del estado de tu cabaña.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <InfoCard title="Próximas Reservas" value={upcomingReservations} color="border-blue-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <InfoCard title="Ganancia Neta (Mes)" value={formatCurrency(monthlyIncome - monthlyExpenses)} color="border-green-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <InfoCard title="Gastos (Mes)" value={formatCurrency(monthlyExpenses)} color="border-red-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NavCard title="Gestionar Reservas" description="Ver calendario y detalles de huéspedes." view="reservations" setView={setView} icon={<svg xmlns="http://www.w3.org/2000/svg" className={navIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <NavCard title="Registrar Gastos" description="Añadir costos de mantenimiento y compras." view="expenses" setView={setView} icon={<svg xmlns="http://www.w3.org/2000/svg" className={navIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <NavCard title="Ver Reportes" description="Analizar finanzas con gráficos detallados." view="reports" setView={setView} icon={<svg xmlns="http://www.w3.org/2000/svg" className={navIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
                <NavCard title="Álbum de Fotos" description="Subir y comparar imágenes de la cabaña." view="photos" setView={setView} icon={<svg xmlns="http://www.w3.org/2000/svg" className={navIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <NavCard title="Servicios Adicionales" description="Configurar y generar carta de servicios." view="services" setView={setView} icon={<svg xmlns="http://www.w3.org/2000/svg" className={navIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m2 10h-4m2 4v-4m6-2a2 2 0 100-4 2 2 0 000 4zm-2-7a2 2 0 100-4 2 2 0 000 4z" /></svg>} />
            </div>
        </div>
    );
};

export default Dashboard;