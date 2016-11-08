var q = require("q");
var OAuth = require('OAuth');

function getFileName() {
  return "./tw_next.txt";
}

function getImageDir() {
  return "c:/bigga/twitter/";
}

function getOAuth() {
  return new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    getTokens()[0].appToken,
    getTokens()[0].appTokenSecret,
    '1.0A',
    null,
    'HMAC-SHA1'
  );
}

function getTag() {
  return "#" + sails.config.tag.name;
}

function getUrl() {
  return '"https://api.instagram.com/v1/tags/{0}/media/recent?access_token={1}"';
}

function getNext(callback) {
  FileUtil.readFully(getFileName(), callback);
}

function saveNext(text, callback) {
  FileUtil.writeFully(getFileName(), text, callback);
}

function download(url, fileName, callback) {
  ImageUtil.download(url, fileName, false, callback);
}

function getTokens() {
  return [{
    appToken: "8Irlk6mAJ7iid796fWBw2bwBV",
    appTokenSecret: "ms65J52RLI0x6jxLAOn4atK1I6tAJrtMLoZyHbTCSOJjjKTFpe",
    accessToken: "158017360-SN7wPncqPasyUVCou4Gk1NjJPhEspAMZDk4F2NMY",
    accessTokenSecret: "vUw4AFLkqMEOeUuLZAczcJWSzvHikOkudkKdhTj6MubPI"
  }];
}

function fetch(next, callback) {
  if (!callback) return;

  var url = getUrl()
          + encodeURIComponent(getTag())
          + "&since_id="
          + next;

  console.log(url);

  getOAuth().get(
    url,
    getTokens()[0].accessToken,
    getTokens()[0].accessTokenSecret,
    function (err, data, res){
      if (err)
        callback(err, null);
      else
        callback(null, JSON.parse(data));
    });
}

function extractImages(statuses, callback) {
  if (!callback) return;

  statuses.forEach(function(status) {
    if (!status.entities || !status.entities.media) return;

    status.entities.media.forEach(function(media) {
      var mediaUrl = media.media_url;
      if (!mediaUrl) return;

      var lastSlashIndex = mediaUrl.lastIndexOf("/");
      if (lastSlashIndex == -1) return;

      var fileName = getImageDir() + mediaUrl.substring(lastSlashIndex+1);
      download(mediaUrl, fileName, function() {
        callback(fileName);
      });

    });
  });
}

function saveData(fileName) {
  var photo = {
    img_thumbnail: fileName,
    img_low: fileName,
    img_standard: fileName,
    tag: getTag(),
    type: "twitter"
  };

  Photowall.create(photo).exec(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("no error");
    }
  });
}

function loop() {
  var d = q.defer();

  d.promise.then(function() {
    var d = q.defer();

    getNext(function(err, data) {
      var next;
      if (err)
        next = "";
      else
      next = data;

      d.resolve(next);
    });

    return d.promise;
  }).then(function(next) {
    var d = q.defer();

    fetch(next, function(err, data) {
      console.log(JSON.stringify(data));

      if (data && data.search_metadata && data.search_metadata.max_id_str) {
        next = data.search_metadata.max_id_str;
      }

      if (err)
        d.reject(err);
      else
        d.resolve({data:data, next:next});
    });

    return d.promise;
  }).then(function(result) {
    var d = q.defer();

    extractImages(result.data.statuses, function(fileName) {
      saveData(fileName);
    });

    d.resolve(result.next);

    return d.promise;
  }).then(function(next) {
    var d = q.defer();

    saveNext(next, function(err, success) {
      if (success)
        console.log("Save next successfully.");
      else
        console.log(err);

      d.resolve();
    });

    setTimeout(loop, 15000);

    return d.promise;
  }).fail(function (err) {
      console.log("TWITTER LOOP ERR: " + err);
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
