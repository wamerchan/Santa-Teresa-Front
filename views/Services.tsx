import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Service, AppContextType } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateServicesReport, ServiceData } from '../utils/pdfMakeUtilsAsync';

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
                <p className="text-lg text-gray-600 mt-2">Cabaña "Santa Teresa - Suesca Cundinamarca"</p>
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
    
    // Función alternativa para generar PDF sin html2canvas
    const generatePdfAlternative = async () => {
        setIsGeneratingPdf(true);
        
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            let yPosition = 20;
            
            // Título
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Carta de Servicios', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 20;
            
            // Agregar cada servicio como texto
            services.forEach((service, index) => {
                if (yPosition > 250) { // Nueva página si es necesario
                    pdf.addPage();
                    yPosition = 20;
                }
                
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text(service.name, 20, yPosition);
                yPosition += 10;
                
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');
                
                // Descripción con salto de línea automático
                const splitDescription = pdf.splitTextToSize(service.description, pageWidth - 40);
                pdf.text(splitDescription, 20, yPosition);
                yPosition += splitDescription.length * 5 + 5;
                
                // Precio
                pdf.setFont('helvetica', 'bold');
                pdf.text(`Precio: $${new Intl.NumberFormat('es-CO').format(service.cost)}`, 20, yPosition);
                yPosition += 15;
                
                // Línea separadora
                if (index < services.length - 1) {
                    pdf.line(20, yPosition, pageWidth - 20, yPosition);
                    yPosition += 10;
                }
            });
            
            pdf.save("carta-de-servicios.pdf");
        } catch (error) {
            console.error('Error generando PDF alternativo:', error);
            alert('Error al generar el PDF.');
        }
        
        setIsGeneratingPdf(false);
    };

    const generatePdf = async () => {
        setIsGeneratingPdf(true);
        
        try {
            setTimeout(async () => {
                const pdfElement = pdfRef.current;
                if (pdfElement) {
                    try {
                        // Crear un stylesheet temporal para sobrescribir colores problemáticos
                        const tempStyle = document.createElement('style');
                        tempStyle.id = 'temp-pdf-styles';
                        tempStyle.innerHTML = `
                            * {
                                background-color: white !important;
                                color: black !important;
                                border-color: black !important;
                                box-shadow: none !important;
                            }
                            .bg-emerald-600, .bg-emerald-500 {
                                background-color: #059669 !important;
                            }
                            .bg-blue-600, .bg-blue-500 {
                                background-color: #2563eb !important;
                            }
                            .bg-red-600, .bg-red-500 {
                                background-color: #dc2626 !important;
                            }
                            .text-white {
                                color: white !important;
                            }
                            .text-emerald-600 {
                                color: #059669 !important;
                            }
                            .text-blue-600 {
                                color: #2563eb !important;
                            }
                            .text-red-600 {
                                color: #dc2626 !important;
                            }
                        `;
                        document.head.appendChild(tempStyle);
                        
                        // Esperar un poco para que los estilos se apliquen
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        const canvas = await html2canvas(pdfElement, { 
                            scale: 2, 
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            removeContainer: true,
                            logging: false,
                            onclone: (clonedDoc) => {
                                // Aplicar estilos seguros al documento clonado
                                const clonedStyle = clonedDoc.createElement('style');
                                clonedStyle.innerHTML = tempStyle.innerHTML;
                                clonedDoc.head.appendChild(clonedStyle);
                            }
                        });
                        
                        // Remover el estilo temporal
                        document.head.removeChild(tempStyle);
                        
                        const imgData = canvas.toDataURL('image/png');
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
                        
                    } catch (error) {
                        console.error('Error generando PDF:', error);
                        
                        // Remover el estilo temporal si existe
                        const tempStyle = document.getElementById('temp-pdf-styles');
                        if (tempStyle) {
                            document.head.removeChild(tempStyle);
                        }
                        
                        alert('Error al generar el PDF. Los colores modernos no son compatibles con la generación de PDF.');
                    }
                }
                setIsGeneratingPdf(false);
            }, 100);
        } catch (error) {
            console.error('Error en generatePdf:', error);
            setIsGeneratingPdf(false);
        }
    };

    // Función para generar catálogo con PDFMake
    const generatePdfWithPdfMake = async () => {
        try {
            // Convertir servicios al formato requerido por PDFMake
            const serviceData: ServiceData[] = services.map(service => ({
                id: service.id,
                name: service.name,
                description: service.description,
                cost: service.cost,
                imageUrl: service.imageUrl
            }));

            // Generar el PDF
            const pdfDoc = await generateServicesReport(serviceData);

            // Descargar el PDF
            pdfDoc.download(`catalogo-servicios-santa-teresa-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error al generar catálogo con PDFMake:', error);
            alert('Error al generar el catálogo PDF.');
        }
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
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={generatePdf}
                        disabled={isGeneratingPdf}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:bg-blue-300"
                    >
                        {isGeneratingPdf ? 'Generando...' : 'Generar PDF (Visual)'}
                    </button>
                    <button
                        onClick={generatePdfAlternative}
                        disabled={isGeneratingPdf}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center disabled:bg-green-300"
                    >
                        {isGeneratingPdf ? 'Generando...' : 'Generar PDF (Texto)'}
                    </button>
                    <button
                        onClick={generatePdfWithPdfMake}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Catálogo PDF Profesional
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Si el PDF visual falla, usa la versión de texto como alternativa.
                </p>
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