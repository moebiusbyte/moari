import React, { useState, useEffect } from 'react';

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
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {dateTime.toLocaleTimeString('pt-BR', timeOptions)}
        </h2>
        <p className="text-lg text-gray-600">
          {dateTime.toLocaleDateString('pt-BR', dateOptions)}
        </p>
      </div>
    </div>
  );
};

export default DataAtual;