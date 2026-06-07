@echo off
title Push DevConnect to GitHub
cd /d "%~dp0"

echo === DevConnect GitHub Setup ===
echo.

:: Initialize git
git init
git config user.email "kartikjaywantsonawane@gmail.com"
git config user.name "Kush"
git branch -M main

:: Stage everything
git add .
git commit -m "Initial commit: DevConnect developer social platform"

echo.
echo === Creating GitHub repository ===

:: Try GitHub CLI first (gh)
where gh >nul 2>&1
if %ERRORLEVEL% == 0 (
    gh repo create devconnect --public --source=. --remote=origin --push
    echo.
    echo Done! Your repo is live at: https://github.com/kartikjaywantsonawane/devconnect
) else (
    echo GitHub CLI (gh) not found. Doing manual push...
    echo.
    git remote add origin https://github.com/kartikjaywantsonawane/devconnect.git
    git push -u origin main
    echo.
    echo If push failed, first create the repo at:
    echo   https://github.com/new
    echo Then re-run this script.
)

pause
