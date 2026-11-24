"use strict";
// Preserve saved job links from when the console occupied the project root.
function restoreSavedJob() {
  if (/^#job=[a-f0-9]{32}$/.test(window.location.hash)) {
    window.location.replace(new URL(`./playground/${window.location.hash}`, window.location.href));
  }
}
window.addEventListener("hashchange", restoreSavedJob);
restoreSavedJob();
