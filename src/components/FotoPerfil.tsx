// como importar no final
import React, { useState } from 'react';
import { Image } from 'lucide-react';

const FotoPerfil = () => {
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        {photo ? (
          <img
            src={photo}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            <Image size={32} className="text-gray-400" />
          </div>
        )}
        <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <Image size={20} className="text-white" />
        </label>
      </div>
    </div>
  );
};

export default FotoPerfil;

PARA IMPORTAR::
import FotoPerfil from './components/FotoPerfil';

function App() {
  return <FotoPerfil />;
}