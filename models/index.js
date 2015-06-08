"use strict";

exports.paginate = require('mongoose-paginate');
exports.autoIncrement = require('mongoose-auto-increment');

/**
 * Validate presence of value.
 * @param   {String}  value Value
 * @return {Boolean} True if exists and False if not.
 */
exports.validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Make model from schema.
 * @param   {Object} options {name, schema}
 * @return {Object} Model
 */
exports.make = function(options) {
  var Schema = exports.schema(options);
  Schema.pre('save', function(next) {
    this.modified = Date.now();
    next();
  });

  return vulpejs.mongoose.model(options.name, Schema);
};

/**
 * Make schema from options.
 * @param   {Object} options {name, schema}
 * @return {Object} Schema
 */
exports.schema = function(options) {
  var Schema = vulpejs.mongoose.Schema;
  var Model = new Schema(options.schema);

  Model.plugin(exports.paginate);

  return Model;
};

/**
 * Init Models Module
 *
 * @param  {Object} options
 * @return {}
 */
exports.init = function(options) {
  var vulpejs = global.vulpejs;
  if (!options.database) {
    options.database = {
      host: 'localhost',
      port: 27017,
      name: 'appName',
      user: 'admin',
      pass: 'q1w2e3r4'
    }
  } else {
    if (!options.database.host) {
      options.database.host = 'localhost';
    }
    if (!options.database.port) {
      options.database.port = 27017;
    }
    if (!options.database.name) {
      options.database.name = 'appName';
    }
    if (!options.database.user) {
      options.database.user = 'admin';
    }
    if (!options.database.pass) {
      options.database.pass = 'q1w2e3r4';
    }
  }
  var db = vulpejs.mongoose.connection;
  db.on('error', console.error);
  db.once('open', function() {
    var init = function() {
      vulpejs.debug.log(vulpejs.i18n.__('Database successfully started!'));
      vulpejs.schedules.init();
    };
    require(root.vulpejs.dir + '/models/security');
    var modelsDir = vulpejs.app.root.dir + '/models/';
    var listModules = function(callback) {
      vulpejs.io.read.dir(modelsDir, function(list) {
        var modules = [];
        if (list) {
          list.forEach(function(name) {
            var stats = vulpejs.io.info.file(modelsDir + name);
            if (stats.isFile() && name[0] !== '.') {
              modules.push(name.split('.')[0]);
            }
          });
          callback(modules);
        }
      });
    };
    if (options.models) {
      if (Array.isArray(options.models)) {
        options.models.forEach(function(model) {
          require(modelsDir + model);
        });
        init();
      } else if (options.models.load && options.models.load.first) {
        listModules(function(modules) {
          options.models.load.first.forEach(function(name) {
            var removed = modules.splice(modules.indexOf(name), 1);
            require(modelsDir + removed)();
          });
          modules.forEach(function(name) {
            require(modelsDir + name);
          });
          init();
        });
      }
    } else {
      listModules(function(modules) {
        modules.forEach(function(name) {
          require(modelsDir + name);
        });
        init();
      });
    }
  });
  var mongoUrl = 'mongodb://${auth}${host}:${port}/${db}?authSource=admin&w=1';
  var database = options.database;
  if (database && database[vulpejs.app.env]) {
    database = database[vulpejs.app.env];
    if (!database.port) {
      database.port = 27017;
    }
  }
  if (database.user && database.pass) {
    mongoUrl = mongoUrl.replace('${auth}', database.user + ':' + database.pass + '@');
  } else {
    mongoUrl = mongoUrl.replace('${auth}', '');
  }
  mongoUrl = mongoUrl.replace('${host}', database.host);
  mongoUrl = mongoUrl.replace('${port}', database.port);
  mongoUrl = mongoUrl.replace('${db}', database.name);
  vulpejs.mongoose.connect(mongoUrl);
  exports.autoIncrement.initialize(vulpejs.mongoose.connection);
};