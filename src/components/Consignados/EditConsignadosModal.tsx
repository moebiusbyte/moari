import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Consignado {
  id: number;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  cnpj: string;
  comissao: number;
  ultima_entrega: string | null;
  status: string;
}

interface EditConsignadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<Consignado>) => Promise<void>;
  consignado: Consignado;
}

const EditConsignadoModal: React.FC<EditConsignadoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  consignado
}) => {
  const [formData, setFormData] = useState<Partial<Consignado>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Atualizar o useEffect para incluir todos os campos do consignado
  useEffect(() => {
    if (consignado) {
      setFormData({
        id: consignado.id,
        nome: consignado.nome,
        contato: consignado.contato,
        telefone: consignado.telefone,
        email: consignado.email,
        endereco: consignado.endereco,
        cidade: consignado.cidade,
        estado: consignado.estado,
        cnpj: consignado.cnpj,
        comissao: consignado.comissao,
        ultima_entrega: consignado.ultima_entrega,
        status: consignado.status
      });
    }
  }, [consignado]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Validação especial para comissão (porcentagem)
    if (name === 'comissao') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar consignado');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Editar Consignado</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
  
        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 p-6">
          <form id="edit-consignado-form" onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <input
                type="text"
                name="id"
                value={formData.id || ''}
                className="w-full rounded-lg border border-gray-300 bg-gray-200 p-2"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Consignado *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contato
              </label>
              <input
                type="text"
                name="contato"
                value={formData.contato || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone || ''}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="exemplo@email.com"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj || ''}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comissão (%)
              </label>
              <input
                type="number"
                name="comissao"
                value={formData.comissao || ''}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
              <span className="text-xs text-gray-500">Porcentagem de comissão sobre vendas</span>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="">Selecione...</option>
                <option value="AC">Acre (AC)</option>
                <option value="AL">Alagoas (AL)</option>
                <option value="AP">Amapá (AP)</option>
                <option value="AM">Amazonas (AM)</option>
                <option value="BA">Bahia (BA)</option>
                <option value="CE">Ceará (CE)</option>
                <option value="DF">Distrito Federal (DF)</option>
                <option value="ES">Espírito Santo (ES)</option>
                <option value="GO">Goiás (GO)</option>
                <option value="MA">Maranhão (MA)</option>
                <option value="MT">Mato Grosso (MT)</option>
                <option value="MS">Mato Grosso do Sul (MS)</option>
                <option value="MG">Minas Gerais (MG)</option>
                <option value="PA">Pará (PA)</option>
                <option value="PB">Paraíba (PB)</option>
                <option value="PR">Paraná (PR)</option>
                <option value="PE">Pernambuco (PE)</option>
                <option value="PI">Piauí (PI)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="RN">Rio Grande do Norte (RN)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
                <option value="RO">Rondônia (RO)</option>
                <option value="RR">Roraima (RR)</option>
                <option value="SC">Santa Catarina (SC)</option>
                <option value="SP">São Paulo (SP)</option>
                <option value="SE">Sergipe (SE)</option>
                <option value="TO">Tocantins (TO)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="">Selecione...</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Última Entrega
              </label>
              <input
                type="date"
                name="ultima_entrega"
                value={formData.ultima_entrega ? formData.ultima_entrega.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
              <span className="text-xs text-gray-500">Data da última entrega realizada</span>
            </div>

            {formData.ultima_entrega && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-800">
                  <strong>Tempo desde a última entrega:</strong> {
                    (() => {
                      const deliveryDate = new Date(formData.ultima_entrega);
                      const today = new Date();
                      const diffTime = Math.abs(today.getTime() - deliveryDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                      if (diffDays > 365) {
                        return `${Math.floor(diffDays / 365)} ano(s) e ${diffDays % 365} dias`;
                      } else if (diffDays > 30) {
                        return `${Math.floor(diffDays / 30)} mês(es) e ${diffDays % 30} dias`;
                      } else {
                        return `${diffDays} dias`;
                      }
                    })()
                  }
                </div>
              </div>
            )}
 
            {validationMessage && (
              <Alert className="mt-4">
                <AlertDescription>{validationMessage}</AlertDescription>
              </Alert>
            )}
  
            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

          </form>
        </div>
        
        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-consignado-form"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
            disabled={loading}
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConsignadoModal;