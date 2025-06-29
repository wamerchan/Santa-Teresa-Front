// Importaciones de PDFMake con ES modules
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar las fuentes para PDFMake de forma segura
try {
    if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
    } else if (pdfFonts) {
        (pdfMake as any).vfs = pdfFonts;
    }
} catch (error) {
    console.warn('Error configurando fuentes de PDFMake:', error);
}

// Tipos para los datos de reportes
export interface MonthlyReportData {
    name: string;
    income: number;
    expenses: number;
    profit: number;
}

export interface ReservationData {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    source: string;
    totalPaid: number;
    commission: number;
    taxes: number;
    guestCount?: number;
    guestPhone?: string;
}

export interface ExpenseData {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

export interface ServiceData {
    id: string;
    name: string;
    description: string;
    cost: number;
    imageUrl?: string;
}

// Función para generar reporte financiero
export const generateFinancialReport = (
    monthlyData: MonthlyReportData[],
    reservations: ReservationData[],
    expenses: ExpenseData[],
    aiSummary?: string
) => {
    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const totalProfit = totalIncome - totalExpenses;

    const docDefinition = {
        content: [
            // Encabezado
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { 
                                text: 'Santa Teresa - Suesca Cundinamarca', 
                                style: 'title'
                            },
                            { 
                                text: 'Reporte Financiero', 
                                style: 'subtitle'
                            }
                        ]
                    },
                    {
                        width: 'auto',
                        stack: [
                            { 
                                text: `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
                                style: 'date'
                            },
                            { 
                                text: `Período: ${monthlyData.length > 0 ? `${monthlyData[0].name} - ${monthlyData[monthlyData.length - 1].name}` : 'Sin datos'}`,
                                style: 'date'
                            }
                        ]
                    }
                ]
            },
            
            { text: '', margin: [0, 20] }, // Espaciado

            // Resumen ejecutivo
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Resumen Ejecutivo', style: 'tableHeader', colSpan: 4, alignment: 'center' },
                            {},
                            {},
                            {}
                        ],
                        [
                            { text: 'Concepto', style: 'tableSubHeader' },
                            { text: 'Ingresos', style: 'tableSubHeader' },
                            { text: 'Gastos', style: 'tableSubHeader' },
                            { text: 'Ganancia', style: 'tableSubHeader' }
                        ],
                        [
                            { text: 'Total Período', style: 'tableCell' },
                            { text: formatCurrency(totalIncome), style: 'tableCellMoney' },
                            { text: formatCurrency(totalExpenses), style: 'tableCellMoney' },
                            { 
                                text: formatCurrency(totalProfit), 
                                style: totalProfit >= 0 ? 'tableCellMoneyPositive' : 'tableCellMoneyNegative'
                            }
                        ]
                    ]
                },
                layout: {
                    fillColor: (rowIndex: number) => {
                        if (rowIndex === 0) return '#3B82F6';
                        if (rowIndex === 1) return '#E5E7EB';
                        return null;
                    },
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#D1D5DB',
                    vLineColor: () => '#D1D5DB'
                }
            },

            { text: '', margin: [0, 20] }, // Espaciado

            // Datos mensuales
            {
                text: 'Análisis Mensual',
                style: 'sectionHeader'
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Mes', style: 'tableSubHeader' },
                            { text: 'Ingresos', style: 'tableSubHeader' },
                            { text: 'Gastos', style: 'tableSubHeader' },
                            { text: 'Ganancia', style: 'tableSubHeader' }
                        ],
                        ...monthlyData.map(month => [
                            { text: month.name, style: 'tableCell' },
                            { text: formatCurrency(month.income), style: 'tableCellMoney' },
                            { text: formatCurrency(month.expenses), style: 'tableCellMoney' },
                            { 
                                text: formatCurrency(month.profit), 
                                style: month.profit >= 0 ? 'tableCellMoneyPositive' : 'tableCellMoneyNegative'
                            }
                        ])
                    ]
                },
                layout: {
                    fillColor: (rowIndex: number) => rowIndex === 0 ? '#F3F4F6' : null,
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#D1D5DB',
                    vLineColor: () => '#D1D5DB'
                }
            },

            // Análisis con IA (si está disponible)
            ...(aiSummary ? [
                { text: '', margin: [0, 20] },
                {
                    text: 'Análisis Inteligente',
                    style: 'sectionHeader'
                },
                {
                    text: aiSummary,
                    style: 'aiSummary',
                    margin: [0, 10, 0, 0]
                }
            ] : []),

            { text: '', margin: [0, 20] }, // Espaciado

            // Estadísticas adicionales
            {
                text: 'Estadísticas Adicionales',
                style: 'sectionHeader'
            },
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: 'Reservaciones', style: 'subSectionHeader' },
                            { text: `Total de reservaciones: ${reservations.length}`, style: 'statText' },
                            { 
                                text: `Ingreso promedio por reservación: ${formatCurrency(reservations.length > 0 ? totalIncome / reservations.length : 0)}`, 
                                style: 'statText' 
                            },
                            {
                                text: `Fuentes principales: ${getTopSources(reservations).join(', ')}`,
                                style: 'statText'
                            }
                        ]
                    },
                    {
                        width: '50%',
                        stack: [
                            { text: 'Gastos', style: 'subSectionHeader' },
                            { text: `Total de gastos: ${expenses.length}`, style: 'statText' },
                            { 
                                text: `Gasto promedio: ${formatCurrency(expenses.length > 0 ? totalExpenses / expenses.length : 0)}`, 
                                style: 'statText' 
                            },
                            {
                                text: `Categorías principales: ${getTopExpenseCategories(expenses).join(', ')}`,
                                style: 'statText'
                            }
                        ]
                    }
                ]
            }
        ],
        styles: {
            title: {
                fontSize: 24,
                bold: true,
                color: '#1F2937',
                margin: [0, 0, 0, 5]
            },
            subtitle: {
                fontSize: 18,
                color: '#374151',
                margin: [0, 0, 0, 10]
            },
            date: {
                fontSize: 10,
                color: '#6B7280',
                alignment: 'right'
            },
            sectionHeader: {
                fontSize: 16,
                bold: true,
                color: '#1F2937',
                margin: [0, 0, 0, 10]
            },
            subSectionHeader: {
                fontSize: 12,
                bold: true,
                color: '#374151',
                margin: [0, 0, 0, 5]
            },
            tableHeader: {
                fontSize: 14,
                bold: true,
                color: 'white',
                fillColor: '#3B82F6'
            },
            tableSubHeader: {
                fontSize: 11,
                bold: true,
                color: '#374151',
                alignment: 'center'
            },
            tableCell: {
                fontSize: 10,
                color: '#374151'
            },
            tableCellMoney: {
                fontSize: 10,
                color: '#374151',
                alignment: 'right'
            },
            tableCellMoneyPositive: {
                fontSize: 10,
                color: '#059669',
                alignment: 'right',
                bold: true
            },
            tableCellMoneyNegative: {
                fontSize: 10,
                color: '#DC2626',
                alignment: 'right',
                bold: true
            },
            aiSummary: {
                fontSize: 11,
                color: '#374151',
                background: '#F0FDF4',
                margin: [10, 10, 10, 10]
            },
            statText: {
                fontSize: 10,
                color: '#6B7280',
                margin: [0, 2]
            }
        },
        defaultStyle: {
            font: 'Roboto'
        },
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        info: {
            title: 'Reporte Financiero - Santa Teresa',
            author: 'Sistema de Gestión Santa Teresa',
            subject: 'Reporte Financiero Mensual',
            creator: 'App Santa Teresa'
        },
        footer: (currentPage: number, pageCount: number) => {
            return {
                text: `Página ${currentPage} de ${pageCount} - Generado el ${new Date().toLocaleString('es-ES')}`,
                alignment: 'center',
                fontSize: 8,
                color: '#6B7280',
                margin: [0, 10]
            };
        }
    };

    return (pdfMake as any).createPdf(docDefinition as any);
};

// Función para generar catálogo de servicios
export const generateServicesReport = (services: ServiceData[]) => {
    const docDefinition = {
        content: [
            // Encabezado
            {
                text: 'Santa Teresa - Suesca Cundinamarca',
                style: 'title',
                alignment: 'center'
            },
            {
                text: 'Catálogo de Servicios',
                style: 'subtitle',
                alignment: 'center'
            },
            
            { text: '', margin: [0, 20] },

            // Servicios
            ...services.map((service, index) => [
                {
                    columns: [
                        {
                            width: '70%',
                            stack: [
                                { text: service.name, style: 'serviceName' },
                                { text: service.description, style: 'serviceDescription' },
                                { text: formatCurrency(service.cost), style: 'servicePrice' }
                            ]
                        },
                        {
                            width: '30%',
                            text: service.imageUrl ? 'Imagen disponible' : 'Sin imagen',
                            style: 'serviceImage',
                            alignment: 'center'
                        }
                    ]
                },
                index < services.length - 1 ? { text: '', margin: [0, 15] } : {}
            ]).flat()
        ],
        styles: {
            title: {
                fontSize: 22,
                bold: true,
                color: '#1F2937'
            },
            subtitle: {
                fontSize: 16,
                color: '#374151',
                margin: [0, 5, 0, 0]
            },
            serviceName: {
                fontSize: 14,
                bold: true,
                color: '#1F2937',
                margin: [0, 0, 0, 5]
            },
            serviceDescription: {
                fontSize: 11,
                color: '#6B7280',
                margin: [0, 0, 0, 8]
            },
            servicePrice: {
                fontSize: 12,
                bold: true,
                color: '#059669'
            },
            serviceImage: {
                fontSize: 10,
                color: '#9CA3AF',
                italics: true
            }
        },
        defaultStyle: {
            font: 'Roboto'
        },
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60]
    };

    return (pdfMake as any).createPdf(docDefinition as any);
};

// Funciones auxiliares
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
};

const getTopSources = (reservations: ReservationData[]): string[] => {
    const sources = reservations.reduce((acc, res) => {
        acc[res.source] = (acc[res.source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([source]) => source);
};

const getTopExpenseCategories = (expenses: ExpenseData[]): string[] => {
    const categories = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);
};
