// public/scripts/script.js
document.addEventListener('DOMContentLoaded', () => {
    const sideMenu = document.querySelector("aside");
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const themeToggler = document.querySelector(".theme-toggler");
  
    if (menuBtn && sideMenu) {
      menuBtn.addEventListener('click', () => {
        sideMenu.style.display = 'block';
      });
  
      closeBtn.addEventListener('click', () => {
        sideMenu.style.display = 'none';
      });
    }
  
    if (themeToggler) {
      themeToggler.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');
  
        themeToggler.querySelectorAll('span').forEach(span => {
          span.classList.toggle('active');
        });
      });
    }
  });
  