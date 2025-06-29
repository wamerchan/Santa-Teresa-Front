import React from 'react';

export type AppView = 'dashboard' | 'reservations' | 'expenses' | 'photos' | 'services' | 'reports';

export enum ReservationSource {
    Airbnb = 'Airbnb',
    Booking = 'Booking.com',
    Direct = 'Directo'
}

export enum PaymentMethod {
    Cash = 'Efectivo',
    Nequi = 'Nequi',
    Daviplata = 'Daviplata',
    Paypal = 'Paypal',
    Other = 'Otro'
}

export interface Reservation {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    source: ReservationSource;
    totalPaid: number;
    commission: number;
    taxes: number;
    paymentMethod?: PaymentMethod;
    guestCount?: number;
    guestPhone?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
}

export enum ExpenseCategory {
    Maintenance = 'Mantenimiento',
    Improvements = 'Mejoras',
    Furniture = 'Mobiliario',
    Supplies = 'Insumos',
    Cleaning = 'Limpieza',
    Utilities = 'Servicios Públicos'
}

export interface Photo {
    id: string;
    url: string; // Now a relative path to the backend, e.g., /uploads/image.jpg
    uploadDate: string;
    description: string;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    cost: number;
    imageUrl: string; // Now a relative path to the backend
}

export interface AppContextType {
    reservations: Reservation[];
    setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    photos: Photo[];
    setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    apiUrl: string;
}