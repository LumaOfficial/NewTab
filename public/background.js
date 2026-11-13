// Minimal Manifest V3 service worker.
//
// The dashboard needs no background work: everything it saves goes through
// `chrome.storage.local` from the new-tab page itself. This worker only wires
// the toolbar button to open the dashboard, so the extension asks for no
// permissions beyond `storage`.

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
