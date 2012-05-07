/**
 * Module dependencies.
 */

var path = require('path')
  , dirname = path.dirname
  , join = path.join
  , glob = require('glob');
/**
 * Include another JSON file,
 * for example "include config/permissions".
 */

exports = module.exports = function(key, val, parser){
  var m = /^include +([\{\[]?) *(.*?) *([\}\]]?)$/.exec(val);
  var simple = /^include +([^\{\[].*)$/.exec(val)
  var brace, relativePath
  if (simple) m = simple;
  if (!m) return;
  if (!simple) {
    if ((m[1] == "" && m[3] != "") ||
        (m[1] != "" && m[1].charCodeAt(0) + 2 !== m[3].charCodeAt(0))) {
      return; // braces don't match
    }
    brace = m[1];
    relativePath = m[2];
  } else {
    brace = "";
    relativePath = m[1];
  }
  var result;
  if (path.extname(relativePath) === '') {
    relativePath += '.json'
  }
  switch (brace) {
    case "":
      // if not globbing, can leave off .json
      var paths = glob.sync(join(dirname(parser.path), relativePath));
      paths = paths.sort();
      return paths.map(function(absolutePath) {
        return parser.clone().parse(exports.getData(absolutePath));
      }).reduce(function(previous, data) {
        for (var key in data) {
          previous[key] = data[key];
        }
        return previous;
      })
      break;
    case "{":
      var paths = glob.sync(join(dirname(parser.path), relativePath));
      result = paths.map(function(absolutePath) {
        // get file name without extension
        var key = path.basename(absolutePath);
        key = key.slice(0, key.indexOf(path.extname(absolutePath)));

        var result = {};
        result[key] = parser.clone().parse(exports.getData(absolutePath));
        return result;
      }).reduce(function(previous, data) {
        for (var key in data) {
          previous[key] = data[key];
        }
        return previous;
      })
      break;
    case '[':
      var paths = glob.sync(join(dirname(parser.path), relativePath));
      paths = paths.sort();
      return paths.map(function(absolutePath) {
        return parser.clone().parse(exports.getData(absolutePath));
      })
      break;
    default:
      // shouldn't get here
      console.warn('No Match:', brace);
  }
  return result;
}

exports.extensions = {
  json: function(data) {
    return data;
  }
}

exports.getData = function(relativePath) {
  var extname = path.extname(relativePath);
  var fileContents = require('fs').readFileSync(relativePath, 'utf8')
  var processFunction = exports.extensions[extname.slice(1)] || function() { return '""'; }
  return processFunction(fileContents);
}


