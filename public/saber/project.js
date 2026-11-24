"use strict";
// Preserve saved job links from when the console occupied the project root.
if (/^#job=[a-f0-9]{32}$/.test(window.location.hash)) {
  window.location.replace(new URL(`./playground/${window.location.hash}`, window.location.href));
}
