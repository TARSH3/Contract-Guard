@echo off
REM ContractGuard Git Helper Script
REM This script makes Git commands easier to run

set GIT_PATH="C:\Program Files\Git\bin\git.exe"

if "%1"=="status" (
    %GIT_PATH% status
) else if "%1"=="add" (
    %GIT_PATH% add .
    echo All files added to staging
) else if "%1"=="commit" (
    if "%2"=="" (
        echo Please provide a commit message: git-helper.bat commit "Your message"
    ) else (
        %GIT_PATH% commit -m %2
    )
) else if "%1"=="push" (
    %GIT_PATH% push
) else if "%1"=="pull" (
    %GIT_PATH% pull
) else if "%1"=="log" (
    %GIT_PATH% log --oneline -10
) else (
    echo ContractGuard Git Helper
    echo Usage:
    echo   git-helper.bat status          - Check repository status
    echo   git-helper.bat add             - Add all changes
    echo   git-helper.bat commit "msg"    - Commit with message
    echo   git-helper.bat push            - Push to GitHub
    echo   git-helper.bat pull            - Pull from GitHub
    echo   git-helper.bat log             - Show recent commits
    echo.
    echo Example: git-helper.bat commit "Fixed login bug"
)