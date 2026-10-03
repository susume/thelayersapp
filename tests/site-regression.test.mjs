import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8');

function contactRuntime(search = '') {
  const form = {
    elements: {
      name: { value: 'Katrin', focus() {} },
      email: { value: 'test@example.test' },
      message: { value: 'Please help with my Android setup.', focus() {} },
      topic: { value: 'access', options: [{ value: 'access', textContent: 'Closed beta enquiry' }, { value: 'guard', textContent: 'Guard Family' }], selectedIndex: 0 },
    },
    reportValidity: () => true,
    addEventListener(type, fn) { this[type] = fn; },
  };
  const nodes = {
    '#contact-form': form,
    '#form-status': { textContent: '' },
    '#email-draft-link': { href: '', focus() { this.focused = true; } },
    '#email-draft': { value: '' },
    '#draft-box': { hidden: true },
  };
  const location = Object.freeze({ search });
  const context = vm.createContext({ document: { querySelector: selector => nodes[selector] || null }, location, URLSearchParams });
  vm.runInContext(script, context);
  return { form, nodes, submit() { let prevented = false; form.submit({ preventDefault() { prevented = true; } }); assert.equal(prevented, true); } };
}

test('contact prepares a draft without sending, navigating or asserting delivery', () => {
  const { nodes, submit } = contactRuntime();
  submit();
  assert.equal(nodes['#draft-box'].hidden, false);
  const url = new URL(nodes['#email-draft-link'].href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'contact@thelayersapp.com');
  assert.equal(url.searchParams.get('subject'), 'Layers — Closed beta enquiry');
  assert.match(url.searchParams.get('body'), /Reply email: test@example.test/);
  assert.match(nodes['#form-status'].textContent, /has not sent a message/);
  assert.equal(nodes['#email-draft-link'].focused, true);
});

test('draft encoding keeps user content out of mailto headers and recipients', () => {
  const { form, nodes, submit } = contactRuntime();
  form.elements.message.value = 'Hello &bcc=someone@example.test\n<script>alert(1)</script> 日本語';
  submit();
  const url = new URL(nodes['#email-draft-link'].href);
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.match(url.searchParams.get('body'), /&bcc=someone@example.test/);
  assert.match(nodes['#email-draft'].value, /<script>alert\(1\)<\/script>/);
  assert.equal(url.pathname, 'contact@thelayersapp.com');
});

test('invalid form and whitespace-only content keep the draft hidden', () => {
  const invalid = contactRuntime();
  invalid.form.reportValidity = () => false;
  invalid.submit();
  assert.equal(invalid.nodes['#draft-box'].hidden, true);
  const blank = contactRuntime();
  blank.form.elements.name.value = '   ';
  blank.submit();
  assert.equal(blank.nodes['#draft-box'].hidden, true);
  assert.match(blank.nodes['#form-status'].textContent, /Please enter/);
});

test('query strings can select only a known contact topic', () => {
  assert.equal(contactRuntime('?topic=guard').form.elements.topic.value, 'guard');
  assert.equal(contactRuntime('?topic=evil&to=attacker@example.test').form.elements.topic.value, 'access');
});

test('mobile navigation toggles its accessible state and closes on Escape', () => {
  const handlers = {};
  const header = { dataset: {}, addEventListener: (type, fn) => { handlers[type] = fn; } };
  const attrs = { 'aria-expanded': 'false' };
  const menu = { getAttribute: name => attrs[name], setAttribute: (name, value) => { attrs[name] = value; }, addEventListener: (_, fn) => { handlers.click = fn; }, focus() { this.focused = true; } };
  vm.runInNewContext(script, { document: { querySelector: selector => selector === '.site-header' ? header : selector === '.menu-toggle' ? menu : null } });
  assert.equal(header.dataset.menu, 'closed');
  handlers.click();
  assert.equal(header.dataset.menu, 'open');
  assert.equal(attrs['aria-expanded'], 'true');
  handlers.keydown({ key: 'Escape' });
  assert.equal(header.dataset.menu, 'closed');
  assert.equal(attrs['aria-expanded'], 'false');
  assert.equal(menu.focused, true);
});
