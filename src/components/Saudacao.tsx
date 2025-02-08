import React, { useState, useEffect } from 'react';

const Saudacao = ({ nomeUsuario = {user.name} }) => {
  const [saudacao, setSaudacao] = useState('');
  const [hora, setHora] = useState(new Date().getHours());

  useEffect(() => {
    // Atualiza a hora a cada minuto
    const timer = setInterval(() => {
      setHora(new Date().getHours());
    }, 60000);

    // Limpa o timer quando o componente é desmontado
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Define a saudação baseada na hora
    if (hora >= 5 && hora < 12) {
      setSaudacao('Bom dia'+'{user.name}');
    } else if (hora >= 12 && hora < 18) {
      setSaudacao('Boa tarde'+'{user.name}');
    } else {
      setSaudacao('Boa noite'+'{user.name}');
    }
  }, [hora]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-blue-600">
        {saudacao}, {nomeUsuario}!
      </h1>
      <p className="mt-2 text-gray-600">
        Agora são {hora}:00 horas
      </p>
    </div>
  );
};

export default Saudacao;