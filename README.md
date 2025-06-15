# 💎 Moari - Sistema de Gestão para Joalherias

Um sistema completo de gestão desenvolvido especificamente para joalherias, oferecendo controle total sobre produtos, vendas, estoque e relatórios.

## 📋 Sobre o Projeto

O **Moari** foi desenvolvido para modernizar a gestão de joalherias, substituindo planilhas manuais por uma solução digital completa e intuitiva. O sistema permite controle detalhado do inventário, gestão de vendas, relacionamento com fornecedores e análises através de relatórios em tempo real.

### 🎯 Principais Funcionalidades

- **📦 Gestão de Produtos**
  - Cadastro completo com materiais, categorias e especificações
  - Sistema de código de barras integrado
  - Controle de estoque com alertas automáticos
  - Upload e gerenciamento de imagens
  - Produtos consignados para revendedoras

- **💰 Controle de Vendas**
  - Registro de vendas com múltiplos produtos
  - Diferentes métodos de pagamento (PIX, cartão, dinheiro, transferência)
  - Gestão de clientes e histórico de compras
  - Cálculo automático de tickets e margens

- **👥 Gestão de Fornecedores**
  - Cadastro completo de fornecedores
  - Histórico de compras e relacionamentos
  - Integração com produtos

- **📊 Relatórios e Analytics**
  - Dashboard em tempo real com métricas de performance
  - Gráficos de evolução de vendas
  - Análise de produtos mais vendidos
  - Relatórios de métodos de pagamento
  - Métricas de estoque e alertas

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
- Sistema de código de barras integrado
- Upload de imagens para produtos
- Filtros avançados e busca inteligente
- Interface responsiva para uso mobile (PWA planejado)

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

- **PWA (Progressive Web App)** para uso mobile
- **Sistema de permissões** e gerenciamento de usuários
- **Integração com APIs de pagamento**
- **Sistema de backup automático**
- **Relatórios mais avançados**

## 🎨 Interface

O sistema conta com uma interface moderna e intuitiva:

- **Dashboard** com métricas em tempo real
- **Tabelas interativas** com filtros avançados
- **Modais responsivos** para cadastros e edições
- **Gráficos dinâmicos** para análise de dados
- **Sistema de alertas** para estoque baixo

## 📊 Estatísticas do Projeto

- **Linguagens**: TypeScript (66.4%), JavaScript (32.9%)
- **Arquitetura**: Frontend React + Backend Express + PostgreSQL
- **Status**: Em desenvolvimento ativo
- **Colaboradores**: 2 desenvolvedores ativos

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Estrutura do Projeto

```
moari/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas principais
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilitários
├── server/                # Backend Express
│   ├── api/               # Rotas da API
│   ├── config/            # Configurações
│   └── database/          # Conexão com banco
├── uploads/               # Arquivos enviados
└── dist/                  # Build de produção
```

## 🔐 Segurança

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
