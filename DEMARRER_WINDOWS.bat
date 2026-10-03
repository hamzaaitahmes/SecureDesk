@echo off
title SecureDesk
docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop n'est pas demarre ou n'est pas installe.
  echo Demarrez Docker Desktop puis relancez ce fichier.
  pause
  exit /b 1
)
echo Construction et demarrage de SecureDesk...
docker compose up --build -d
if errorlevel 1 (
  echo Le demarrage a echoue. Consultez les messages ci-dessus.
  pause
  exit /b 1
)
echo SecureDesk sera disponible sur http://localhost:3000
timeout /t 8 /nobreak >nul
start http://localhost:3000
echo Pour consulter les journaux : docker compose logs -f
pause

