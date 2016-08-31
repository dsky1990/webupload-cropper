/*cropper browser-support
 Chrome (latest 2)
 Firefox (latest 2)
 Internet Explorer 8+
 Opera (latest 2)
 Safari (latest 2)*/

var cropUpload = function (cropOption) {
  var $cropBtn = $(cropOption.$cropBtn) || $(".imgCropBtn");
  var cropBtnWidth = $cropBtn.width();
  var cropBtnHeight = $cropBtn.height();
  var cropRatio = cropBtnWidth / cropBtnHeight;
  $cropBtn.on('click', function (e) {
    e.preventDefault();
    $(".imgCropModal").modal({backdrop: 'static', keyboard: false});
    $(".imgCropModal").modal('show');
    //modalshown之后再执行webupload的初始化
    $(".imgCropModal").on('shown.bs.modal', function () {
      $(cropOption.$btn).show();
      upLoadImg(cropOption);
      imgCloud(cropOption);
      $(this).off('shown.bs.modal');
    });
    $(".imgCropModal").on('hidden.bs.modal', function () {
      $(".img-box-container").empty();
      $(".img-preview").empty().hide();
      $(".img-preview-header").addClass("hide");
      uploader.destroy();
      $(this).off('hidden.bs.modal');
    })
  });
  var clearClick1 = 0,
      clearClick2 = 0,
      clearClick3 = 0;
  function imgCloud(cropOption){
    if(clearClick1<=0){
      $(".img-crop-select").on('click', function(){
        ++clearClick1;
        $(".img-select").removeClass("btn-primary").addClass("btn-default");
        $(this).addClass("btn-primary");
        $(".imgCloud-modal, .modal-footer-ImgCloud").hide();
        $(".img-box, .modal-footer-cropImg").show();
      });
    }
    if(clearClick2<=0){
      $(".img-cloud-select").on("click", function(){
        ++clearClick2;
        $(".img-select").removeClass("btn-primary").addClass("btn-default");
        $(this).addClass("btn-primary");
        $(".imgCloud-modal, .modal-footer-ImgCloud").show();
        $(".img-box, .modal-footer-cropImg").hide();
        var imgBoxWidth = $(".imgCloud_box").width();
        var setWidth = parseInt((imgBoxWidth - 24 * 5) / 5);
        $(".imgCloud_list").outerWidth(setWidth);
        $(cropOption.$cloudBtn).on('click', function(){
          cropOption.imgCloudFun();
        });
      });
    }
    if(clearClick3<= 0){
      $(".imgCloud-modal .imgCloud_list").on('click', function(){
        ++clearClick3;
        $(this).find(".imgCloud-select").toggleClass("active");
      });
    }
  }
  /*
   File.Status(文件状态值)
   inited 初始状态
   queued 已经进入队列, 等待上传
   progress 上传中
   complete 上传完成。
   error 上传出错，可重试
   interrupt 上传中断，可续传。
   invalid 文件不合格，不能重试上传。会自动从队列中移除。
   cancelled 文件被移除
   */
  function upLoadImg(cropOption) {
    var $wrap = $('#uploader');
    var $btn = $(cropOption.$btn);
    var $upload = $(".imgUploadFile");
    var $uploadRetry = $(".imgUploadRetry").hide();
    var state = 'pedding';// 可能有pedding, ready, uploading,paused, confirm, finish, done
    var percentages = {};
    var $progress = $('.progress').hide();
    var $imgBox = $wrap.find(".img-box");//图片裁剪区域
    var $imgBoxCont = $imgBox.find(".img-box-container");
    var $imgBoxText = $imgBox.find(".img-box-text");
    var $imgBoxSet = $imgBox.find(".img-box-set").hide();
    var $imgRotate = $imgBoxSet.find(".img-rotate");
    var $cropReset = $(".img-crop-reset");
    var imgBoxWidth = $imgBox.width();
    var $previewBox = $wrap.find(".img-preview").show();
    var previewWidth = $previewBox.width();
    var maxImgBoxHeight = 420;
    // 如果使用原始大小，超大的图片可能会出现 Croper UI 卡顿，所以这里建议先缩小后再crop.
    var FRAME_WIDTH = 1600;
    //console.log(imgBoxWidth);
    var $imgPreview = $wrap.find(".img-preview");//图片预览区域
    var $previeHeader = $(".img-preview-header");
    var cropDate = {};
    var isSupportBase64 = (function () {
      var data = new Image();
      var support = true;
      data.onload = data.onerror = function () {
        if (this.width != 1 || this.height != 1) {
          support = false;
        }
      };
      data.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      return support;
    })();
    //检测flash
    var flashVersion = (function () {
      var version;
      try {
        version = navigator.plugins['Shockwave Flash'];
        version = version.description;
      } catch (ex) {
        try {
          version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
        } catch (ex2) {
          version = '0.0';
        }
      }
      version = version.match(/\d+/g);
      return parseFloat(version[0] + '.' + version[1], 10);
    })();
    //判断是否支持flash
    if (!WebUploader.Uploader.support('flash') && WebUploader.browser.ie) {
      // flash 安装了但是版本过低。
      if (flashVersion) {
        (function (container) {
          window['expressinstallcallback'] = function (state) {
            switch (state) {
              case 'Download.Cancelled':
                alert('您取消了更新！');
                break;
              case 'Download.Failed':
                alert('安装失败');
                break;
              default:
                alert('安装已成功，请刷新！');
                break;
            }
            delete window['expressinstallcallback'];
          };
          var swf = './expressInstall.swf';
          // insert flash object
          var html = '<object type="application/' + 'x-shockwave-flash" data="' + swf + '" ';
          if (WebUploader.browser.ie) {
            html += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
          }
          html += 'width="100%" height="100%" style="outline:0">' +
            '<param name="movie" value="' + swf + '" />' +
            '<param name="wmode" value="transparent" />' +
            '<param name="allowscriptaccess" value="always" />' +
            '</object>';
          container.html(html);
        })($wrap);
        // 压根就没有安转。
      } else {
        $wrap.html('<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0"><img alt="get flash player" src="http://www.adobe.com/macromedia/style_guide/images/160x41_Get_Flash_Player.jpg" /></a>');
      }
      return;
    } else if (!WebUploader.Uploader.support()) {
      alert('Web Uploader 不支持您的浏览器！');
      return;
    }
    // 初始化Web Uploader
    var uploader = WebUploader.create({
      pick: {
        id: cropOption.$btn,
        multiple: false
      },
      swf: "Uploader.swf",
      accept: {
        title: 'Images',
        extensions: 'gif,jpg,jpeg,bmp,png',
        mimeTypes: 'image/*'
      },
      compress: false,
      thumb: {
        // 图片质量，只有type为`image/jpeg`的时候才有效。
        quality: 100,
        // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
        allowMagnify: false,
        // 是否允许裁剪。
        crop: false,
        // 为空的话则保留原有图片格式。否则强制转换成指定的类型。
        type: ''
      },
      fileSingleSizeLimit: 1024 * 1024,
      server: 'fileupload.php'
    });
    window.uploader = uploader;
    // 当有文件添加进来时执行，负责view的创建
    function addFile(file) {
      var text = null;
      var showError = function (code) {
        switch (code) {
          case 'exceed_size':
            text = '文件大小超出';
            break;

          case 'interrupt':
            text = '上传暂停';
            break;

          default:
            text = '上传失败，请重试';
            break;
        }
      };
      if (file.getStatus() === 'invalid') {
        showError(file.statusText);
      } else {
        uploader.makeThumb(file, function (error, src) {
          var img;
          var infoWidth = file._info.width;
          var infoHeight = file._info.height;
          var infoBaseHeight = (infoHeight * imgBoxWidth) / infoWidth;
          /*          console.log(infoBaseHeight);
           console.log(maxImgBoxHeight);*/
          $imgBoxText.hide();
          $imgBoxSet.show();
          $(window).resize();//fix addButton fail bug
          if (isSupportBase64) {
            img = $('<img class="img-responsive" src="' + src + '">');
            $imgBoxCont.append(img);
            if (infoBaseHeight > maxImgBoxHeight) {
              var imgWidthNow = (infoWidth * maxImgBoxHeight) / infoHeight;
              var marLeft = (imgBoxWidth - imgWidthNow) / 2;
              img.css("height", maxImgBoxHeight).css("margin-left", marLeft);
            }
          } else {
            $.ajax('preview.php', {
              method: 'POST',
              data: src,
              dataType: 'json'
            }).done(function (response) {
              if (response.result) {
                img = $('<img class="img-responsive" src="' + response.result + '">');
                img.addClass('img-responsive');
                $imgBoxCont.append(img);
              } else {
                $wrap.text('预览出错');
              }
            });
          }
          imgCrop(img);
          $previeHeader.removeClass("hide");
        }, FRAME_WIDTH, 1); // 注意这里的 height 值是 1，被当成了 100% 使用
      }
    }

    //updateStatus
    function updateStatus() {

    }

    //setState
    function setState(val) {
      var file, stats;
      if (val === state) {
        return;
      }

      state = val;
      switch (state) {
        case 'pedding':

          break;
        case 'ready':

          break;
        case 'uploading':

          break;
        case 'paused':

          break;
        case 'confirm':

          break;
        case 'finish':

          break;
      }
      updateStatus();
    }

    // 添加“添加文件”的按钮，
    uploader.addButton({
      id: '#img-add'
    });
    //$imgBoxSet.hide();
    //dialogOpen
    uploader.on('dialogOpen', function () {
      console.log('dialogOpen');

    });
    //当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列
    uploader.on('beforeFileQueued', function (file) {
      //重置下队列，这样可以上传重复的图片
      uploader.reset();
      $previewBox.empty();
    });
    // 当有文件添加进来的时候
    uploader.on('fileQueued', function (file) {
      console.log('fileQueued');
      $btn.hide();
      $imgBoxCont.empty();
      $imgBoxText.show();
      $imgBoxSet.hide();
      addFile(file);
    });
    //当某个文件发送前触发
    uploader.on('uploadStart', function (data) {
      console.log('uploadStart');
      uploader.option('formData', {
        xPoint: cropDate.x,
        yPoint: cropDate.y,
        width: cropDate.width,
        height: cropDate.height,
        rPorint: cropDate.rotate
      });
      /*data.x = cropDate.x;
       data.y = cropDate.y;
       data.width = cropDate.width;
       data.height = cropDate.height;
       data.rotate = cropDate.rotate;*/
    });
    // 文件上传过程中创建进度条实时显示
    uploader.on('uploadProgress', function (file, percentage) {
      $progress.show();
      console.log(percentage);
      console.log(file);
      var percent = Math.round(percentage * 100);
      $progress.find(".progress-bar").css('width', percent + '%');
      $(".cropper-crop-box").hide();
      $imgBoxSet.hide();
      //updateTotalProgress();
    });
    // 文件上传成功
    uploader.on('uploadSuccess', function (response) {
      console.log(response);
      $imgBoxCont.empty();
      $imgBoxSet.hide();
      $previewBox.empty();
      $btn.show();
      $upload.show();
      $uploadRetry.hide();
      if(cropOption.uploadSuccess(response)){
        cropOption.uploadSuccess(response)
      }
    });
    // 文件上传失败，显示上传出错
    uploader.on('uploadError', function (reason) {
      console.log(reason);
      $upload.hide();
      $uploadRetry.show();
      $uploadRetry.on('click', function () {
        uploader.retry();
      });
      if(cropOption.uploadError(reason)){
        cropOption.uploadError(reason);
      }
    });
    // 完成上传完了，成功或者失败
    uploader.on('uploadComplete', function (file) {
      $progress.hide();
      if(cropOption.uploadComplete(file)){
        cropOption.uploadComplete(file);
      }
    });
    //点击上传
    $upload.on('click', function () {
      uploader.upload();
    });
    //crop
    function imgCrop(img) {
      var $previews = $('.img-preview');
      $(img).cropper({
        aspectRatio: cropRatio,
        autoCropArea: 0.6,
        preview: '.img-preview',
        build: function (e) {
          var $clone = $(this).clone();
          $clone.css({
            display: 'block',
            width: '100%',
            minWidth: 0,
            minHeight: 0,
            maxWidth: 'none',
            maxHeight: 'none'
          });

          $previews.css({
            width: previewWidth,
            overflow: 'hidden'
          }).html($clone);
        },
        crop: function (e) {
          // Output the result data for cropping image.
          /*console.log(e.x);
           console.log(e.y);
           console.log(e.width);
           console.log(e.height);
           console.log(e.rotate);
           console.log(e.scaleX);
           console.log(e.scaleY);*/
          cropDate.x = e.x;
          cropDate.y = e.y;
          cropDate.width = e.width;
          cropDate.height = e.height;
          cropDate.rotate = e.rotate;
          console.log(cropDate);
        }
      });
      $imgRotate.on('click', function () {
        $(img).cropper('rotate', 90);
      });
      $cropReset.on('click', function () {
        $(img).cropper('reset');
      });
    }
  }
};
