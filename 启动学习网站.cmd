@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动算法拾级，请在浏览器打开 http://127.0.0.1:4173
node scripts\serve.mjs
pause
