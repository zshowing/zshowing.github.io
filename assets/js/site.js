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

window.addEventListener('DOMContentLoaded', function() {
  if ($("#photo").length) {
    change();
  }
  registerScrollPercent();

  // $('.photo-grid').each(function (i, v) {
  //  registerImageHover(v);
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

  $("#menu-button").click(function() {
    toggle();
  });

  $('.image-slider').slick({
    arrows: true,
    adaptiveHeight: true,
    dots: true
  });

  if ($('.movie-list').length) {
    expandMovie();
    expandAllMovies();
  }

  $('.movie-type a, .movie-year a, .movie-rate a').on('click', function() {
    $(this).siblings().removeClass('selected').end().addClass('selected');
    $('.movie-single').addClass('hide');
    filterMovies();
  });
});
