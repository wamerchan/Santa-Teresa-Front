import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AppContextType } from '../types';
import { generateFinancialReport, MonthlyReportData } from '../utils/pdfMakeUtilsAsync';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    LineChart, 
    Line 
} from 'recharts';

const Reports: React.FC = () => {
    const context = useContext(AppContext);
    const [aiSummary, setAiSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    if (!context) return null;
    const { reservations, expenses, apiUrl } = context as AppContextType;

    // Calcular datos mensuales con useMemo ANTES de cualquier return condicional
    const monthlyData = useMemo(() => {
        // Agrupar datos por mes
        const monthlyStats = new Map<string, { income: number; expenses: number }>();

        // Procesar reservas
        reservations.forEach(reservation => {
            const monthKey = reservation.checkIn.substring(0, 7); // YYYY-MM
            const totalPaid = Number(reservation.totalPaid) || 0;
            const commission = Number(reservation.commission) || 0;
            const taxes = Number(reservation.taxes) || 0;
            const netProfit = totalPaid - commission - taxes;

            if (!monthlyStats.has(monthKey)) {
                monthlyStats.set(monthKey, { income: 0, expenses: 0 });
            }
            const stats = monthlyStats.get(monthKey)!;
            stats.income += netProfit;
        });

        // Procesar gastos
        expenses.forEach(expense => {
            const monthKey = expense.date.substring(0, 7); // YYYY-MM
            if (!monthlyStats.has(monthKey)) {
                monthlyStats.set(monthKey, { income: 0, expenses: 0 });
            }
            const stats = monthlyStats.get(monthKey)!;
            stats.expenses += Number(expense.amount) || 0;
        });

        // Convertir a array y ordenar
        return Array.from(monthlyStats.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, values]) => ({
                name: new Date(month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
                Ingresos: values.income,
                Gastos: values.expenses,
                Ganancia: values.income - values.expenses,
            }));
    }, [reservations, expenses]);

    const handleGenerateSummary = async () => {
        if (!monthlyData || monthlyData.length === 0) {
            setError("No hay datos suficientes para generar un resumen.");
            return;
        }
        
        setIsGenerating(true);
        setError('');
        setAiSummary('');
    
        try {
            const response = await fetch(`${apiUrl}/api/reports/summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ monthlyData }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al generar el resumen con IA.');
            }
            
            const { summary } = await response.json();
            setAiSummary(summary);
    
        } catch (e) {
            console.error("Error generating AI summary:", e);
            setError(e instanceof Error ? e.message : "Hubo un error al contactar al servicio de IA. Revisa la consola del servidor para más detalles.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Función para generar PDF con PDFMake
    const handleGeneratePDF = async () => {
        try {
            console.log('🔄 Iniciando generación de PDF...');
            
            // Validar que hay datos
            if (!monthlyData || monthlyData.length === 0) {
                setError('No hay datos suficientes para generar el reporte. Agrega algunas reservas y gastos primero.');
                return;
            }

            // Convertir monthlyData al formato requerido por PDFMake
            const reportData: MonthlyReportData[] = monthlyData.map(month => ({
                name: month.name,
                income: month.Ingresos,
                expenses: month.Gastos,
                profit: month.Ganancia
            }));

            console.log('📊 Datos procesados:', reportData.length, 'meses');

            // Generar el PDF
            const pdfDoc = await generateFinancialReport(
                reportData,
                reservations,
                expenses,
                aiSummary || undefined
            );

            console.log('✅ PDF generado exitosamente');

            // Descargar el PDF
            pdfDoc.download(`reporte-financiero-santa-teresa-${new Date().toISOString().split('T')[0]}.pdf`);
            
            // Limpiar errores previos
            setError('');
            
        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            
            if (error instanceof Error) {
                if (error.message.includes('PDFMake')) {
                    setError('Error de configuración de PDFMake. Recarga la página e inténtalo de nuevo.');
                } else if (error.message.includes('import')) {
                    setError('Error al cargar las librerías de PDF. Verifica tu conexión e inténtalo de nuevo.');
                } else {
                    setError(`Error específico: ${error.message}`);
                }
            } else {
                setError('Error desconocido al generar el PDF. Inténtalo de nuevo.');
            }
        }
    };

    const formatCurrencyTick = (tick: number) => new Intl.NumberFormat('es-CO', { notation: 'compact', compactDisplay: 'short' }).format(tick);
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
            return (
                <div className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-lg">
                    <p className="font-bold text-gray-800 dark:text-gray-100">{label}</p>
                    {payload.map((p: any) => (
                        <p key={p.name} style={{ color: p.color }}>{`${p.name}: ${formatCurrency(p.value)}`}</p>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Reportes Financieros</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">Ingresos vs. Gastos Mensuales</h3>
                {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                            <XAxis dataKey="name" stroke="rgba(128,128,128,0.7)"/>
                            <YAxis tickFormatter={formatCurrencyTick} stroke="rgba(128,128,128,0.7)"/>
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(236, 252, 241, 0.5)'}}/>
                            <Legend />
                            <Bar dataKey="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]}/>
                            <Bar dataKey="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500 py-10">No hay suficientes datos para generar el reporte.</p>
                )}
            </div>
            
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Evolución de Ganancias</h3>
                 {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)"/>
                            <XAxis dataKey="name" stroke="rgba(128,128,128,0.7)"/>
                            <YAxis tickFormatter={formatCurrencyTick} stroke="rgba(128,128,128,0.7)"/>
                            <Tooltip content={<CustomTooltip />}/>
                            <Legend />
                            <Line type="monotone" dataKey="Ganancia" stroke="#3B82F6" strokeWidth={3} dot={{r: 5}} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                 ) : (
                    <p className="text-center text-gray-500 py-10">No hay suficientes datos para generar el reporte.</p>
                 )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
                <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-xl font-bold ml-3 text-gray-800 dark:text-gray-100">Análisis con IA</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Obtén un resumen automático de tus finanzas utilizando inteligencia artificial.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating || monthlyData.length === 0}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center"
                    >
                        {isGenerating && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isGenerating ? 'Generando...' : 'Generar Resumen Financiero'}
                    </button>
                    
                    <button
                        onClick={handleGeneratePDF}
                        disabled={monthlyData.length === 0}
                        className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descargar PDF
                    </button>
                </div>
                
                {error && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 rounded-md">
                        <p>{error}</p>
                    </div>
                )}

                {aiSummary && !isGenerating && (
                    <div className="mt-4 p-4 bg-emerald-50 dark:bg-gray-700 rounded-md border border-emerald-200 dark:border-gray-600">
                        <p className="text-gray-700 dark:text-gray-200" style={{ whiteSpace: 'pre-wrap' }}>
                            {aiSummary}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;