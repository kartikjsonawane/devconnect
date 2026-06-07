@echo off
title DevConnect Backend
cd /d "%~dp0backend"
echo Starting DevConnect Backend on port 5000...
npm run dev
pause
