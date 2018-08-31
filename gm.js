#!/usr/local/bin/node

/**
 * load args
 * @type Object
 */

let argv = require("argp").createParser({
		once: true
	})
	.on('end', function(argv) {
		if (!argv.build) this.printHelp();
	})
	.description("Gm help.")
	.email("wyyxdgm@163.com")
	.body()
	// The object and argument definitions and the text of the --help message
	// are configured at the same time
	.text(" Arguments:")
	.argument("build", {
		description: "compile && build file"
	})
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
		short: "a",
		long: "append-array",
		description: "Appends intead of replaces an array"
	})
	.option({
		short: "V",
		long: "verbose",
		description: "Makes output more verbose"
	})
	.help()
	.version("v1.0.0")
	.argv();

if (argv.build) {
	let util = require('./lib/util.js');
	util.init(argv);
	util.build(argv.directory ? require('path').resolve(process.cwd(), argv.directory) : process.cwd(), argv['output'], argv['append-array']);
}