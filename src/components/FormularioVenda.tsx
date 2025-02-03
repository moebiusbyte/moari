import React, { useState } from 'react';

interface FormularioVendaProps {
  onClose: () => void;
  onSave: () => void;
}

const FormularioVenda: React.FC<FormularioVendaProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    produtos: '',
    valor: '',
    formaPagamento: 'cartao'
  });

  // Função para formatar o valor em reais
  const formatarValorEmReais = (valor: string) => {
    // Remove tudo que não é número
    let numero = valor.replace(/\D/g, '');
    
    // Converte para número e divide por 100 para ter os centavos
    const valorNumerico = Number(numero) / 100;
    
    // Formata o número para moeda brasileira
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

   // Validar valor máximo (exemplo: 1 milhão)
   const validarValorMaximo = (valor: string) => {
    const numeroLimpo = Number(valor.replace(/\D/g, ''));
    const valorMaximo = 100000000; // R$ 1.000.000,00 em centavos
    return numeroLimpo <= valorMaximo;
  };

  // Função unificada para lidar com a mudança no campo de valor
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Só atualiza se estiver dentro do valor máximo permitido
    if (validarValorMaximo(apenasNumeros)) {
      setFormData(prev => ({
        ...prev,
        valor: apenasNumeros
      }));
    }
  };

  // Função para formatar o valor para exibição
  const valorFormatado = formData.valor ? formatarValorEmReais(formData.valor) : 'R$ 0,00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode acessar formData.valor que conterá apenas números
    // Para converter para float: Number(formData.valor) / 100
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente
        </label>
        <input
          type="text"
          value={formData.cliente}
          onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Produtos
        </label>
        <input
          type="text"
          value={formData.produtos}
          onChange={(e) => setFormData({ ...formData, produtos: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor
        </label>
        <div className="relative">
          <input
            type="text"
            value={valorFormatado}
            onChange={handleValorChange}
            className={`
              w-full px-3 py-2 border rounded-md
              ${Number(formData.valor) > 0 
                ? 'border-green-500 focus:ring-green-500' 
                : 'border-gray-300 focus:ring-blue-500'
              }
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Forma de Pagamento
        </label>
        <select
          value={formData.formaPagamento}
          onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="credito">Cartão de Crédito</option>
          <option value="debito">Cartão de Débito</option>
          <option value="pix">PIX</option>
          <option value="dinheiro">Dinheiro</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default FormularioVenda;