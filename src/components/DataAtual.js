import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const DataAtual = () => {
    // Estado para armazenar a data/hora atual
    const [dateTime, setDateTime] = useState(new Date());
    useEffect(() => {
        // Atualiza a cada segundo
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(timer);
    }, []);
    // Opções de formatação para a data
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    // Opções de formatação para a hora
    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    };
    return (_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("p", { className: "text-xl font-medium text-gray-900", children: dateTime.toLocaleTimeString('pt-BR', timeOptions) }), _jsx("p", { className: "text-xl text-gray-900", children: dateTime.toLocaleDateString('pt-BR', dateOptions) })] }) }));
};
export default DataAtual;
