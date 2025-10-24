import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Reservation, ReservationSource, AppContextType, PaymentMethod } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { RefreshCw, Plus } from 'lucide-react';

const ReservationForm: React.FC<{
    initialData?: Reservation | null;
    selectedDate?: string | null;
    onSave: (reservation: Omit<Reservation, 'id'> | Reservation) => void;
    onClose: () => void;
}> = ({ initialData, selectedDate, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Reservation, 'id'>>({
        guestName: '',
        checkIn: '',
        checkOut: '',
        source: ReservationSource.Direct,
        totalPaid: 0,
        commission: 0,
        taxes: 0,
        paymentMethod: PaymentMethod.Cash,
        guestCount: 1,
        guestPhone: '',
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({ 
                ...initialData,
                guestCount: Number(initialData.guestCount) || 1,
                guestPhone: initialData.guestPhone || '',
                totalPaid: Number(initialData.totalPaid) || 0,
                commission: Number(initialData.commission) || 0,
                taxes: Number(initialData.taxes) || 0,
            });
        } else {
             setFormData({
                guestName: '',
                checkIn: selectedDate || '',
                checkOut: '',
                source: ReservationSource.Direct,
                totalPaid: 0,
                commission: 0,
                taxes: 0,
                paymentMethod: PaymentMethod.Cash,
                guestCount: 1,
                guestPhone: '',
            });
        }
    }, [initialData, selectedDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['totalPaid', 'commission', 'taxes', 'guestCount'].includes(name);
        
        if (isNumeric) {
            // Para campos numéricos, solo permitir números enteros
            const numericValue = value === '' ? 0 : parseInt(value, 10);
            if (!isNaN(numericValue)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: numericValue
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(initialData ? { ...initialData, ...formData } : formData);
    };
    
    const inputClass = "w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const isSyncedReservation = Boolean(initialData?.id && initialData?.source !== ReservationSource.Direct);
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} htmlFor="guestName">Nombre del Huésped</label>
                    <input id="guestName" name="guestName" type="text" value={formData.guestName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass} htmlFor="guestPhone">Teléfono</label>
                    <input id="guestPhone" name="guestPhone" type="tel" value={formData.guestPhone} onChange={handleChange} className={inputClass} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} htmlFor="guestCount">Cantidad de Huéspedes</label>
                    <input id="guestCount" name="guestCount" type="number" min="1" value={formData.guestCount} onChange={handleChange} className={inputClass} required step="1" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className={labelClass} htmlFor="paymentMethod">Forma de Pago</label>
                    <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={inputClass}>
                        {Object.values(PaymentMethod).map(pm => <option key={pm} value={pm}>{pm}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClass} htmlFor="totalPaid">Valor Pagado</label>
                    <input 
                        id="totalPaid" 
                        name="totalPaid" 
                        type="number" 
                        value={formData.totalPaid} 
                        onChange={handleChange} 
                        className={inputClass} 
                        required 
                        step="1" 
                        min="0"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[.,]/g, '');
                        }}
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} htmlFor="commission">Comisión</label>
                    <input 
                        id="commission" 
                        name="commission" 
                        type="number" 
                        value={formData.commission} 
                        onChange={handleChange} 
                        className={inputClass} 
                        step="1" 
                        min="0"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[.,]/g, '');
                        }}
                    />
                </div>
                 <div>
                    <label className={labelClass} htmlFor="taxes">Impuestos</label>
                    <input 
                        id="taxes" 
                        name="taxes" 
                        type="number" 
                        value={formData.taxes} 
                        onChange={handleChange} 
                        className={inputClass} 
                        step="1" 
                        min="0"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[.,]/g, '');
                        }}
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Guardar Reserva</button>
            </div>
        </form>
    );
};


const Calendar: React.FC<{ 
    reservations: Reservation[]; 
    onDateClick?: (date: string) => void;
    onReservationClick?: (reservation: Reservation) => void;
}> = ({ reservations, onDateClick, onReservationClick }) => {
    const [date, setDate] = useState(new Date());

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const bookedDays = useMemo(() => {
        const days = new Map<string, Reservation[]>();
        reservations.forEach(res => {
            // Use UTC dates to avoid timezone issues.
            // The check-in date is the first day of the reservation.
            const start = new Date(res.checkIn);
            // The check-out date is the day the guest leaves, so the reservation ends the day before.
            const end = new Date(res.checkOut);

            let current = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));

            while (current < end) {
                const dateString = current.toISOString().split('T')[0];
                if (!days.has(dateString)) {
                    days.set(dateString, []);
                }
                days.get(dateString)?.push(res);
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
        const dayDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), i));
        const dateString = dayDate.toISOString().split('T')[0];
        const dayReservations = bookedDays.get(dateString) || [];
        const isBooked = dayReservations.length > 0;
        const todayUTC = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
        const isToday = todayUTC.toISOString().split('T')[0] === dateString;
        
        const handleDayClick = () => {
            if (isBooked && dayReservations.length > 0 && onReservationClick) {
                // Si hay una reserva en este día, mostrar los detalles de la primera reserva
                onReservationClick(dayReservations[0]);
            } else if (!isBooked && onDateClick) {
                // Si no hay reserva, permitir crear una nueva
                onDateClick(dateString);
            }
        };
        
        days.push(
            <div 
                key={i} 
                className={`p-2 border dark:border-gray-700 rounded-md text-center cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isBooked ? 'bg-rose-300 dark:bg-rose-800' : 'bg-white dark:bg-gray-800'
                } ${
                    isToday ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={handleDayClick}
                title={isBooked ? `Reservado: ${dayReservations.map(r => r.guestName).join(', ')}` : 'Clic para añadir reserva'}
            >
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
    const totalPaid = Number(reservation.totalPaid) || 0;
    const commission = Number(reservation.commission) || 0;
    const taxes = Number(reservation.taxes) || 0;
    const netProfit = totalPaid - commission - taxes;

    const sourceColor = {
        [ReservationSource.Airbnb]: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        [ReservationSource.Booking]: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        [ReservationSource.Direct]: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    };
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    const formatDate = (dateString: string) => dateString.split('T')[0];

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{reservation.guestName}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sourceColor[reservation.source]}`}>{reservation.source}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(reservation.checkIn)} &rarr; {formatDate(reservation.checkOut)}
                </p>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Huéspedes:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{reservation.guestCount}</span>
                    </div>
                    {reservation.guestPhone && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Teléfono:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{reservation.guestPhone}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Forma de Pago:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{reservation.paymentMethod}</span>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Pagado:</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(totalPaid)}</p>
                    </div>
                     <div>
                        <p className="text-gray-500 dark:text-gray-400">Comisión/Imp.:</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(commission + taxes)}</p>
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

const ReservationDetailModal: React.FC<{
    reservation: Reservation;
    onClose: () => void;
    onEdit: (reservation: Reservation) => void;
}> = ({ reservation, onClose, onEdit }) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const totalPaid = Number(reservation.totalPaid) || 0;
    const commission = Number(reservation.commission) || 0;
    const taxes = Number(reservation.taxes) || 0;
    const netProfit = totalPaid - commission - taxes;

    return (
        <Modal isOpen={true} onClose={onClose} title="Detalles de la Reserva">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{reservation.guestName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Huésped principal</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            reservation.source === ReservationSource.Airbnb ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            reservation.source === ReservationSource.Booking ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                            {reservation.source}
                        </span>
                    </div>
                </div>
                
                <div className="border-t pt-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Check-in:</p>
                            <p className="text-gray-900 dark:text-white">{formatDate(reservation.checkIn)}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Check-out:</p>
                            <p className="text-gray-900 dark:text-white">{formatDate(reservation.checkOut)}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Huéspedes:</p>
                            <p className="text-gray-900 dark:text-white">{reservation.guestCount}</p>
                        </div>
                        {reservation.guestPhone && (
                            <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">Teléfono:</p>
                                <p className="text-gray-900 dark:text-white">{reservation.guestPhone}</p>
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Forma de Pago:</p>
                            <p className="text-gray-900 dark:text-white">{reservation.paymentMethod}</p>
                        </div>
                    </div>
                </div>
                
                <div className="border-t pt-4 dark:border-gray-700">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Información Financiera</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Total Pagado</p>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">Comisión + Impuestos</p>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{formatCurrency(commission + taxes)}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900 p-3 rounded-lg">
                            <p className="text-emerald-600 dark:text-emerald-400">Ganancia Neta</p>
                            <p className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{formatCurrency(netProfit)}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                        Cerrar
                    </button>
                    <button onClick={() => onEdit(reservation)} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                        Editar Reserva
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const Reservations: React.FC = () => {
    const context = useContext(AppContext);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [selectedDateForNewReservation, setSelectedDateForNewReservation] = useState<string | null>(null);
    const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState('');
    const [syncSuccess, setSyncSuccess] = useState('');
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
    
    if (!context) return null;
    const { reservations, setReservations, apiUrl } = context as AppContextType;

    const handleSyncCalendars = async () => {
        setIsSyncing(true);
        setSyncError('');
        setSyncSuccess('');
        try {
            console.log('🔄 Iniciando sincronización desde frontend...');
            const response = await fetch(`${apiUrl}/api/reservations/sync`, { method: 'POST' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al sincronizar los calendarios.');
            }
    
            const updatedReservations = await response.json();
            console.log(`✅ Sincronización exitosa: ${updatedReservations.length} reservas totales`);
            
            const bookingCount = updatedReservations.filter((r: Reservation) => r.source === ReservationSource.Booking).length;
            const airbnbCount = updatedReservations.filter((r: Reservation) => r.source === ReservationSource.Airbnb).length;
            const directCount = updatedReservations.filter((r: Reservation) => r.source === ReservationSource.Direct).length;
            
            console.log('📋 Reservas por plataforma:', {
                booking: bookingCount,
                airbnb: airbnbCount,
                direct: directCount,
            });
            
            setSyncSuccess(`Sincronización exitosa: ${bookingCount} de Booking.com, ${airbnbCount} de Airbnb, ${directCount} directas`);
            setReservations(updatedReservations);
            
            // Limpiar mensaje de éxito después de 5 segundos
            setTimeout(() => setSyncSuccess(''), 5000);
    
        } catch (error) {
            console.error("❌ Error syncing calendars:", error);
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
        setSelectedDateForNewReservation(null);
        setIsFormModalOpen(true);
    };

    const handleCalendarDateClick = (date: string) => {
        setSelectedDateForNewReservation(date);
        setEditingReservation(null);
        setIsFormModalOpen(true);
    };

    const handleCalendarReservationClick = (reservation: Reservation) => {
        setViewingReservation(reservation);
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
        setSelectedDateForNewReservation(null);
    };

    const handleCloseDetailModal = () => {
        setViewingReservation(null);
    };

    const handleEditFromDetail = (reservation: Reservation) => {
        setViewingReservation(null);
        setTimeout(() => {
            setEditingReservation(reservation);
            setSelectedDateForNewReservation(null);
            setIsFormModalOpen(true);
        }, 0);
    };

    return (
        <div>
            <Header title="Reservas">
                <button
                    onClick={handleSyncCalendars}
                    disabled={isSyncing}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isSyncing ? (
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    ) : (
                       <RefreshCw className="h-5 w-5 mr-2" />
                    )}
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                <button
                    onClick={handleStartAddNew}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-md"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Añadir Reserva
                </button>
            </Header>

            {syncError && (
                <div className="my-4 p-3 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 rounded-md" role="alert">
                    <p><strong>Error de Sincronización:</strong> {syncError}</p>
                </div>
            )}

            {syncSuccess && (
                <div className="my-4 p-3 bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 rounded-md" role="alert">
                    <p><strong>Sincronización Exitosa:</strong> {syncSuccess}</p>
                </div>
            )}

            <Calendar 
                reservations={reservations} 
                onDateClick={handleCalendarDateClick}
                onReservationClick={handleCalendarReservationClick}
            />

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
                    selectedDate={selectedDateForNewReservation}
                    onSave={handleSaveReservation} 
                    onClose={handleCloseModal} 
                />
            </Modal>

            {viewingReservation && (
                <ReservationDetailModal
                    reservation={viewingReservation}
                    onClose={handleCloseDetailModal}
                    onEdit={handleEditFromDetail}
                />
            )}

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