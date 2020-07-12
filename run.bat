rem # Locate the folder containing NodeJS and substitute the path below with it
set nodejsloc=path/to/nodeJsFolder

START C:\Windows\System32\cmd.exe /k "echo Symbol Art Editor Online & echo @author malulleybovo (since 2017) & echo @license Apache-2.0 License & "%nodejsloc%"\nodejs\nodevars.bat & node --eval "require('./server.js')" & exit"