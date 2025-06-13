export interface Supplier {
    id: number;
    nome: string;
    contato: string;
    telefone: string;
    email: string;
    endereco: string;
    cidade: string;
    estado: string;
    ultimacompra: Date;
    status: 'Ativo' | 'Inativo';
  }