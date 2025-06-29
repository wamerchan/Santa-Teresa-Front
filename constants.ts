
import { Reservation, ReservationSource, Expense, ExpenseCategory, Photo, Service } from './types';

export const DUMMY_RESERVATIONS: Reservation[] = [
    {
        id: 'res1',
        guestName: 'Juan Pérez',
        checkIn: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        checkOut: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
        source: ReservationSource.Airbnb,
        totalPaid: 300,
        commission: 45,
        taxes: 20
    },
    {
        id: 'res2',
        guestName: 'Ana García',
        checkIn: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
        checkOut: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString().split('T')[0],
        source: ReservationSource.Booking,
        totalPaid: 220,
        commission: 33,
        taxes: 15
    },
    {
        id: 'res3',
        guestName: 'Carlos López',
        checkIn: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
        checkOut: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
        source: ReservationSource.Direct,
        totalPaid: 250,
        commission: 0,
        taxes: 0
    }
];

export const DUMMY_EXPENSES: Expense[] = [
    {
        id: 'exp1',
        description: 'Reparación de grifo',
        amount: 50,
        category: ExpenseCategory.Maintenance,
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().split('T')[0]
    },
    {
        id: 'exp2',
        description: 'Compra de nuevo sofá',
        amount: 450,
        category: ExpenseCategory.Furniture,
        date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    },
    {
        id: 'exp3',
        description: 'Servicio de limpieza profundo',
        amount: 80,
        category: ExpenseCategory.Cleaning,
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0]
    }
];

export const DUMMY_PHOTOS: Photo[] = [
    {
        id: 'photo1',
        url: 'https://picsum.photos/seed/cabin1/800/600',
        uploadDate: '2023-05-10',
        description: 'Vista exterior de la cabaña (Antes de la remodelación)'
    },
    {
        id: 'photo2',
        url: 'https://picsum.photos/seed/cabin2/800/600',
        uploadDate: '2024-03-20',
        description: 'Vista exterior de la cabaña (Después de pintar)'
    },
    {
        id: 'photo3',
        url: 'https://picsum.photos/seed/cabin3/800/600',
        uploadDate: '2023-05-11',
        description: 'Interior, sala de estar (Mobiliario antiguo)'
    },
    {
        id: 'photo4',
        url: 'https://picsum.photos/seed/cabin4/800/600',
        uploadDate: '2024-04-01',
        description: 'Interior, sala de estar (Con sofá nuevo)'
    }
];

export const DUMMY_SERVICES: Service[] = [
    {
        id: 'serv1',
        name: 'Servicio de Parrilla',
        description: 'Incluye carbón, utensilios y limpieza posterior.',
        cost: 25,
        imageUrl: 'https://picsum.photos/seed/grill/400/300'
    },
    {
        id: 'serv2',
        name: 'Noche de Fogata',
        description: 'Madera, malvaviscos y todo lo necesario para una noche mágica.',
        cost: 30,
        imageUrl: 'https://picsum.photos/seed/bonfire/400/300'
    },
    {
        id: 'serv3',
        name: 'Desayuno Campestre',
        description: 'Huevos de granja, pan artesanal, fruta fresca y café.',
        cost: 15,
        imageUrl: 'https://picsum.photos/seed/breakfast/400/300'
    }
];
