@echo off
chcp 65001 >nul
title MODERA Demo - نسخه نمایشی قالب مدرا
cd /d "%~dp0"
echo ============================================
echo   MODERA - در حال اجرای نسخه نمایشی...
echo ============================================
where python >nul 2>nul
if %errorlevel%==0 (
  start /min "" python -m http.server 8000
  timeout /t 2 /nobreak >nul
  start "" http://localhost:8000
  echo.
  echo   دمو اجرا شد! مرورگر باز شد: http://localhost:8000
  echo   برای بستن سرور، این پنجره را ببندید.
  echo.
  pause >nul
) else (
  echo   پایتون پیدا نشد؛ فایل مستقیم باز می‌شود...
  start "" "%~dp0index.html"
)
