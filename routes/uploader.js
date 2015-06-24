"use strict";

var uploader = require(root.vulpejs.dir + '/uploader')({
  tmpDir: vulpejs.app.uploader.dir.tmp,
  publicDir: vulpejs.app.uploader.dir.public || vulpejs.app.uploader.dir.files,
  uploadDir: vulpejs.app.uploader.dir.files,
  uploadUrl: '/uploaded/files/',
  downloadUrl: '/download/files/',
  maxPostSize: 11000000000, // 11 GB
  minFileSize: 1,
  maxFileSize: 10000000000, // 10 GB
  acceptFileTypes: /.+/i,
  copyImgAsThumb: true,
  // Files not matched by this regular expression force a download dialog,
  // to prevent executing any scripts in the context of the service domain:
  inlineFileTypes: /\.(gif|jpe?g|png)$/i,
  imageTypes: /\.(gif|jpe?g|png)$/i,
  imageVersions: {
    maxWidth: 80,
    maxHeight: 80
  },
  accessControl: {
    allowOrigin: '*',
    allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
    allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
  },
  nodeStatic: {
    cache: 3600 // seconds to cache served files
  }
});

/**
 * Uploader Module
 *
 * @param  {Router} router
 * @return {} Express route
 */
module.exports = function() {

  var router = vulpejs.express.router;
  var create = function(dir) {
    vulpejs.io.dir.exists(dir, function(exists) {
      if (!exists) {
        vulpejs.io.dir.make(dir + '/thumbnail');
      };
    });
  };
  var dir = function(req, make) {
    if (req.params.dir) {
      req.params.uploadDir = req.params.dir.indexOf('/') !== -1 ? req.params.dir : vulpejs.app.uploader.dir.files + '/' + req.params.dir;
      if (make) {
        create(req.params.uploadDir);
      }
    }
  };
  router.get('/upload/:dir?', function(req, res) {
    dir(req, true);
    uploader.get(req, res, function(obj) {
      res.json(obj);
    });
  });

  router.post('/upload/:dir?', function(req, res) {
    dir(req, true);
    uploader.post(req, res, function(obj) {
      res.json(obj);
    });
  });

  router.delete('/uploaded/files/:name/:dir?', function(req, res) {
    dir(req);
    uploader.delete(req, res, function(obj) {
      res.json(obj);
    });
  });

  return router;
};