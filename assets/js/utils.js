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

function calculateImageHeight(width, imageWidth, imageHeight) {
  return (width / imageWidth) * imageHeight;
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
