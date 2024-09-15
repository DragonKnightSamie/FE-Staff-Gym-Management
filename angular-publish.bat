@echo off
REM Chuyển đến thư mục chứa project Angular của bạn
cd /d C:\Users\Administrator\Desktop\FE-Admin-Gym-Management

REM Hiển thị phiên bản Node.js và npm (tùy chọn)
echo Node.js version:
node -v
echo npm version:
CALL npm version

echo Sync local with origin/main.

REM Ensure we are on the main branch
git checkout main

REM Fetch the latest changes from the remote repository
git fetch origin

REM Reset the local main branch to match the remote main branch
git reset --hard origin/main

REM Inform the user that the operation is complete
echo Update complete. Local main branch is now in sync with origin/main.

REM Cài đặt các dependencies (nếu cần thiết)
echo Installing dependencies...
CALL npm install

REM Kiểm tra lỗi của lệnh trước đó
IF %ERRORLEVEL% NEQ 0 (
    echo Error occurred during npm install
    pause
    exit /b %ERRORLEVEL%
)

REM Build project Angular
echo Building Angular project...
CALL ng build

REM Kiểm tra lỗi của lệnh build
IF %ERRORLEVEL% NEQ 0 (
    echo Error occurred during ng build
    pause
    exit /b %ERRORLEVEL%
)

REM Tạo nội dung cho file web.config
echo Creating web.config file...
(
  echo ^<?xml version="1.0" encoding="UTF-8"?^>
  echo ^<configuration^>
  echo   ^<system.webServer^>
  echo     ^<rewrite^>
  echo       ^<rules^>
  echo         ^<rule name="ReactRouter Routes" stopProcessing="true"^>
  echo           ^<match url=".*" /^>
  echo           ^<conditions logicalGrouping="MatchAll"^>
  echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /^>
  echo             ^<add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /^>
  echo             ^<add input="{REQUEST_URI}" pattern="^/(docs)" negate="true" /^>
  echo           ^</conditions^>
  echo           ^<action type="Rewrite" url="index.html" /^>
  echo         ^</rule^>
  echo       ^</rules^>
  echo     ^</rewrite^>
  echo   ^</system.webServer^>
  echo ^</configuration^>
) > "dist\fuse\browser\web.config"

IF EXIST "C:\inetpub\wwwroot\fe-admin-gym-management" (
    echo Deleting existing files in fe-admin-gym-management...
    CALL rmdir /s /q "C:\inetpub\wwwroot\fe-admin-gym-management"
)

REM Tạo lại thư mục đích
CALL mkdir "C:\inetpub\wwwroot\fe-admin-gym-management"

REM Sao chép các file đã build vào thư mục đích
echo Copying built files to fe-admin-gym-management...
CALL xcopy "dist\fuse\browser\*" "C:\inetpub\wwwroot\fe-admin-gym-management" /s /e /y

REM Thông báo hoàn thành và dừng màn hình
echo Build completed. Press any key to exit.
pause