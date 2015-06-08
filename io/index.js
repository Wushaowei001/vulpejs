"use strict";

var fs = require('fs');

module.exports = {
  read: {
    file: function(path, encoding) {
      encoding = encoding || 'utf8';
      return fs.readFileSync(path, encoding);
    },
    dir: function(path, callback) {
      fs.readdir(path, function(err, list) {
        vulpejs.utils.execute(callback, list);
      });
    }
  },
  write: {
    file: function(name, content) {
      fs.writeFileSync(name, content);
    }
  },
  remove: {
    file: function(path) {
      fs.unlinkSync(path);
    }
  },
  info: {
    file: function(path) {
      return fs.statSync(path);
    }
  },
  file: {
    size: function(filename) {
      var stats = fs.statSync(filename);
      return stats["size"];
    },
    /**
     * Return file content type.
     *
     * @param  {String} fileName
     * @return {String} Content Type
     */
    contentType: function(fileName) {
      var contentType = 'application/octet-stream';
      var file = fileName.toLowerCase();

      if (file.indexOf('.html') >= 0) {
        contentType = 'text/html';
      } else if (file.indexOf('.css') >= 0) {
        contentType = 'text/css';
      } else if (file.indexOf('.json') >= 0) {
        contentType = 'application/json';
      } else if (file.indexOf('.js') >= 0) {
        contentType = 'application/x-javascript';
      } else if (file.indexOf('.png') >= 0) {
        contentType = 'image/png';
      } else if (file.indexOf('.jpg') >= 0) {
        contentType = 'image/jpg';
      }

      return contentType;
    }
  }
};