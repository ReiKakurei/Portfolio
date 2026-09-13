var html = document.documentElement;
var themeBtn = document.getElementById('themeBtn');

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
}

var saved = localStorage.getItem('theme') || 'dark';
setTheme(saved);

themeBtn.addEventListener('click', function () {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});