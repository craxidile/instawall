var q = require("q");
var request = require("request");
var tokenIndex = 0;

function getFileName() {
  return "./ig_next.txt";
}

function getImageDir() {
  return "c:/bigga/instagram/";
}

function getTokenIndex() {
  var index = tokenIndex;
  tokenIndex = (tokenIndex + 1) % getTokens().length;
  return index;
}

function getTokens() {
  return [
    "1643769474.1677ed0.df21cf2760df48ffbcb1d63cd4c6524b",
    "1643772803.1677ed0.915d4788ebc94838a9f978342a9fe5dd",
    "1643778207.1677ed0.b46acf3ef5d14232b105b582c2811779",
  ];
}

function download(url, fileName, callback) {
  ImageUtil.download(url, fileName, url.indexOf("https://") ? true : false, callback);
}

function getUrl() {
  return "https://api.instagram.com/v1/tags/{0}/media/recent?access_token={1}";
}

function getTag() {
  return sails.config.tag.name;
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

function fetch(next, callback) {
  var url = getUrl().replace("{0}", getTag()).replace("{1}", getTokens()[getTokenIndex()]);
  if (next) {
    url += "&min_tag_id=" + next;
  }

  console.log(url);

  request.get(url, {}, function (err, response, body) {
    if (err) {
      console.log(err);
      return;
    }

    var resObj = JSON.parse(body);
    console.log(resObj);
    var min_tag_id = resObj.pagination.min_tag_id;
    var data = resObj.data;

    if (!data) {
      return callback(null, [], min_tag_id);
    } else {
      return callback(null, data, min_tag_id);
    }
  });
}

function extractImages(posts, callback) {
  if (!callback) return;

  posts.forEach(function(post) {
    if (post.type === "video") return;

    var mediaUrl = post.images.standard_resolution.url;
    console.log(">>>>>", mediaUrl);
    if (!mediaUrl) return;

    var lastSlashIndex = mediaUrl.lastIndexOf("/");
    if (lastSlashIndex == -1) return;

    var fileName = getImageDir() + mediaUrl.substring(lastSlashIndex+1);
    download(mediaUrl, fileName, function() {
      callback(fileName);
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

  setTimeout(function() {
    Photowall.create(photo).exec(function(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("no error");
      }
    });
  }, 4000);

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
  }).then(function (next) {
    var d = q.defer();

    fetch(next, function(err, data, next) {
      if (!next) return d.reject(new Error("No next"));
      d.resolve({data: data, next: next});
    });

    return d.promise;
  }).then(function(result) {
    var d = q.defer();

    var data = result.data;
    var next = result.next;

    extractImages(data, function(fileName) {
      saveData(fileName);
      console.log(fileName);
    });

    d.resolve(next);

    return d.promise;
  }).then(function(next) {
    var d = q.defer();

    if (next) {
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
    console.log("INSTAGRAM LOOP ERR: " + err);
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

loop();
