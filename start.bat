@echo off
echo Запуск Restaurant App...

echo Запуск backend сервера...
start cmd /k "cd backend && npm run dev"

timeout /t 2

echo Запуск мобильного приложения...
start cmd /k "npm start"

echo Все сервисы запущены!
pause