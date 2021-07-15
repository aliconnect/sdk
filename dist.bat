@echo off
:start
cls
php src\php\publish.php public/aim/css/web.css src/public/aim/css/web.css
php src\php\publish.php public/aim/css/doc.css src/public/aim/css/doc.css
php src\php\publish.php public/aim/js/aim.js src/public/aim/js/aim.js

call \aim\aliconnect\npm\push.bat

pause
goto start
