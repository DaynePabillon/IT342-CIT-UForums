@echo off
echo Scanning for potential bean conflicts...

echo Checking for duplicate class names in different packages:

echo Service classes:
dir /s /b Backend\CIT-Forums\src\main\java\edu\cit\citforums\*Service.java | findstr /i "Service.java" | sort

echo Controller classes:
dir /s /b Backend\CIT-Forums\src\main\java\edu\cit\citforums\*Controller.java | findstr /i "Controller.java" | sort

echo Repository classes:
dir /s /b Backend\CIT-Forums\src\main\java\edu\cit\citforums\*Repository.java | findstr /i "Repository.java" | sort

echo Model classes:
dir /s /b Backend\CIT-Forums\src\main\java\edu\cit\citforums\models\*.java Backend\CIT-Forums\src\main\java\edu\cit\citforums\model\*.java | sort

echo Checking for package structure:
dir /s /b /ad Backend\CIT-Forums\src\main\java\edu\cit\citforums\

echo Scan complete. Please review the output for duplicate class names. 