var fs = require("fs");
var q = require("q");

module.exports = {
  readFully: function(fileName, callback) {
    if (!callback) return;

    var d = q.defer();
    var readSize, fileDesc;

    d.promise.then(function() {
      var d = q.defer();
      fs.exists(fileName, function(exists) {
        if (exists)
          d.resolve();
        else
          d.reject("File not found.");
      });

      return d.promise;
    }).then(function() {
      var d = q.defer();

      fs.stat(fileName, function(error, stats) {
        if (error)
          d.reject(error);
        else if (stats.isFile()) {
          readSize = stats.size;
          d.resolve();
        } else
          d.reject("Format mismatched.");
      });

      return d.promise;
    }).then(function() {
      var d = q.defer();

      fs.open(fileName, "r", function(error, fd) {
        if (error)
          d.reject(error);
        else {
          fileDesc = fd;
          d.resolve();
        }
      });

      return d.promise;
    }).then(function() {
      var d = q.defer();

      var buffer = new Buffer(readSize);

      if (buffer.length === 0) {
        callback(null, "");
        d.resolve();
      } else {
        fs.read(fileDesc, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
          var data = buffer.toString("utf8", 0, buffer.length);
          callback(null, data);
          d.resolve();
        });
      }

      return d.promise;
    }).then(function() {
      var d = q.defer();

      fs.close(fileDesc);

      return d.promise;
    }).fail(function(e) {
      console.error("READ FULLY ERROR: " + e);
      callback(e, null);
    });

    d.resolve();
  },
  writeFully: function(fileName, text, callback) {
    if (!fileName || !callback) return;

    var d = q.defer();
    console.log(fileName,text);
    d.promise.then(function() {
      var d = q.defer();

      fs.writeFile(fileName, text, function(err) {
        if(err) {
          d.reject(err);
        } else {
          callback(null, true);
          d.resolve();
        }
      });

      return d.promise;
    }).fail(function(e) {
      console.error("WRITE FULLY ERROR: " + e);
      callback(e, false);
    });

    d.resolve();
  }
}
