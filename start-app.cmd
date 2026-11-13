@echo off
cd /d "%~dp0"
title English Coach
where node >nul 2>nul || (echo Can cai Node.js 22+ truoc: https://nodejs.org & pause & exit /b 1)
node src\server.mjs %*
