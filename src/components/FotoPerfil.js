import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                if (!e.target)
                    return;
                const base64String = e.target.result;
                setFotoPerfil(base64String);
                setPreviewUrl(base64String);
                localStorage.setItem('fotoPerfil', base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "relative w-16 h-16 rounded-full overflow-hidden bg-gray-100", children: previewUrl ? (_jsx("img", { src: previewUrl, alt: "Foto de perfil", className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-gray-200", children: _jsx(Upload, { className: "w-8 h-8 text-gray-400" }) })) }), _jsxs("label", { className: "cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-1 py-1 rounded-full transition-colors", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }), fotoPerfil ? 'Alterar foto' : 'Adicionar foto'] })] }));
};
export default FotoPerfil;
