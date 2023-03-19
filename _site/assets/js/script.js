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
var index = 0;
var firsttime = true;
var active = false;

function change() {
	var index = Math.floor(Math.random() * images.length);
	var src = "/assets/pics/" + images[index];
	var location = metas[images[index]][0]
	var meta = metas[images[index]][1]

	function updateInfo() {
		$("#location").text(location);
		$("#metas").text(meta);
	}

	if (firsttime) {
		$("#photo").attr("src",src);
		updateInfo();
		var height = $("#postcard-photo").width() / 1200 * 800;
		$("#photo").height(Math.ceil(height) + 'px');

		var parentWidth = $('#postcard-photo').width();
	  var parentHeight = $('#postcard-photo').height();
	  var childWidth = $('.loader').width();
	  var childHeight = $('.loader').height();
	  var leftOffset = (parentWidth - childWidth) / 2;
	  var topOffset = (parentHeight - childHeight) / 2;
	  $('.loader').css({
	    'position': 'absolute',
	    'left': leftOffset + 'px',
	    'top': topOffset + 'px'
	  });
	}

	var obj = new Image(); 
	obj.src = src;
	var fadeTo = firsttime ? 1 : 0;
	obj.onload=function(){
		$("#photo").fadeTo(1000,fadeTo, function() {
			setTimeout(change, 10000);

			var height = $("#photo").width() / obj.width * obj.height;
			if (!firsttime) {
				$("#photo").attr("src",src);
			}
			updateInfo();
			if (firsttime) {
				$("#photo").height(Math.ceil(height)+'px');
			}
			$("#photo").animate({height: Math.ceil(height)+'px'}, 500);
			firsttime = false;

			var parentHeight = $('#photo').height();
			var childHeight = $('.loader').height();
			$('.loader').css({
		    'position': 'absolute',
		    'left': leftOffset + 'px',
		    'top': topOffset + 'px'
		  });

			$("#photo").on('load', function(){
				$('#loading').hide();
				$("#photo").fadeTo(1000,1);
			});
		});
	}
}

function registerScrollPercent() {
	var THRESHOLD = 50;
    var readingProgressBar = document.querySelector('.reading-progress-bar');   
    window.addEventListener('scroll', () => {
      if (readingProgressBar) {
        var docHeight = document.querySelector('.content-wrapper').offsetHeight;
        var winHeight = window.innerHeight;
        var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
        var scrollPercent = Math.min(100 * window.scrollY / contentVisibilityHeight, 100);
        
        if (readingProgressBar) {
          readingProgressBar.style.width = scrollPercent.toFixed(2) + '%';
        }
      }
    });
}

function registerImageMouse(target) {
	$(target).mousemove(function(e) {
		var num = $(target).attr('num');
		var index = Math.max(Math.ceil(e.offsetX / $(target).width() * parseInt(num)), 1);
		var src = "/assets/photos/" + $(target).attr('name') + "/" + $(target).attr('name') + "-" + index + ".jpeg";
		$(target).find('img').attr('src', src)
	});
}

function registerImageHover(target) {
	var update;
	var ft = true;
	var updateImage = function () {
		clearTimeout(update);
		update = setTimeout(updateImage, 3000);

		var num = $(target).attr('num');
		var randomIndex = Math.floor(Math.random() * parseInt(num)) + 1;
		//todo: make the random index diff from the previous one
		var src = "/assets/photos/" + $(target).attr('name') + "/" + $(target).attr('name') + "-" + randomIndex + ".jpeg";

		var obj = new Image(); 
		obj.src = src;
		obj.onload=function(){
			$(target).find('img').fadeTo(250, 0, function() {
				
				$(target).find('img').attr('src', src);
				var height = $(target).find('img').width() / obj.width * obj.height;
				if (ft) {
					$(target).find('img').height(Math.ceil(height)+'px');
				}else{
					$(target).find('img').animate({height: Math.ceil(height)+'px'}, 500);	
				}
				
				$(target).find('img').on('load', function(){
					$(target).find('img').fadeTo(500,1);
				});
			});
		};
	};

	var timer;

	$(target).on('mouseenter', 'img', function(e) {
    timer = setTimeout(function(){
        updateImage();
    }, 2000);
	});
	$(target).on('mouseleave', 'img', function(e) {
		clearTimeout(update);
		clearTimeout(timer);
	});
}

function registerPostHeaders() {
	var headers = $('.post-group-title');

	$(window).on('scroll', function(){
	 	var scrollPos = $(window).scrollTop();
	 	var screenHeight = $(window).height();

	 	if ( $('#all-posts').offset().top >= scrollPos ) {
	  	$('#current-section').text("按时间显示");
	  }

	  if ( $('#sort-by-category').offset().top <= scrollPos + 5 ) {
	  	$('#post-sort-category').text("切换按时间显示");
	  	$('#post-sort-category').attr('href', '#sort-by-date');
	  } else {
	  	$('#post-sort-category').text("切换按分类显示");
	  	$('#post-sort-category').attr('href', '#sort-by-category');
	  }

		headers.each(function(i){
		 	var thisHeader = $(this),
		 	nextHeader = headers.eq(i+1),
	    prevHeader = headers.eq(i-1);
	  
	  	if( thisHeader.offset().top <= scrollPos + 5) {
	  		if ( nextHeader.offset().top >= scrollPos ) {
	  			$('#current-section').text(thisHeader.text());
	  		}
	  	};
		});
	});
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
  let i = document.querySelector('#menu-button i');
  let navlist = document.querySelector('.nav-list');
  $(i).removeClass();
  if (active) {
    $(i).addClass('fa-solid fa-xmark');
    $(navlist).addClass('active');
  } else {
  	$(i).addClass('fa-solid fa-bars');
  	$(navlist).removeClass('active');
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
	var typeString = "";
	var actionString = "";
	if (type == 'book') {
		typeString = '书籍';
		actionString = "阅读";
	} else if (type == 'movie') {
		typeString = '影视剧';
		actionString = '看';
	} else if ( type == 'game') {
		typeString = '游戏';
		actionString = '玩';
	}

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

	title += `${typeString}`;
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