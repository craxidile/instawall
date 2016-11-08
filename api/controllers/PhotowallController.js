module.exports = {
  show: function(req, res) {
    return res.view("photowall_show");
  },
  print: function(req, res) {
    var path = req.query.path+"";

    if(!path || !path.substring(9))
      return res.send({success: false});

    path = "c:/bigga/" + path.substring(9);
    console.log("$$$$", path);
    ////console.log(">>>>", 'c:/web/instawall/instawallprint.exe \"' + path + '\"');

    console.log('c:/web/instawall/instawallprint.exe \"' + path + '\"');

    require("child_process").exec('c:/web/instawall/instawallprint.exe \"' + path + '\"').unref();
    //res.send({success: true});

    res.send({success: true});
  },
  list: function(req, res) {
    var paramNames = Object.keys(req.query);

    if (paramNames.indexOf("tag") == -1) {
      return res.send({
        success: false,
        message: "Parameter tag is required."
      });
    }

    var since = paramNames.indexOf("since") != -1 ? req.query.since : "0";
    var count = paramNames.indexOf("count") != -1 ? req.query.count : "100";
    var tag = req.query.tag;

    try {
      since = parseInt(since);
    } catch (e) {
      since = 0;
    }

    try {
      count = parseInt(count);
    } catch (e) {
      count = 100;
    }

    Photowall.find({
      where: {
        photowall_id: {
          ">": since
        },
        tag: tag
      },
      sort: "photowall_id DESC"
    }).limit(count).exec(function (err, photos) {
      //console.log(err);
      return res.send({
        success: true,
        message: "Success.",
        data: photos
      });
    });

  }
};
