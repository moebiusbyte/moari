import React, { useState } from 'react';
import { Image, Camera } from 'lucide-react';

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
    <div className="flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        {photo ? (
          <img
            src={photo}
            alt="Profile"
            className="w-full h-full rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center shadow-sm">
            <Image size={32} className="text-gray-400" />
          </div>
        )}
        <label className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <Camera size={14} className="text-white" />
        </label>
      </div>
    </div>
  );
};

export default FotoPerfil;