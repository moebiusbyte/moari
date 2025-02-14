import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

const FotoPerfil = () => {
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    // Carrega a foto salva ao iniciar o componente
    const savedImage = localStorage.getItem('fotoPerfil');
    if (savedImage) {
      setFotoPerfil(savedImage);
      setPreviewUrl(savedImage);
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFotoPerfil(base64String);
        setPreviewUrl(base64String);
        localStorage.setItem('fotoPerfil', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-1 py-1 rounded-full transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"/>
        {fotoPerfil ? 'Alterar foto' : 'Adicionar foto'}
      </label>
    </div>
  );
};

export default FotoPerfil;