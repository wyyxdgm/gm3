let util = require('./util.js');
module.exports.install = util.install;
module.exports.auth = util.auth;
module.exports.info = util.info;
module.exports.publish = util.publish;
module.exports.search = util.search;
module.exports.build = (conf) => util.buildStr(conf.dir || '', conf.appendArray, conf);
