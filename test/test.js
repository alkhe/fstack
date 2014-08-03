var fstack = require('../fstack'),
	async = require('async');

async.series([
	function(next) {
		fstack.ents('.', function(err, ents) {
			console.log('ents: ');
			console.log(ents);
			next();
		});
	},
	function(next) {
		fstack.files('.', function(err, files) {
			console.log('files:');
			console.log(files);
			next();
		});
	},
	function(next) {
		fstack.dirs('.', function(err, dirs) {
			console.log('dirs: ');
			console.log(dirs);
			next();
		});
	},
	function(next) {
		fstack.readStream('test.js', function(err, stream) {
			stream.pipe(process.stdout);
			next();
		});
	},
	function(next) {
		fstack.read('test.js', function(err, data) {
			console.log(data.toString());
			next();
		});
	},
	function(next) {
		console.log(fstack.tmpdir());
		next();
	},
	function(next) {
		fstack.fst('.', function(err, fst) {
			if (err)
				console.log(err);
			console.log(JSON.stringify(fst, null, 4));
			next();
		});
	},
	function(next) {
		fstack.fst('.', function(err, fst) {
			if (err)
				console.log(err);
			console.log(JSON.stringify(fst, null, 4));
			next();
		}, 1);
	},
	function(next) {
		fstack.mkdirp('b/c/d/e', function(err) {
			next();
		});
	},
	function(next) {
		fstack.copy('a', 'f', function(err) {
			next();
		});
	},
	function(next) {
		fstack.move('f', 'g', function(err) {
			next();
		});
	},
	function(next) {
		fstack.write('abc.de', 'hello', function(err) {
			next();
		});
	}
]);




