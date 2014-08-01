(function(fstack) {

	var fs = require('fs'),
		_path = require('path'),
		os = require('os'),
		async = require('async'),
		_ = require('lodash');

	_.extend(fstack, {
		checkFile: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory())
					callback(err, stat);
				else if (stat)
					return callback(new Error('not-file'));
				else
					return callback(new Error('not-found'));
			});
		},
		checkDir: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && stat.isDirectory())
					callback(err, stat);
				else if (stat)
					return callback(new Error('not-directory'));
				else
					return callback(new Error('not-found'));
			});
		},
		ents: function(path, callback) {
			fstack.checkDir(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
					fs.readdir(path, function(err, ents) {
						if (err)
							return callback(err);
						async.map(ents, function(ent, cb) {
							fs.stat(_path.join(path.length ? path : '.', ent), cb);
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
		fst: function(path, callback) {
			fstack.checkDir(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
					fstack.fsn(path, function(err, o) {
						callback(err, o);
					});
			});
		},
		fso: this.fst,
		fsn: function(path, callback) {
			var o = {};
			async.parallel([
				function(next) {
					fstack.dirs(path, function(err, dirs) {
						async.map(_.keys(dirs), function(dir, cb) {
								fstack.fsn(_path.join(path, dir), function(err, d) {
									o[dir] = d;
									cb(err);
								});
							},
							function(err) {
								next();
						});
					});
				},
				function(next) {
					fstack.files(path, function(err, files) {
						async.map(_.keys(files), function(file, cb) {
								o[file] = 0;
								cb(err);
							},
							function(err) {
								next();
						});
					});
				}
			], function(err) {
				if (callback)
					callback(err, o);
			});
		},
		read: function(path, callback) {
			fstack.checkFile(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
					fs.readFile(path, callback);
			});
		},
		readStream: function(path, callback) {
			fstack.checkFile(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
					callback(null, fs.createReadStream(path));
			});
		},
		write: function(path, data, callback) {
			fstack.checkFile(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
					fs.write(path, data, callback);
			});
		},
		writeStream: function(path, callback) {
			fstack.checkFile(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
					callback(null, fs.createWriteStream(path));
			});
		},
		append: function(path, data, callback) {
			fstack.checkFile(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat)
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
		}
	}, _path, os);

})(module.exports);
