"use strict";
const cases = [...document.querySelectorAll('[data-case]')];
const validTabs = ['task', 'attack', 'trajectory', 'result'];
function showRoute() {
  const [requestedCase, requestedTab] = location.hash.slice(1).split('/');
  const caseId = cases.some(c => c.dataset.case === requestedCase) ? requestedCase : 'code';
  const tabId = validTabs.includes(requestedTab) ? requestedTab : 'trajectory';
  cases.forEach(section => {
    section.hidden = section.dataset.case !== caseId;
    section.querySelectorAll('[data-tab]').forEach(tab => {
      const active = tab.dataset.tab === tabId;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    });
    section.querySelectorAll('[data-panel]').forEach(panel => {panel.hidden = panel.dataset.panel !== tabId;});
  });
  document.querySelectorAll('[data-case-link]').forEach(link => {
    if (link.dataset.caseLink === caseId) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
cases.forEach(section => {
  const tabs = [...section.querySelectorAll('[data-tab]')];
  tabs.forEach((tab, i) => {
    function select() {location.hash = `${section.dataset.case}/${tab.dataset.tab}`;}
    tab.addEventListener('click', select);
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click(); tabs[next].focus();
    });
  });
});
window.addEventListener('hashchange', showRoute);
showRoute();
