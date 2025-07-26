# 💎 Moari - Sistema de Gestão para Joalherias

Um sistema completo de gestão desenvolvido especificamente para joalherias, oferecendo controle total sobre produtos, vendas, estoque e relatórios.

## 📋 Sobre o Projeto

O **Moari** foi desenvolvido para modernizar a gestão de joalherias, substituindo planilhas manuais por uma solução digital completa e intuitiva. O sistema permite controle detalhado do inventário, gestão de vendas, relacionamento com fornecedores e análises através de relatórios em tempo real.

### 🎯 Principais Funcionalidades

- **📦 Gestão de Produtos**
  - Cadastro completo com materiais, categorias e especificações técnicas
  - Sistema de código de barras integrado com geração automática
  - Controle de estoque em tempo real com alertas automáticos
  - Upload e gerenciamento de múltiplas imagens por produto
  - Busca avançada por código de barras
  - Precificação inteligente com cálculo de margens
  - Controle de quantidade e tempo em estoque

- **🤝 Sistema de Consignados**
  - Cadastro completo de revendedores/parceiros
  - Gestão de produtos em consignação
  - Controle de comissões por parceiro
  - Acompanhamento de entregas e devoluções
  - Relatórios específicos de vendas consignadas
  - Dashboard dedicado para análise de performance
  - Integração com sistema de vendas principal

- **💰 Controle de Vendas**
  - Registro de vendas com múltiplos produtos
  - Diferentes métodos de pagamento (PIX, cartão, dinheiro, transferência)
  - Vendas de produtos próprios e consignados
  - Gestão de clientes e histórico de compras
  - Cálculo automático de tickets e margens
  - Sistema de códigos sequenciais para vendas

- **👥 Gestão de Fornecedores**
  - Cadastro completo de fornecedores
  - Histórico de compras e relacionamentos
  - Integração direta com produtos
  - Controle de origem dos produtos

- **📊 Relatórios e Analytics Avançados**
  - Dashboard em tempo real com métricas de performance
  - Gráficos de evolução de vendas (próprias e consignadas)
  - Análise de produtos mais vendidos
  - Relatórios detalhados de métodos de pagamento
  - Métricas de estoque e alertas de baixo estoque
  - Relatórios específicos de consignados
  - Análise de performance por revendedor
  - Evolução de vendas por período

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Recharts** para gráficos e visualizações
- **Vite** como bundler

### Backend
- **Node.js** com Express
- **PostgreSQL** via Neon Database
- **APIs RESTful** para comunicação

### Funcionalidades Especiais

- Sistema completo de código de barras com geração automática
- Busca avançada por código de barras
- Sistema de consignados com controle de comissões
- Upload de múltiplas imagens para produtos
- Filtros avançados e busca inteligente
- Relatórios detalhados com gráficos interativos
- Sistema de alertas para estoque baixo
- Precificação automática com cálculo de margens
- Interface responsiva para uso mobile (PWA planejado)
- Controle de tempo em estoque por produto

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou pnpm
- Banco PostgreSQL

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/moebiusbyte/moari.git
cd moari
```

2. **Instale as dependências**
```bash
npm install
# ou
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=sua_url_do_banco_postgresql
JWT_SECRET=seu_jwt_secret
PORT=3000
```

4. **Configure o banco de dados**
```bash
# Execute as migrações do banco
npm run db:migrate
```

5. **Inicie o servidor de desenvolvimento**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 📱 Funcionalidades em Desenvolvimento

- **PWA (Progressive Web App)** para uso mobile offline
- **Sistema de permissões** e gerenciamento multi-usuário
- **Integração com APIs de pagamento** (Mercado Pago, PagSeguro)
- **Sistema de backup automático** para segurança dos dados
- **Relatórios mais avançados** com exportação em PDF/Excel
- **Impressão térmica** de etiquetas e códigos de barras
- **Notificações push** para alertas importantes
- **Sincronização em nuvem** para múltiplas filiais

## 🎨 Interface

O sistema conta com uma interface moderna e intuitiva:

- **Dashboard principal** com métricas em tempo real de vendas e estoque
- **Módulo de Consignados** com interface dedicada para gestão de parceiros
- **Tabelas interativas** com filtros avançados e busca inteligente
- **Modais responsivos** para cadastros e edições rápidas
- **Gráficos dinâmicos** para análise de dados de vendas e consignados
- **Sistema de alertas** para estoque baixo e prazos de entrega
- **Gerador de códigos de barras** integrado
- **Upload drag-and-drop** para imagens de produtos
- **Filtros por categoria, fornecedor e status**
- **Relatórios visuais** com exportação de dados

## 📊 Estatísticas do Projeto

- **Linguagens**: TypeScript (66.4%), JavaScript (32.9%)
- **Arquitetura**: Frontend React + Backend Express + PostgreSQL
- **Status**: Em desenvolvimento ativo
- **Colaboradores**: 2 desenvolvedores ativos

## 🤝 Sistema de Consignados - Funcionalidade Principal

O **Moari** possui um módulo completo e robusto para gestão de consignados, desenvolvido especificamente para joalherias que trabalham com revendedores e parceiros comerciais:

### Principais Recursos:
- **Cadastro de Revendedores**: Informações completas incluindo dados pessoais, endereço, CNPJ e configurações de comissão
- **Gestão de Produtos Consignados**: Controle total sobre quais produtos estão com cada revendedor
- **Acompanhamento de Entregas**: Histórico completo de entregas e retiradas de produtos
- **Sistema de Comissões**: Configuração personalizada de percentuais por revendedor
- **Relatórios Específicos**: Dashboard dedicado com métricas de performance por revendedor
- **Controle de Devoluções**: Gestão de produtos devolvidos pelos revendedores
- **Integração com Vendas**: Registro automático de vendas de produtos consignados

### Fluxo de Trabalho:
1. **Cadastro do Revendedor** com todas as informações comerciais
2. **Seleção de Produtos** para consignação com o parceiro
3. **Registro de Entrega** com data e produtos específicos
4. **Acompanhamento de Vendas** através do sistema
5. **Controle de Comissões** e acertos financeiros
6. **Relatórios de Performance** para análise de resultados

Esta funcionalidade permite que joalherias expandam sua rede de vendas de forma organizada e profissional, mantendo controle total sobre produtos, comissões e performance de cada parceiro.

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Estrutura do Projeto

```
moari2/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Produtos/       # Módulo de produtos
│   │   ├── Consignados/    # Módulo de consignados
│   │   ├── Vendas/         # Módulo de vendas
│   │   ├── Fornecedores/   # Módulo de fornecedores
│   │   ├── Relatorio/      # Módulo de relatórios
│   │   └── ui/             # Componentes de interface
│   ├── contexts/           # Contextos React
│   ├── types/              # Tipos TypeScript
│   └── lib/                # Utilitários e bibliotecas
├── server/                 # Backend Express
│   ├── api/                # Configurações de API
│   ├── routes/             # Rotas da API
│   │   ├── productRoutes.ts     # Rotas de produtos
│   │   ├── consignadosRoutes.ts # Rotas de consignados
│   │   ├── vendasRoutes.ts      # Rotas de vendas
│   │   ├── fornecedoresRoutes.ts # Rotas de fornecedores
│   │   └── relatoriosRoutes.ts  # Rotas de relatórios
│   └── certs/              # Certificados SSL
├── uploads/                # Arquivos de imagens
│   └── products/           # Imagens de produtos
├── pages/                  # Páginas principais
└── dist/                   # Build de produção
```

## � APIs e Endpoints

O sistema possui uma arquitetura RESTful bem estruturada com os seguintes módulos de API:

### Produtos (`/api/products`)
- Gestão completa de produtos com upload de imagens
- Sistema de códigos de barras automático
- Filtros avançados e busca inteligente
- Controle de estoque e precificação

### Consignados (`/api/consignados`)
- CRUD completo de revendedores
- Gestão de produtos consignados
- Relatórios específicos de consignados
- Controle de entregas e devoluções

### Vendas (`/api/sales`)
- Registro de vendas próprias e consignadas
- Múltiplos métodos de pagamento
- Histórico de transações
- Integração com sistema de estoque

### Fornecedores (`/api/suppliers`)
- Cadastro e gestão de fornecedores
- Integração com produtos
- Histórico de relacionamentos

### Relatórios (`/api/reports`)
- Dashboard com métricas em tempo real
- Gráficos de evolução de vendas
- Análises de performance
- Exportação de dados

## �🔐 Segurança

- Autenticação via JWT
- Validação de dados no backend
- Sanitização de inputs
- Controle de acesso por sessão

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto:

- **Issues**: Use as [GitHub Issues](https://github.com/moebiusbyte/moari/issues)
- **Discussões**: [GitHub Discussions](https://github.com/moebiusbyte/moari/discussions)

---

**Desenvolvido com 💜 para facilitar a gestão de joalherias**
