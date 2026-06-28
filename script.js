// Mobile nav toggle handled inline
document.querySelectorAll('.nav-links a').forEach(link=>{
  link.addEventListener('click',()=>{
    document.querySelectorAll('.nav-links a').forEach(l=>l.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('navLinks').classList.remove('open');
  });
});

// Pill click demo
document.querySelectorAll('.pills a').forEach(p=>{
  p.addEventListener('click',e=>{
    e.preventDefault();
    alert('Opening: ' + p.textContent);
  });
});

// Subtle reveal-on-load animation for cards
window.addEventListener('load',()=>{
  document.querySelectorAll('.card').forEach((c,i)=>{
    c.style.opacity=0;
    c.style.transform='translateY(20px)';
    c.style.transition=`opacity .6s ${i*.12}s ease, transform .6s ${i*.12}s ease`;
    requestAnimationFrame(()=>{c.style.opacity=1;c.style.transform='translateY(0)';});
  });
});
function loadNavbar() {
  const navbarContainer = document.getElementById('navbar-placeholder');
  if (!navbarContainer) return;

  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      navbarContainer.innerHTML = data;
      highlightActiveLink();
    });
}

function highlightActiveLink() {
  // Finds the current page name (e.g., "about.html")
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Runs the loader automatically when a page finishes loading
document.addEventListener('DOMContentLoaded', loadNavbar);
// Dropdown menu ko open aur close karne ka function
function toggleSettingsMenu(event) {
  event.stopPropagation(); // Click event ko bubble hone se rokta hai
  const dropdown = document.getElementById('settingsDropdown');
  dropdown.classList.toggle('show');
}

// Modals open karne ke liye
function openModal(modalId) {
  // Dropdown ko automatic close karne ke liye jab modal khule
  document.getElementById('settingsDropdown').classList.remove('show');
  
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// Modals close karne ke liye
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Agar user window screen par kahin bhi bahar click kare to elements automatically close ho jayen
window.onclick = function(event) {
  // Close dropdown if clicked outside
  if (!event.target.matches('.settings-trigger')) {
    const dropdowns = document.getElementsByClassName("settings-dropdown");
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }

  // Close modals if background/overlay is clicked
  if (event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
  }
}