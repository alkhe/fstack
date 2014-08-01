(function(fstack) {

	var fs = require('fs'),
		path = require('path'),
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
						async.map(ents, fs.stat, function(err, stats) {
							callback(err, _.zipObject(ents, stats));
						});
					});
			});
		},
		dirs: function(path, callback) {
			fstack.ents(path, function(err, data) {
				callback(err, _.pick(data, function(stat) {
					return stat.isDirectory();
				}));
			});
		},
		files: function(path, callback) {
			fstack.ents(path, function(err, data) {
				callback(err, _.omit(data, function(stat) {
					return stat.isDirectory();
				}));
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
	}, path, os);

})(module.exports);
