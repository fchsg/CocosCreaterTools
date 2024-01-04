@echo off

set MAIN_JS=%~dp0node_modules\gulp\bin\gulp.js

call node.exe %MAIN_JS% compress

echo DONE

pause

exit