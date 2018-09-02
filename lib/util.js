let fs = require('fs');
let path = require('path');
let _ = require('underscore');
let colors = require('colors');
let ejs = require('ejs');
let ncp = require('ncp');
let LOG_TITLE = '[GM]'.green;
let __verbose;
const USER_HOME = process.env.HOME || process.env.USERPROFILE
let CONIF_PATH = path.resolve(USER_HOME, '.gm');
let init = (conf) => {
	__verbose = conf['verbose'];
}

let _require = (path_name_no_suffix) => {
	let json;
	try {
		json = require(path_name_no_suffix);
	} catch (e) {
		console.error(`no ${path_name_no_suffix} with suffix .json nor .js`);
	}
	return json;
}

//TODO
//search key worlds [registry]
let search = (keys) => {
	console.log('do search at site...')
	//todo search
	//api post /search {keys:[key1,key2,key3]}
}
let upload = (dir, auth) => {
	console.log('do upload to site...')
	//todo upload
};

let installFromSite = (package) => {
	console.log('do install from site...')
	//todo download
}

//info [registry]
let info = () => {
	let conf = loadLocalInfo();
	return console.log(conf);
}

//auth
let auth = (user, pass) => {
	setLocalInfo('auth', {
		user,
		pass
	});
}
//	publish
let check = () => {
	try {
		return !!load(process.cwd());
	} catch (e) {
		console.error(e);
	}
	return false;
}
let loadLocalInfo = (key) => {
	let txt = fs.existsSync(CONIF_PATH) && fs.readFileSync(CONIF_PATH).toString() || '{}';
	let conf;
	try {
		conf = JSON.parse(txt) || {};
	} catch (e) {
		console.error(e);
	}
	if (!conf) return;
	if (!key) return conf;
	return conf[key];

}
let setLocalInfo = (key, v) => {
	if (!fs.existsSync(CONIF_PATH)) fs.writeFileSync(CONIF_PATH, '{}');
	let conf = loadLocalInfo();
	if (!conf) conf = {};
	conf[key] = v;
	fs.writeFileSync(CONIF_PATH, JSON.stringify(conf));
}
let publish = () => {
	let auth = loadLocalInfo('auth');
	if (auth && check()) {
		upload({
			dir: process.cwd(),
			auth: auth,
		});
	}
}
let install = (modulePath, baseDir) => {
	var ncp = require('ncp').ncp;
	const _dist_path = path.join(baseDir, 'gm_components', path.basename(modulePath).replace(/\.git$/, ''));
	let cb = (err) => {
		if (err) {
			return console.error(err);
		}
		console.log(`${modulePath} installed!`);
	};
	if (/^[\w\d-]+\@[\w\d\.]+$/.test(modulePath)) {
		//from site
		installFromSite(modulePath);
	} else if (new RegExp('(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]').test(modulePath)) {
		//远程URL
		let gitCloneRepo = require('git-clone-repo');
		let re = gitCloneRepo.default(modulePath, {
			destination: _dist_path
		}); // => true
		cb(!re);
	} else { //本地处理
		// ncp.limit = 100;
		ncp(modulePath, _dist_path, cb);
	}
}
let load = (dir, baseDir) => {
	if (!fs.existsSync(path.join(dir, 'gm.json'))) return console.error('no gm.json');
	let conf = require(path.join(dir, './gm.json'));
	if (!conf.main) return console.error('no main gm.json');
	let [htmlPath, jsonPath] = [conf.main + '.html', conf.main].map(_p => path.join(dir, _p));
	if (!fs.existsSync(htmlPath)) return console.error('no file ' + htmlPath + ' that defined in gm.json by main');
	if (!_require(jsonPath)) return console.error('wich is defined in gm.json by main!');
	let htmlContent = fs.readFileSync(htmlPath).toString()
	let json = _require(jsonPath);
	// console.log("load======", dir, {
	// 	htmlContent,
	// 	json
	// })
	return {
		htmlContent,
		json,
		conf
	};
}

/**
 * build
 * @return {string} build html
 */
let buildStr = (baseDir, appendArray) => {
	if (__verbose) console.log(LOG_TITLE, 'BuildDirectory'.yellow, baseDir)
	/**
	 * init htmlContent,json,conf
	 */
	let {
		htmlContent,
		json,
		conf
	} = load(baseDir);
	/**
	 * init gmComponents by load gm_components
	 * @type {}
	 */
	let gmComponents = {};
	let gmComponentsDirs = fs.readdirSync(path.join(baseDir, 'gm_components'));
	gmComponentsDirs.forEach((moduleDir) => {
		let _p = path.join(baseDir, 'gm_components', moduleDir);
		if (__verbose) console.log(LOG_TITLE, 'Load'.yellow, baseDir ? path.relative(baseDir, _p) : _p);
		gmComponents[moduleDir] = load(_p, baseDir);
	});

	let resolveKey = (o, k) => {
		let v = o[k];
		if (_.isObject(v) && v.template) { //template
			let moduleComponent = gmComponents[v.template];
			let data = deepExtend(moduleComponent.json, v.data, appendArray);
			for (key in data) {
				data[key] = resolveKey(data, key);
			}
			if (__verbose) console.log(LOG_TITLE, 'Render'.yellow, v.template);
			// console.log(`ejs.render: ${v.template}`)
			// console.log(v.template);
			// console.log('- - - - - - - - - - - - ')
			// console.log(data);
			// console.log('========================')

			return ejs.render(moduleComponent.htmlContent, data);
		} else if (_.isArray(v)) {
			// console.log('isArray====================', v)
			return _.map(v, e => resolveKey({
				k: e
			}, 'k'));
		} else {
			return v;
		}
	}
	for (key in json) {
		json[key] = resolveKey(json, key);
	}
	let htmlStr = ejs.render(htmlContent, json);
	return htmlStr;
}

let build = (baseDir, target, appendArray) => {
	let _path = path.join(baseDir, target || 'gm.html');
	fs.writeFileSync(_path, buildStr(baseDir, appendArray));
	if (__verbose) console.log(LOG_TITLE, 'BuildSucess'.yellow, `${_path}`);
}

/**
 *
 * 构建当前页面的json。
 * [0]for key
 * 	[1]如果是template,
 * 		读取该tempate,路径：相对当前路径
 * 			读取的数据
 * 				如果原来没有data数据，
 * 					拼接到该json的data上
 * 						回到[0]
 * 				如果原来的有数据，进入下一层
 * 					回到[1]
 * 
 * 		如果是别的直接忽略。
 * PRE: 所有的 template 都在 gm_components 下
 */

function deepExtend(to, from, appendArray) {
	for (key in from) {
		tar = to[key]
		source = from[key]
		// console.log("source", source, "option", option, "key", key)
		//  如果为深拷贝并且此时的属性值为对象，则进行递归拷贝
		if (_.isObject(source)) {
			if (!_.isObject(tar)) { //  如果目标对象没有此属性，那么创建它
				tar = _.isArray(source) ? [] : {}
			}
			if (_.isArray(tar) && _.isArray(source) && !appendArray) {
				let _st = source.length - tar.length
				// if (__verbose) console.log(source, tar, _st);
				if (_st < 0) tar.splice(_st);
			}
			//  将递归拷贝的结果赋值给目标对象
			to[key] = deepExtend(tar, source, appendArray);
		} else {
			//  如果为浅拷贝，直接赋值
			to[key] = source
		}
	}
	// }
	return to
}

module.exports = {
	info,
	publish,
	auth,
	search,
	install,
	_require,
	load,
	deepExtend,
	init,
	build,
	buildStr
}