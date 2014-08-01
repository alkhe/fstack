var fstack = require('./fstack');

fstack.files('.s', function(err, files) {
	console.log('files:');
	console.log(files);

	fstack.dirs('.', function(err, dirs) {
		console.log('dirs: ');
		console.log(dirs);

		fstack.ents('.', function(err, ents) {
			console.log('ents: ');
			console.log(ents);
		});
	});
});




