export const restaurants = [
  { name: '盛香亭热卤粉', dishes: ['猪油拌粉', '土豆泥盖码肉酱卤粉', '肉酱卤粉'], icon: '🍜' },
  { name: '蛙来哒', dishes: ['一人餐'], icon: '🍲' },
  { name: '味千拉面', dishes: ['猪软骨炒饭'], icon: '🍛' },
  { name: '冇味湘潭菜', dishes: ['冇味湘潭菜'], icon: '🥘' },
  { name: '达美乐', dishes: ['日式照烧鸡腿饭'], icon: '🍗' },
  { name: '台北豆浆', dishes: ['酸菜牛肉炒饭'], icon: '🍚' },
];
export const coffees = ['橙C美式', '苹果C美式', '小青桔C美式', '缤纷C美式', '柠C气泡美式', '柚C美式', '葡萄冰萃美式'];
const pick = (items) => items[Math.floor(Math.random() * items.length)];
export function dateKey(date = new Date(), offset = 0) {
  const day = new Date(date);
  day.setDate(day.getDate() + offset);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}
export function validPlan(plan) {
  return !!plan && [plan.lunch, plan.dinner].every(meal => meal && Number.isInteger(meal.restaurant) && restaurants[meal.restaurant]?.dishes.includes(meal.dish)) && plan.lunch.restaurant !== plan.dinner.restaurant && coffees.includes(plan.coffee);
}
// Compare unordered restaurant pairs: swapping lunch and dinner is still the same combination.
export function pairKey(plan) {
  return [plan.lunch.restaurant, plan.dinner.restaurant].sort().join('-');
}
export function generatePlan(previous, current) {
  const pairs = restaurants.flatMap((_, lunch) => restaurants.flatMap((__, dinner) => {
    const candidate = { lunch: { restaurant: lunch }, dinner: { restaurant: dinner } };
    return lunch !== dinner && (!previous || pairKey(candidate) !== pairKey(previous)) && (!current || pairKey(candidate) !== pairKey(current)) ? [[lunch, dinner]] : [];
  }));
  const [lunch, dinner] = pick(pairs);
  const meal = restaurant => ({ restaurant, dish: pick(restaurants[restaurant].dishes) });
  return { lunch: meal(lunch), dinner: meal(dinner), coffee: pick(coffees) };
}
