# Testes dos Relatórios Aprimorados

## Problema Resolvido
**Situação anterior**: Os relatórios não distinguiam entre vendas normais e vendas consignadas, mostrando produtos como "Brinco João Dias" (que é consignado) nos relatórios de vendas normais.

**Solução implementada**: Adicionados filtros baseados no campo `notes` das vendas para identificar vendas consignadas pela presença do texto `[VENDA CONSIGNADA]`.

## Novas funcionalidades dos relatórios:

### 1. Relatório de Performance de Produtos (Aprimorado)
```bash
# Todas as vendas (comportamento anterior)
GET /api/reports/products-performance?sale_type=all

# Apenas vendas normais (excluindo consignadas)
GET /api/reports/products-performance?sale_type=normal

# Apenas vendas consignadas
GET /api/reports/products-performance?sale_type=consignado
```

**Novos campos retornados:**
- `vendas.vendasNormais`: Contagem de vendas normais
- `vendas.vendasConsignadas`: Contagem de vendas consignadas
- `tipoVenda`: Tipo de filtro aplicado

### 2. Novo Relatório Específico de Vendas Consignadas
```bash
GET /api/reports/consignado-sales?period=month
```

**Retorna:**
- Lista detalhada de todas as vendas consignadas
- Informações do consignador e comissão
- Resumo consolidado com totais

### 3. Relatório de Métodos de Pagamento (Aprimorado)
```bash
# Com filtro por tipo de venda
GET /api/reports/payment-methods?sale_type=consignado
```

**Novos campos:**
- `vendasNormais`: Contagem por método
- `vendasConsignadas`: Contagem por método

### 4. Relatório Overview (Aprimorado)
**Novos campos adicionados:**
- `vendas_consignadas`: Total de vendas consignadas
- `vendas_normais`: Total de vendas normais  
- `receita_consignada`: Receita de vendas consignadas
- `receita_normal`: Receita de vendas normais

## Como testar:

1. **Iniciar o servidor:**
```bash
cd server
npm start
```

2. **Testar a diferenciação:**
```bash
# Ver apenas produtos vendidos normalmente
curl "http://localhost:8081/api/reports/products-performance?sale_type=normal"

# Ver apenas produtos consignados vendidos
curl "http://localhost:8081/api/reports/products-performance?sale_type=consignado"

# Ver relatório específico de consignados
curl "http://localhost:8081/api/reports/consignado-sales"
```

## Resultado esperado:
- **"Brinco João Dias"** agora aparecerá apenas no relatório de vendas consignadas
- Relatórios de vendas normais mostrarão apenas produtos vendidos diretamente
- Novos relatórios fornecerão visibilidade completa sobre comissões e performance por tipo de venda
