import domready from 'domready';
import '../css/index.styl';

domready(() => {
  // contact form
  const message = document.querySelector('#contact-message');
  message &&
    message.addEventListener('keypress', (event) => {
      const el = event.currentTarget;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    });
});
