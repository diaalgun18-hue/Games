@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Exportando Supabase a archivos locales...
python exportar_supabase.py || py exportar_supabase.py
echo.
pause
