var html=document.documentElement;
var themeBtn=document.getElementById('themeBtn');
var themeBtnMob=document.getElementById('themeBtnMob');
var hamburger=document.getElementById('hamburger');
var mobileMenu=document.getElementById('mobileMenu');

function setTheme(t){
  html.setAttribute('data-theme',t);
  localStorage.setItem('theme',t);
  var icon=t==='dark'?'Moon':'Sun';
  themeBtn.textContent=t==='dark'?'\u{1F319}':'\u2600\uFE0F';
  themeBtnMob.textContent=t==='dark'?'\u{1F319}':'\u2600\uFE0F';
}

var saved=localStorage.getItem('theme')||'dark';
setTheme(saved);

themeBtn.addEventListener('click',function(){setTheme(html.getAttribute('data-theme')==='dark'?'light':'dark')});
themeBtnMob.addEventListener('click',function(){setTheme(html.getAttribute('data-theme')==='dark'?'light':'dark')});

hamburger.addEventListener('click',function(){
  mobileMenu.classList.toggle('open');
  document.body.style.overflow=mobileMenu.classList.contains('open')?'hidden':'';
});

document.querySelectorAll('.mob-link').forEach(function(l){
  l.addEventListener('click',function(){
    mobileMenu.classList.remove('open');
    document.body.style.overflow='';
  });
});

var observer=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}});
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(function(el){observer.observe(el)});
