@echo off
:start
cls
echo === MINIMIZE ===
php src\php\publish.php public/aim/css/web.css src/public/aim/css/web.css
php src\php\publish.php public/aim/css/doc.css src/public/aim/css/doc.css
php src\php\publish.php public/aim/js/aim.js src/public/aim/js/aim.js

echo === PUSH === NPM ===
SET root=%CD%
cd \aim\aliconnect\npm
call \aim\aliconnect\npm\push.bat

echo === PUSH ===
cd %root%
call \aim\aliconnect\npm\push.bat

echo === NPM PUBLISH DIST === DRY RUN ===
cd %root%\dist
call npm publish --dry-run
echo === NPM PUBLISH DIST ===
pause
call npm publish --access public
pause
cd %root%
goto start
