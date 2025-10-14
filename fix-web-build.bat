@echo off
echo ========================================
echo Fixing React Native Web Build Errors
echo ========================================
echo.

echo Step 1: Installing required Babel dependencies...
call npm install --save-dev @babel/plugin-proposal-class-properties @babel/plugin-transform-runtime @babel/preset-flow @babel/preset-react babel-loader
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Cleaning cache and build directories...
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist web-build rmdir /s /q web-build
if exist package-lock.json del /f /q package-lock.json
echo.

echo Step 3: Clearing npm cache...
call npm cache clean --force
echo.

echo Step 4: Reinstalling all dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo ========================================
echo Fix completed successfully!
echo ========================================
echo.
echo You can now run: npm run web
echo.
pause
