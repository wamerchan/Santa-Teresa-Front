
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Reservations from './views/Reservations';
import Expenses from './views/Expenses';
import Photos from './views/Photos';
import Services from './views/Services';
import Reports from './views/Reports';
import { Reservation, Expense, Photo, Service, AppView } from './types';
import { AppContext } from './contexts/AppContext';

const API_URL = 'http://localhost:4000';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('dashboard');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [reservationsRes, expensesRes, photosRes, servicesRes] = await Promise.all([
                    fetch(`${API_URL}/api/reservations`),
                    fetch(`${API_URL}/api/expenses`),
                    fetch(`${API_URL}/api/photos`),
                    fetch(`${API_URL}/api/services`),
                ]);

                if (!reservationsRes.ok || !expensesRes.ok || !photosRes.ok || !servicesRes.ok) {
                    throw new Error('Error al cargar los datos iniciales. ¿Está el servidor backend corriendo?');
                }

                const reservationsData = await reservationsRes.json();
                const expensesData = await expensesRes.json();
                const photosData = await photosRes.json();
                const servicesData = await servicesRes.json();

                setReservations(reservationsData);
                setExpenses(expensesData);
                setPhotos(photosData);
                setServices(servicesData);

            } catch (err) {
                const fetchError = err instanceof TypeError && err.message === 'Failed to fetch' 
                    ? new Error('No se pudo conectar con el servidor. Por favor, asegúrate de que el backend esté corriendo en http://localhost:4000.')
                    : err;

                setError(fetchError instanceof Error ? fetchError.message : 'Ocurrió un error desconocido.');
                console.error(fetchError);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const appContextValue = useMemo(() => ({
        reservations, setReservations,
        expenses, setExpenses,
        photos, setPhotos,
        services, setServices,
        apiUrl: API_URL,
    }), [reservations, expenses, photos, services]);

    const renderView = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full text-xl">Cargando datos...</div>;
        }
        if (error) {
            return (
                 <div className="flex flex-col justify-center items-center h-full text-center p-4">
                    <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-xl mb-2">Error de Conexión</h3>
                        <p>{error}</p>
                    </div>
                </div>
            );
        }

        switch (view) {
            case 'dashboard':
                return <Dashboard setView={setView} />;
            case 'reservations':
                return <Reservations />;
            case 'expenses':
                return <Expenses />;
            case 'photos':
                return <Photos />;
            case 'services':
                return <Services />;
            case 'reports':
                return <Reports />;
            default:
                return <Dashboard setView={setView} />;
        }
    };

    return (
        <AppContext.Provider value={appContextValue}>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Sidebar currentView={view} setView={setView} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </AppContext.Provider>
    );
};

export default App;