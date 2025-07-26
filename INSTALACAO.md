# 📋 Sistema MoAri - Guia de Instalação e Uso

## 🚀 Para a Cliente

### Instalação
1. **Baixe o arquivo**: `Sistema MoAri Setup 1.0.0.exe`
2. **Execute o instalador** clicando duas vezes no arquivo
3. **Siga as instruções** do assistente de instalação
4. **Escolha o local de instalação** (recomendado deixar o padrão)
5. **Aguarde a instalação** ser concluída

### Primeira Execução
1. **Abra o Sistema MoAri** através do ícone criado na área de trabalho ou menu iniciar
2. **Aguarde a inicialização** - o sistema pode demorar alguns segundos para abrir na primeira vez
3. **Configure suas informações** conforme necessário

### ⚠️ Importantes
- **Internet**: O sistema pode precisar de conexão com internet para algumas funcionalidades
- **Antivírus**: Alguns antivírus podem questionar o programa - autorize a execução
- **Backup**: Recomendamos fazer backup regular dos dados importantes
- **Suporte**: Entre em contato em caso de problemas

---

## 🛠️ Para o Desenvolvedor

### Arquivos Gerados
- **`Sistema MoAri Setup 1.0.0.exe`**: Instalador completo para distribuição
- **`win-unpacked/`**: Versão portátil (não precisa instalar)
- **`latest.yml`**: Arquivo de atualização automática

### Como Atualizar
```bash
# 1. Fazer alterações no código
# 2. Executar o build completo
npm run dist-win

# Ou usar o script batch
build.bat
```

### Estrutura do Build
```
release/
├── Sistema MoAri Setup 1.0.0.exe  # Instalador principal
├── win-unpacked/                   # Versão portátil
│   ├── Sistema MoAri.exe          # Executável principal
│   ├── resources/                  # Recursos da aplicação
│   └── ...                        # Outros arquivos necessários
└── latest.yml                     # Metadados de versão
```

### Configurações de Produção
- **Frontend**: Build otimizado com Vite
- **Backend**: Servidor Express compilado
- **Electron**: Empacotamento para Windows
- **Porta**: 3001 (servidor interno)
- **Ambiente**: Produção

### Scripts Disponíveis
```bash
npm run build-frontend   # Constrói apenas o frontend
npm run build-server     # Constrói apenas o servidor
npm run build-all        # Constrói tudo
npm run dist-win         # Gera executável Windows
npm run pack             # Empacota sem instalar
npm run electron         # Executa em modo desenvolvimento
```

### Debugging
Se houver problemas:
1. Verificar logs no console do Electron (F12)
2. Conferir se o servidor backend iniciou
3. Validar permissões de arquivo
4. Verificar configurações de ambiente

### Dependências do Sistema
- **Node.js**: Embarcado no executável
- **Banco de dados**: Configurar conexão se necessário
- **Uploads**: Pasta `uploads/` será criada automaticamente

---

## 📦 Distribuição

### Para Enviar à Cliente
1. **Compacte apenas** o arquivo `Sistema MoAri Setup 1.0.0.exe`
2. **Inclua este guia** de instruções
3. **Teste** a instalação em uma máquina limpa antes de enviar

### Tamanho do Arquivo
- **Instalador**: ~200-300MB (inclui Electron + Node.js + aplicação)
- **Instalado**: ~400-500MB
- **RAM necessária**: ~200-500MB durante execução

### Compatibilidade
- **Windows**: 10/11 (64-bit)
- **Antivírus**: Pode ser necessário autorizar
- **Firewall**: Pode solicitar permissão de rede

---

## ✅ Checklist Final

### Antes de Distribuir
- [ ] Testado em máquina limpa
- [ ] Funcionalidades principais verificadas
- [ ] Banco de dados configurado
- [ ] Backups configurados
- [ ] Documentação incluída
- [ ] Suporte definido

### Para Futuras Versões
- [ ] Configurar auto-updater
- [ ] Adicionar ícones personalizados
- [ ] Otimizar tamanho do bundle
- [ ] Implementar crash reporting
- [ ] Configurar telemetria (opcional)

---

## 📞 Suporte

Em caso de problemas ou dúvidas:
1. Verificar este guia primeiro
2. Tentar reiniciar a aplicação
3. Entrar em contato com o desenvolvedor
4. Fornecer prints de erro se houver

**Data da Compilação**: 26 de julho de 2025
**Versão**: 1.0.0
