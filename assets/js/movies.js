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
  btns.on('click', function() {
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

  updateMoviesListTitle(type, year, $('.movie-rate .selected').text());

  var movieslist = $(typeQuery + yearQuery + rateQuery);
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
    book: { label: '书籍', action: '阅读' },
    movie: { label: '影视剧', action: '看' },
    game: { label: '游戏', action: '玩' }
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
