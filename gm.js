let fs = require('fs');
let path = require('path');
let _ = require('underscore');
let colors = require('colors');
let util = require('./lib/util.js');
/**
 * load args
 * @type Object
 */
let CONSOLE_HEAD = '[GM]'.green;
let argv = require("argp").createParser({
		once: true
	})
	.description("Gm help.")
	.email("wyyxdgm@163.com")
	.body()
	//The object and argument definitions and the text of the --help message
	//are configured at the same time
	// .text(" Arguments:")
	// .argument("path", {
	// 	description: "Path of the target file that will be bulilded, default value is defined in gm.json by the 'main' property"
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

let baseDir = argv.directory ? path.resolve(process.cwd(), argv.directory) : process.cwd();
util.init({
	verbose: argv['verbose'],
	CONSOLE_HEAD: CONSOLE_HEAD,
	'append-array': argv['append-array']
});

util.build(baseDir, argv['output']);


//bower
// cache                   Manage bower cache
//     help                    Display help information about Bower
//     home                    Opens a package homepage into your favorite browser
//     info                    Info of a particular package
//     init                    Interactively create a bower.json file
//     install                 Install a package locally
//     link                    Symlink a package folder
//     list                    List local packages - and possible updates
//     login                   Authenticate with GitHub and store credentials
//     lookup                  Look up a single package URL by name
//     prune                   Removes local extraneous packages
//     register                Register a package
//     search                  Search for packages by name
//     update                  Update a local package
//     uninstall               Remove a local package
//     unregister              Remove a package from the registry
//     version                 Bump a package version
// Options:

//     -f, --force             Makes various commands more forceful
//     -j, --json              Output consumable JSON
//     -l, --loglevel          What level of logs to report
//     -o, --offline           Do not hit the network
//     -q, --quiet             Only output important information
//     -s, --silent            Do not output anything, besides errors
//     -V, --verbose           Makes output more verbose
//     --allow-root            Allows running commands as root
//     -v, --version           Output Bower version
//     --no-color              Disable colors
//     --config.interactive=false Disable prompts