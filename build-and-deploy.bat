@echo off
echo Starting build and deploy process...

echo Building React app...
cd FrontEnd/cit-forums-client
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error building React app
    exit /b %ERRORLEVEL%
)

echo Cleaning up old static files...
if exist "Backend\CIT-Forums\src\main\resources\static" (
    echo Removing old static files...
    rmdir /S /Q "Backend\CIT-Forums\src\main\resources\static"
)

echo Creating static folder in Spring Boot...
mkdir Backend\CIT-Forums\src\main\resources\static

echo Copying React build to Spring Boot static folder...
xcopy /E /Y /I "FrontEnd\cit-forums-client\build\*" "Backend\CIT-Forums\src\main\resources\static"

echo Build and deploy completed successfully!
echo You can now run your Spring Boot application and access the React UI from there.
echo.
echo Run your Spring Boot app with:
echo cd Backend/CIT-Forums
echo mvn spring-boot:run
echo.
echo Then access the application at: http://localhost:8080/ 