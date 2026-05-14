import { getBoissons, getCategories } from './backend.js';

const boissons = await getBoissons();
const categories = await getCategories();

console.log('Boissons :', boissons);
console.log('Catégories :', categories);