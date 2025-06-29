
import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Photo, AppContextType } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';

const PhotoCard: React.FC<{ photo: Photo; onDelete: (id: string) => void; onCompare: (photo: Photo) => void; apiUrl: string }> = ({ photo, onDelete, onCompare, apiUrl }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group">
            <img src={`${apiUrl}${photo.url}`} alt={photo.description} className="w-full h-48 object-cover" />
            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{photo.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(photo.uploadDate).toLocaleDateString()}</p>
                <div className="flex justify-between items-center mt-3">
                    <button onClick={() => onCompare(photo)} className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Comparar</button>
                    <button onClick={() => onDelete(photo.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                </div>
            </div>
        </div>
    );
};

const PhotoUpload: React.FC<{ onUpload: (formData: FormData) => void }> = ({ onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = () => {
        if (file && description) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('description', description);
            onUpload(formData);
            
            // Reset form
            setFile(null);
            setDescription('');
            setPreview(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } else {
            alert('Por favor, selecciona una imagen y añade una descripción.');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Subir Nueva Foto</h3>
            <div className="space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {preview && <img src={preview} alt="Preview" className="max-h-40 rounded-lg mx-auto" />}
                <input
                    type="text"
                    placeholder="Descripción (ej: Antes de la remodelación)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                    Subir Foto
                </button>
            </div>
        </div>
    );
};


const Photos: React.FC = () => {
    const context = useContext(AppContext);
    const [comparePhotos, setComparePhotos] = useState<[Photo | null, Photo | null]>([null, null]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    if (!context) return null;
    const { photos, setPhotos, apiUrl } = context as AppContextType;

    const handleUpload = async (formData: FormData) => {
        try {
            const response = await fetch(`${apiUrl}/api/photos`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Error al subir la foto.');
            const newPhoto = await response.json();
            setPhotos(prev => [newPhoto, ...prev]);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error al subir la foto');
        }
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            try {
                const response = await fetch(`${apiUrl}/api/photos/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar la foto.');
                setPhotos(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error(error);
                alert(error instanceof Error ? error.message : 'Error al eliminar la foto');
            }
        }
    };

    const handleCompare = (photo: Photo) => {
        if (!comparePhotos[0]) {
            setComparePhotos([photo, null]);
        } else {
            setComparePhotos([comparePhotos[0], photo]);
            setIsCompareModalOpen(true);
        }
    };
    
    const closeCompareModal = () => {
        setIsCompareModalOpen(false);
        setComparePhotos([null, null]);
    };

    return (
        <div>
            <Header title="Álbum de Fotos" />
            <PhotoUpload onUpload={handleUpload} />

            {comparePhotos[0] && !comparePhotos[1] && (
                <div className="p-4 mb-6 bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200 rounded-md">
                    <p>Has seleccionado una foto para comparar. Ahora selecciona la segunda foto.</p>
                </div>
            )}
            
            <Modal isOpen={isCompareModalOpen} onClose={closeCompareModal} title="Comparar Fotos">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparePhotos[0] && (
                        <div>
                            <img src={`${apiUrl}${comparePhotos[0].url}`} className="w-full rounded-lg" alt={comparePhotos[0].description} />
                            <p className="mt-2 text-center font-semibold">{comparePhotos[0].description}</p>
                            <p className="text-center text-sm text-gray-500">{new Date(comparePhotos[0].uploadDate).toLocaleDateString()}</p>
                        </div>
                    )}
                    {comparePhotos[1] && (
                         <div>
                            <img src={`${apiUrl}${comparePhotos[1].url}`} className="w-full rounded-lg" alt={comparePhotos[1].description} />
                            <p className="mt-2 text-center font-semibold">{comparePhotos[1].description}</p>
                            <p className="text-center text-sm text-gray-500">{new Date(comparePhotos[1].uploadDate).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
                 <div className="mt-6 text-center">
                    <button onClick={closeCompareModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cerrar</button>
                </div>
            </Modal>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.length > 0 ? (
                    photos.map(photo => <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} onCompare={handleCompare} apiUrl={apiUrl} />)
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No hay fotos subidas.</p>
                )}
            </div>
        </div>
    );
};

export default Photos;