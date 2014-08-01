(function(fstack) {

	var fs = require('fs'),
		path = require('path'),
		async = require('async'),
		_ = require('lodash');

	_.extend(fstack, {
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
			this.ents(path, function(err, data) {
				callback(err, _.pick(data, function(stat) {
					return stat.isDirectory();
				}));
			});
		},
		files: function(path, callback) {
			this.ents(path, function(err, data) {
				callback(err, _.omit(data, function(stat) {
					return stat.isDirectory();
				}));
			});
		},
		read: function(path, callback) {
			fs.stat(path, function(err, stat) {
				if (err)
					return callback(err);
				if (stat && !stat.isDirectory()) {
					fs.readFile(path, callback);
				}
				else if (stat)
					callback(new Error('not-file'));
				else
					callback(new Error('not-found'));
			});	
		}

	});

})(module.exports);
