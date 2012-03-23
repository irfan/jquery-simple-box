#/bin/bash
java -jar ../../tools/yuicompressor/build/yuicompressor-2.4.7.jar --type js -v src/simplebox.js -o min/simplebox.js
java -jar ../../tools/yuicompressor/build/yuicompressor-2.4.7.jar --type css -v src/simplebox.css -o min/simplebox.css
