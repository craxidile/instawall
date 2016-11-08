$(document).ready(function() {
  var since = 0;
  (function loadPhotos() {
    var url = "../photowall?tag=imbiggawedding&since=" + since;
    console.log(url);

    $.get(url, function (data) {
      if (!data || !data.success) return;
      var images = [];
      data.data.forEach(function (photo) {
        var div = $("<div></div>");
        div.addClass("frame");

        var imageUrl = photo.img_standard.replace("c:/bigga/","../posts/");

        var a = $("<a></a>");
        a.attr({
          "href": imageUrl,
          "data-lightbox": "image-1"
        });
        div.append(a);

        var image = $("<img />");
        var im = new Image();



        im.onload = function imgLoaded() {
          console.log("success");
          image.attr({
            "src": im.src
          })
        };
        im.onerror = function imgError(err) {
          console.log("***");

          //im = new Image();
          //
          //im.onload = imgLoaded;
          //im.onerror = imgError;
          //im.src = photo.img_standard.replace("c:/bigga/","../posts/");
        };

        im.src = imageUrl;

        image.attr({
          "draggable": true
        }).addClass("cropimg").css({
           // "width": "200px"
      }).click(function() {
          $.get("photowall/print?path=" + photo.path_large,function() {

          });
        });

        images.push(div);
        a.append(image);
      });


      images.reverse();
      images.forEach(function(image) {
        $(".content-wrap").prepend(image);

        var div = image[0];
        div.addEventListener('dragstart', handleDragStart, false);
        div.addEventListener('dragover', handleDragOver, false);
        div.addEventListener('dragleave', handleDragLeave, false);
        div.addEventListener('drop', handleDrop, false);
      });


      if (data.data.length) {
        since = data.data[0].photowall_id;
        loadPhotos();
      } else {
        setTimeout(loadPhotos, 2000);
      }
    });
  })();


});
