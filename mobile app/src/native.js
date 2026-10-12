import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { Keyboard } from '@capacitor/keyboard';
import { installSession } from './session.js';

window.TEENLAUNCH_API_ORIGIN = 'https://teenlaunch-production.up.railway.app';
window.TEENLAUNCH_API_BASE = window.TEENLAUNCH_API_ORIGIN + '/api';
const session = installSession(window);
const native = Capacitor.isNativePlatform();
const root = new URL('./', document.currentScript.src);
let keyboardVisible = false;
const report = error => console.warn('Mobile integration:', error.message);
async function openExternal(value) {
  const url = new URL(value, location.href);
  if (!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) return;
  if (native && ['https:', 'http:'].includes(url.protocol)) {
    await Browser.open({ url: url.href });
  } else if (['mailto:', 'tel:'].includes(url.protocol)) {
    location.href = url.href;
  } else {
    window.open(url.href, '_blank', 'noopener,noreferrer');
  }
}
window.TeenLaunchNative = {
  openExternal,
  publicPortfolioUrl(slug) {
    return 'https://www.teenlaunch.app/pages/public-portfolio.html?slug=' + encodeURIComponent(slug);
  },
  async copyText(text) {
    if (native) return Clipboard.write({ string: String(text) });
    return navigator.clipboard.writeText(String(text));
  }
};

if (native) {
  document.documentElement.classList.add('native-app');
  const NativePrint = registerPlugin('TeenLaunchPrint');
  window.print = () => NativePrint.print().catch(report);
  // Always use the installed web bundle; a browser service worker must not serve an older UI.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(items => Promise.all(items.map(item => item.unregister()))).catch(report);
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || event.defaultPrevented) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin === location.origin) return;
    if (!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) return;
    event.preventDefault();
    openExternal(url.href).catch(report);
  }, true);
  window.open = (value) => {
    if (!value) return null;
    const url = new URL(value, location.href);
    if (url.origin === location.origin) location.href = url.href;
    else openExternal(url.href).catch(report);
    return null;
  };
  App.addListener('resume', () => session.refreshIfNeeded().catch(report)).catch(report);
  App.addListener('backButton', async ({ canGoBack }) => {
    if (keyboardVisible) { await Keyboard.hide(); return; }
    const dialog = document.querySelector('dialog[open]');
    if (dialog) { dialog.close(); return; }
    const menu = document.querySelector('.nav-links.open');
    if (menu) {
      menu.classList.remove('open');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
      return;
    }
    if (canGoBack) { history.back(); return; }
    if (location.pathname !== root.pathname + 'index.html' && location.pathname !== root.pathname) {
      location.replace(new URL('index.html', root).href);
      return;
    }
    await App.minimizeApp();
  }).catch(report);
  Keyboard.addListener('keyboardDidShow', () => {
    keyboardVisible = true;
    document.documentElement.classList.add('keyboard-open');
    document.activeElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }).catch(report);
  Keyboard.addListener('keyboardDidHide', () => {
    keyboardVisible = false;
    document.documentElement.classList.remove('keyboard-open');
  }).catch(report);
}
