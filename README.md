fstack
======

[![Build Status](https://travis-ci.org/chronize/fstack.svg?branch=master)](https://travis-ci.org/chronize/fstack)
[![NPM version](https://badge.fury.io/js/fstack.svg)](http://badge.fury.io/js/fstack)
[![Dependencies](https://david-dm.org/chronize/fstack.svg)](https://david-dm.org/chronize/fstack)

A lightweight and efficient driver stack to easily manage and maintain a filesystem.

`fstack` provides a simple and optimized interface for accessing a filesystem and deriving logical structures by utilizing the `fs` core library. `fstack` features high-level filesystem operations such as atomic implementations of `copy`, `move`, `delete`, and `mkdir -p`. `fstack` can also derive a filesystem tree object based on a supplied path, which has countless applications. `fstack`  is designed to replace other npm packages such as `mkdirp`, `file`, and `node-dir`. `fstack` also extends `path` and `os`, for convenience.

## Installing
`npm install --save fstack`

## Usage
`var fstack = require('fstack');`

## Documentation

### fstack.ents(path, callback)
`fstack.ents(path, callback)` will return all of the immediate child entities inside `path` and callback with `(err, ents)`, where `ents` is an associative array containing entity names as keys and stats as values.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.ents('./foo', function(err, ents) {
    console.log(_.keys(ents));
});

// ['bar', 'qux']
```

### fstack.dirs(path, callback)
`fstack.dirs(path, callback)` will return all of the immediate child directories inside `path` and callback with `(err, dirs)`, where `dirs` is an associative array containing directory names as keys and stats as values.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.dirs('./foo', function(err, dirs) {
    console.log(_.keys(dirs));
});

// ['bar']
```

### fstack.files(path, callback)
`fstack.ents(path, callback)` will return all of the immediate child non-directories inside `path` and callback with `(err, files)`, where `files` is an associative array containing non-directory names as keys and stats as values.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.files('./foo', function(err, files) {
    console.log(_.keys(files));
});

// ['qux']
```

### fstack.fst(path, callback, [depth])
`fstack.fst(path, callback, [depth])` will callback with `(err, fst)`, where `fst` is an object representing the filesystem with `path` as the root node. `depth` is the number of levels to recursively crawl the filesystem, and defaults to null, which does a complete crawl. Calling fstack#fst with a `depth` of 1 or 2 is a good strategy for returning an object that will represent a filesystem client-side. Directories will contain an object representing its children, while non-directories will contain their device types, which is usually `'file'`.

```
/*
foo/
    bar/
        baz
    quux/
        corge/
            garply
        grault
    qux
*/

fstack.fst('./foo', function(err, fst) {
    console.log(JSON.stringify(fst, null, 4));
});

/*
{
    "qux": "file",
    "bar": {
        "baz": "file"
    },
    "quux": {
        "grault": "file",
        "corge": {
            "garply": "file"
        }
    }
}
*/

fstack.fst('./foo', function(err, fst) {
    console.log(JSON.stringify(fst, null, 4));
}, 1);

/*
{
    "bar": {},
    "quux": {},
    "qux": "file"
}
*/
```

### fstack.fso
Alias of fstack#fst.


### fstack.device(path, callback)
`fstack.device(path, callback)` will check the device type of `path` and callback with `(err, mode)`, where `mode` is the determined device type of `path`.

Device types are `file`, `directory`, `block-device`, `char-device`, `link`, `fifo`, `socket`, and `unknown`.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.device('./foo', function(err, mode) {
    console.log(mode);
});

// 'directory'
```

### fstack.mkdir(path, callback, [force])
`fstack.mkdir(path, callback, [force])` will create the directory `path` if it does not already exist, and callback with `(err)`. If `force` is specified, the directory will be created without checks. `fstack#mkdir` will callback with `(err, made)`.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.mkdir('./foo/quux', function(err) {
    
});

/*
foo/
    bar/
        baz
    quux/
    qux
*/
```


### fstack.mkdirp(path, callback, [force])
`fstack.mkdirp(path, callback, [force])` will recursively create each directory that leads to `path` if any do not already exist, and callback with `(err)`. If `force` is specified, directories will be created without checks. `fstack#mkdirp` will callback with `(err)`.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.mkdirp('./foo/quux/corge', function(err) {
    
});

/*
foo/
    bar/
        baz
    quux/
        corge/
    qux
*/
```

### fstack.copy(source, destination, callback)
`fstack.copy(source, destination, callback)` will recursively copy each directory and file from `source` to `destination` if `source` is a directory, and it will copy `source` to `directory` if `source` is a file. `fstack#copy` will create any missing directories in the process. Files in `destination` with the same name as files in `source` will be overwritten. `fstack#copy` will callback with `(err)`.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.copy('./foo', './quux', function(err) {
    
});

/*
foo/
    bar/
        baz
    qux
quux/
    bar/
        baz
    qux
*/
```

### fstack.move(source, destination, callback)
`fstack.move(source, destination, callback)` will recursively move each directory and file from `source` to `destination` if `source` is a directory, using `fs#rename` when possible. It will move `source` to `directory` if `source` is a file. `fstack#move` will create any missing directories in the process. Files in `destination` with the same name as files in `source` will be overwritten. `fstack#move` will callback with `(err)`.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.move('./foo', './quux', function(err) {
    
});

/*
quux/
    bar/
        baz
    qux
*/
```

### fstack.delete(path, callback)
`fstack.delete(path, callback)` will recursively delete each directory and file in `path`, if `path` is a directory, while it will delete `path` if it is a non-directory. `fstack#delete` will callback with `(err)`.

```
/*
foo/
    bar/
        baz
    qux
*/

fstack.delete('./foo', function(err) {
    
});

/*

*/
```

### fstack.checkFile(path, callback)
`fstack.checkFile(path, callback)` will check if `path` exists as a non-directory and callback with `(err, stat)`, where `stat` is the stat of `path`.


### fstack.checkDir(path, callback)
`fstack.checkDir(path, callback)` will check if `path` exists as a directory and callback with `(err, stat)`, where `stat` is the stat of `path`.


### fstack.json(path, callback, [explicit])
`fstack.json(path, callback, [explicit])` will read the json from `path` if it is a file. `explicit` defaults to `false`, where it may append `'.json'` to the supplied `path` so that the file may be accessed without requiring the `'.json'` extension. `fstack#json(path, callback, explicit)` will callback with `(err, json)`, where `json` is the parsed object for the file at `path`.

```
/*
test.json
    {
        "a": "b",
        "c": {
            "d": "e"
        }
    }
*/

fstack.json('./test.json', function(err, json) {
    console.log(json.c);
});

/*
{ d: 'e' }
*/
```

### fstack.read(path, callback)
`fstack#read` behaves the same way as `fs#readFile`, but first performs a check to see whether the supplied file exists.


### fstack.readStream(path, callback)
`fstack.readStream(path, callback)` will create a Readable Stream for `path` and callback with `(err, stream)`.


### fstack.write(path, callback)
`fstack#write` behaves the same way as `fs#writeFile`, but first performs a check to see whether the supplied file exists.


### fstack.writeStream(path, callback)
`fstack.writeStream(path, callback)` will create a Writable Stream for `path` and callback with `(err, stream)`.


### fstack.append(path, callback)
`fstack#append` behaves the same way as `fs#append`, but first performs a check to see whether the supplied file exists.
