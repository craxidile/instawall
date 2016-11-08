/**
 * FetcherController
 *
 * @description :: Server-side logic for managing fetchers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  start: function(req, res) {
    Instagram.start();
    //Twitter.start();
    //Facebook.start();
    res.send({
      success: true
    });
  },
  stop: function(req, res) {
    Instagram.stop();
    //Twitter.stop();
    //Facebook.stop();
    res.send({
      success: true
    });
  }
};

