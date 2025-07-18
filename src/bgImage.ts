// Import the money background image for use in CSS
import moneyBg from './assets/money-bg.jpg';

// Create a CSS variable with the imported image
const root = document.documentElement;
root.style.setProperty('--money-bg-url', `url(${moneyBg})`);

export default moneyBg;
