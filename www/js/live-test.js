/* jshint browser:true, devel:true */
/* global $ */

$(function () {

  "use strict";

    var video_max = 32;

    var canvas;
    var imageViews = [];
    var images = [];

    var useCanvas = true;

    if (useCanvas) {
      canvas = document.getElementById('live-canvas');
      canvas.width = $(canvas).width();
      canvas.height = $(canvas).height();
      document.getElementById('live-image-box').style.display = 'none';
    } else {
      document.getElementById('live-canvas').style.display = 'none';
      canvas = document.getElementById('live-image-box');
      canvas.style.position = 'relative';
      canvas.style.backgroundColor = '#000000';
      canvas.width = 1024;
      canvas.height = 768;
      for (var i = 0; i < video_max; i++) {
        var imageView = document.createElement("div");
        canvas.appendChild(imageView);
        imageView.setAttribute('id', 'live-image-view-' + i);
        imageViews.push(imageView);

        var img = document.createElement("img");
        img.setAttribute('id', 'live-image-' + i);
        imageView.appendChild(img);
        images.push(img);
      }
    }

    var imageLive = createMvImageLive(canvas, {
      address: '192.168.100.10',
      port: 80,
      user: 'guest',
      password: 'guest',
      cameraTotal: video_max,
      fps: 200
    });

    $(window).resize(function () {
      canvas.width = $(window).width() - ($('#image-live-content').outerWidth() - $('#live-content').width());
      canvas.height = $(window).height() - $('[data-role=header]').outerHeight() - ($('#live-content').outerHeight() - $('#live-content').height());
      imageLive.relayout();
    });
    $(window).resize();

    if (useCanvas) {
      var ctx = canvas.getContext('2d');

      imageLive.ondraw = function (image, cam) {
        ctx.save();
        ctx.drawImage(image,
                      cam.rect.x + 1, 
                      cam.rect.y + 1,
                      cam.rect.width - 2,
                      cam.rect.height - 2);
        ctx.restore();
      };
      imageLive.onclear = function () {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      };
      imageLive.ondrawselection = function (cam) {
        var mode = imageLive.getMode();
        if (mode.rows == 1 && mode.columns == 1)
          return;
        ctx.save();
        ctx.strokeStyle = "#ffce00";
        ctx.lineWidth = 1.0;
        ctx.strokeRect(cam.viewRect.x,
                       cam.viewRect.y,
                       cam.viewRect.width,
                       cam.viewRect.height);
        ctx.restore();
      };
    } else {
      imageLive.ondraw = function (image, cam) {
        var imageView = imageViews[cam.id];
        var img = images[cam.id];
        imageView.style.display = 'inline-block';
        imageView.style.position = 'absolute';
        imageView.style.width = (cam.viewRect.width - 2) + 'px';
        imageView.style.height = (cam.viewRect.height - 2) + 'px';
        imageView.style.left = (cam.viewRect.x + 1) + 'px';
        imageView.style.top = (cam.viewRect.y + 1) + 'px';
        img.src = image.src;
        imageView.style.display = 'inline-block';
        img.width = cam.rect.width - 2;
        img.height = cam.rect.height - 2;
        img.style.width = (cam.rect.width - 2) + 'px';
        img.style.height = (cam.rect.height - 2) + 'px';
        img.style.paddingLeft = (cam.rect.x - cam.viewRect.x) + 'px';
        img.style.paddingTop = (cam.rect.y - cam.viewRect.y) + 'px';
      };
      imageLive.onclear = function () {
        for (var i = 0; i < video_max; i++) {
          imageViews[i].style.display = 'none';
          imageViews[i].style.border = '0';
        }
      };
      imageLive.ondrawselection = function (cam) {
        imageViews[cam.id].style.border = '1px solid #ffce00';
      };
    }

    var camera = document.getElementById('camera');
    var rows = document.getElementById('rows');
    var columns = document.getElementById('columns');
    var fill = document.getElementById('fill');

    document.getElementById('start').onclick = function () {
        imageLive.setMode(columns.value, rows.value);
        imageLive.selectCamera(camera.value - 1);
        imageLive.setFill(fill.checked);
        imageLive.start();
    };
    document.getElementById('stop').onclick = function () {
        imageLive.stop();
    };
    document.getElementById('layout').onclick = function () {
        var w = canvas.width;
        canvas.width = canvas.height;
        canvas.height = w;
        imageLive.relayout();
    };
    document.getElementById('setColumns').onclick = function () {
        imageLive.setMode(columns.value, rows.value);
    };
    document.getElementById('selectCamera').onclick = function () {
        imageLive.selectCamera(camera.value - 1);
    };
    fill.onchange = function () {
        imageLive.setFill(fill.checked);
    };

    canvas.onclick = function (e) {
      var offset = $('#live-canvas').offset();
        var pos = imageLive.getCameraforPoint(e.clientX - offset.left, e.clientY - offset.top);
        camera.value = (pos.cameraID === undefined ? 0 : pos.cameraID) + 1;
        imageLive.selectCamera(camera.value - 1);
    };

    var lastMode = { rows: 4, columns: 4 };
    canvas.ondblclick = function (e) {
        var m = imageLive.getMode();
        if (m.rows == 1 && m.columns == 1)
          imageLive.setMode(lastMode.columns, lastMode.rows);
        else {
          lastMode = m;
          imageLive.setMode(1, 1);
        }
    };

  $(document).on( "swiperight", "#live-page", function (e) {
    // We check if there is no open panel on the page because otherwise
    // a swipe to close the left panel would also open the right panel (and v.v.).
    // We do this by checking the data that the framework stores on the page element (panel: open).
    if ($( ".ui-page-active" ).jqmData( "panel" ) !== "open") {
      $("#menu-panel").panel("open");
    }
  });
});
