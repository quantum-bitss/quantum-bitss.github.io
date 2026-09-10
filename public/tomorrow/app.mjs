import { restaurants, coffees, dateKey, validPlan, generatePlan } from './menu.mjs';
const $ = id => document.getElementById(id);
const storageKey = 'for-you-daily-menu-v1';
let history = {};
let storageAvailable = true;
let offset = 1;
let today = dateKey();
let selectedDate;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    history = Object.fromEntries(Object.entries(stored).filter(([key, plan]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && validPlan(plan)));
  }
} catch { storageAvailable = false; }
function persist() {
  try {
    // Bound browser storage while retaining recent days for adjacent-day comparisons.
    history = Object.fromEntries(Object.entries(history).sort(([a], [b]) => b.localeCompare(a)).slice(0, 60));
    localStorage.setItem(storageKey, JSON.stringify(history));
    storageAvailable = true;
  } catch { storageAvailable = false; }
}
function status(message) {
  $('status').textContent = storageAvailable ? message : '当前浏览器无法保存菜单；这次搭配仅在本页保留。';
}
function select(dayOffset) {
  offset = dayOffset;
  today = dateKey();
  selectedDate = dateKey(new Date(), offset);
  if (offset === 1 && !history[selectedDate]) {
    history[selectedDate] = generatePlan(history[today]);
    persist();
  }
  render();
}
function render() {
  const plan = history[selectedDate];
  const date = new Date(`${selectedDate}T12:00:00`);
  $('date').textContent = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
  $('menu-title').textContent = offset ? '明日的快乐，安排好啦' : '今天也要好好吃饭';
  $('tomorrow').setAttribute('aria-pressed', String(offset === 1));
  $('today').setAttribute('aria-pressed', String(offset === 0));
  $('cards').replaceChildren();
  if (plan) {
    for (const [kind, label, english] of [['lunch', '午餐', 'LUNCH'], ['dinner', '晚餐', 'DINNER'], ['coffee', '每日咖啡', 'COFFEE']]) {
      const meal = plan[kind];
      const restaurant = kind === 'coffee' ? null : restaurants[meal.restaurant];
      const card = document.createElement('article');
      card.className = `card ${kind}`;
      const heading = document.createElement('div');
      heading.className = 'card-label';
      for (const text of [label, english]) {
        const span = document.createElement('span'); span.textContent = text; heading.append(span);
      }
      const icon = document.createElement('div'); icon.className = 'food-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = restaurant?.icon || '☕';
      const title = document.createElement('h3'); title.textContent = restaurant ? meal.dish : meal;
      const detail = document.createElement('p'); detail.textContent = restaurant ? restaurant.name : '给平凡的一天，加一点果香。';
      card.append(heading, icon, title, detail); $('cards').append(card);
    }
  } else {
    const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = '今天还没有留下菜单。先去安排明天的快乐吧 ♡'; $('cards').append(empty);
  }
  $('shuffle').hidden = offset === 0;
  $('save').hidden = offset === 0;
  $('shuffle').disabled = false;
  $('save').disabled = false;
  $('save').textContent = plan?.confirmed ? '♥ 已选好这份' : '♡ 就吃这份';
  status(!plan ? '从今天开始，慢慢攒下好好吃饭的日子。' : plan.confirmed ? '说好啦，就吃这份。记得按时吃饭哦 ♥' : '搭配已自动保存，不心动就再换一份。');
}
$('tomorrow').addEventListener('click', () => select(1));
$('today').addEventListener('click', () => select(0));
$('shuffle').addEventListener('click', () => {
  if (dateKey() !== today) select(1);
  history[selectedDate] = generatePlan(history[dateKey(new Date(), -1 + offset)], history[selectedDate]);
  persist(); render();
});
$('save').addEventListener('click', () => {
  if (dateKey() !== today) { select(1); return; }
  history[selectedDate].confirmed = true; persist(); render();
});
// Refresh the selected calendar day when an overnight tab returns to the foreground.
const refreshDay = () => { if (dateKey() !== today) select(offset); };
window.addEventListener('focus', refreshDay);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDay(); });
const list = document.createElement('ul');
for (const restaurant of restaurants) {
  const li = document.createElement('li'); li.textContent = restaurant.name === restaurant.dishes[0] ? restaurant.name : `${restaurant.name}：${restaurant.dishes.join(' / ')}`; list.append(li);
}
const coffeeList = document.createElement('p'); coffeeList.textContent = `每日咖啡：${coffees.join('、')}`;
$('options').append(list, coffeeList);
select(1);
