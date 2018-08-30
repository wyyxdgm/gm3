let _ = require('underscore');
console.log(_.isObject(null),_.isObject(), _.isObject({}), _.isObject([]), _.isObject(() => {}))