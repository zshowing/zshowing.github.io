function registerImageMouse(target) {
  const $target = $(target);
  const name = $target.attr('name');
  const maxNum = parseInt($target.attr('num'));
  const $img = $target.find('img');

  $target.mousemove(function(e) {
    const index = Math.max(Math.ceil(e.offsetX / $target.width() * maxNum), 1);
    const src = "/assets/photos/" + name + "/" + name + "-" + index + ".jpeg";
    $img.attr('src', src);
  });
}

function registerImageHover(target) {
  let updateTimer;
  let firstLoad = true;
  const $target = $(target);
  const $img = $target.find('img');
  const name = $target.attr('name');
  const maxNum = parseInt($target.attr('num'));

  const updateImage = function () {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(updateImage, CONFIG.IMAGE_UPDATE_INTERVAL);

    const randomIndex = Math.floor(Math.random() * maxNum) + 1;
    const src = "/assets/photos/" + name + "/" + name + "-" + randomIndex + ".jpeg";

    const obj = new Image();
    obj.src = src;
    obj.onerror = function() {
      console.error('Failed to load hover image:', src);
    };
    obj.onload = function() {
      $img.fadeTo(250, 0, function() {
        $img.attr('src', src);
        const height = calculateImageHeight($img.width(), obj.width, obj.height);

        if (firstLoad) {
          $img.height(Math.ceil(height) + 'px');
          firstLoad = false;
        } else {
          $img.animate({ height: Math.ceil(height) + 'px' }, CONFIG.ANIMATE_DURATION);
        }

        $img.off('load').on('load', function() {
          $img.fadeTo(500, 1);
        });
      });
    };
  };

  let hoverTimer;

  $target.on('mouseenter', 'img', function() {
    hoverTimer = setTimeout(updateImage, CONFIG.IMAGE_HOVER_DELAY);
  });

  $target.on('mouseleave', 'img', function() {
    clearTimeout(updateTimer);
    clearTimeout(hoverTimer);
  });
}

function fullScreenImages(className) {
  var selector = className + ' img';
  const imgs = document.querySelectorAll(selector);
  const fullPage = document.querySelector('#fullpage');
  const winWidth = $(window).width();
  const winHeight = $(window).height();
  imgs.forEach(img => {
    var image = new Image();
    image.src = img.src;
    var imageWidth = image.width;
    var imageHeight = image.height;
    var renderWidth = img.width;
    if (imageWidth > renderWidth) {
      $(img).css('cursor', 'pointer');
      img.addEventListener('click', function() {
        fullPage.style.backgroundImage = 'url(' + img.src + ')';
        fullPage.style.display = 'block';
        if ($(fullPage).height() < imageHeight || $(fullPage).width() < imageWidth) {
          $(fullPage).css('background-size', 'contain');
        } else {
          $(fullPage).css('background-size', 'auto');
        }
        setTimeout(() => {
          fullPage.style.opacity = 1;
        }, 50);
      });
    }
  });
}

function closingImage(element) {
  element.style.display = 'none';
  element.style.opacity = 0;
}
