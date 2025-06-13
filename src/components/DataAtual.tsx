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
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const
  };

  // Opções de formatação para a hora
  const timeOptions = {
    hour: "2-digit" as "2-digit",
    minute: "2-digit" as "2-digit",
    second: "2-digit" as "2-digit",
    hour12: false
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-center">
        <p className="text-xl font-medium text-gray-900">
          {dateTime.toLocaleTimeString('pt-BR', timeOptions)}
        </p>
        <p className="text-xl text-gray-900">
          {dateTime.toLocaleDateString('pt-BR', dateOptions)}
        </p>
      </div>
    </div>
  );
};

export default DataAtual;   