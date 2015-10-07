"use strict";

var dust = require('dustjs-linkedin');

exports.dust = dust;

/**
 * Load Dust template and execute callback.
 * @param {Object} options {name, data, res, callback}
 */
exports.get = function(options) {
  dust.compile(vulpejs.io.read.file(vulpejs.app.root.dir + '/templates/' + options.name), options.name);
  dust.render(options.name, options.data, function(error, out) {
    if (error) {
      vulpejs.log.error('Error on parse template ' + options.name + ': ' + error);
      if (options.res) {
        vulpejs.routes.response.error(options.res, error);
      }
    } else {
      vulpejs.utils.execute(options.callback, out);
    }
  });
};

/**
 * Compile template
 *
 * @param  {String} definition
 * @param  {String} name
 * @return {}
 */
exports.compile = function(definition, name) {
  dust.loadSource(dust.compile(definition, name));
  return dust;
};

/**
 * Render template
 *
 * @param  {Object} options
 * @return {}
 */
exports.render = function(options) {
  dust.loadSource(dust.compile(options.definition, options.name));
  dust.render(options.name, options.data, function(error, out) {
    vulpejs.utils.execute(options.callback, {
      error: error,
      out: out
    });
  });
};