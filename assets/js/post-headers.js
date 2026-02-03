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
}
