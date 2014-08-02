fstack
======

A lightweight and efficient driver stack to easily manage and maintain a filesystem.



## fstack#ents
`fstack.ents(path, callback)` will return all of the immediate child entities inside `path` and callback with `(err, ents)`, where `ents` is an associative array containing entity names as keys and stats as values.


## fstack#dirs
`fstack.dirs(path, callback)` will return all of the immediate child directories inside `path` and callback with `(err, dirs)`, where `dirs` is an associative array containing directory names as keys and stats as values.


## fstack#files
`fstack.ents(path, callback)` will return all of the immediate child non-directories inside `path` and callback with `(err, files)`, where `files` is an associative array containing non-directory names as keys and stats as values.


## fstack#fst
`fstack.fst(path, callback, [depth])` will callback with `(err, o)`, where `o` is an object representing the filesystem with `path` as the root node. `depth` is the number of levels to recursively crawl the filesystem, and defaults to null, which does a complete crawl. Calling fstack#fst with a `depth` of 1 or 2 is a good strategy for returning an object that will represent a filesystem client-side. Directories will contain an object representing its children, while non-directories will contain their device types, which is usually `'file'`.

## fstack#fso
Alias of fstack#fst.


## fstack#device
`fstack.device(path, callback)` will check the device type of `path` and callback with `(err, mode)`, where `mode` is the determined device type of `path`.

Device types are `file`, `directory`, `block-device`, `char-device`, `link`, `fifo`, `socket`, and `unknown`.


## fstack#checkFile
`fstack.checkFile(path, callback)` will check if `path` exists as a non-directory and callback with `(err, stat)`, where `stat` is the stat of `path`.


## fstack#checkDir
`fstack.checkDir(path, callback)` will check if `path` exists as a directory and callback with `(err, stat)`, where `stat` is the stat of `path`.


## fstack#json
`fstack.json(path, callback, explicit)` will read the json from `path` if it is a file. `explicit` defaults to `false`, where it may append `'.json'` to the supplied `path`. `fstack#json(path, callback, explicit)` will callback with `(err, json)`, where `json` is the parsed object for the file at `path`.


## fstack#read
`fstack.read` behaves the same way as `fs.readFile`, but first performs a check to see whether the supplied file exists.


## fstack#readStream
`fstack.readStream(path, callback)` will create a Readable Stream for `path` and callback with `(err, stream)`.


## fstack#write
`fstack.write` behaves the same way as `fs.write`, but first performs a check to see whether the supplied file exists.


## fstack#writeStream
`fstack.writeStream(path, callback)` will create a Writable Stream for `path` and callback with `(err, stream)`.


## fstack#append
`fstack.append` behaves the same way as `fs.append`, but first performs a check to see whether the supplied file exists.



