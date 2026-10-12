// Browser preview remains usable; native installation comes from the APK.
if (!window.Capacitor?.isNativePlatform()) {
  let installPrompt;
  const installButton = document.querySelector('#install');
  window.addEventListener('beforeinstallprompt', event => {
    if (!installButton) return;
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton?.addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    installButton.hidden = true;
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
