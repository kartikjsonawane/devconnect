@echo off
title DevConnect Frontend
cd /d "%~dp0frontend"
echo Starting DevConnect Frontend on port 5173...
npm run dev
pause
