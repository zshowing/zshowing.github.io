let active = false;

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
