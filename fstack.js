(function(fstack) {

	var fs = require('fs'),
		path = require('path'),
		async = require('async'),
		_ = require('lodash');

	fstack = {
		entsx: function(path, callback) {
			this.ents(path, function(err, ents) {
				if (err)
					return callback(err);
				async.map(ents, fs.stat, function(err, stats) {
					callback(err, {
						ents: ents,
						stats: _.zipObject(ents, stats)
					});
				});
			});
		},
		ents: function(path, callback) {
			fs.readdir(path, callback);
		},
		dirs: function(path, callback) {

		},
		files: function(path, callback) {
			this.entsx(path, function(err, data) {
				if (err)
					return callback(err);
				callback(err, _.filter(data.stats, function(ent, stat) {
					return stat.isFile();
				});
			});
		},
	}

})(module.exports);
