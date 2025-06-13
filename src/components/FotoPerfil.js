import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
var FotoPerfil = function () {
    var _a = useState(null), fotoPerfil = _a[0], setFotoPerfil = _a[1];
    var _b = useState(null), previewUrl = _b[0], setPreviewUrl = _b[1];
    useEffect(function () {
        // Carrega a foto salva ao iniciar o componente
        var savedImage = localStorage.getItem('fotoPerfil');
        if (savedImage) {
            setFotoPerfil(savedImage);
            setPreviewUrl(savedImage);
        }
    }, []);
    var handleImageUpload = function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader_1 = new FileReader();
            reader_1.onloadend = function () {
                var base64String = reader_1.result;
                setFotoPerfil(base64String);
                setPreviewUrl(base64String);
                localStorage.setItem('fotoPerfil', base64String);
            };
            reader_1.readAsDataURL(file);
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "relative w-16 h-16 rounded-full overflow-hidden bg-gray-100", children: previewUrl ? (_jsx("img", { src: previewUrl, alt: "Foto de perfil", className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-gray-200", children: _jsx(Upload, { className: "w-8 h-8 text-gray-400" }) })) }), _jsxs("label", { className: "cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-1 py-1 rounded-full transition-colors", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }), fotoPerfil ? 'Alterar foto' : 'Adicionar foto'] })] }));
};
export default FotoPerfil;
