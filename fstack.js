(function(fstack) {

	var fs = require('fs'),
		path = require('path'),
		os = require('os'),
		async = require('async'),
		_ = require('lodash');

	_.extend(fstack, {
		checkFile: function(path, callback) {
			
		},
		checkDir: function(path, callback) {

		},
		ents: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && stat.isDirectory()) {
					fs.readdir(path, function(err, ents) {
						if (err)
							return callback(err);
						async.map(ents, fs.stat, function(err, stats) {
							callback(err, _.zipObject(ents, stats));
						});
					});
				}
				else if (stat)
					callback(new Error('not-directory'));
				else
					callback(new Error('not-found'));
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
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory())
					fs.readFile(path, callback);
				else if (stat)
					callback(new Error('not-file'));
				else
					callback(new Error('not-found'));
			});	
		},
		readStream: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory())
					callback(null, fs.createReadStream(path));
				else if (stat)
					callback(new Error('not-file'));
				else
					callback(new Error('not-found'));
			});	
		},
		write: function(path, data, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory())
					fs.write(path, data, callback);
				else if (stat)
					callback(new Error('not-file'));
				else
					callback(new Error('not-found'));
			});	
		},
		writeStream: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory())
					callback(null, fs.createWriteStream(path));
				else if (stat)
					callback(new Error('not-file'));
				else
					callback(new Error('not-found'));
			});	
		},
		append: function(path, data, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory())
					fs.appendFile(path, data, callback);
				else if (stat)
					callback(new Error('not-file'));
				else
					callback(new Error('not-found'));
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
