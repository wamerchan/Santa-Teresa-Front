import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Reservation, ReservationSource, AppContextType } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';

const ReservationForm: React.FC<{
    initialData?: Reservation | null;
    onSave: (reservation: Omit<Reservation, 'id'> | Reservation) => void;
    onClose: () => void;
}> = ({ initialData, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Reservation, 'id'>>({
        guestName: '',
        checkIn: '',
        checkOut: '',
        source: ReservationSource.Direct,
        totalPaid: 0,
        commission: 0,
        taxes: 0,
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
        } else {
             setFormData({
                guestName: '',
                checkIn: '',
                checkOut: '',
                source: ReservationSource.Direct,
                totalPaid: 0,
                commission: 0,
                taxes: 0,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'totalPaid' || name === 'commission' || name === 'taxes' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(initialData ? { ...initialData, ...formData } : formData);
    };
    
    const inputClass = "w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const isSyncedReservation = initialData?.source !== ReservationSource.Direct;
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} htmlFor="guestName">Nombre del Huésped</label>
                    <input id="guestName" name="guestName" type="text" value={formData.guestName} onChange={handleChange} className={inputClass} required />
                </div>
                 <div>
                    <label className={labelClass} htmlFor="source">Plataforma</label>
                    <select id="source" name="source" value={formData.source} onChange={handleChange} className={`${inputClass} disabled:bg-gray-200 dark:disabled:bg-gray-600`} required disabled={isSyncedReservation}>
                        {Object.values(ReservationSource).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className={labelClass} htmlFor="checkIn">Check-In</label>
                    <input id="checkIn" name="checkIn" type="date" value={formData.checkIn} onChange={handleChange} className={`${inputClass} disabled:bg-gray-200 dark:disabled:bg-gray-600`} required disabled={isSyncedReservation} />
                </div>
                <div>
                    <label className={labelClass} htmlFor="checkOut">Check-Out</label>
                    <input id="checkOut" name="checkOut" type="date" value={formData.checkOut} onChange={handleChange} className={`${inputClass} disabled:bg-gray-200 dark:disabled:bg-gray-600`} required disabled={isSyncedReservation} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={labelClass} htmlFor="totalPaid">Valor Pagado</label>
                    <input id="totalPaid" name="totalPaid" type="number" value={formData.totalPaid} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass} htmlFor="commission">Comisión</label>
                    <input id="commission" name="commission" type="number" value={formData.commission} onChange={handleChange} className={inputClass} />
                </div>
                 <div>
                    <label className={labelClass} htmlFor="taxes">Impuestos</label>
                    <input id="taxes" name="taxes" type="number" value={formData.taxes} onChange={handleChange} className={inputClass} />
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Guardar Reserva</button>
            </div>
        </form>
    );
};


const Calendar: React.FC<{ reservations: Reservation[] }> = ({ reservations }) => {
    const [date, setDate] = useState(new Date());

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const bookedDays = useMemo(() => {
        const days = new Set<string>();
        reservations.forEach(res => {
            let current = new Date(res.checkIn + 'T00:00:00');
            const end = new Date(res.checkOut + 'T00:00:00');
            while (current < end) {
                days.add(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        });
        return days;
    }, [reservations]);

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="border dark:border-gray-700 rounded-md"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
        const dateString = dayDate.toISOString().split('T')[0];
        const isBooked = bookedDays.has(dateString);
        const isToday = new Date().toISOString().split('T')[0] === dateString;
        
        days.push(
            <div key={i} className={`p-2 border dark:border-gray-700 rounded-md text-center ${isBooked ? 'bg-rose-300 dark:bg-rose-800' : 'bg-white dark:bg-gray-800'} ${isToday ? 'ring-2 ring-emerald-500' : ''}`}>
                {i}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">&lt;</button>
                <h3 className="text-xl font-semibold">{date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => <div key={`${day}-${index}`} className="font-bold text-center">{day}</div>)}
                {days}
            </div>
        </div>
    );
};


const ReservationCard: React.FC<{reservation: Reservation, onDelete: (id: string) => void, onEdit: (reservation: Reservation) => void}> = ({ reservation, onDelete, onEdit }) => {
    const netProfit = reservation.totalPaid - reservation.commission - reservation.taxes;
    const sourceColor = {
        [ReservationSource.Airbnb]: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        [ReservationSource.Booking]: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        [ReservationSource.Direct]: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    };
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{reservation.guestName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sourceColor[reservation.source]}`}>{reservation.source}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {reservation.checkIn} &rarr; {reservation.checkOut}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Pagado:</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(reservation.totalPaid)}</p>
                    </div>
                     <div>
                        <p className="text-gray-500 dark:text-gray-400">Comisión/Imp.:</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(reservation.commission + reservation.taxes)}</p>
                    </div>
                </div>
                 <div className="mt-2 border-t pt-2 dark:border-gray-700">
                     <p className="text-gray-500 dark:text-gray-400">Ganancia Neta:</p>
                     <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(netProfit)}</p>
                 </div>
            </div>
            <div className="mt-4 flex justify-end items-center space-x-4">
                 <button onClick={() => onEdit(reservation)} className="text-xs font-semibold px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">EDITAR</button>
                <button onClick={() => onDelete(reservation.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
            </div>
        </div>
    );
};

const Reservations: React.FC = () => {
    const context = useContext(AppContext);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState('');
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
    
    if (!context) return null;
    const { reservations, setReservations, apiUrl } = context as AppContextType;

    const handleSyncCalendars = async () => {
        setIsSyncing(true);
        setSyncError('');
        try {
            const response = await fetch(`${apiUrl}/api/reservations/sync`, { method: 'POST' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al sincronizar los calendarios.');
            }
    
            const updatedReservations = await response.json();
            setReservations(updatedReservations);
    
        } catch (error) {
            console.error("Error syncing calendars:", error);
            setSyncError(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveReservation = async (reservationData: Omit<Reservation, 'id'> | Reservation) => {
        try {
            let response;
            let updatedReservation: Reservation;

            if ('id' in reservationData) { // Editing existing reservation
                response = await fetch(`${apiUrl}/api/reservations/${reservationData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservationData),
                });
                if (!response.ok) throw new Error('Error al actualizar la reserva');
                updatedReservation = await response.json();
                setReservations(prev => prev.map(r => (r.id === updatedReservation.id ? updatedReservation : r)));
            } else { // Creating new reservation
                response = await fetch(`${apiUrl}/api/reservations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservationData),
                });
                if (!response.ok) throw new Error('Error al crear la reserva');
                updatedReservation = await response.json();
                setReservations(prev => [...prev, updatedReservation]);
            }
            setIsFormModalOpen(false);
            setEditingReservation(null);
        } catch (error) {
            console.error("Error saving reservation:", error);
            alert(error instanceof Error ? error.message : 'Error al guardar');
        }
    };
    
    const handleStartEdit = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsFormModalOpen(true);
    };

    const handleStartAddNew = () => {
        setEditingReservation(null);
        setIsFormModalOpen(true);
    };

    const handleDeleteReservation = async (id: string) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
            try {
                const response = await fetch(`${apiUrl}/api/reservations/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar la reserva');
                setReservations(prev => prev.filter(r => r.id !== id));
            } catch (error) {
                console.error("Error deleting reservation:", error);
                alert(error instanceof Error ? error.message : 'Error al eliminar');
            }
        }
    };
    
    const filteredReservations = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (filter === 'upcoming') {
            return reservations.filter(r => r.checkOut >= todayStr);
        }
        if (filter === 'past') {
            return reservations.filter(r => r.checkOut < todayStr);
        }
        return reservations;
    }, [reservations, filter]);
    
    const sortedReservations = [...filteredReservations].sort((a,b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
    
    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setEditingReservation(null);
    }

    return (
        <div>
            <Header title="Reservas">
                <button
                    onClick={handleSyncCalendars}
                    disabled={isSyncing}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isSyncing ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5m-5 0a9 9 0 0014.23 4.23l1.77-1.77M20 20v-5h-5m5 0a9 9 0 00-14.23-4.23l-1.77 1.77" /></svg>
                    )}
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                <button
                    onClick={handleStartAddNew}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Añadir Reserva
                </button>
            </Header>

            {syncError && (
                <div className="my-4 p-3 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 rounded-md" role="alert">
                    <p><strong>Error de Sincronización:</strong> {syncError}</p>
                </div>
            )}

            <Calendar reservations={reservations} />

            <div className="mb-6 mt-8 flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                <button onClick={() => setFilter('upcoming')} className={`w-full rounded-md py-2 text-sm font-medium leading-5 transition ${filter === 'upcoming' ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-white/50'}`}>
                    Próximas
                </button>
                <button onClick={() => setFilter('past')} className={`w-full rounded-md py-2 text-sm font-medium leading-5 transition ${filter === 'past' ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-white/50'}`}>
                    Pasadas
                </button>
                <button onClick={() => setFilter('all')} className={`w-full rounded-md py-2 text-sm font-medium leading-5 transition ${filter === 'all' ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-white/50'}`}>
                    Todas
                </button>
            </div>
            
            <Modal isOpen={isFormModalOpen} onClose={handleCloseModal} title={editingReservation ? 'Editar Reserva' : 'Nueva Reserva'}>
                <ReservationForm 
                    initialData={editingReservation} 
                    onSave={handleSaveReservation} 
                    onClose={handleCloseModal} 
                />
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedReservations.length > 0 ? (
                   sortedReservations.map(res => <ReservationCard key={res.id} reservation={res} onEdit={handleStartEdit} onDelete={handleDeleteReservation} />)
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                        No hay reservas que coincidan con este filtro.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Reservations;