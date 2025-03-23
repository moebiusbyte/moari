export interface Product {
    id: number;
    nome: string;
    contato: string;
    telefone: string;
    email: string;
    cidade: string;
    estado: string;
    endereco: string;
    ultimacompra: Date;
    status: 'Ativo' | 'Inativo';
  }