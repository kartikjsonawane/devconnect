@echo off
title Push DevConnect to GitHub
cd /d "%~dp0"

echo === DevConnect GitHub Setup ===
echo.

git init
git config user.email "kartikjaywantsonawane@gmail.com"
git config user.name "Kush"
git branch -M main
git add .
git commit -m "Initial commit: DevConnect developer social platform"

echo.
echo Adding remote...
git remote remove origin 2>nul
git remote add origin https://github.com/kartikjaywantsonawane/devconnect.git

echo Pushing to GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% == 0 (
    echo SUCCESS! Code is live at: https://github.com/kartikjaywantsonawane/devconnect
) else (
    echo Push failed. Check the error above.
)

echo.
pause
