
import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Service, AppContextType } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';

// This needs to be declared because the script is loaded globally in index.html
declare const jspdf: any;
declare const html2canvas: any;

const ServiceForm: React.FC<{
    onSave: (formData: FormData) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('cost', cost.toString());
        if (imageFile) {
            formData.append('image', imageFile);
        }
        onSave(formData);
    };
    
    const inputClass = "w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass} htmlFor="name">Nombre del Servicio</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label className={labelClass} htmlFor="description">Descripción</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3}></textarea>
            </div>
            <div>
                <label className={labelClass} htmlFor="cost">Costo</label>
                <input id="cost" type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className={inputClass} required />
            </div>
            <div>
                 <label className={labelClass} htmlFor="image">Imagen del Servicio (Requerida)</label>
                 <input id="image" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Guardar Servicio</button>
            </div>
        </form>
    );
};

const ServiceCard: React.FC<{ service: Service, onDelete: (id: string) => void; apiUrl: string }> = ({ service, onDelete, apiUrl }) => {
     const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
            <img src={`${apiUrl}${service.imageUrl}`} alt={service.name} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{service.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow my-2">{service.description}</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">{formatCurrency(service.cost)}</p>
                <button onClick={() => onDelete(service.id)} className="text-xs text-red-500 hover:text-red-700 self-end">Eliminar</button>
            </div>
        </div>
    );
};


const ServicesPDFMenu: React.FC<{ services: Service[]; apiUrl: string }> = ({ services, apiUrl }) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
    // We need to fetch images as base64 to embed them in the PDF
    const [base64Images, setBase64Images] = useState<{[key: string]: string}>({});
    const [imagesLoaded, setImagesLoaded] = useState(false);

    React.useEffect(() => {
        const fetchImages = async () => {
            const imagePromises = services.map(async (service) => {
                const response = await fetch(`${apiUrl}${service.imageUrl}`);
                const blob = await response.blob();
                return new Promise<[string, string]>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve([service.id, reader.result as string]);
                    };
                    reader.readAsDataURL(blob);
                });
            });
            const imageMap = Object.fromEntries(await Promise.all(imagePromises));
            setBase64Images(imageMap);
            setImagesLoaded(true);
        };
        if(services.length > 0) fetchImages();
        else setImagesLoaded(true);
    }, [services, apiUrl]);

    if (!imagesLoaded) return <div className="p-10">Cargando imágenes para PDF...</div>

    return (
        <div className="p-10 bg-white" style={{ width: '210mm', minHeight: '297mm'}}>
            <div className="text-center mb-10 border-b-2 pb-4 border-gray-800">
                <h1 className="text-4xl font-serif text-gray-800">Carta de Servicios</h1>
                <p className="text-lg text-gray-600 mt-2">Cabaña "El Refugio"</p>
            </div>
            <div className="space-y-8">
                {services.map(service => (
                     <div key={service.id} className="flex items-start space-x-6">
                        <img src={base64Images[service.id]} alt={service.name} className="w-32 h-32 object-cover rounded-lg shadow-md" crossOrigin="anonymous" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900">{service.name}</h2>
                            <p className="text-md text-gray-700 mt-1">{service.description}</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-3">{formatCurrency(service.cost)}</p>
                        </div>
                    </div>
                ))}
            </div>
             <div className="text-center mt-12 text-sm text-gray-500">
                <p>Precios vigentes. Consulta con nosotros para reservar cualquier servicio.</p>
            </div>
        </div>
    );
};

const Services: React.FC = () => {
    const context = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    if (!context) return null;
    const { services, setServices, apiUrl } = context as AppContextType;

    const handleAddService = async (formData: FormData) => {
        try {
            const response = await fetch(`${apiUrl}/api/services`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Error al añadir el servicio.');
            const newService = await response.json();
            setServices(prev => [...prev, newService]);
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error al añadir el servicio');
        }
    };
    
    const handleDeleteService = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
            try {
                const response = await fetch(`${apiUrl}/api/services/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar el servicio.');
                setServices(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error(error);
                alert(error instanceof Error ? error.message : 'Error al eliminar el servicio.');
            }
        }
    };
    
    const generatePdf = async () => {
        setIsGeneratingPdf(true);
        // Timeout to allow state to update and render the PDF content
        setTimeout(async () => {
            const pdfElement = pdfRef.current;
            if (pdfElement) {
                const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = imgWidth / imgHeight;
                let newImgWidth = pdfWidth;
                let newImgHeight = newImgWidth / ratio;

                // if image height is bigger than page height, scale image to fit page height
                if (newImgHeight > pdfHeight) {
                    newImgHeight = pdfHeight;
                    newImgWidth = newImgHeight * ratio;
                }

                pdf.addImage(imgData, 'PNG', 0, 0, newImgWidth, newImgHeight);
                pdf.save("carta-de-servicios.pdf");
            }
            setIsGeneratingPdf(false);
        }, 500); // Increased timeout to allow images to load for PDF
    };

    return (
        <div>
            <Header title="Servicios Adicionales">
                 <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Añadir Servicio
                </button>
            </Header>
            
            <div className="mb-6">
                <button
                    onClick={generatePdf}
                    disabled={isGeneratingPdf}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:bg-blue-300"
                >
                    {isGeneratingPdf ? 'Generando...' : 'Generar Carta de Servicios (PDF)'}
                </button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Servicio">
                <ServiceForm onSave={handleAddService} onClose={() => setIsModalOpen(false)} />
            </Modal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.length > 0 ? (
                    services.map(service => <ServiceCard key={service.id} service={service} onDelete={handleDeleteService} apiUrl={apiUrl} />)
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No hay servicios registrados.</p>
                )}
            </div>
            
             {/* Hidden element for PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {isGeneratingPdf && <div ref={pdfRef}><ServicesPDFMenu services={services} apiUrl={apiUrl} /></div>}
            </div>

        </div>
    );
};

export default Services;