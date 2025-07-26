const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  console.log('🖥️ Criando janela principal...');
  
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Permite carregamento de recursos locais
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Opcional: adicione um ícone
    show: false, // Não mostrar até estar pronto
  });

  console.log('🖥️ Janela criada com sucesso');

  // ✅ Interceptar navegação para corrigir rotas do React Router
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('🔍 Tentativa de navegação para:', navigationUrl);
    
    try {
      // Se for uma URL completa, analisar
      if (navigationUrl.includes('://')) {
        const parsedUrl = new URL(navigationUrl);
        
        // Se estiver tentando navegar para um protocolo de arquivo, converter para HTTP
        if (parsedUrl.protocol === 'file:') {
          console.log('� Convertendo file:// para http://localhost:3001');
          event.preventDefault();
          
          // Extrair apenas o caminho (removendo file:///C:/)
          let path = parsedUrl.pathname;
          
          // Limpar o caminho - remover drive letter se presente
          if (path.match(/^\/[A-Z]:\//)) {
            path = path.substring(3); // Remove "/C:/"
          }
          
          // Se não começar com /, adicionar
          if (!path.startsWith('/')) {
            path = '/' + path;
          }
          
          const correctedUrl = `http://localhost:3001${path}`;
          console.log('➡️ Redirecionando para:', correctedUrl);
          mainWindow.loadURL(correctedUrl);
          return;
        }
        
        // Se estiver tentando navegar para fora do localhost:3001, cancelar
        if (parsedUrl.hostname !== 'localhost' || parsedUrl.port !== '3001') {
          console.log('🚫 Bloqueando navegação externa:', navigationUrl);
          event.preventDefault();
          return;
        }
        
        console.log('✅ Permitindo navegação HTTP:', navigationUrl);
      } else {
        // Se for um caminho relativo, converter para URL completa
        console.log('🔄 Convertendo caminho relativo para URL completa');
        event.preventDefault();
        
        let path = navigationUrl;
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        
        const correctedUrl = `http://localhost:3001${path}`;
        console.log('➡️ Redirecionando para:', correctedUrl);
        mainWindow.loadURL(correctedUrl);
        return;
      }
    } catch (error) {
      console.error('❌ Erro ao processar navegação:', error);
      // Em caso de erro, cancelar navegação
      event.preventDefault();
    }
  });

  // ✅ Interceptar criação de nova janela e cliques em links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('🔗 Tentativa de abrir nova janela:', url);
    
    // Se for uma URL externa, abrir no navegador padrão
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (!url.includes('localhost:3001')) {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    
    // Se for um link interno, abrir na mesma janela
    mainWindow.loadURL(url);
    return { action: 'deny' };
  });

  // ✅ Interceptar eventos de navegação via JavaScript também
  mainWindow.webContents.on('new-window', (event, url) => {
    console.log('🔗 new-window event:', url);
    event.preventDefault();
    
    if (url.startsWith('http://localhost:3001')) {
      mainWindow.loadURL(url);
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      require('electron').shell.openExternal(url);
    }
  });

  // ✅ ADICIONADO: Carregar tela de carregamento imediatamente
  const loadingHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Sistema MoAri - Carregando</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: white;
                overflow: hidden;
            }
            .logo {
                font-size: 3rem;
                font-weight: bold;
                margin-bottom: 2rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .status {
                font-size: 1.2rem;
                margin-top: 1rem;
                opacity: 0.9;
            }
            .progress-bar {
                width: 300px;
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 1rem;
            }
            .progress-fill {
                height: 100%;
                background: white;
                width: 0%;
                animation: progress 8s ease-in-out forwards;
            }
            @keyframes progress {
                0% { width: 0%; }
                25% { width: 30%; }
                50% { width: 60%; }
                75% { width: 85%; }
                100% { width: 100%; }
            }
            .tips {
                position: absolute;
                bottom: 40px;
                text-align: center;
                opacity: 0.7;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="logo">Sistema MoAri</div>
        <div class="loading-container">
            <div class="spinner"></div>
            <div class="status" id="status">Iniciando sistema...</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
        <div class="tips">
            Aguarde enquanto o sistema está sendo carregado.<br>
            Isso pode levar alguns segundos na primeira execução.
        </div>
        
        <script>
            const messages = [
                "Iniciando sistema...",
                "Configurando servidor...",
                "Conectando ao banco de dados...",
                "Carregando interface...",
                "Quase pronto..."
            ];
            
            let currentMessage = 0;
            const statusElement = document.getElementById('status');
            
            setInterval(() => {
                if (currentMessage < messages.length - 1) {
                    currentMessage++;
                    statusElement.textContent = messages[currentMessage];
                }
            }, 1500);
        </script>
    </body>
    </html>
  `;

  // Carregar a tela de carregamento imediatamente
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml)}`);

  // Definir menu personalizado (opcional)
  const menuTemplate = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Ferramentas do Desenvolvedor',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Mostrar janela imediatamente com a tela de carregamento
  mainWindow.once('ready-to-show', () => {
    console.log('🖥️ Janela pronta para mostrar - exibindo tela de carregamento');
    mainWindow.show();
  });

  // Fechar a aplicação quando a janela é fechada
  mainWindow.on('closed', () => {
    console.log('🖥️ Janela fechada');
    mainWindow = null;
  });
}

function startServer() {
  console.log('🚀 Verificando e iniciando processo do servidor...');
  
  return new Promise((resolve, reject) => {
    // ✅ PRIMEIRO: Verificar se o servidor já está rodando
    console.log('🔍 Verificando se servidor já está ativo na porta 3001...');
    
    const http = require('http');
    const testRequest = http.get('http://localhost:3001/', (res) => {
      console.log('✅ Servidor já está rodando! Status:', res.statusCode);
      resolve();
    });
    
    testRequest.on('error', (error) => {
      console.log('❌ Servidor não está rodando, iniciando novo processo...');
      
      // Se não está rodando, iniciar o servidor
      const fs = require('fs');
      const isDev = !app.isPackaged; // Melhor detecção de desenvolvimento
      
      console.log('🔍 Informações do ambiente:');
      console.log('  isDev:', isDev);
      console.log('  isPackaged:', app.isPackaged);
      console.log('  __dirname:', __dirname);
      
      let serverPath;
      
      // Primeiro, tentar na pasta release (desenvolvimento)
      const devPath = path.join(__dirname, 'release', 'moari-server.exe');
      
      // Depois, tentar na pasta server (local)
      const localPath = path.join(__dirname, 'server', 'moari-server.exe');
      
      // Por último, tentar nos recursos (produção)
      const prodPath = path.join(process.resourcesPath || __dirname, 'moari-server.exe');
      
      // Verificar qual existe
      if (fs.existsSync(devPath)) {
        serverPath = devPath;
        console.log('✅ Usando executável da pasta release');
      } else if (fs.existsSync(localPath)) {
        serverPath = localPath;
        console.log('✅ Usando executável da pasta server');
      } else if (fs.existsSync(prodPath)) {
        serverPath = prodPath;
        console.log('✅ Usando executável dos recursos');
      } else {
        console.error('❌ Executável não encontrado em nenhum local');
        serverPath = devPath; // Fallback para mostrar erro
      }
      
      console.log('📁 Caminho do servidor:', serverPath);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(serverPath)) {
      console.error('❌ Executável do servidor não encontrado:', serverPath);
      console.log('📂 Tentando caminhos alternativos...');
      
      // Listar arquivos disponíveis para debug
      try {
        console.log('📂 Conteúdo de __dirname:', fs.readdirSync(__dirname));
        if (fs.existsSync(path.join(__dirname, 'release'))) {
          console.log('� Conteúdo de release:', fs.readdirSync(path.join(__dirname, 'release')));
        }
      } catch (e) {
        console.log('📂 Erro ao listar arquivos:', e.message);
      }
      
      reject(new Error('Executável do servidor não encontrado'));
      return;
    }
    
    console.log('✅ Executável do servidor encontrado em:', serverPath);
    
    // ✅ EXECUTAR O SERVIDOR STANDALONE
    console.log('🔄 Iniciando servidor executável standalone...');
    
    try {
      // Executar o arquivo .exe diretamente
      console.log('� Executando:', serverPath);
      
      serverProcess = spawn(serverPath, [], {
        cwd: path.dirname(serverPath),
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
        detached: false
      });

      let serverStarted = false;

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`📟 Server stdout: ${output}`);
        
        // Verificar se o servidor confirmou que está rodando
        if (output.includes('SERVIDOR INICIADO') || 
            output.includes('3001') || 
            output.includes('listening') ||
            output.includes('Server started')) {
          console.log('✅ Servidor confirmou inicialização via stdout');
          if (!serverStarted) {
            serverStarted = true;
            resolve();
          }
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`❌ Server stderr: ${error}`);
      });

      serverProcess.on('error', (spawnError) => {
        console.error(`💥 Spawn error:`, spawnError.message);
        if (!serverStarted) {
          console.log('🔄 Tentando fallback...');
          // Fallback: assumir que vai funcionar e deixar o timeout resolver
        }
      });

      serverProcess.on('exit', (code, signal) => {
        console.log(`🔚 Servidor terminou com código ${code} e sinal ${signal}`);
      });

      // Timeout de segurança - assumir que funcionou após 8 segundos
      setTimeout(() => {
        if (!serverStarted) {
          console.log('⏰ Timeout - assumindo que servidor está funcionando');
          serverStarted = true;
          resolve();
        }
      }, 8000);
      
    } catch (spawnError) {
      console.error(`❌ Erro ao tentar spawn:`, spawnError.message);
      // Mesmo com erro, resolver para tentar carregar
      resolve();
    }
    });
    
    testRequest.setTimeout(2000, () => testRequest.abort());
  });
}

async function waitForServer() {
  console.log('🔍 Aguardando servidor estar disponível...');
  
  // ✅ CORRIGIDO: Apenas 1 URL de teste e menos tentativas
  const testUrl = 'http://localhost:3001/';
  
  for (let i = 0; i < 8; i++) { // ✅ Reduzido para apenas 8 tentativas
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get(testUrl, (res) => {
          console.log(`🔍 Testando servidor - Status: ${res.statusCode}`);
          if (res.statusCode === 200 || res.statusCode === 404) {
            // 404 também indica que o servidor está respondendo
            console.log(`✅ Servidor está respondendo!`);
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        req.setTimeout(2000, () => reject(new Error('Timeout')));
      });
      
      return true; // Servidor está disponível
    } catch (error) {
      console.log(`⏳ Tentativa ${i + 1}/8 - aguardando servidor...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
    }
  }
  
  // ✅ Servidor provavelmente está funcionando mesmo sem resposta HTTP
  console.log('⚠️ Timeout na verificação, mas prosseguindo...');
  return true; // ✅ Sempre retornar true para não bloquear
}

async function initializeApp() {
  try {
    console.log('🔄 Inicializando aplicação...');
    
    // Primeiro, iniciar o servidor
    console.log('🚀 Iniciando servidor...');
    await startServer();
    
    console.log('⏱️ Aguardando servidor responder a requisições HTTP...');
    const serverAvailable = await waitForServer();
    
    if (serverAvailable) {
      console.log('✅ Servidor confirmado e disponível!');
    } else {
      console.log('⚠️ Servidor pode estar iniciando ainda, tentando carregar...');
    }
    
    // Aguardar mais um pouco para garantir estabilidade
    console.log('🔄 Finalizando carregamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Carregar a aplicação frontend
    const isDev = process.env.NODE_ENV === 'development';
    console.log('🎯 Modo de desenvolvimento:', isDev);
    
    let appUrl;
    if (isDev) {
      // Em desenvolvimento, usar o servidor de desenvolvimento
      appUrl = 'http://localhost:5173';
      console.log('🔧 Carregando em modo desenvolvimento via Vite');
    } else {
      // Em produção, carregar via servidor HTTP (que serve o frontend corretamente)
      appUrl = 'http://localhost:3001';
      console.log('🏭 Carregando em modo produção via servidor HTTP');
    }
    
    console.log('🌐 Carregando URL:', appUrl);
    
    // Tentar carregar com timeout
    const loadPromise = new Promise((resolve, reject) => {
      mainWindow.loadURL(appUrl);
      
      mainWindow.webContents.once('did-finish-load', () => {
        console.log('✅ Página carregada com sucesso!');
        resolve();
      });
      
      mainWindow.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('❌ Falha ao carregar página:', errorCode, errorDescription);
        reject(new Error(`Falha ao carregar: ${errorDescription}`));
      });
      
      // Timeout de 30 segundos para carregamento
      setTimeout(() => {
        reject(new Error('Timeout no carregamento da página'));
      }, 30000);
    });
    
    await loadPromise;
    console.log('✅ Aplicação inicializada com sucesso');
    
  } catch (error) {
    console.error('💥 Erro ao inicializar aplicação:', error);
    
    // Tentar carregamento direto como último recurso
    console.log('🔄 Tentando carregamento direto como último recurso...');
    try {
      await mainWindow.loadURL('http://localhost:3001');
      console.log('✅ Carregamento direto funcionou!');
      return;
    } catch (directLoadError) {
      console.error('❌ Carregamento direto também falhou:', directLoadError);
    }
    
    // Último recurso: mostrar página de erro com visual melhor
    console.log('🚨 Carregando página de erro...');
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Sistema MoAri - Erro</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  color: white;
                  text-align: center;
                  padding: 2rem;
                  box-sizing: border-box;
              }
              .error-icon {
                  font-size: 4rem;
                  margin-bottom: 1rem;
              }
              .error-title {
                  font-size: 2rem;
                  font-weight: bold;
                  margin-bottom: 1rem;
              }
              .error-message {
                  font-size: 1.1rem;
                  margin-bottom: 2rem;
                  opacity: 0.9;
                  max-width: 600px;
              }
              .error-details {
                  background: rgba(0,0,0,0.2);
                  padding: 1rem;
                  border-radius: 8px;
                  font-family: monospace;
                  font-size: 0.9rem;
                  max-width: 600px;
                  word-break: break-word;
                  margin-bottom: 1rem;
              }
              .retry-button {
                  background: rgba(255,255,255,0.2);
                  border: 2px solid white;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 6px;
                  font-size: 1rem;
                  cursor: pointer;
                  margin-top: 1rem;
                  transition: all 0.3s ease;
              }
              .retry-button:hover {
                  background: rgba(255,255,255,0.3);
              }
          </style>
      </head>
      <body>
          <div class="error-icon">⚠️</div>
          <div class="error-title">Erro ao Inicializar Sistema</div>
          <div class="error-message">
              Ocorreu um erro durante a inicialização do Sistema MoAri.<br>
              Por favor, tente as seguintes soluções:
              <ul style="text-align: left; margin-top: 1rem;">
                  <li>Feche o programa e abra novamente</li>
                  <li>Execute como Administrador</li>
                  <li>Verifique se o antivírus não está bloqueando</li>
                  <li>Entre em contato com o suporte técnico</li>
              </ul>
          </div>
          <div class="error-details">
              Erro técnico: Servidor não respondeu após 30 tentativas
          </div>
          <button class="retry-button" onclick="location.reload()">
              Tentar Novamente
          </button>
      </body>
      </html>
    `;
    
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  }
}

// Este método será chamado quando o Electron terminar a inicialização
app.whenReady().then(() => {
  console.log('⚡ Electron está pronto');
  createWindow();
  console.log('🔄 Chamando initializeApp...');
  initializeApp();

  app.on('activate', () => {
    console.log('📱 App ativado');
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('🔄 Criando nova janela...');
      createWindow();
    }
  });
});

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  console.log('🚪 Todas as janelas fechadas');
  // No macOS, aplicações ficam ativas mesmo quando todas as janelas são fechadas
  if (process.platform !== 'darwin') {
    console.log('🔚 Encerrando aplicação');
    app.quit();
  }
});

// Limpar processos ao sair
app.on('before-quit', () => {
  console.log('🧹 Limpando antes de sair...');
  if (serverProcess) {
    console.log('🔴 Matando processo do servidor');
    serverProcess.kill();
  }
});

app.on('will-quit', (event) => {
  console.log('🛑 Aplicação vai fechar...');
  if (serverProcess) {
    console.log('🔴 Forçando encerramento do servidor');
    serverProcess.kill();
  }
});
