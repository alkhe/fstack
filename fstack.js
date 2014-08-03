(function(fstack) {

	var fs = require('fs'),
		_path = require('path'),
		os = require('os'),
		constants = require('constants'),
		async = require('async'),
		_ = require('lodash'),
		statMode = function(mode) {
			switch (mode) {
				case constants.S_IFREG:
					return 'file';
				case constants.S_IFDIR:
					return 'directory';
				case constants.S_IFBLK:
					return 'block-device';
				case constants.S_IFCHR:
					return 'char-device';
				case constants.S_IFLNK:
					return 'link';
				case constants.S_IFIFO:
					return 'fifo';
				case constants.S_IFSOCK:
					return 'socket';
				default:
					return 'unknown';
			}
		};

	_.extend(fstack, {
		checkFile: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (stat && !stat.isDirectory())
					callback(err, stat);
				else if (stat)
					return callback(new Error('not-file'));
				else
					return callback(err);
			});
		},
		checkDir: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (stat && stat.isDirectory())
					callback(err, stat);
				else if (stat)
					return callback(new Error('not-directory'));
				else
					return callback(err);
			});
		},
		ents: function(path, callback) {
			fstack.checkDir(path, function(err, stat) {
				if (err)
					return callback(err);
				fs.readdir(path, function(err, ents) {
					if (err)
						return callback(err);
					async.map(ents, function(ent, cb) {
						fs.stat(fstack.join(path.length ? path : '', ent), cb);
					}, function(err, stats) {
						callback(err, _.zipObject(ents, stats));
					});
				});
			});
		},
		dirs: function(path, callback) {
			fstack.ents(path, function(err, data) {
				if (err)
					return callback(err);
				callback(err, _.pick(data, function(stat) {
					return stat.isDirectory();
				}));
			});
		},
		files: function(path, callback) {
			fstack.ents(path, function(err, data) {
				if (err)
					return callback(err);
				callback(err, _.omit(data, function(stat) {
					return stat.isDirectory();
				}));
			});
		},
		fst: function(path, callback, depth) {
			fstack.checkDir(path, function(err, stat) {
				if (err)
					return callback(err);
				fstack.fsn(path, function(err, o) {
					callback(err, o);
				}, depth);
			});
		},
		fso: fstack.fst,
		fsn: function(path, callback, depth) {
			var o = {};
			if (depth !== 0) {
				if (depth)
					depth--;
				async.parallel([
					function(next) {
						fstack.dirs(path, function(err, dirs) {
							async.each(_.keys(dirs), function(dir, cb) {
								fstack.fsn(fstack.join(path, dir), function(err, d) {
									o[dir] = d ;
									cb(err);
								}, depth);
							}, next);
						});
					},
					function(next) {
						fstack.files(path, function(err, files) {
							async.each(_.keys(files), function(file, cb) {
								fstack.device(fstack.join(path, file), function(err, statmode) {
									o[file] = statmode;
									cb(err);
								});
							}, next);
						});
					}
				], function(err) {
					callback(err, o);
				});
			}
			else
				callback(null, o);
		},
		device: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				callback(err, statMode(stat.mode & constants.S_IFMT));
			});
		},
		mkdir: function(path, callback, force) {
			if (!force)
				fstack.checkDir(path, function(err, stat) {
					if (err && err.code === 'ENOENT')
						fs.mkdir(path, _.partialRight(callback, true));
					else
						callback(err);
				});
			else
				fs.mkdir(path, _.partialRight(callback, true));
		},
		mkdirp: function(path, callback, force) {
			var force = force || false;
			async.reduce(fstack.normalize(path).split(fstack.sep), '', function(parent, local, cb) {
				fstack.mkdir(fstack.join(parent, local), function(err, made) {
					if (force = made && err && (err.code === 'EEXIST'))
						err = null;
					cb(err, fstack.join(parent, local));
				}, force);
			}, function(err) {
				callback(err);
			});
		},
		read: function(path, callback) {
			fstack.checkFile(path, function(err) {
				if (err)
					return callback(err);
				fs.readFile(path, callback);
			});
		},
		readStream: function(path, callback) {
			fstack.checkFile(path, function(err) {
				if (err)
					return callback(err);
				callback(err, fs.createReadStream(path));
			});
		},
		write: function(path, data, callback) {
			fstack.checkFile(path, function(err) {
				if (err)
					if (err.code === 'ENOENT')
						err = null;
					else
						return callback(err);
				fs.writeFile(path, data, callback);
			});
		},
		writeStream: function(path, callback) {
			fstack.checkFile(path, function(err) {
				if (err)
					if (err.code === 'ENOENT')
						err = null;
					else
						return callback(err);
				callback(err, fs.createWriteStream(path));
			});
		},
		append: function(path, data, callback) {
			fstack.checkFile(path, function(err) {
				if (err)
					if (err.code === 'ENOENT')
						err = null;
					else
						return callback(err);
				fs.appendFile(path, data, callback);
			});
		},
		json: function(path, callback, explicit) {
			fstack.read(path, function(err, data) {
				if (err)
					if (explicit)
						return callback(err);
					else
						fstack.json(path + '.json', callback, true);
				else
					callback(err, JSON.parse(data));
			});
		},
		delete: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat.isDirectory()) {
					async.parallel([
						function(next) {
							fstack.dirs(path, function(err, dirs) {
								async.each(_.keys(dirs), function(dir, n) {
									fstack.delete(fstack.join(path, dir), n);
								}, next);
							});
						},
						function(next) {
							fstack.files(path, function(err, files) {
								async.each(_.keys(files), function(file, n) {
									fs.unlink(fstack.join(path, file), n);
								}, next);
							});
						}
					], function(err) {
						if (err)
							return callback(err);
						fs.rmdir(path, callback);
					});
				}
				else
					fs.unlink(path, callback);
			});
		},
		copy: function(source, destination, callback) {
			fs.stat(source, function(err, stat) {
				if (err)
					return callback(err);
				if (stat.isDirectory()) {
					fs.stat(destination, function(err) {
						if (err && err.code === 'ENOENT') {
							err = null;
							fstack.mkdirp(destination, function(err) {
								if (err)
									return callback(err);
							});
						}
						else if (err)
							return callback(err);
						async.parallel([
							function(next) {
								fstack.dirs(source, function(err, dirs) {
									if (err)
										return next(err);
									async.each(_.keys(dirs), function(dir, n) {
										fstack.copy(fstack.join(source, dir), fstack.join(destination, dir), n);
									}, next);
								});
							},
							function(next) {
								fstack.files(source, function(err, files) {
									if (err)
										return next(err);
									async.each(_.keys(files), function(file, n) {
										fstack.copy(fstack.join(source, file), fstack.join(destination, file), n);
									}, next);
								});
							}
						], callback);
					});
				}
				else {
					fs.stat(destination, function(err) {
						if (err && err.code === 'ENOENT') {
							err = null;
							fstack.mkdirp(fstack.dirname(destination), function(err) {
								if (err)
									return callback(err);
								fs.createReadStream(source).pipe(fs.createWriteStream(destination));
								return callback(err);
							});
						}
						else
							return callback(err);
					});
				}
			});
		},
		move: function(source, destination, callback) {
			fs.stat(source, function(err, stat) {
				if (err)
					return callback(err);
				if (stat.isDirectory()) {
					fs.stat(destination, function(err) {
						if (err && err.code === 'ENOENT') {
							err = null;
							fstack.mkdirp(fstack.dirname(destination), function(err) {
								if (err)
									return callback(err);
								return fs.rename(source, destination, callback);
							});
						}
						else if (err)
							return callback(err)
						else {
							async.parallel([
								function(next) {
									fstack.dirs(source, function(err, dirs) {
										if (err)
											return next(err);
										async.each(_.keys(dirs), function(dir, n) {
											fstack.move(fstack.join(source, dir), fstack.join(destination, dir), n);
										}, next);
									});
								},
								function(next) {
									fstack.files(source, function(err, files) {
										if (err)
											return next(err);
										async.each(_.keys(files), function(file, n) {
											fstack.move(fstack.join(source, file), fstack.join(destination, file), n);
										}, next);
									});
								}
							], function(err) {
								if (err)
									return callback(err);
								fs.rmdir(source, callback);
							});
						}
					});
				}
				else {
					fs.stat(destination, function(err) {
						if (err && err.code === 'ENOENT') {
							err = null;
							fstack.mkdirp(fstack.dirname(destination), function(err) {
								if (err)
									return callback(err);
							});
						}
						else if (err)
							return callback(err);
						else
							fs.rename(source, destination, callback);
					});
				}
			});
		}
	}, _path, os);

})(module.exports);
