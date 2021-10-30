# squoosh_resizer
A simple but powerful cli image resizer, the script is realized in node and utilizes the squoosh npm package. When launched via cli it needs only a parameter, the target folder, it iterates over all the png images contained in that folder and produces the compressed version at various resolutions, the output is high optimized thanks to squoosh lib.

Usage: 

```
./sqres.js ./targetfolder
```

