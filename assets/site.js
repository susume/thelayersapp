// Progressive enhancements. Content and navigation work without JavaScript.
const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
if (header && menu) {
  header.dataset.menu = 'closed';
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    header.dataset.menu = expanded ? 'open' : 'closed';
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      header.dataset.menu = 'closed';
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
}

const form = document.querySelector('#contact-form');
if (form) {
  const topic = new URLSearchParams(location.search).get('topic');
  const select = form.elements.topic;
  if (Array.from(select.options).some(option => option.value === topic)) select.value = topic;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message) {
      document.querySelector('#form-status').textContent = 'Please enter your name and message.';
      (!name ? form.elements.name : form.elements.message).focus();
      return;
    }
    const label = select.options[select.selectedIndex].textContent;
    const subject = 'Layers — ' + label;
    const body = 'Name: ' + name + '\nReply email: ' + email + '\nTopic: ' + label + '\n\n' + message;
    const link = document.querySelector('#email-draft-link');
    link.href = 'mailto:contact@thelayersapp.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const draft = document.querySelector('#email-draft');
    draft.value = 'To: contact@thelayersapp.com\nSubject: ' + subject + '\n\n' + body;
    document.querySelector('#draft-box').hidden = false;
    document.querySelector('#form-status').textContent = 'Your draft is ready. Open your email app and press Send there, or copy the draft into your webmail. This website has not sent a message.';
    link.focus();
  });
}
