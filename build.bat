xcopy public\ public-dist\ /E/I
cd public-dist\script
call javascript-obfuscator metamask.js -o metamask.js
call javascript-obfuscator scripts-mint.js -o scripts-mint.js
call javascript-obfuscator ui.js -o ui.js
cd ..