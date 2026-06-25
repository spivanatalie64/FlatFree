(function(){'use strict';try{
    var isOpen=false,sidebar,overlay,hamburger;
    function init(){
      var header=document.querySelector('.header-content');
      if(!header||document.getElementById('hamburger'))return;
      hamburger=document.createElement('button');
      hamburger.id='hamburger';
      hamburger.setAttribute('aria-label','Menu');
      hamburger.setAttribute('aria-expanded','false');
      hamburger.innerHTML='<span></span><span></span><span></span>';
      hamburger.addEventListener('click',function(e){e.preventDefault();toggle();});
      header.appendChild(hamburger);
      overlay=document.createElement('div');
      overlay.id='sidebar-overlay';
      overlay.addEventListener('click',close);
      document.body.appendChild(overlay);
      sidebar=document.createElement('div');
      sidebar.id='sidebar';
      sidebar.setAttribute('role','dialog');
      sidebar.setAttribute('aria-label','Site navigation');
      sidebar.innerHTML='<div class="sidebar-body"><ul><li><a href="index.html"><i class="bi bi-house"></i> Home</a></li><li><a href="apps.html"><i class="bi bi-grid"></i> Apps</a></li><li><a href="about.html"><i class="bi bi-info-circle"></i> About</a></li><li><a href="guidelines.html"><i class="bi bi-file-text"></i> Guidelines</a></li><li><a href="docs.html"><i class="bi bi-book"></i> Docs</a></li><li><a href="setup.html"><i class="bi bi-gear"></i> Setup</a></li><li><a href="faq.html"><i class="bi bi-question-circle"></i> FAQ</a></li><li><a href="blog.html"><i class="bi bi-pencil-square"></i> Blog</a></li><li><a href="contribute.html"><i class="bi bi-heart"></i> Contribute</a></li></ul></div><div class="sidebar-footer"><a href="https://github.com/spivanatalie64/FlatFree" target="_blank"><i class="bi bi-github"></i> GitHub</a><a href="https://flatfree.pages.dev" target="_blank"><i class="bi bi-globe2"></i> Visit</a></div>';
      document.body.appendChild(sidebar);
    }
    function toggle(){if(isOpen){close();}else{open();}}
    function open(){isOpen=true;document.body.classList.add('sidebar-open');if(hamburger){hamburger.classList.add('active');hamburger.setAttribute('aria-expanded','true');}if(sidebar){sidebar.classList.add('open');}}
    function close(){isOpen=false;document.body.classList.remove('sidebar-open');if(hamburger){hamburger.classList.remove('active');hamburger.setAttribute('aria-expanded','false');}if(sidebar){sidebar.classList.remove('open');}}
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen)close();});
    window.addEventListener('pageshow',function(){document.body.classList.remove('sidebar-open');});
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
  }catch(e){console.error('Sidebar init error:',e);}})();
