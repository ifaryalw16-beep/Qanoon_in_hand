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
