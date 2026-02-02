// 常量定义
const CONFIG = {
  IMAGE_RATIO_W: 1200,
  IMAGE_RATIO_H: 800,
  FADE_DURATION: 1000,
  CHANGE_INTERVAL: 10000,
  ANIMATE_DURATION: 500,
  IMAGE_HOVER_DELAY: 2000,
  IMAGE_UPDATE_INTERVAL: 3000,
  SCROLL_THROTTLE: 100
};

const images = ['jptokyoginkgoave.jpg','jptokyo-shibuya.jpeg','gbstonehenge.jpeg','babymetal.jpeg','bayinbuluke.jpeg','bjbeihai.jpeg','duku.jpeg','duku2.jpeg','duku3.jpeg','duku4.jpeg','duku5.jpeg','duku6.jpeg','gbgrass.jpeg','gblogo.jpeg','gboxford.jpeg','gboxford2.jpeg','gbsheep.jpeg','gobath.jpeg','hunanmuseum.jpeg','jpicesea.jpeg','jpkyotodaohe.jpeg','jpkyototemplewithredleaves.jpeg','jpkyototower.jpeg','jplogowithredleaves.jpeg','jpmastumotowinter.jpeg','jpnaganocat.jpeg','jpnarabudda.jpeg','jpnararedleves.jpeg','jposaka.jpeg','jptokyoginza.jpeg','jptokyologos.jpeg','jptokyonight.jpeg','jptokyoredhat.jpeg','jptokyotower.jpeg','jptokyotowernight.jpeg','jpxuchuanzoo.jpeg','qiongkushitai.jpeg','qiongkushitai2.jpeg','qiongkushitai3.jpeg','takelamagan.jpeg','tsingtao.jpeg','tw.jpeg','xj.jpeg'];
const metas = {'babymetal.jpeg': ['英国，伦敦 / 温布利体育馆', '2016.4 / Canon 700D'],
'bayinbuluke.jpeg': ['新疆，独库公路 / 巴音郭楞', '2021.6 / DJI Mini 2'],
'bjbeihai.jpeg': ['北京，北海公园', '2014.8 / Canon 700D'],
'duku.jpeg': ['新疆，独库公路', '2021.6 / DJI Mini 2'],
'duku2.jpeg': ['新疆，独库公路 / 库车国家地质公园', '2021.6 / DJI Mini 2'],
'duku3.jpeg': ['新疆，独库公路 / 库车大龙池', '2021.6 / DJI Mini 2'],
'duku4.jpeg': ['新疆，独库公路 / 巴音布鲁克', '2021.6 / DJI Mini 2'],
'duku5.jpeg': ['新疆，独库公路 / 库车国家地质公园', '2021.6 / DJI Mini 2'],
'duku6.jpeg': ['新疆，独库公路 / 铁力买提达坂', '2021.6 / Canon 700D'],
'gbgrass.jpeg': ['英国，切尔滕纳姆', '2016.4 / Canon 700D'],
'gblogo.jpeg': ['英国，科茨沃尔德', '2016.4 / Canon 700D'],
'gboxford.jpeg': ['英国，牛津', '2016.4 / Canon 700D'],
'gboxford2.jpeg': ['英国，牛津', '2016.4 / Canon 700D'],
'gbsheep.jpeg': ['英国，科茨沃尔德', '2016.4 / Canon 700D'],
'gobath.jpeg': ['英国，巴斯', '2016.4 / Canon 700D'],
'gbstonehenge.jpeg': ['英国，巨石阵', '2016.4 / Canon 700D'],
'hunanmuseum.jpeg': ['武汉，湖北省博物馆', '2021.6 / SONY RX100M7'],
'jpicesea.jpeg': ['日本，北海道 / 知床半岛斜里町', '2016.2 / Canon 700D'],
'jpkyotodaohe.jpeg': ['日本，京都 / 伏见稻荷大社', '2013.12 / Canon 700D'],
'jptokyo-shibuya.jpeg':['日本，东京 / 涉谷十字路口', '2019.7 / iPhone XS'],
'jpkyototemplewithredleaves.jpeg': ['日本，京都 / 醍醐寺', '2013.12 / Canon 700D'],
'jpkyototower.jpeg': ['日本，京都 / 京都塔', '2013.12 / Canon 700D'],
'jplogowithredleaves.jpeg': ['日本，京都 / 北野天满宫', '2013.12 / Canon 700D'],
'jpmastumotowinter.jpeg': ['日本，松本', '2015.12 / Canon 700D'],
'jpnaganocat.jpeg': ['日本，松本 / 松本城', '2015.12 / Canon 700D'],
'jpnarabudda.jpeg': ['日本，京都大原 / 三千院', '2013.11 / Canon 700D'],
'jpnararedleves.jpeg': ['日本，京都', '2013.11 / Canon 700D'],
'jposaka.jpeg': ['日本，大阪', '2013.12 / Canon 700D'],
'jptokyoginza.jpeg': ['日本，东京 / 银座', '2015.12 / Canon 700D'],
'jptokyologos.jpeg': ['日本，东京 / 有乐町', '2015.12 / Canon 700D'],
'jptokyonight.jpeg': ['日本，东京', '2015.12.31 / Canon 700D'],
'jptokyoredhat.jpeg': ['日本，东京 / 代代木公园', '2015.12 / Canon 700D'],
'jptokyotower.jpeg': ['日本，东京', '2015.12.31 / Canon 700D'],
'jptokyotowernight.jpeg': ['日本，东京', '2015.12.31 / Canon 700D'],
'jpxuchuanzoo.jpeg': ['日本，旭川 / 旭山动物园', '2018.3 / Canon 700D'],
'jptokyoginkgoave.jpg': ['日本，东京 / 明治神宫外苑', '2015.12 / Canon 700D'],
'qiongkushitai.jpeg': ['新疆，琼库什台', '2021.6 / Canon 700D'],
'qiongkushitai2.jpeg': ['新疆，琼库什台', '2021.6 / DJI Mini 2'],
'qiongkushitai3.jpeg': ['新疆，琼库什台', '2021.6 / DJI Mini 2'],
'takelamagan.jpeg': ['新疆，塔克拉玛干沙漠', '2021.6 / DJI Mini 2'],
'tsingtao.jpeg': ['青岛', '2014.9 / Canon 700D'],
'tw.jpeg': ['台湾，台东', '2014.10 / Canon 700D'],
'xj.jpeg': ['新疆，库车 / 苏巴什佛寺遗址', '2021.6 / SONY RX100M7']};

let firsttime = true;
let active = false;
let changeTimeout;

// 工具函数
function calculateImageHeight(width, imageWidth, imageHeight) {
  return (width / imageWidth) * imageHeight;
}

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
      'position': 'absolute',
      'left': left + 'px',
      'top': top + 'px'
    });
  }
}

function change() {
  // 清除之前的超时
  if (changeTimeout) {
    clearTimeout(changeTimeout);
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  const imageName = images[randomIndex];
  const src = "/assets/pics/" + imageName;
  const [location, meta] = metas[imageName];

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
      $("#photo").animate({height: Math.ceil(height) + 'px'}, CONFIG.ANIMATE_DURATION);
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

// 节流函数
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

function registerScrollPercent() {
  const readingProgressBar = document.querySelector('.reading-progress-bar');
  if (!readingProgressBar) return;

  const contentWrapper = document.querySelector('.content-wrapper');
  if (!contentWrapper) return;

  const handleScroll = throttle(() => {
    const docHeight = contentWrapper.offsetHeight;
    const winHeight = window.innerHeight;
    const contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
    const scrollPercent = Math.min(100 * window.scrollY / contentVisibilityHeight, 100);
    readingProgressBar.style.width = scrollPercent.toFixed(2) + '%';
  }, CONFIG.SCROLL_THROTTLE);

  window.addEventListener('scroll', handleScroll);
}

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
          $img.animate({height: Math.ceil(height) + 'px'}, CONFIG.ANIMATE_DURATION);
        }

        $img.off('load').on('load', function() {
          $img.fadeTo(500, 1);
        });
      });
    };
  };

  let hoverTimer;

  $target.on('mouseenter', 'img', function(e) {
    hoverTimer = setTimeout(updateImage, CONFIG.IMAGE_HOVER_DELAY);
  });

  $target.on('mouseleave', 'img', function(e) {
    clearTimeout(updateTimer);
    clearTimeout(hoverTimer);
  });
}

function registerPostHeaders() {
  const headers = $('.post-group-title');
  const $currentSection = $('#current-section');
  const $postSortCategory = $('#post-sort-category');
  const $allPosts = $('#all-posts');
  const $sortByCategory = $('#sort-by-category');

  const handleScroll = throttle(() => {
    const scrollPos = $(window).scrollTop();

    if ($allPosts.offset().top >= scrollPos) {
      $currentSection.text("按时间显示");
    }

    if ($sortByCategory.offset().top <= scrollPos + 5) {
      $postSortCategory.text("切换按时间显示");
      $postSortCategory.attr('href', '#sort-by-date');
    } else {
      $postSortCategory.text("切换按分类显示");
      $postSortCategory.attr('href', '#sort-by-category');
    }

    headers.each(function(i) {
      const thisHeader = $(this);
      const nextHeader = headers.eq(i + 1);

      if (thisHeader.offset().top <= scrollPos + 5) {
        if (nextHeader.length === 0 || nextHeader.offset().top >= scrollPos) {
          $currentSection.text(thisHeader.text());
        }
      }
    });
  }, CONFIG.SCROLL_THROTTLE);

  $(window).on('scroll', handleScroll);
};

function fullScreenImages(className) {
	var selector = className + ' img'
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
				}
				else {
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
	element.style.display='none';
	element.style.opacity = 0;
}

function toggle() {
  active = !active;
  const $icon = $('#menu-button i');
  const $navlist = $('.nav-list');
  
  $icon.removeClass();
  
  if (active) {
    $icon.addClass('fa-solid fa-xmark');
    $navlist.addClass('active');
  } else {
    $icon.addClass('fa-solid fa-bars');
    $navlist.removeClass('active');
  }
}

function expandMovie() {
	const list = $('.movie-list');
	list.on('click', '.movie-title', function() {
	  const item = $(this).next();
	  const btn = $(this).parent().parent().prev();
	  btn.addClass('movie-on');
	  btn.text('收起全部详情');
	  const details = $(this).nextAll('.movie-detail').first();
	  details.slideToggle(function() {
	    item.toggleClass('open');
	  });
	});
}

function expandAllMovies() {
	const btns = $('.expand-all-button');
	btns.on('click', function(){
		const list = $(this).siblings('.movie-list').first();
		const details = list.find('.movie-detail');
		const expand = list.find('.expand-button');
		$(this).siblings('.expand-all-button').toggleClass('movie-on');

		if ($(this).hasClass('movie-on')) {
			// 收起
			expand.removeClass('open');
			details.slideUp();
			$(this).text('展开全部详情');
			$(this).siblings('.expand-all-button').text('展开全部详情');
			$(this).siblings('.at-bottom').removeClass('movie-on');
		} else {
			// 展开
			details.slideToggle();
			expand.addClass('open');
			$(this).text('收起全部详情');
			$(this).siblings('.expand-all-button').text('收起全部详情');
		}

		$(this).toggleClass('movie-on');
	});
}

function filterMovies() {
	const type = $('.movie-type .selected').data('value');
	const typeQuery = type ? `[data-type=${type}]` : "";
	const year = $('.movie-year .selected').data('value');
	const yearQuery = year ? `[data-value=${year}]` : '';
	const rate = $('.movie-rate .selected').data('value');
	const rateQuery = rate ? `[data-rating="${rate}.0"]` : '';

	updateMoviesListTitle(type, year, $('.movie-rate .selected').text())

	var movieslist = $(typeQuery+yearQuery+rateQuery);
	movieslist.removeClass('hide');
	movieslist.find('.movie-rating:not([load=true])').each(function() {
	  const ratingValue = $(this).data('rating');
	  let starHtml = '';
	  for (let i = 0; i < ratingValue; i++) {
		starHtml += '<i class="fa-solid fa-star" style="color: #FFAC2D; font-size: .7em;"></i>';
	  }
	  $(this).append(starHtml).attr('load', 'true');
	});
  }

  function updateMoviesListTitle(type, year, rate) {
    const typeMap = {
      'book': { label: '书籍', action: '阅读' },
      'movie': { label: '影视剧', action: '看' },
      'game': { label: '游戏', action: '玩' }
    };

    const typeConfig = typeMap[type] || { label: '', action: '' };
    const typeString = typeConfig.label;
    const actionString = typeConfig.action;

    let title = '';
    if (year) {
      title = `${year}年${actionString}过的`;
    } else {
      title = `全部${actionString}过的`;
    }

    if (title.includes('全部')) {
      if (!rate.includes('全部')) {
        title += rate;
      }
    } else {
      title += rate;
    }

    title += typeString;
    $('.movies-list h2').text(title);
  }

window.addEventListener('DOMContentLoaded', (event) => {
	if ($("#photo").length){
		change();
	}
	registerScrollPercent();

	// $('.photo-grid').each(function (i, v) {
	// 	registerImageHover(v);
	// });
	if ($('.post-group-title').length) {
		registerPostHeaders();	
	}

	if ($('.post').length) {
		fullScreenImages('.post');
	}
	if ($('.project-content').length) {
		fullScreenImages('.project-content');
	}
	if ($('.thought-content').length) {
		fullScreenImages('.thought-content');
	}

	$("#menu-button").click(function(){
		toggle();
	});

	$('.image-slider').slick({
		arrows:true,
		adaptiveHeight: true,
		dots:true
	});

	if ($('.movie-list').length) {
		expandMovie();
		expandAllMovies();
	}

	$('.movie-type a, .movie-year a, .movie-rate a').on('click', function () {
		$(this).siblings().removeClass('selected').end().addClass('selected');
		$('.movie-single').addClass('hide');
		filterMovies();
	});
});