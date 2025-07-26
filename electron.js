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
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Opcional: adicione um ícone
    show: false, // Não mostrar até estar pronto
  });

  console.log('🖥️ Janela criada com sucesso');

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
  console.log('🚀 Iniciando processo do servidor...');
  
  return new Promise((resolve, reject) => {
    // Caminho para o servidor
    const serverPath = path.join(__dirname, 'server', 'dist', 'server.js');
    console.log('📁 Caminho do servidor:', serverPath);
    
    // Verificar se o arquivo existe
    const fs = require('fs');
    if (!fs.existsSync(serverPath)) {
      console.error('❌ Arquivo do servidor não encontrado:', serverPath);
      reject(new Error('Arquivo do servidor não encontrado'));
      return;
    }
    
    console.log('✅ Arquivo do servidor encontrado');
    
    // ✅ ABORDAGEM PRIORITÁRIA: Usar Node.js diretamente via spawn
    console.log('🔄 Iniciando servidor via spawn...');
    
    // Configurar variáveis de ambiente
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3001',
      HOST: '0.0.0.0'
    };
    
    // Lista de possíveis executáveis Node.js
    const possibleNodePaths = [
      process.execPath.replace('electron.exe', 'node.exe'), // Tentar Node.js na mesma pasta do Electron
      'node', // Comando padrão do sistema
      'node.exe', // Windows específico
      path.join(process.resourcesPath, '..', 'node.exe'), // Possível localização no empacotamento
      path.join(__dirname, '..', 'node.exe'), // Relativo ao executável
      'C:\\Program Files\\nodejs\\node.exe', // Instalação padrão Windows
      'C:\\Program Files (x86)\\nodejs\\node.exe', // Instalação 32-bit
    ];
    
    let serverStarted = false;
    let tryCount = 0;
    
    function tryNextNode() {
      if (tryCount >= possibleNodePaths.length || serverStarted) {
        if (!serverStarted) {
          console.log('⚠️ Nenhum Node.js funcionou, mas assumindo que servidor pode estar rodando');
          resolve();
        }
        return;
      }
      
      const nodePath = possibleNodePaths[tryCount];
      tryCount++;
      
      console.log(`🔍 Tentativa ${tryCount}/${possibleNodePaths.length}: ${nodePath}`);
      
      try {
        serverProcess = spawn(nodePath, [serverPath], {
          cwd: path.join(__dirname, 'server'),
          env: env,
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: false,
          detached: false
        });

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
          
          // Se for erro de ENOENT, tentar próximo Node.js
          if (error.includes('ENOENT') || error.includes('spawn')) {
            console.log('🔄 Erro de spawn, tentando próximo Node.js...');
            setTimeout(tryNextNode, 1000);
          }
        });

        serverProcess.on('error', (spawnError) => {
          console.error(`💥 Spawn error com ${nodePath}:`, spawnError.message);
          if (spawnError.code === 'ENOENT') {
            console.log('🔄 ENOENT detectado, tentando próximo Node.js...');
            setTimeout(tryNextNode, 1000);
          }
        });

        serverProcess.on('exit', (code, signal) => {
          console.log(`🔚 Servidor terminou com código ${code} e sinal ${signal}`);
          if (!serverStarted && code !== 0) {
            console.log('🔄 Servidor terminou com erro, tentando próximo Node.js...');
            setTimeout(tryNextNode, 1000);
          }
        });

        // Se chegou até aqui sem erro imediato, aguardar um pouco
        setTimeout(() => {
          if (!serverStarted) {
            console.log(`⏰ Timeout para ${nodePath}, tentando próximo...`);
            if (serverProcess && !serverProcess.killed) {
              serverProcess.kill();
            }
            tryNextNode();
          }
        }, 5000);
        
      } catch (spawnError) {
        console.error(`❌ Erro ao tentar spawn ${nodePath}:`, spawnError.message);
        setTimeout(tryNextNode, 1000);
      }
    }
    
    // Iniciar tentativas
    tryNextNode();
    
    // Timeout final mais longo
    setTimeout(() => {
      if (!serverStarted) {
        console.log('⏰ Timeout final - assumindo que servidor pode estar funcionando');
        resolve();
      }
    }, 20000); // 20 segundos
  });
}

async function waitForServer() {
  console.log('🔍 Aguardando servidor estar disponível...');
  
  // Lista de endpoints para testar (em ordem de prioridade)
  const testUrls = [
    'http://localhost:3001/api/test-simple',
    'http://localhost:3001/health',
    'http://localhost:3001/',
    'http://localhost:3001/api/products'
  ];
  
  for (let i = 0; i < 45; i++) { // Aumentar tentativas para 45 segundos
    for (const testUrl of testUrls) {
      try {
        const http = require('http');
        await new Promise((resolve, reject) => {
          const req = http.get(testUrl, (res) => {
            console.log(`🔍 Testando ${testUrl} - Status: ${res.statusCode}`);
            if (res.statusCode === 200 || res.statusCode === 404) {
              // 404 também indica que o servidor está respondendo
              console.log(`✅ Servidor respondeu em ${testUrl}!`);
              resolve();
            } else {
              reject(new Error(`Status: ${res.statusCode}`));
            }
          });
          
          req.on('error', (error) => {
            console.log(`❌ Erro em ${testUrl}: ${error.message}`);
            reject(error);
          });
          req.setTimeout(3000, () => reject(new Error('Timeout')));
        });
        
        return true; // Servidor está disponível
      } catch (error) {
        // Continuar testando outras URLs
        continue;
      }
    }
    
    console.log(`⏳ Tentativa ${i + 1}/45 - todas as URLs falharam`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
  }
  
  // Não rejeitar imediatamente - tentar carregar mesmo assim
  console.log('⚠️ Servidor pode não estar respondendo, mas tentando carregar...');
  return false;
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
      // Em produção, carregar via servidor HTTP
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
