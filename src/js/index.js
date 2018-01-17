import domready from 'domready';
import '../css/index.styl';

const adjustFrame = () => {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const height = iframe.offsetWidth / 16 * 9;
    iframe.setAttribute('height', height);
    iframe.style.height = `${height}px`; // eslint-disable-line no-param-reassign
  });
};

domready(() => {
  // contact form
  const message = document.querySelector('#contact-message');
  message &&
    message.addEventListener('keypress', (event) => {
      const el = event.currentTarget;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    });

  // iframe
  window.addEventListener('resize', adjustFrame);
  adjustFrame();
});
