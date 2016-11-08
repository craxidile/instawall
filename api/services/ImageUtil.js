var fs = require("fs");
var q = require("q");
var http = require("http");
var https = require("https");

module.exports = {
  download: function(url, fileName, secure, callback) {
    if (!callback) return;

    var d = q.defer();
    var imageData = "";

    d.promise.then(function() {
      var d = q.defer();

      (secure ? https : http).get(url, function (res) { console.log("$$$$$$$$$$$$$$$");
        res.setEncoding('binary')

        res.on('data', function (chunk) {
          imageData += chunk
        });

        res.on('error', function (err) {
          d.reject(err);
        });

        res.on('end', function () {
          fs.writeFileSync(fileName, imageData, 'binary');
          callback(null, true);
          d.resolve();
        });

      }).on("error", function (e) {
        d.reject(e);
      }).end();

      return d.promise;
    }).fail(function(err) {
      callback(err, false);
    });

    d.resolve();
  }
}
