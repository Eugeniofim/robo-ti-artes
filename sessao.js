/* O login no navegador (14/11/2026): com e-mail e senha ou com o Google, o Supabase Auth dá um token de 1 hora e um de renovação. Fica no localStorage
   deste navegador; nada mais é guardado aqui. Toda chamada à função leva o token; vencido, renova uma vez. */
(function () {
  const K = 'robo-sessao';
  const le = () => { try { return JSON.parse(localStorage.getItem(K) || 'null'); } catch (_) { return null; } };
  const grava = (s) => { try { s ? localStorage.setItem(K, JSON.stringify(s)) : localStorage.removeItem(K); } catch (_) {} };
  const cab = { 'content-type': 'application/json', apikey: ROBO.anon };

  async function entrar(email, senha) {
    const r = await fetch(ROBO.auth + '/auth/v1/token?grant_type=password', { method: 'POST', headers: cab, body: JSON.stringify({ email, password: senha }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(/invalid/i.test(j.error_description || j.msg || '') ? 'E-mail ou senha não conferem.' : 'Não consegui entrar agora. Tente de novo.');
    grava({ token: j.access_token, renova: j.refresh_token, vence: Date.now() + (j.expires_in || 3600) * 1000, email: j.user && j.user.email });
    return j;
  }
  async function renovar() {
    const s = le(); if (!s || !s.renova) return null;
    const r = await fetch(ROBO.auth + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: cab, body: JSON.stringify({ refresh_token: s.renova }) });
    if (!r.ok) { grava(null); return null; }
    const j = await r.json();
    const n = { ...s, token: j.access_token, renova: j.refresh_token || s.renova, vence: Date.now() + (j.expires_in || 3600) * 1000 };
    grava(n); return n;
  }
  async function token() {
    let s = le(); if (!s) return '';
    if (Date.now() > s.vence - 60000) s = await renovar();
    return (s && s.token) || '';
  }
  /* chama a função; sem login, volta para a tela de entrar */
  async function api(rota, corpo, metodo) {
    const t = await token();
    const r = await fetch(ROBO.funcao + rota, {
      method: metodo || (corpo ? 'POST' : 'GET'),
      headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const j = await r.json().catch(() => ({ erro: 'resposta estranha do servidor' }));
    if (r.status === 401 && j.codigo === 'login') { grava(null); location.href = 'entrar.html'; throw new Error('login'); }
    return { status: r.status, ...j };
  }
  /* Entrar com Google (entrar-google.ts na função): um número sorteado fica neste navegador e precisa voltar igual,
     para ninguém conseguir pôr outra pessoa dentro da conta dele. O que mais precisar sobreviver à ida ao Google
     (o plano escolhido na vitrine) vai junto na sessionStorage. */
  async function google(extra) {
    const b = new Uint8Array(16); crypto.getRandomValues(b);
    const n = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    try { sessionStorage.setItem('robo-google', JSON.stringify({ ...(extra || {}), n })); } catch (_) { /* sem sessionStorage a volta avisa */ }
    const r = await fetch(ROBO.funcao + '/google-entrar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ n }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.url) throw new Error(j.erro || 'Não deu para abrir o Google agora. Tente de novo.');
    location.href = j.url;
  }
  /* a volta: entrar.html#google=<hash>&n=<n>, ou #google-erro=<motivo> */
  async function voltaDoGoogle() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (!h.has('google') && !h.has('google-erro')) return null;
    history.replaceState(null, '', location.pathname + location.search);
    let ida = null;
    try { ida = JSON.parse(sessionStorage.getItem('robo-google') || 'null'); sessionStorage.removeItem('robo-google'); } catch (_) { ida = null; }
    if (h.has('google-erro')) return { erro: 'Não deu para entrar com o Google: ' + h.get('google-erro') + '.' };
    if (!ida || !ida.n || ida.n !== h.get('n')) return { erro: 'Esse login com o Google não começou neste navegador. Toque em "Continuar com Google" de novo.' };
    let j = null;
    for (const type of ['magiclink', 'email']) {
      const r = await fetch(ROBO.auth + '/auth/v1/verify', { method: 'POST', headers: cab, body: JSON.stringify({ type, token_hash: h.get('google') }) });
      j = await r.json().catch(() => ({}));
      if (r.ok && j.access_token) break;
      j = null;
    }
    if (!j) return { erro: 'O login com o Google venceu. Toque em "Continuar com Google" de novo.' };
    grava({ token: j.access_token, renova: j.refresh_token, vence: Date.now() + (j.expires_in || 3600) * 1000, email: j.user && j.user.email });
    return { ok: true, ...ida };
  }
  window.Sessao = { entrar, google, voltaDoGoogle, sair: () => grava(null), tem: () => !!le(), api };
})();
