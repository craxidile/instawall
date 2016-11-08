var q = require("q");
var FB = require("fb");

function getTokens() {
  return [{
    accessToken: "701096326591353|GnZ-tx2PelAa3bZy8INa1Fz6jzE"
  }]
};

function getFileName() {
  return "./fb_next.txt";
}

function getTag() {
  return "#" + sails.config.tag.name;
}

function getUrl() {
  return 'v1.0/search?type=post&q=';
}

function getNext(callback) {
  FileUtil.readFully(getFileName(), callback);
}

function saveNext(text, callback) {
  FileUtil.writeFully(getFileName(), text, callback);
}

function fetch(next, callback) {
  if (!callback) return;

  var url;

  if (next) {
    url = (next || "").replace('https://graph.facebook.com/', '');
  } else {
    url = getUrl()
        + encodeURIComponent(getTag())
        + "&access_token="
        + getTokens()[0].accessToken;
  }

  FB.api(url, function (res) {
    if(!res || res.error) {
      return callback(!res ? new Error("Unexpected Error.") : res.error, null);
    }

    console.log(url);
    console.log(res);
    callback(null, res);
  });
}

function loop() {
  var d = q.defer();
  var originalNext;

  d.promise.then(function() {
    var d = q.defer();

    getNext(function(err, data) {
      var next;
      if (err)
        next = "";
      else
        next = data;

      originalNext = next;
      d.resolve(next);
    });

    return d.promise;
  }).then(function(next) {
    var d = q.defer();

    fetch(next, function(err, data) {
      if (err) return d.reject(err);

      d.resolve(data.paging ? data.paging.previous : "")
    });

    return d.promise;
  }).then(function(next) {
    var d = q.defer();

    if (next && originalNext) {
      saveNext(next, function (err, success) {
        if (success)
          console.log("Save next successfully.");
        else
          console.log(err);

        d.resolve();
      });
    }

    setTimeout(loop, 15000);

    return d.promise;
  }).fail(function (err) {
    console.log("FACEBOOK LOOP ERR: ", err);
    setTimeout(loop, 5000);
  });

  d.resolve();
}

module.exports = {
  start: function() {
    loop();
  },
  stop: function() {

  }
};

