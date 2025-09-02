/* Lightweight local auth (demo). Do not use in production. */
const Auth = (() => {
  const KEY = 'qc_users_v1';
  const SESSION = 'qc_session_v1';

  function users(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  function saveUsers(u){ localStorage.setItem(KEY, JSON.stringify(u)); }

  function register({name,email,password}){
    const u = users();
    if(u.some(x => x.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already registered.');
    u.push({ id: crypto.randomUUID(), name, email, password });
    saveUsers(u);
    login({ email, password });
  }

  function login({email,password}){
    const u = users().find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if(!u) throw new Error('Invalid credentials.');
    localStorage.setItem(SESSION, JSON.stringify({ id:u.id, name:u.name, email:u.email }));
  }

  function logout(){ localStorage.removeItem(SESSION); }
  function me(){ try { return JSON.parse(localStorage.getItem(SESSION)); } catch { return null; } }
  function requireAuth(redirect = '/auth/login.html'){
    if(!me()){ window.location.href = redirect + '?next=' + encodeURIComponent(location.pathname); }
  }

  function bindGreeting(sel='.auth-greeting'){
    const el = document.querySelector(sel);
    if(el){
      const user = me();
      el.textContent = user ? `Welcome, ${user.name}` : 'Welcome, Guest';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindGreeting();
    document.querySelectorAll('[data-logout]').forEach(btn => btn.addEventListener('click', () => { logout(); location.reload(); }));
    // hamburger toggle
    const toggle = document.getElementById('nav-toggle');
    const links  = document.querySelector('.nav-links');
    toggle?.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
  });

  return { register, login, logout, me, requireAuth, bindGreeting };
})();