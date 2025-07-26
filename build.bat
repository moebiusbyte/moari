@echo off
echo Construindo aplicacao completa...

echo.
echo 1. Instalando dependencias do frontend...
call npm install

echo.
echo 2. Instalando dependencias do servidor...
cd server
call npm install
cd ..

echo.
echo 3. Construindo frontend...
call npm run build-frontend

echo.
echo 4. Construindo servidor...
call npm run build-server

echo.
echo 5. Criando executavel...
call npm run dist-win

echo.
echo ✅ Build concluido! O executavel esta na pasta 'release'.
pause
