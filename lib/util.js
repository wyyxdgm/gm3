let fs = require('fs');
let path = require('path');
let _ = require('underscore');
let colors = require('colors');
let ejs = require('ejs');
let LOG_TITLE = '[GM]'.green;

let init = (conf) => {
	__append_array = conf['append-array'];
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
let buildStr = (baseDir) => {
	if (__verbose) console.log(LOG_TITLE, `BuildDirectory: ${baseDir}`)
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
			let data = deepExtend(true, moduleComponent.json, v.data);
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

let build = (baseDir, target) => {
	fs.writeFileSync(path.join(baseDir, target || 'gm.html'), buildStr(baseDir));
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

function deepExtend() {
	//  arguments种类
	//  [deep]  可选，标注是否为深度继承
	//  target  第一个对象，则为目标对像
	//  options  之后的对象，都视为继承对象
	var args = arguments,
		target = args[0], //  假设第一个参数为目标对象
		len = args.length, //  获取参数总长度
		i = 1, //  假设继承对象从下标为1开始
		deep = false, //  初始化为浅拷贝
		tar, source, option, key
	//  如果第一个参数是布尔值，那么第二个参数做为目标对象
	if (typeof target === 'boolean') {
		deep = target
		target = args[i++]
	}
	//  遍历继承对象，并将每一个都继承到目标对象中
	for (; i < len; i++) {

		option = args[i]

		for (key in option) {
			tar = target[key]
			source = option[key]
			// console.log("source", source, "option", option, "key", key)
			//  如果为深拷贝并且此时的属性值为对象，则进行递归拷贝
			if (deep && _.isObject(source)) {
				if (!_.isObject(tar)) { //  如果目标对象没有此属性，那么创建它
					tar = _.isArray(source) ? [] : {}
				}
				if (_.isArray(tar) && _.isArray(source) && !__append_array) {
					let _st = source.length > tar.length
					if (_st > 0) source.splice(_st);
				}
				//  将递归拷贝的结果赋值给目标对象
				target[key] = deepExtend(deep, tar, source);
			} else {
				//  如果为浅拷贝，直接赋值
				target[key] = source
			}
		}
	}
	return target
}

module.exports = {
	_require,
	load,
	deepExtend,
	init,
	build,
	buildStr
}