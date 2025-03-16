@echo off
title Filmes App - Inicializando...
color 0A

echo Verificando arquivo hosts...
findstr /c:"127.0.0.1 localhost" C:\Windows\System32\drivers\etc\hosts >nul
if %ERRORLEVEL% neq 0 (
    echo Atualizando arquivo hosts...
    echo 127.0.0.1 localhost>> C:\Windows\System32\drivers\etc\hosts
    if %ERRORLEVEL% neq 0 (
        echo ============================================
        echo ATENCAO: Execute este script como Administrador
        echo para configurar o arquivo hosts corretamente.
        echo ============================================
        pause
        exit
    )
)

echo Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js nao encontrado! Iniciando download e instalacao...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/latest-v22.x/node-v22.14.0-x64.msi' -OutFile 'nodejs_installer.msi'}"
    start /wait msiexec /i nodejs_installer.msi /qn
    timeout /t 5 /nobreak >nul
    del /f /q nodejs_installer.msi
    cls
    echo ============================================
    echo Node.js foi instalado com sucesso!
    echo Por favor, REINICIE seu computador para
    echo completar a instalacao ou feche esse terminal e
    echo de dois clicks no arquivo start_app.bat para rodar o App
    echo forte abraço.
    echo ============================================
    echo.
    pause
    exit
)

echo Verificando política de execução do PowerShell...
powershell -Command "if ((Get-ExecutionPolicy) -eq 'Restricted') { Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force }"

echo Instalando dependências do npm...
start /min cmd /c "npm install"

echo Iniciando servidor...
cd /d "%~dp0"
start /min cmd /c "npm start"
timeout /t 5 /nobreak >nul
start http://localhost:3002
cls...
start cmd /k "%~dp0start_app.bat"
exit
echo Servidor rodando em http://localhost:3002
echo Pressione qualquer tecla para encerrar o servidor
pause
taskkill /F /IM node.exe >nul 2>&1