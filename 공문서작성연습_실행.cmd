@echo off
chcp 65001 >nul
title 공문서 작성 연습

set "APP_DIR=%~dp0공문서작성연습"
set "NODE_EXE=C:\Users\Min\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE_EXE%" (
  where node >nul 2>nul
  if errorlevel 1 (
    echo 실행 프로그램을 찾을 수 없습니다.
    echo Codex에서 다시 실행을 요청해 주세요.
    pause
    exit /b 1
  )
  set "NODE_EXE=node"
)

echo 공문서 작성 연습을 여는 중입니다...
if not defined SKIP_BROWSER start "" /b powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://127.0.0.1:4174'"
echo.
echo 앱을 사용하는 동안 이 창을 열어 두세요.
echo 사용을 마치면 이 창을 닫으면 됩니다.
echo.
"%NODE_EXE%" "%APP_DIR%\server.mjs"

if errorlevel 1 (
  echo.
  echo 앱을 시작하지 못했습니다. Codex에 화면 내용을 알려주세요.
  pause
)
