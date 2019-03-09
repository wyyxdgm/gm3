#!/usr/local/bin/node

/**
 * load args
 * @type Object
 */

let argv = require("argp").createParser({
		once: true
	})
	.on('end', function(argv) {
		// if (!argv.build) this.printHelp();
	})
	.description("Gm help.")
	.email("wyyxdgm@163.com")
	.body()
	// The object and argument definitions and the text of the --help message
	// are configured at the same time
	// .text(" Arguments:")
	// .argument("build", {
	// 	description: "compile && build file"
	// })
	.text("\n Options:")
	.option({
		short: "d",
		long: "directory",
		optional: true,
		metavar: "DIR",
		description: "The directory to be builded, default is current directory"
	})
	.option({
		short: "o",
		long: "output",
		optional: true,
		metavar: "PATH",
		description: "Write the builded content to the target file"
	})
	.option({
		short: "m",
		long: "main",
		optional: true,
		metavar: "PATH",
		description: "defind the entry file"
	})
	.option({
		short: "a",
		long: "append-array",
		description: "Appends intead of replaces an array"
	})
	.option({
		short: "b",
		long: "build",
		description: "Compile && build file"
	})
	.option({
		short: "i",
		long: "install",
		optional: true,
		metavar: "MODULES",
		description: "Install templates"
	})
	.option({
		short: "A",
		long: "auth",
		optional: true,
		metavar: "USER:PASS",
		description: "User auth by name and password"
	})
	.option({
		short: "s",
		long: "search",
		optional: true,
		metavar: "key1:key2:...",
		description: "Search by keys"
	})
	.option({
		short: "p",
		long: "publish",
		description: "Publish package"
	})
	.option({
		short: "I",
		long: "info",
		description: "Show local infos"
	})
	.option({
		short: "V",
		long: "verbose",
		description: "Makes output more verbose"
	})
	.help()
	.version("v1.0.0")
	.argv();
let util = require('../lib/util.js');
let baseDir = argv.directory ? require('path').resolve(process.cwd(), argv.directory) : process.cwd();
if (argv.install) {
	util.install(argv.install, baseDir);
} else if (argv.auth) {
	let as = argv.auth.split(':');
	util.auth(as[0], as[1]);
} else if (argv.info) {
	util.info();
} else if (argv.publish) {
	util.publish();
} else if (argv.search) {
	util.search(argv.search.split(':'));
} else {
	util.init(argv);
	util.build(baseDir, argv['output'], argv['append-array'], argv['main']);
}
