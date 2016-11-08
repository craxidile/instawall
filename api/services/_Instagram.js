var Q = require("q");
var request = require("request");
var fs = require("fs");
var https = require("https");
var http = require("http");

var addPhotos = function () {
  PollingTask.find({where: 1}).exec(function (err, tasks) {

    if (!tasks || !tasks.length)
      return res.send({
        success: true,
        message: "No tasks found"
      });

    tasks.forEach(function (task) {
      pollSingleTask(task);
    });
  });
};

var pollSingleTask = function(task, queryMore) {
  var deferred = Q.defer();

  var tag = task.tag;
  var minTagId = task.min_tag_id;
  var data, pagination, pollingTask;

  var url = sails.config.instagram.tagUrl.replace("{0}", tag)
    .replace("{1}", sails.config.instagram.accessToken);

  if (minTagId && minTagId !== "0") {
    url += "&min_tag_id=" + minTagId;
  }

  var url = null;

  deferred.promise.then(function() {
    var d = Q.defer();

    Social_Account.find({
      social_id: 1,
      sort: "working_amount ASC"
    }).exec(function (err, accounts) {
      if (!accounts || !accounts.length)
        return;

      var account = accounts[0];
      console.log("use: ", account);

      Social_Account.update({id: account.id}, {working_amount: account.working_amount+1})
        .exec(function(err, accounts) {
        });

      url = sails.config.instagram.tagUrl.replace("{0}", tag)
        .replace("{1}", accounts[0].access_token);

      if (minTagId && minTagId !== "0") {
        url += "&min_tag_id=" + minTagId;
      } else {
        url += "&min_tag_id=0";
      }

      d.resolve();
    });

    return d.promise;
  }).then(function (){
    var d = Q.defer();

    if (queryMore) {
      d.resolve();
    } else {
      PollingTask.find({
        where: {
          tag: tag,
          working: 1
        }
      }).exec(function (err, pollingTasks) {
        if (!err && (!pollingTasks || !pollingTasks.length)) {
          d.resolve();
        }
      });
    }

    return d.promise;
  }).then(function () {
    var d = Q.defer();

    console.log("%%%%", url);
    request.get(url, {}, function (err, response, body) {
      if (err) {
        console.log(err);
        return;
      }

      var resObj = JSON.parse(body);
      pagination = resObj.pagination;
      data = resObj.data;

      if (!data) {
        console.log("data not exist");
        return;
      }

      d.resolve();
    });

    return d.promise;
  }).then(function () {
    var d = Q.defer();

    console.log("step 2");

    if (pagination.min_tag_id) {
      PollingTask.find({
        where: {
          tag: tag
        }
      }).exec(function (err, pollingTasks) {

        if (!pollingTasks || !pollingTasks.length) {
          console.log(err);
          return;
        }

        pollingTask = pollingTasks[0];
        pollingTask.min_tag_id = pagination.min_tag_id;

        pollingTask.save(function (err) {
          if (err) {
            console.log(err);
            return;
          }

          d.resolve();
        });
      });
    } else {
      return;
    }

    return d.promise;
  }).then(function () {
    var d = Q.defer();
    console.log ("step 3", data.length);

    data.forEach(function (mediaItem) {
      addPhoto(tag, mediaItem);
    });

    if (data.length == 20) {
      setTimeout(function () {
        pollSingleTask(task, true);
      }, 200);
    } else {
      pollingTask.working = 0;
      pollingTask.save(function (err) {

      });
    }

    return d.promise;
  });

  deferred.resolve();
};

var addPhoto = function (tag, mediaItem) {
  var deferred = Q.defer();

  var images = {
    tmb: mediaItem.images.thumbnail.url,
    low: mediaItem.images.low_resolution.url,
    std: mediaItem.images.standard_resolution.url,
    pfl: mediaItem.user.profile_picture
  };

  console.log("$$$$$", images);

  var attrs = {
    tmb: "path_small",
    low: "path_medium",
    std: "path_large",
    pfl: "path_profile"
  };

  var photo = {
    image_id: mediaItem.id,
    user_id: mediaItem.user.id,
    username: mediaItem.user.username,
    caption: mediaItem.caption ? mediaItem.caption.text : "",
    img_username: mediaItem.user.profile_picture,
    img_thumbnail: mediaItem.images.thumbnail.url,
    img_low: mediaItem.images.low_resolution.url,
    img_standard: mediaItem.images.standard_resolution.url,
    path_small: "",
    path_medium: "",
    path_large: "",
    following: 0,
    followers: 0,
    filter: mediaItem.filter,
    likes: mediaItem.likes.count,
    type: mediaItem.type,
    count: 0,
    created_time: parseInt(mediaItem.created_time),
    is_activate: 0,
    tag: tag
  };

  console.log(">>>>");

  deferred.promise.then(function () {
    var d = Q.defer();

    var photoCount = 0;

    for (var key in images) {

      (function imageTask(images, key) {
        console.log(key);

        var url = images[key];
        //var bucket = buckets[key];
        //var req = request(url);
        var fileName = "tmp/" + mediaItem.id + "-" + key + "-" + url.substring(url.lastIndexOf("/")+1);
        var imagedata = '';


        try {
          console.log("request image", url);

          var conn = null;
          if (url.indexOf("https") === 0) {
            conn = https;
          } else {
            conn = http;
          }

          conn.get(url, function (res) {
            res.setEncoding('binary')

            res.on('data', function (chunk) {
              imagedata += chunk
            });

            res.on('error', function () {
              imageTask(images, key);
            });

            res.on('end', function () {
              console.log("uploading", tag, mediaItem.id);
              fs.writeFileSync(fileName, imagedata, 'binary');

              //S3Service.upload(fileName, bucket, tag, function (data, err, message) {
              //
              //    if (err) {
              //        imageTask(images, key);
              //        console.log(err);
              //        return;
              //    }
              //
              //    photo[attrs[key]] = data.fileName;
              //
              //    fs.unlinkSync(fileName);
              //
              //    if (++photoCount === Object.keys(images).length) {
              //        d.resolve();
              //    }
              //});

              photo[attrs[key]] = fileName;
              //fs.unlinkSync(fileName);

              if (++photoCount === Object.keys(images).length) {
                d.resolve();
              }
            });

          }).on("error", function (e) {
            console.log(e);
            imageTask(images, key);
          }).end();
        } catch (e) {
          console.log(e);
          imageTask(images, key);
        }

      })(images, key);
    }

    return d.promise;
  }).then(function () {

    console.log("$$$$$save db", photo);

    Photowall.create(photo).exec(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("no error");
      }
    });
  });

  deferred.resolve();
};

module.exports = {
  running: false,
  loopInstance: null,
  start: function() {
    if (this.running)
      return;

    this.running = true;
    this.run();

  },
  stop: function() {
    this.running = false;
    if (this.loopInstance)
      clearTimeout(this.loopInstance);
  },
  run: function(more) {
    if (!this.running) {
      return;
    }

    console.log(">> Hello");
    addPhotos();

    var self = this;

    if (this.loopInstance)
      clearTimeout(this.loopInstance);
    this.loopInstance = setTimeout(function() {
      self.run();
    }, 10000);
  }
};
