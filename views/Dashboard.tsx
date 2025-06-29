
import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppView } from '../types';
import { 
    Calendar, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Receipt,
    Users,
    PieChart,
    Camera,
    Settings
} from 'lucide-react';

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

const MonthlyIncomeCard: React.FC<{ 
    reservations: any[], 
    expenses: any[], 
    formatCurrency: (amount: number) => string,
    iconClass: string 
}> = ({ reservations, expenses, formatCurrency, iconClass }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const monthlyIncome = reservations
        .filter(r => {
            const reservationDate = new Date(r.checkIn);
            return reservationDate.getMonth() === selectedMonth && reservationDate.getFullYear() === selectedYear;
        })
        .reduce((acc, r) => acc + (r.totalPaid - r.commission - r.taxes), 0);
        
    const monthlyExpenses = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
        })
        .reduce((acc, e) => acc + e.amount, 0);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const years = Array.from(new Set([
        ...reservations.map(r => new Date(r.checkIn).getFullYear()),
        ...expenses.map(e => new Date(e.date).getFullYear()),
        new Date().getFullYear()
    ])).sort((a, b) => b - a);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-emerald-500">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="mr-4 text-gray-500 dark:text-gray-400">
                        <TrendingUp className={iconClass} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Ganancia Neta (Mes)</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(monthlyIncome - monthlyExpenses)}</p>
                    </div>
                </div>
            </div>
            <div className="flex space-x-2">
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                    {months.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                    ))}
                </select>
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

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
    
    const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((acc, e) => acc + e.amount, 0);

    // Calcular totales
    const totalIncome = reservations.reduce((acc, r) => acc + (r.totalPaid - r.commission - r.taxes), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    const iconClass = "w-10 h-10";
    const navIconClass = "w-8 h-8";

    return (
        <div>
            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">Bienvenido de Nuevo!</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Aquí tienes un resumen rápido del estado de Santa Teresa.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <InfoCard title="Próximas Reservas" value={upcomingReservations} color="border-blue-500" icon={<Calendar className={iconClass} />} />
                <MonthlyIncomeCard 
                    reservations={reservations} 
                    expenses={expenses} 
                    formatCurrency={formatCurrency}
                    iconClass={iconClass}
                />
                <InfoCard title="Gastos (Mes)" value={formatCurrency(monthlyExpenses)} color="border-red-500" icon={<TrendingDown className={iconClass} />} />
                <InfoCard title="Ganancia Total" value={formatCurrency(totalIncome)} color="border-green-600" icon={<DollarSign className={iconClass} />} />
                <InfoCard title="Gastos Totales" value={formatCurrency(totalExpenses)} color="border-orange-500" icon={<Receipt className={iconClass} />} />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NavCard title="Gestionar Reservas" description="Ver calendario y detalles de huéspedes." view="reservations" setView={setView} icon={<Users className={navIconClass} />} />
                <NavCard title="Registrar Gastos" description="Añadir costos de mantenimiento y compras." view="expenses" setView={setView} icon={<Receipt className={navIconClass} />} />
                <NavCard title="Ver Reportes" description="Analizar finanzas con gráficos detallados." view="reports" setView={setView} icon={<PieChart className={navIconClass} />} />
                <NavCard title="Álbum de Fotos" description="Subir y comparar imágenes de Santa Teresa." view="photos" setView={setView} icon={<Camera className={navIconClass} />} />
                <NavCard title="Servicios Adicionales" description="Configurar y generar carta de servicios." view="services" setView={setView} icon={<Settings className={navIconClass} />} />
            </div>
        </div>
    );
};

export default Dashboard;