xcopy public\ public-dist\ /E/I
cd public-dist\script
call javascript-obfuscator metamask.js -o metamask.js
call javascript-obfuscator main-page.js -o main-page.js
call javascript-obfuscator mint.js -o mint.js
call javascript-obfuscator ranklist.js -o ranklist.js
call javascript-obfuscator rename.js -o rename.js
call javascript-obfuscator scripts.js -o scripts.js
call javascript-obfuscator ui.js -o ui.js
call javascript-obfuscator share.js -o share.js
cd ..