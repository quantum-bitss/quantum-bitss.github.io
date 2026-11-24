"use strict";
// Preserve saved job links from when the console occupied the project root.
function restoreSavedJob() {
  if (/^#job=[a-f0-9]{32}$/.test(window.location.hash)) {
    window.location.replace(new URL(`./playground/${window.location.hash}`, window.location.href));
  }
}
window.addEventListener("hashchange", restoreSavedJob);
restoreSavedJob();

// Project figure viewer and compact paper-result comparison.
const figureDialog = document.querySelector('.figure-dialog');
document.querySelectorAll('[data-figure]').forEach(button => button.addEventListener('click', () => {
  const img = document.querySelector('#expanded-figure');
  img.src = button.dataset.figure; img.alt = button.dataset.caption;
  document.querySelector('#figure-caption').textContent = button.dataset.caption;
  figureDialog.showModal();
}));
document.querySelector('.dialog-close')?.addEventListener('click', () => figureDialog.close());
figureDialog?.addEventListener('click', event => {if (event.target === figureDialog) figureDialog.close();});
const results = {"openclaw": {"model": "DeepSeek V4 Pro", "rows": [[20.83, 12.5, 70.83], [16.67, 6.25, 14.58], [37.5, 25, 52.08], [16.67, 12.5, 60.42], [62.5, 54.17, 95.83]]}, "openai": {"model": "GPT-5.5", "rows": [[12.5, 6.25, 31.25], [8.33, 0, 6.25], [18.75, 10.42, 27.08], [29.17, 25, 60.42], [62.5, 56.25, 81.25]]}, "claude": {"model": "Sonnet 4.6", "rows": [[10.42, 6.25, 8.33], [0, 0, 0], [2.08, 2.08, 18.75], [8.33, 6.25, 31.25], [16.67, 10.42, 52.08]]}};
const methods = ["AutoRedTeamer", "MUZZLE", "RedCodeAgent", "Naive SABER", "SABER"];
const targetTabs = [...document.querySelectorAll('[data-target]')];
function selectTarget(button) {
  targetTabs.forEach(tab => {tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1;});
  const selected = results[button.dataset.target];
  document.querySelector('#comparison-data').setAttribute('aria-labelledby', button.id);
  document.querySelector('#target-model').textContent = `Target model · ${selected.model}`;
  document.querySelector('#result-rows').innerHTML = selected.rows.map((row, i) => `<tr${i === 4 ? ' class="ours"' : ''}><th scope="row">${methods[i]}</th>${row.map(value => `<td>${value.toFixed(2)}</td>`).join('')}</tr>`).join('');
}
targetTabs.forEach((button, i) => {
  button.addEventListener('click', () => selectTarget(button));
  button.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? targetTabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + targetTabs.length) % targetTabs.length;
    selectTarget(targetTabs[next]); targetTabs[next].focus();
  });
});
