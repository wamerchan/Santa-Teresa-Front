
import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Expense, ExpenseCategory, AppContextType } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';

const ExpenseForm: React.FC<{
    onSave: (expense: Omit<Expense, 'id'>) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Maintenance);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ description, amount, category, date });
    };

    const inputClass = "w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass} htmlFor="description">Descripción</label>
                <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} htmlFor="amount">Monto</label>
                    <input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass} htmlFor="category">Categoría</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className={inputClass} required>
                        {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label className={labelClass} htmlFor="date">Fecha</label>
                <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Guardar Gasto</button>
            </div>
        </form>
    );
};

const ExpenseItem: React.FC<{expense: Expense, onDelete: (id: string) => void}> = ({ expense, onDelete }) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">{expense.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category} - {expense.date}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</p>
                <button onClick={() => onDelete(expense.id)} className="text-xs text-gray-500 hover:text-red-500 mt-1">Eliminar</button>
            </div>
        </div>
    );
}

const Expenses: React.FC = () => {
    const context = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!context) return null;
    const { expenses, setExpenses, apiUrl } = context as AppContextType;

    const handleAddExpense = async (newExpenseData: Omit<Expense, 'id'>) => {
        try {
            const response = await fetch(`${apiUrl}/api/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpenseData),
            });
            if (!response.ok) throw new Error('Error al añadir el gasto');
            const addedExpense = await response.json();
            setExpenses(prev => [...prev, addedExpense]);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error adding expense:", error);
            alert(error instanceof Error ? error.message : 'Error al añadir gasto');
        }
    };

    const handleDeleteExpense = async (id: string) => {
         if(window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            try {
                const response = await fetch(`${apiUrl}/api/expenses/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar el gasto');
                setExpenses(prev => prev.filter(e => e.id !== id));
            } catch (error) {
                console.error("Error deleting expense:", error);
                alert(error instanceof Error ? error.message : 'Error al eliminar gasto');
            }
        }
    };

    const sortedExpenses = [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <Header title="Gastos">
                 <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Añadir Gasto
                </button>
            </Header>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Gasto">
                <ExpenseForm onSave={handleAddExpense} onClose={() => setIsModalOpen(false)} />
            </Modal>

            <div className="space-y-4">
                {sortedExpenses.length > 0 ? (
                    sortedExpenses.map(exp => <ExpenseItem key={exp.id} expense={exp} onDelete={handleDeleteExpense} />)
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No hay gastos registrados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Expenses;