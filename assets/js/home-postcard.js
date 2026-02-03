let firsttime = true;
let changeTimeout;

function positionLoader() {
  const $postcard = $('#postcard-photo');
  const $loader = $('.loader');

  if ($postcard.length === 0 || $loader.length === 0) return;

  const parentWidth = $postcard.width();
  const parentHeight = $postcard.height();
  const childWidth = $loader.width();
  const childHeight = $loader.height();

  // 只有当 loader 有实际尺寸时才进行定位
  if (childWidth > 0 && childHeight > 0) {
    const left = (parentWidth - childWidth) / 2;
    const top = (parentHeight - childHeight) / 2;
    $loader.css({
      position: 'absolute',
      left: left + 'px',
      top: top + 'px'
    });
  }
}

function change() {
  // 清除之前的超时
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }

  const data = window.HOME_PHOTOS || { images: [], metas: {} };
  const images = data.images || [];
  const metas = data.metas || {};
  if (images.length === 0) return;

  const randomIndex = Math.floor(Math.random() * images.length);
  const imageName = images[randomIndex];
  const src = "/assets/pics/" + imageName;
  const [location, meta] = metas[imageName] || ['', ''];

  function updateInfo() {
    $("#location").text(location);
    $("#metas").text(meta);
  }

  if (firsttime) {
    $("#photo").attr("src", src);
    updateInfo();
    const containerWidth = $("#postcard-photo").width();
    const height = containerWidth / CONFIG.IMAGE_RATIO_W * CONFIG.IMAGE_RATIO_H;
    $("#photo").height(Math.ceil(height) + 'px');

    // 延迟定位 loader，确保其尺寸已确定
    setTimeout(() => {
      positionLoader();
    }, 0);
  }

  const obj = new Image();
  obj.src = src;
  obj.onerror = function() {
    console.error('Failed to load image:', src);
    $('#loading').hide();
    changeTimeout = setTimeout(change, CONFIG.CHANGE_INTERVAL);
  };

  const fadeTo = firsttime ? 1 : 0;
  obj.onload = function() {
    $("#photo").fadeTo(CONFIG.FADE_DURATION, fadeTo, function() {
      const height = calculateImageHeight($("#photo").width(), obj.width, obj.height);

      if (!firsttime) {
        $("#photo").attr("src", src);
      }
      updateInfo();

      if (firsttime) {
        $("#photo").height(Math.ceil(height) + 'px');
      }
      $("#photo").animate({ height: Math.ceil(height) + 'px' }, CONFIG.ANIMATE_DURATION);
      firsttime = false;

      // 只绑定一次 load 事件，先移除之前的
      $("#photo").off('load').on('load', function() {
        $('#loading').hide();
        $("#photo").fadeTo(CONFIG.FADE_DURATION, 1);
      });

      changeTimeout = setTimeout(change, CONFIG.CHANGE_INTERVAL);
    });
  };
}
