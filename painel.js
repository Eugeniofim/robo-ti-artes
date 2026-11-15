/* O painel do assinante (14/11/2026; refeito em 14/11 com o menu de vidro e o Cérebro no lugar do quiz).
   Tudo o que aparece vem da função `robo`, que só devolve a linha DESTE login.
   Nada aqui escolhe "qual cliente": não existe ?cliente= nem slug no navegador. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reais = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inteiro = (v) => Number(v || 0).toLocaleString('pt-BR');
  const dia = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const nomeMes = (m) => `${MESES[+m.slice(5) - 1]} de ${m.slice(0, 4)}`;
  const tamanho = (b) => (b >= 1048576 ? (b / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' MB' : Math.max(1, Math.round((b || 0) / 1024)) + ' KB');
  const hojeIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const primeiro = (s) => String(s || '').trim().split(/\s+/)[0] || '';
  /* a faixa da prévia some só nos prints da vitrine (testes/robo-local.ts, /falso/print) */
  if (ROBO.local && !(() => { try { return localStorage.getItem('robo-print'); } catch (_) { return null; } })()) $('faixa-local').hidden = false;
  if (!Sessao.tem()) { location.href = 'entrar.html'; return; }

  /* chamada à função que nunca explode: sem rede vira um erro de verdade na tela */
  const api = (rota, corpo) => Sessao.api(rota, corpo).catch((e) => { if (e && e.message === 'login') throw e; return { erro: 'Sem conexão. Tente de novo.', status: 0 }; });
  const naoExiste = (r) => r && r.status === 404 && /rota desconhecida/i.test(r.erro || '');

  /* ---------- ícones (traço, sem emoji) ---------- */
  const IC = {
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
    doc: '<path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5z"/><path d="M14 3.5V7.5h4M9 12.5h6M9 16h6"/>',
    foto: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.8-4.8L7 19.5"/>',
    globo: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z"/>',
    texto: '<path d="M5 6.5h14M5 11h14M5 15.5h9"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alerta: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2h.01"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8h.01"/>',
    lixo: '<path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 12.5h9l1-12.5"/>',
    baixar: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
    nuvem: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9a4.75 4.75 0 0 1-.5 9.5z"/>',
    pasta: '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    enviar: '<path d="M4.5 12 20 4.5 15 20l-3-6.5z"/><path d="m12 13.5 8-9"/>',
    camera: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
    balao: '<path d="M12 4c4.7 0 8.5 3.2 8.5 7.2s-3.8 7.2-8.5 7.2c-1 0-2-.2-2.9-.4L4.5 20l1.2-3.9C4.3 14.8 3.5 13.1 3.5 11.2 3.5 7.2 7.3 4 12 4z"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    pausa: '<path d="M9 5.5v13M15 5.5v13"/>',
    play: '<path d="M7 5v14l11-7z"/>',
    cerebro: '<path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3.2 3.2 0 0 0 7 18a2.7 2.7 0 0 0 5 1V6.5a2.5 2.5 0 0 0-3-2z"/><path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3.2 3.2 0 0 1 17 18a2.7 2.7 0 0 1-5 1"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    agenda: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
    casa: '<path d="m3.5 11 8.5-7 8.5 7"/><path d="M6 9.5V20h12V9.5"/>',
    sair: '<path d="M14.5 4.5h3a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3"/><path d="M10 8l-4 4 4 4M6 12h9.5"/>',
  };
  const ic = (n, cls) => `<span class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><svg viewBox="0 0 24 24">${IC[n] || ''}</svg></span>`;
  const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;
  const aviso = (tipo, texto, html) => `<p class="aviso ${tipo}">${ic(tipo === 'erro' || tipo === 'atencao' ? 'alerta' : 'info')}<span>${html ? texto : esc(texto)}</span></p>`;

  /* ---------- o que voltou na URL (Stripe, Instagram, Google Drive) vira um aviso; a URL fica limpa ---------- */
  const q = new URLSearchParams(location.search);
  let avisoVolta = null;
  if (q.get('ig') === 'ok') avisoVolta = { tipo: 'info', texto: 'Instagram conectado' + (q.get('u') ? ': @' + q.get('u') : '') + '.' };
  if (q.get('ig') === 'erro') avisoVolta = { tipo: 'erro', texto: 'Não deu para conectar o Instagram. ' + (q.get('motivo') || 'Tente de novo.') };
  if (q.get('ig') === 'cancelou') avisoVolta = { tipo: 'atencao', texto: 'Você cancelou a conexão do Instagram.' };
  /* conectou o Instagram agora: se ele ainda não leu esta conta, já começa a ler sozinho (a pessoa não precisa voltar e apertar) */
  let lerIgAoVoltar = q.get('ig') === 'ok';
  if (q.get('drive') === 'ok') avisoVolta = { tipo: 'info', texto: 'Google Drive conectado. Tudo o que você mandar vai sozinho para a pasta do agente no seu Drive.' };
  if (q.get('drive') === 'erro') avisoVolta = { tipo: 'erro', texto: 'Não deu para conectar o Google Drive. ' + (q.get('motivo') || 'Tente de novo.') };
  if (q.get('pago') === '1') avisoVolta = { tipo: 'info', texto: 'Pagamento recebido. Pode levar alguns segundos para o plano aparecer aqui.' };
  if (q.get('cancelou') === '1') avisoVolta = { tipo: 'atencao', texto: 'Você saiu do pagamento sem concluir. Nada foi cobrado.' };
  const planoPedido = q.get('plano');
  /* o cupom dos chegados: o entrar.html guarda o código; aqui ele vale na conta (uma vez) */
  const cupomGuardado = () => { try { return localStorage.getItem('robo-cupom') || ''; } catch (_) { return ''; } };
  const esqueceCupom = () => { try { localStorage.removeItem('robo-cupom'); } catch (_) { /* sem armazenamento: tudo bem */ } };
  const abaUrl = q.get('aba');
  if (location.search) history.replaceState(null, '', location.pathname + (abaUrl ? '#' + abaUrl : location.hash));

  let EU = null, MENU = null;
  const NOME = () => (EU && EU.nomes && EU.nomes.atendimento) || 'Sol';
  const ASSIST = () => (EU && EU.nomes && EU.nomes.assistente) || 'Dora';
  const ABAS = {
    inicio: 'Início', cerebro: 'Cérebro', testar: 'Testar', agenda: 'Agenda', notas: 'Notas', pedidos: 'Pedidos',
    arquivos: 'Arquivos', conectar: 'Conectar', plano: 'Plano e uso', estudio: 'Estúdio',
  };
  /* nomes antigos de aba (links de volta do Stripe e do Instagram, favoritos) */
  const APELIDO = { comecar: 'inicio', ensinar: 'cerebro', quiz: 'cerebro', uso: 'plano' };
  const contaNova = () => { const s = (EU && EU.sabe) || {}; return !s.sobre && !(s.servicos || []).length; };
  function abaAtual() {
    let h = location.hash.slice(1); h = APELIDO[h] || h;
    if (h === 'estudio' && !(EU && EU.estudio)) h = '';
    return ABAS[h] ? h : (contaNova() ? 'cerebro' : 'inicio');
  }

  /* ---------- o cérebro: do servidor; se a rota nova ainda não existir, calculado aqui a partir do que ele sabe ---------- */
  const DICAS = {
    quem: { nome: 'Quem você é e o que faz', frase: 'Vou te contar quem eu sou e o que o meu negócio faz: ' },
    vende: { nome: 'O que você vende, com preço', frase: 'Estes são os meus produtos e serviços, com preço: ' },
    funciona: { nome: 'Como funciona o atendimento', frase: 'Como funciona: o meu horário é ..., atendo/entrego em ..., o prazo é ... e aceito ... como pagamento.' },
    perguntas: { nome: 'As perguntas que mais fazem', frase: 'As perguntas que os clientes mais me fazem, com a minha resposta: ' },
    jeito: { nome: 'O seu jeito de falar', frase: `Quero que o Sol fale assim com os meus clientes: ` },
    limites: { nome: 'O que ele nunca faz', frase: 'O agente nunca pode ... e deve passar a conversa para mim quando ... ' },
  };
  function cerebroDe() {
    if (EU && EU.cerebro && Array.isArray(EU.cerebro.itens)) return EU.cerebro;
    const s = (EU && EU.sabe) || {}, serv = s.servicos || [], perg = s.perguntas || [];
    const itens = [
      { id: 'quem', ok: (s.sobre || '').length >= 60, meio: !!s.sobre, peso: 20, nota: s.sobre ? 'ele já sabe o que o negócio faz' : '' },
      { id: 'vende', ok: serv.length >= 1, meio: false, peso: 25, nota: serv.length ? `${serv.length} produto${serv.length > 1 ? 's' : ''} ou serviço${serv.length > 1 ? 's' : ''}` : '' },
      { id: 'funciona', ok: (s.funciona || '').length >= 40, meio: !!s.funciona, peso: 15, nota: s.funciona ? 'horário, entrega e pagamento' : '' },
      { id: 'perguntas', ok: perg.length >= 5, meio: perg.length > 0, peso: 20, nota: perg.length ? `${perg.length} pergunta${perg.length > 1 ? 's' : ''} com resposta` : '' },
      { id: 'jeito', ok: (s.jeito || '').length >= 40, meio: !!s.tom, peso: 10, nota: s.jeito ? 'ele já tem um jeito' : '' },
      { id: 'limites', ok: !!s.nunca && (s.passa || []).length > 0, meio: !!s.nunca || (s.passa || []).length > 0, peso: 10, nota: s.nunca ? 'ele sabe o que não pode' : '' },
    ];
    const nivel = Math.round(itens.reduce((t, i) => t + (i.ok ? i.peso : i.meio ? i.peso / 2 : 0), 0));
    return { nivel, pronto: !!s.sobre && serv.length > 0, itens: itens.map((i) => ({ id: i.id, nome: DICAS[i.id].nome, ok: i.ok, meio: !i.ok && i.meio, nota: i.nota, dica: '' })), local: true };
  }
  const fontes = () => (EU && Array.isArray(EU.fontes) ? EU.fontes : []);
  const drive = () => (EU && EU.drive) || { disponivel: false, ligado: false };

  /* ---------- o menu de vidro ---------- */
  function montaMenu() {
    const c = cerebroDe();
    MENU = criaMenuVidro($('menu'), {
      marca: EU.negocio || 'Seu negócio', subtitulo: 'Agentes Ti Artes', logo: 'logo.svg', chave: 'robo-painel-menu', ativo: abaAtual(), noite: true,
      usuario: { nome: EU.nome || primeiro((EU.email || '').split('@')[0]) || 'Você', email: EU.email || '' },
      menu: [
        { secao: 'O agente', itens: [
          { id: 'inicio', rotulo: 'Início', icone: 'casa', href: '#inicio' },
          { id: 'cerebro', rotulo: 'Cérebro', icone: 'cerebro', href: '#cerebro', ponto: !c.pronto },
          { id: 'testar', rotulo: 'Testar', icone: 'balao', href: '#testar' },
        ] },
        { secao: 'O seu dia', itens: [
          { id: 'agenda', rotulo: 'Agenda', icone: 'agenda', href: '#agenda' },
          { id: 'notas', rotulo: 'Notas', icone: 'nota', href: '#notas' },
          { id: 'pedidos', rotulo: 'Pedidos', icone: 'caixa', href: '#pedidos' },
          { id: 'arquivos', rotulo: 'Arquivos', icone: 'pasta', href: '#arquivos' },
        ] },
        { secao: 'Conta', itens: [
          { id: 'conectar', rotulo: 'Conectar', icone: 'elo', href: '#conectar' },
          { id: 'plano', rotulo: 'Plano e uso', icone: 'carteira', href: '#plano' },
          ...(EU.estudio ? [{ id: 'estudio', rotulo: 'Estúdio', icone: 'barras', href: '#estudio' }] : []),
          { id: 'sair', rotulo: 'Sair', icone: 'sair', href: '#' },
        ] },
      ],
      aoEscolher: (id) => {
        if (id === 'sair') { Sessao.sair(); location.href = 'entrar.html?entrar=1'; return; }
        fechaGaveta();
      },
      aoMudarNoite: (liga) => { document.documentElement.dataset.theme = liga ? 'dark' : 'light'; },
      aoUsuario: () => { location.hash = 'plano'; fechaGaveta(); },
    });
    /* barra de baixo do celular: 4 atalhos + o menu */
    $('baixo').innerHTML = [['inicio', 'Início', 'casa'], ['cerebro', 'Cérebro', 'cerebro'], ['testar', 'Testar', 'balao'], ['agenda', 'Agenda', 'agenda']]
      .map(([k, n, i]) => `<a href="#${k}" data-aba="${k}">${svg(i)}<span>${n}</span>${k === 'cerebro' && !c.pronto ? '<i class="ponto" aria-label="falta alimentar"></i>' : ''}</a>`).join('')
      + `<button type="button" id="abre-menu" aria-label="Abrir o menu" aria-expanded="false">${svg('menu')}<span>Menu</span></button>`;
    $('abre-menu').onclick = abreGaveta;
    $('veu').onclick = fechaGaveta;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('gaveta')) fechaGaveta(); });
  }
  const celular = () => matchMedia('(max-width: 860px)').matches;
  function abreGaveta() {
    document.body.classList.add('gaveta'); $('abre-menu').setAttribute('aria-expanded', 'true');
    if (MENU) MENU.recolher(false, false);
    setTimeout(() => { const a = $('menu').querySelector('.gs-item[aria-current]') || $('menu').querySelector('.gs-item'); if (a) a.focus(); }, 60);
  }
  function fechaGaveta() {
    if (!document.body.classList.contains('gaveta')) return;
    document.body.classList.remove('gaveta'); const b = $('abre-menu'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); }
  }
  /* voltou para a tela grande: o menu volta como a pessoa deixou */
  matchMedia('(max-width: 860px)').addEventListener('change', (e) => {
    if (!MENU) return;
    if (!e.matches) { document.body.classList.remove('gaveta'); let r = null; try { r = localStorage.getItem('robo-painel-menu:recolhido'); } catch (_) {} MENU.recolher(r === '1', false); }
    else MENU.recolher(false, false);
  });
  function seloCerebro() {
    const c = cerebroDe();
    const it = $('menu').querySelector('.gs-item[data-id="cerebro"]');
    if (it) { const p = it.querySelector('.gs-selo'); if (!c.pronto && !p) it.insertAdjacentHTML('beforeend', '<span class="gs-selo ponto" aria-label="falta alimentar"></span>'); if (c.pronto && p) p.remove(); }
    const b = $('baixo').querySelector('[data-aba="cerebro"]');
    if (b) { const p = b.querySelector('.ponto'); if (!c.pronto && !p) b.insertAdjacentHTML('beforeend', '<i class="ponto" aria-label="falta alimentar"></i>'); if (c.pronto && p) p.remove(); }
  }

  /* ---------- a barra de cima ---------- */
  function cabecalho() {
    const aba = abaAtual();
    $('neg').textContent = aba === 'inicio' ? (EU.negocio || 'Seu negócio') : ABAS[aba];
    $('barra-sec').textContent = aba === 'inicio' ? 'Painel' : (EU.negocio || 'Painel');
    document.title = `${ABAS[aba]} · Agentes Ti Artes`;
    const s = $('selo');
    if (EU.robo.ativo) { s.className = 'selo ok robo-estado'; s.textContent = `${NOME()} ligado`; }
    else if (EU.pausado) { s.className = 'selo atencao robo-estado'; s.textContent = 'Pausado'; }
    else { s.className = 'selo desligado robo-estado'; s.textContent = `${NOME()} desligado`; s.title = (EU.robo.falta || []).length ? 'Falta: ' + EU.robo.falta.join(', ') : ''; }
    relogio();
    if (MENU) MENU.ativar(aba);
    $('baixo').querySelectorAll('[data-aba]').forEach((a) => a.dataset.aba === aba ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  }
  /* o relógio do teste livre: quanto falta (ou que acabou) */
  function relogio() {
    const r = $('relogio'), t = (EU && EU.teste) || {};
    if (!t.ate || t.pagou) { r.hidden = true; return; }
    const falta = Date.parse(t.ate) - Date.now();
    r.hidden = false;
    if (falta <= 0) { r.className = 'selo atencao'; r.textContent = 'Teste acabou · ver planos'; return; }
    const h = Math.floor(falta / 3600000), m = Math.floor((falta % 3600000) / 60000);
    r.className = 'selo ok'; r.textContent = h >= 48 ? `Teste grátis · ${Math.floor(h / 24)} dias` : `Teste grátis · ${h ? h + 'h' : ''}${String(m).padStart(h ? 2 : 1, '0')}${h ? '' : ' min'}`;
  }
  setInterval(() => { if (EU) { const antes = EU.teste && EU.teste.ligado; relogio(); if (antes && Date.parse(EU.teste.ate) <= Date.now()) carrega(); } }, 30000);

  async function carrega() {
    const r = await api('/eu');
    if (r.codigo === 'comecar') return telaComecarConta(r.nome);
    if (r.erro) { $('conteudo').innerHTML = aviso('erro', r.erro); return; }
    EU = r;
    if (cupomGuardado() && EU.teste && !EU.teste.pagou && !EU.teste.cupom) {
      const c = await api('/cupom', { codigo: cupomGuardado() });
      esqueceCupom();
      if (c && !c.erro && c.teste) { EU = c; avisoVolta = { tipo: 'info', texto: `Cupom aplicado: o seu teste grátis vai até ${hora(c.teste.ate)}.` }; }
      else if (c && c.erro) avisoVolta = { tipo: 'atencao', texto: c.erro };
    }
    if (!MENU) montaMenu();
    if (lerIgAoVoltar) {
      lerIgAoVoltar = false;
      const t = EU.teste || {}, acabou = !t.pagou && t.ate && Date.parse(t.ate) <= Date.now();
      if (EU.instagram && EU.instagram.conectado && !acabou && !fontes().some((f) => f.tipo === 'instagram' && f.estado === 'lido' && f.nome === '@' + (EU.instagram.usuario || 'instagram'))) {
        history.replaceState(null, '', location.pathname + '#cerebro');
        avisoVolta = { tipo: 'info', texto: `Instagram conectado${EU.instagram.usuario ? ': @' + EU.instagram.usuario : ''}. O ${NOME()} já está lendo a sua bio, as legendas e o seu jeito no direct.` };
        mostra(); enfileiraOutro('instagram'); return;
      }
    }
    mostra();
  }
  /* o /eu de novo, sem redesenhar a tela (depois de ensinar ou ler um arquivo) */
  async function atualizaEu() {
    const r = await api('/eu');
    if (r && !r.erro && r.sabe !== undefined) { EU = r; cabecalho(); seloCerebro(); pintaCerebro(); }
  }
  window.addEventListener('hashchange', () => EU && mostra());

  function mostra() {
    cabecalho();
    const aba = abaAtual(), alvo = $('conteudo');
    const topo = avisoVolta ? aviso(avisoVolta.tipo, avisoVolta.texto) : '';
    avisoVolta = null;
    alvo.innerHTML = '';
    ({ inicio: telaInicio, cerebro: telaCerebro, agenda: telaAgenda, notas: telaNotas, testar: telaTestar, conectar: telaConectar,
      plano: telaPlano, pedidos: telaPedidos, arquivos: telaArquivos, estudio: telaEstudio }[aba] || telaInicio)(alvo, topo);
    window.scrollTo(0, 0);
  }

  /* ---------- quem entrou mas ainda não começou (conta de outro produto da Ti Artes, por exemplo) ---------- */
  function telaComecarConta(nome) {
    $('neg').textContent = 'Bem-vindo';
    $('conteudo').innerHTML = `<section class="aba"><div class="cabeca-aba"><div><p class="rotulo">Falta um passo</p><h1>Qual é o nome do seu negócio?</h1></div></div>
      <form class="cartao" id="f-comecar" style="max-width:560px"><label class="campo">Nome do negócio (ou o seu nome, se for só para você)
      <input id="c-negocio" placeholder="Ateliê Folha Miúda" autocomplete="organization"></label>
      <label class="aceite" style="display:flex;gap:10px;align-items:flex-start;font-weight:400"><input id="c-aceite" type="checkbox" checked style="width:22px;height:22px;min-height:0;margin:1px 0 0;accent-color:var(--teal);flex:none"> Pode me escrever por e-mail sobre o meu teste e o meu agente.</label>
      <div><button class="bt" type="submit">Começar ${svg('seta')}</button></div><p id="c-erro" class="aviso erro" hidden></p></form></section>`;
    $('f-comecar').onsubmit = async (e) => {
      e.preventDefault();
      const r = await api('/comecar', { negocio: $('c-negocio').value.trim(), nome, aceita_contato: $('c-aceite').checked, cupom: cupomGuardado() || undefined });
      if (r.erro) { $('c-erro').textContent = r.erro; $('c-erro').hidden = false; return; }
      if (cupomGuardado()) {
        esqueceCupom();
        avisoVolta = r.aviso_cupom ? { tipo: 'atencao', texto: r.aviso_cupom } : (r.teste && r.teste.cupom ? { tipo: 'info', texto: `Cupom aplicado: o seu teste grátis vai até ${hora(r.teste.ate)}.` } : null);
      }
      EU = r; location.hash = 'cerebro'; if (!MENU) montaMenu(); mostra();
    };
  }

  /* ---------- o teste livre, em uma frase ---------- */
  const hora = (iso) => new Date(iso).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  function quadroTeste() {
    const t = EU.teste || {};
    if (t.pagou || !t.ate) return '';
    if (t.ligado) return aviso('info', `<b>Teste grátis até ${esc(hora(t.ate))}.</b> Nesse tempo você alimenta, ensina e testa à vontade, e com o Instagram conectado o ${esc(NOME())} responde de verdade (até ${t.limite} mensagens; já foram ${t.respostas}). Gostou? <a href="#plano">Escolha um plano</a> e ele não para.`, true);
    return aviso('atencao', `<b>O teste grátis acabou.</b>${t.respostas ? ` O ${esc(NOME())} respondeu ${t.respostas} mensage${t.respostas === 1 ? 'm' : 'ns'}.` : ''} Para ele voltar a atender e você continuar ensinando, <a href="#plano">escolha um plano</a>.${t.apaga_em ? ` Tudo o que você fez fica guardado até ${esc(dia(t.apaga_em))}.` : ''}`, true);
  }
  /* o teste acabou ou chegou no limite: o convite para assinar, no lugar do erro seco */
  const bloqueio = (r) => r && r.status === 402;

  /* ---------- o anel ---------- */
  function anel(n, tam) {
    return `<span class="anel" style="--tam:${tam || 168}px" role="img" aria-label="Cérebro do ${esc(NOME())}: ${n}%">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trilha" cx="60" cy="60" r="52"/><circle class="valor" cx="60" cy="60" r="52" pathLength="100" data-p="${n}"/></svg>
      <span class="anel-txt"><b>${n}%</b><span>cérebro</span></span></span>`;
  }
  /* o anel nasce vazio e enche (o CSS anima); sem movimento, já nasce cheio */
  const enche = (raiz) => requestAnimationFrame(() => requestAnimationFrame(() => (raiz || document).querySelectorAll('.anel .valor').forEach((c) => { c.style.strokeDashoffset = String(100 - (+c.dataset.p || 0)); })));

  /* ---------- Início ---------- */
  function proximoPasso() {
    const c = cerebroDe(), ig = EU.instagram && EU.instagram.conectado;
    let testou = false; try { testou = localStorage.getItem('robo-testou') === '1'; } catch (_) {}
    const pagando = !!(EU.plano && EU.em_dia && !(EU.teste && EU.teste.ligado));
    if (!c.pronto) return { bt: 'Alimentar o cérebro', aba: 'cerebro', frase: `Mande um PDF, uma foto do cardápio ou o seu site: o ${NOME()} lê e aprende sozinho.` };
    if (!testou && !ig) return { bt: `Testar o ${NOME()}`, aba: 'testar', alt: { bt: 'Conectar o Instagram', aba: 'conectar' }, frase: 'Ele já sabe o básico. Veja como ele responde antes de ligar no Instagram.' };
    if (!ig) return { bt: 'Conectar o Instagram', aba: 'conectar', alt: { bt: 'Testar de novo', aba: 'testar' }, frase: 'Conecte o Instagram e ele passa a responder o seu direct.' };
    if (!pagando) return { bt: 'Escolher um plano', aba: 'plano', frase: EU.teste && EU.teste.ligado ? 'O teste está rodando. Escolha um plano para ele não parar quando acabar.' : 'Escolha um plano para ele continuar atendendo.' };
    if (c.nivel < 100) return { bt: `Deixar o ${NOME()} mais esperto`, aba: 'cerebro', frase: 'Quanto mais ele sabe, menos ele passa para você.' };
    return { bt: 'Ver os pedidos', aba: 'pedidos', frase: 'Ele está afiado. Confira o que ele anotou.' };
  }
  function telaInicio(alvo, topo) {
    const c = cerebroDe(), p = proximoPasso(), h = new Date().getHours();
    const oi = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const tit = EU.robo.ativo ? `O ${NOME()} está atendendo` : EU.pausado ? `O ${NOME()} está pausado` : `Vamos ligar o ${NOME()}`;
    let testou = false; try { testou = localStorage.getItem('robo-testou') === '1'; } catch (_) {}
    const passos = [
      { feito: c.pronto, nome: 'Alimentar o cérebro', aba: 'cerebro' },
      { feito: testou, nome: 'Testar como cliente', aba: 'testar' },
      { feito: !!(EU.instagram && EU.instagram.conectado), nome: 'Conectar o Instagram', aba: 'conectar' },
      { feito: !!(EU.plano && EU.em_dia && !(EU.teste && EU.teste.ligado)), nome: 'Escolher um plano', aba: 'plano' },
    ];
    const agora = passos.findIndex((x) => !x.feito);
    const faltam = c.itens.filter((i) => !i.ok).slice(0, 3);
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cartao heroi">
        <div class="heroi-txt"><p class="rotulo">${oi}${EU.nome ? ', ' + esc(primeiro(EU.nome)) : ''}</p>
          <h1>${esc(tit)}</h1>
          <p class="lede">${esc(p.frase)}${!EU.robo.ativo && (EU.robo.falta || []).length ? ` <span class="dica">Falta: ${esc(EU.robo.falta.join(', '))}.</span>` : ''}</p>
          <div class="heroi-acoes"><a class="bt" href="#${p.aba}">${esc(p.bt)} ${svg('seta')}</a>${p.alt ? `<a class="bt fraco" href="#${p.alt.aba}">${esc(p.alt.bt)}</a>` : ''}</div></div>
        <a class="heroi-anel" href="#cerebro" aria-label="Abrir o cérebro do ${esc(NOME())}">${anel(c.nivel)}</a>
      </div>
      ${quadroTeste()}
      <ol class="passos" aria-label="O caminho até o agente atender">${passos.map((x, i) => `<li class="${x.feito ? 'feito' : ''} ${i === agora ? 'agora' : ''}"><a href="#${x.aba}">
        <span class="bola">${x.feito ? svg('check').replace('<svg', '<svg style="width:15px;height:15px;stroke-width:2.6;fill:none;stroke:currentColor"') : i + 1}</span><span>${esc(x.nome)}</span></a></li>`).join('')}</ol>
      <div class="bento">
        <article class="cartao tile"><h2>${ic('agenda')} Hoje</h2><div id="t-hoje"><p class="dica">Carregando…</p></div><a class="lnk" href="#agenda">Abrir a agenda</a></article>
        <article class="cartao tile"><h2>${ic('balao')} Últimos pedidos</h2><div id="t-ped"><p class="dica">Carregando…</p></div><a class="lnk" href="#pedidos">Ver todos</a></article>
        <article class="cartao tile"><h2>${ic('cerebro')} O que falta ele saber</h2>
          ${faltam.length ? `<ul class="mini-lista">${faltam.map((i) => `<li><span class="quando">${(i.meio || (+i.parcial || 0) > 0) ? 'meio' : 'falta'}</span><span><b>${esc(i.nome || (DICAS[i.id] || {}).nome || '')}</b></span></li>`).join('')}</ul>` : `<p>Ele sabe tudo o que precisa. Continue mandando novidades.</p>`}
          <a class="lnk" href="#cerebro">Alimentar</a></article>
        ${(EU.em_dia && (EU.robo.ativo || EU.pausado)) ? `<article class="cartao tile largo"><h2>${ic(EU.pausado ? 'play' : 'pausa')} ${EU.pausado ? 'Ele está pausado' : 'Ligar e desligar'}</h2>
          <p class="dica">${EU.pausado ? 'Pausado, ele não responde ninguém. Religue quando quiser.' : 'Pausado, ele para de responder em todas as conversas, na hora.'}</p>
          <div><button class="bt ${EU.pausado ? '' : 'fraco'}" id="pausar" type="button">${EU.pausado ? 'Religar o agente' : 'Pausar o agente'}</button></div></article>` : ''}
        <article class="cartao tile ${(EU.em_dia && (EU.robo.ativo || EU.pausado)) ? 'largo' : ''}"><h2>${ic('relogio')} A ${esc(ASSIST())}, a sua secretária</h2>
          <p>Quando quem escreve no direct é você, do seu perfil pessoal, a ${esc(ASSIST())} marca na agenda, anota e confirma os horários no seu lugar.
          ${!(EU.assistente || {}).disponivel ? '<span class="selo breve">chega em breve</span>' : EU.assistente.ligado ? '<span class="selo ok">ligado</span>' : ''}</p>
          ${(EU.assistente || {}).disponivel && !EU.assistente.ligado ? '<a class="lnk" href="#conectar">Ligar em 1 minuto</a>' : ''}</article>
      </div></section>`;
    enche(alvo);
    const bp = $('pausar');
    if (bp) bp.onclick = async () => { bp.disabled = true; const r = await api('/pausar', { pausado: !EU.pausado }); if (!r.erro) EU = r; mostra(); };
    /* os quadros de hoje e dos pedidos chegam depois, sem segurar a tela */
    api('/agenda').then((r) => {
      const el = $('t-hoje'); if (!el) return;
      const hoje = (r.agenda || []).filter((e) => e.dia === hojeIso());
      const ped = r.pedidos || [];
      el.innerHTML = (hoje.length ? `<ul class="mini-lista">${hoje.slice(0, 4).map((e) => `<li><span class="quando">${esc(e.hora || 'dia todo')}</span><span><b>${esc(e.titulo)}</b>${e.com ? `<span class="dica">com ${esc(e.com)}</span>` : ''}</span></li>`).join('')}</ul>`
        : '<p class="vazio">Nada marcado para hoje.</p>') + (ped.length ? `<p class="aviso atencao" style="margin-top:6px">${ic('relogio')}<span>${ped.length} pedido${ped.length > 1 ? 's' : ''} de horário para confirmar.</span></p>` : '');
    });
    api('/recados').then((r) => {
      const el = $('t-ped'); if (!el) return;
      const l = (r.recados || []).slice(0, 3);
      el.innerHTML = l.length ? `<ul class="mini-lista">${l.map((x) => `<li><span class="quando">${esc(dia(x.quando).slice(0, 5))}</span><span><b>${esc(x.nome || 'Alguém')}</b><span class="dica">${esc(x.assunto || x.resumo || '')}</span></span></li>`).join('')}</ul>`
        : `<p class="vazio">Quando o ${esc(NOME())} anotar um pedido, ele aparece aqui.</p>`;
    });
  }

  /* ---------- conversa (serve para treinar e para testar) ---------- */
  function montaChat(alvo, o) {
    alvo.innerHTML = `<div class="chat"><div class="chat-topo"><span class="avatar-robo" aria-hidden="true">${esc(NOME()[0])}</span><div><b>${esc(o.titulo)}</b><span>${esc(o.sub)}</span></div></div>
      <div class="msgs" id="${o.id}-msgs" role="log" aria-live="polite"></div>
      <form class="escrever" id="${o.id}-f"><div class="sugestoes" id="${o.id}-sug"></div>
      <div class="linha"><textarea id="${o.id}-txt" rows="1" placeholder="${esc(o.placeholder)}" aria-label="${esc(o.placeholder)}"></textarea>
      <button class="bt" type="submit" id="${o.id}-env" aria-label="Enviar">${svg('enviar')}</button></div></form></div>`;
    const msgs = $(o.id + '-msgs'), txt = $(o.id + '-txt'), env = $(o.id + '-env');
    const poe = (quem, texto, extra) => {
      const d = document.createElement('div');
      d.className = 'm ' + quem; d.textContent = texto;
      if (extra && extra.feito && extra.feito.length) { const f = document.createElement('span'); f.className = 'feito'; f.textContent = 'Gravado: ' + extra.feito.join(', '); d.appendChild(f); }
      if (extra && extra.convite) { const a = document.createElement('a'); a.className = 'bt pequeno convite'; a.href = '#plano'; a.textContent = 'Ver os planos'; d.appendChild(document.createElement('br')); d.appendChild(a); }
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
    };
    const pensando = () => {
      const d = document.createElement('div'); d.className = 'm ele pensando';
      d.innerHTML = `<span class="pontos" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(o.pensando)}</span>`;
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
    };
    const cresce = () => { txt.style.height = 'auto'; txt.style.height = Math.min(180, txt.scrollHeight + 2) + 'px'; };
    txt.addEventListener('input', cresce);
    const manda = async (texto) => {
      texto = String(texto || '').trim(); if (!texto) return;
      txt.value = ''; cresce(); env.disabled = true;
      poe('eu', texto);
      const p = pensando();
      const r = await o.envia(texto);
      p.remove(); env.disabled = false; txt.focus();
      if (r.erro) return poe('ele', r.erro, { convite: bloqueio(r) });
      poe('ele', r.resposta, { feito: r.feito });
      if (o.depois) o.depois(r);
    };
    $(o.id + '-f').onsubmit = (e) => { e.preventDefault(); manda(txt.value); };
    txt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); manda(txt.value); } });
    const sug = $(o.id + '-sug');
    sug.innerHTML = (o.sugestoes || []).map((s, i) => `<button type="button" data-i="${i}">${esc(s.rotulo)}</button>`).join('');
    sug.querySelectorAll('button').forEach((b) => b.onclick = () => {
      const s = o.sugestoes[+b.dataset.i];
      if (s.manda) manda(s.texto); else { txt.value = s.texto; cresce(); txt.focus(); txt.setSelectionRange(txt.value.length, txt.value.length); }
    });
    return { poe, manda, escreve: (t) => { txt.value = t; cresce(); txt.focus(); txt.setSelectionRange(t.length, t.length); } };
  }

  function quadroSabe(s) {
    s = s || {};
    const lista = (s.servicos || []).map((x) => `<div><span>${esc(x.nome)}</span><span>${x.preco ? reais(x.preco) + (x.por ? ' / ' + esc(x.por) : '') : 'sob consulta'}</span></div>`).join('');
    const tons = { simp: 'simpático e acolhedor', formal: 'formal e educado', leve: 'leve, com um emoji de vez em quando', direto: 'direto, frases curtas' };
    const passa = { hReclama: 'reclamação', hDesconto: 'pedido de desconto', hGrupo: 'pedido grande', hEspecial: 'pedido especial' };
    const pedir = { nome: 'nome', instagram: '@ do Instagram', email: 'e-mail' };
    const bloco = (t, v) => `<div><h3>${t}</h3>${v || '<p class="vazio">ainda não</p>'}</div>`;
    return `<div class="sabe">
      ${bloco('O negócio', s.sobre ? `<p>${esc(s.sobre)}</p>${s.cidade ? `<p class="dica">${esc(s.cidade)}</p>` : ''}` : '')}
      ${bloco('Serviços e preços', lista ? `<div class="servicos num">${lista}</div>` : '')}
      ${bloco('Como funciona', s.funciona ? `<p>${esc(s.funciona)}</p>` : '')}
      ${bloco('Jeito de falar', `<p>${esc(tons[s.tom] || tons.simp)}</p>${s.jeito ? `<p class="dica">${esc(s.jeito)}</p>` : ''}`)}
      ${bloco('Nunca diz', s.nunca ? `<p>${esc(s.nunca)}</p>` : '')}
      ${bloco('Passa para você', (s.passa || []).length ? `<p>${s.passa.map((k) => esc(passa[k] || k)).join(', ')}</p>` : '')}
      ${bloco('Pede ao cliente', (s.pedir || []).length ? `<p>${s.pedir.map((k) => esc(pedir[k] || k)).join(', ')}</p>` : '')}
      ${bloco('Perguntas frequentes', (s.perguntas || []).length ? `<p>${s.perguntas.length} pergunta${s.perguntas.length > 1 ? 's' : ''} com resposta</p>` : '')}
    </div>`;
  }

  /* =====================================================================
     O CÉREBRO: a pessoa alimenta o agente com o que já tem (arquivo, site, texto) e conversa com o treinador.
     ===================================================================== */
  const ACEITA = { 'application/pdf': 'pdf', 'image/jpeg': 'foto', 'image/png': 'foto', 'image/webp': 'foto', 'text/plain': 'texto', 'text/csv': 'texto' };
  const POR_EXT = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', txt: 'text/plain', csv: 'text/csv' };
  const MAX_MB = 20;
  const mimeDe = (f) => (ACEITA[f.type] ? f.type : POR_EXT[(String(f.name).split('.').pop() || '').toLowerCase()] || f.type || '');
  const tipoIc = (tipo, mime) => {
    if (tipo === 'site') return `<span class="tipo-ic site">${svg('globo')}</span>`;
    if (tipo === 'instagram') return `<span class="tipo-ic insta">${svg('camera')}</span>`;
    if (tipo === 'texto' || /^text\//.test(mime || '')) return `<span class="tipo-ic texto">${svg('texto')}</span>`;
    if (/^image\//.test(mime || '')) return `<span class="tipo-ic foto">${svg('foto')}</span>`;
    if (mime === 'application/pdf' || !mime) return `<span class="tipo-ic pdf">PDF</span>`;
    return `<span class="tipo-ic outro">${svg('doc')}</span>`;
  };

  /* a fila de leitura: um por vez, e continua mesmo se a pessoa trocar de aba */
  const FILA = [];
  let rodando = false;
  function enfileira(lista) {
    for (const f of lista) {
      const it = { id: 'q' + Math.random().toString(36).slice(2, 9), tipo: 'arquivo', file: f, nome: f.name, tamanho: f.size, mime: mimeDe(f), estado: 'na fila', pct: 0 };
      if (!ACEITA[it.mime]) { it.estado = 'erro'; it.erro = 'Esse tipo eu ainda não leio. Mande PDF, foto (JPG, PNG, WebP) ou texto (TXT, CSV). Documento do Word: salve como PDF.'; }
      else if (f.size > MAX_MB * 1048576) { it.estado = 'erro'; it.erro = `Passa de ${MAX_MB} MB. Mande um arquivo menor ou divida o PDF.`; }
      FILA.push(it);
    }
    pintaFila(); roda();
  }
  function enfileiraOutro(tipo, valor) {
    if (tipo === 'instagram' && FILA.some((x) => x.tipo === 'instagram' && x.estado !== 'erro')) return;
    const nome = tipo === 'site' ? valor : tipo === 'instagram' ? (EU.instagram && EU.instagram.usuario ? '@' + EU.instagram.usuario : 'O seu Instagram') : 'Texto colado';
    FILA.push({ id: 'q' + Math.random().toString(36).slice(2, 9), tipo, valor, nome, mime: tipo === 'texto' ? 'text/plain' : '', estado: 'na fila', pct: 0 });
    pintaFila(); roda();
  }
  async function roda() {
    if (rodando) return; rodando = true;
    try { for (let it = FILA.find((x) => x.estado === 'na fila'); it; it = FILA.find((x) => x.estado === 'na fila')) await sobe(it); }
    finally { rodando = false; }
  }
  function falha(it, r) {
    it.estado = 'erro'; it.convite = bloqueio(r);
    it.erro = naoExiste(r) ? 'A leitura de arquivos está sendo ligada agora. Tente de novo daqui a pouco.' : (r && r.erro) || 'Não deu certo. Tente de novo.';
    pintaFila();
  }
  async function sobe(it) {
    if (it.tipo !== 'arquivo') {
      it.estado = 'lendo'; pintaFila();
      const r = await api('/fonte', it.tipo === 'site' ? { tipo: 'site', url: it.valor } : it.tipo === 'instagram' ? { tipo: 'instagram' } : { tipo: 'texto', texto: it.valor, nome: 'Texto colado' });
      if (r.erro) return falha(it, r);
      return pronto(it, r);
    }
    it.estado = 'enviando'; pintaFila();
    const r1 = await api('/fonte', { tipo: 'arquivo', nome: it.nome, mime: it.mime, tamanho: it.tamanho });
    if (r1.erro) return falha(it, r1);
    if (!r1.envio || !r1.envio.url || !r1.fonte) return falha(it, { erro: 'Resposta estranha do servidor. Tente de novo.' });
    try { await envia(r1.envio, it.file, (p) => { it.pct = p; pintaItem(it); }); }
    catch (_) { return falha(it, { erro: 'O envio não foi até o fim. Confira a internet e tente de novo.' }); }
    it.estado = 'lendo'; it.pct = 100; it.fonteId = r1.fonte.id; pintaFila();
    const r2 = await api('/fonte-ler', { id: r1.fonte.id });
    if (r2.erro) { absorve({ fonte: { ...r1.fonte, estado: 'erro', erro: r2.erro } }); return falha(it, r2); }
    pronto(it, r2);
  }
  function pronto(it, r) {
    const i = FILA.indexOf(it); if (i >= 0) FILA.splice(i, 1);
    if (r.fonte) r.fonte._novo = true;
    absorve(r);
    pintaFila();
    brinde(it.nome, r.aprendeu || (r.fonte && r.fonte.aprendeu) || '');
  }
  /* o aviso que aparece embaixo da tela: o que ele aprendeu com aquilo */
  let brindeTempo = 0;
  function brinde(nome, texto) {
    if (!texto) return;
    let b = document.getElementById('brinde');
    if (!b) { b = document.createElement('div'); b.id = 'brinde'; b.className = 'brinde'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = `${svg('check')}<span><b>${esc(nome)}</b><br>${esc(texto)}</span>`;
    void b.offsetWidth;          /* força o desenho antes de mostrar: a transição roda mesmo com a aba em segundo plano */
    b.classList.add('mostra');
    clearTimeout(brindeTempo);
    brindeTempo = setTimeout(() => b.classList.remove('mostra'), 7000);
  }
  /* o que a função devolveu passa a valer na tela: o que ele sabe, o nível e a lista de fontes */
  function absorve(r) {
    if (!EU) return;
    if (r.sabe) EU.sabe = r.sabe;
    if (r.cerebro) EU.cerebro = r.cerebro;
    if (Array.isArray(r.fontes)) EU.fontes = r.fontes;
    if (r.fonte) {
      /* o mesmo site, ou o Instagram, lido de novo substitui a leitura anterior (o servidor faz igual) */
      const repete = (f) => f.tipo === r.fonte.tipo && (r.fonte.tipo === 'instagram' || (r.fonte.tipo === 'site' && f.url && f.url === r.fonte.url));
      const l = fontes().filter((f) => f.id !== r.fonte.id && !repete(f));
      EU.fontes = [{ ...r.fonte, aprendeu: r.fonte.aprendeu || r.aprendeu || ((r.feito || []).length ? r.feito.join(', ') : '') }, ...l];
    }
    seloCerebro(); pintaCerebro();
    /* o nível e o "pronto" oficiais vêm do /eu */
    if (!r.cerebro) atualizaEu();
  }
  function envia(envio, file, aoAndar) {
    return new Promise((ok, nao) => {
      const x = new XMLHttpRequest();
      x.open(envio.metodo || 'PUT', envio.url);
      const cab = { ...(envio.cabecalhos || {}) }, tem = (k) => Object.keys(cab).some((c) => c.toLowerCase() === k);
      if (!tem('content-type')) cab['content-type'] = file.type || mimeDe(file) || 'application/octet-stream';
      if (ROBO.anon && String(envio.url).startsWith(ROBO.auth) && !tem('apikey')) cab.apikey = ROBO.anon;
      for (const [k, v] of Object.entries(cab)) x.setRequestHeader(k, v);
      x.upload.onprogress = (e) => { if (e.lengthComputable) aoAndar(Math.round((e.loaded / e.total) * 100)); };
      x.onload = () => (x.status >= 200 && x.status < 300 ? ok() : nao(new Error('status ' + x.status)));
      x.onerror = () => nao(new Error('rede'));
      x.send(file);
    });
  }
  const textoEstado = (it) => ({ 'na fila': 'na fila', enviando: `enviando ${it.pct || 0}%`, lendo: it.tipo === 'site' ? 'lendo o site…' : it.tipo === 'instagram' ? 'lendo a bio, as legendas e o seu jeito no direct…' : 'lendo e aprendendo…' }[it.estado] || '');
  function itemFila(it) {
    return `<li class="item-f ${it.estado === 'erro' ? 'erro' : ''}" data-fila="${it.id}">${tipoIc(it.tipo, it.mime)}
      <div class="meio"><b>${esc(it.nome)}</b>
        ${it.estado === 'erro' ? `<span class="dica" style="color:var(--erro)">${esc(it.erro)}</span>${it.convite ? '<a class="lnk" href="#plano" style="justify-self:start">Ver os planos</a>' : ''}`
        : `<div class="prog ${it.estado === 'lendo' ? 'lendo' : ''}" role="progressbar" aria-label="${esc(textoEstado(it))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${it.pct || 0}"><i style="width:${it.pct || 0}%"></i></div><span class="dica" data-estado>${esc(textoEstado(it))}${it.tamanho ? ' · ' + tamanho(it.tamanho) : ''}</span>`}</div>
      <div class="acoes">${it.estado === 'erro' ? `<button type="button" class="bt-ic" data-tira-fila="${it.id}" aria-label="Tirar da fila">${svg('x')}</button>` : ''}</div></li>`;
  }
  function pintaFila() {
    document.querySelectorAll('[data-fila-lista]').forEach((ul) => {
      ul.innerHTML = FILA.map(itemFila).join('');
      ul.querySelectorAll('[data-tira-fila]').forEach((b) => b.onclick = () => { const i = FILA.findIndex((x) => x.id === b.dataset.tiraFila); if (i >= 0) FILA.splice(i, 1); pintaFila(); });
    });
    pintaInsta();
  }
  function pintaItem(it) {
    document.querySelectorAll(`[data-fila="${it.id}"]`).forEach((li) => {
      const i = li.querySelector('.prog i'), e = li.querySelector('[data-estado]'), p = li.querySelector('.prog');
      if (i) i.style.width = (it.pct || 0) + '%';
      if (p) p.setAttribute('aria-valuenow', it.pct || 0);
      if (e) e.textContent = textoEstado(it) + (it.tamanho ? ' · ' + tamanho(it.tamanho) : '');
    });
  }

  /* a zona de soltar arquivos (serve no Cérebro e em Arquivos) */
  function zonaSoltar(compacta) {
    return `<div class="solta ${compacta ? 'compacta' : ''}" data-solta tabindex="0" role="button" aria-label="Mandar arquivos para o ${esc(NOME())} ler">
      <span class="ic-grande" aria-hidden="true">${svg('upload')}</span>
      <h2>${compacta ? 'Mandar arquivos' : 'Arraste aqui o que você já tem'}</h2>
      ${compacta ? '' : `<p>Cardápio ou tabela de preços em PDF, fotos do portfólio, prints de conversas com clientes. O ${esc(NOME())} lê e aprende sozinho.</p>`}
      <span class="bt" aria-hidden="true">${svg('mais')} Escolher arquivos</span>
      <div class="tipos" aria-hidden="true"><span>PDF</span><span>JPG</span><span>PNG</span><span>WEBP</span><span>TXT</span><span>CSV</span><span>até ${MAX_MB} MB</span></div>
      <input type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,application/pdf,image/jpeg,image/png,image/webp,text/plain,text/csv">
    </div><ul class="fila" data-fila-lista aria-label="Arquivos sendo lidos"></ul>`;
  }
  function ligaSoltar(raiz) {
    raiz.querySelectorAll('[data-solta]').forEach((z) => {
      const inp = z.querySelector('input[type=file]');
      z.addEventListener('click', (e) => { if (e.target !== inp) inp.click(); });
      z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
      inp.addEventListener('change', () => { if (inp.files.length) enfileira([...inp.files]); inp.value = ''; });
      let n = 0;
      z.addEventListener('dragenter', (e) => { e.preventDefault(); n++; z.classList.add('em-cima'); });
      z.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
      z.addEventListener('dragleave', () => { n = Math.max(0, n - 1); if (!n) z.classList.remove('em-cima'); });
      z.addEventListener('drop', (e) => { e.preventDefault(); n = 0; z.classList.remove('em-cima'); if (e.dataTransfer.files.length) enfileira([...e.dataTransfer.files]); });
    });
    pintaFila();
  }
  /* soltar um arquivo fora da zona não abre o arquivo no navegador (perderia o painel) */
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { if (!e.target.closest || !e.target.closest('[data-solta]')) e.preventDefault(); });

  /* uma fonte já lida */
  function itemFonte(f) {
    const meta = [f.tipo === 'site' ? 'site' : f.tipo === 'texto' ? 'texto colado' : f.tipo === 'instagram' ? 'Instagram' : (f.tamanho ? tamanho(f.tamanho) : ''), f.criado ? dia(f.criado) : '', f.drive ? 'no Drive' : ''].filter(Boolean).join(' · ');
    const est = f.estado === 'lido' ? '<span class="selo ok">lido</span>' : f.estado === 'erro' ? '<span class="selo atencao">não deu</span>' : '<span class="selo desligado">esperando</span>';
    return `<li class="item-f ${f._novo ? 'novo' : ''}" data-fonte="${esc(f.id)}">${tipoIc(f.tipo, f.mime)}
      <div class="meio"><b title="${esc(f.nome)}">${esc(f.nome || 'sem nome')}</b><span class="dica">${est} ${esc(meta)}</span>
        ${f.aprendeu ? `<span class="aprendeu">Aprendi: ${esc(String(f.aprendeu).replace(/^\s*aprendi:?\s*/i, ''))}</span>` : f.erro ? `<span class="dica" style="color:var(--erro)">${esc(f.erro)}</span>` : ''}</div>
      <div class="acoes">
        ${f.estado !== 'lido' && f.tipo === 'arquivo' ? `<button type="button" class="bt-ic" data-reler="${esc(f.id)}" aria-label="Ler de novo">${svg('cerebro')}</button>` : ''}
        ${f.tipo === 'arquivo' ? `<button type="button" class="bt-ic" data-baixar="${esc(f.id)}" aria-label="Baixar ${esc(f.nome)}">${svg('baixar')}</button>` : ''}
        <button type="button" class="bt-ic" data-tirar="${esc(f.id)}" aria-label="Tirar ${esc(f.nome)}">${svg('lixo')}</button></div></li>`;
  }
  function ligaFontes(raiz, aoMudar) {
    raiz.querySelectorAll('[data-baixar]').forEach((b) => b.onclick = async () => {
      const w = window.open('', '_blank');   /* aberta já no clique: depois da espera o navegador bloquearia */
      const r = await api('/arquivo?id=' + encodeURIComponent(b.dataset.baixar));
      if (r.url && w) w.location.href = r.url; else { if (w) w.close(); if (r.url) location.href = r.url; else raiz.insertAdjacentHTML('afterbegin', aviso('erro', r.erro || 'Não consegui abrir o arquivo.')); }
    });
    raiz.querySelectorAll('[data-reler]').forEach((b) => b.onclick = async () => {
      b.disabled = true; const li = b.closest('.item-f'); li.querySelector('.meio').insertAdjacentHTML('beforeend', '<div class="prog lendo"><i></i></div>');
      const r = await api('/fonte-ler', { id: b.dataset.reler });
      if (r.erro) { li.querySelector('.prog').remove(); b.disabled = false; li.querySelector('.meio').insertAdjacentHTML('beforeend', `<span class="dica" style="color:var(--erro)">${esc(r.erro)}</span>`); return; }
      if (r.fonte) r.fonte._novo = true; absorve(r); if (aoMudar) aoMudar();
    });
    raiz.querySelectorAll('[data-tirar]').forEach((b) => b.onclick = async () => {
      if (b.dataset.certeza !== '1') { b.dataset.certeza = '1'; b.classList.add('certeza'); b.textContent = 'tirar?'; return; }
      b.disabled = true;
      const r = await api('/fonte-apagar', { id: b.dataset.tirar });
      if (r.erro) { b.disabled = false; return raiz.insertAdjacentHTML('afterbegin', aviso('erro', r.erro)); }
      if (Array.isArray(r.fontes)) EU.fontes = r.fontes; else EU.fontes = fontes().filter((f) => f.id !== b.dataset.tirar);
      if (aoMudar) aoMudar();
    });
  }

  /* as partes do Cérebro que mudam sozinhas (depois de ler um arquivo ou de ensinar no chat) */
  let CHAT_TREINO = null;
  /* o cartão "Ler o meu Instagram": conectar, ler, lendo agora ou já lido (com a data e o que aprendeu) */
  function pintaInsta() {
    const box = $('cb-insta'); if (!box || !EU) return;
    const ig = EU.instagram || {}, topo = (t) => `<div class="canal-topo"><span class="canal-ic ig" aria-hidden="true">${svg('camera')}</span><div style="display:grid;gap:4px">${t}</div></div>`;
    if (!ig.conectado) {
      box.innerHTML = topo(`<h2>O seu Instagram</h2><p class="dica">Conecte o Instagram e o ${esc(NOME())} lê sozinho a sua bio, as legendas e o seu jeito no direct.</p>`)
        + `<div><a class="bt fraco" href="#conectar">Conectar o Instagram ${svg('seta')}</a></div>`;
      return;
    }
    const lendo = FILA.some((x) => x.tipo === 'instagram' && x.estado !== 'erro');
    const lido = fontes().find((f) => f.tipo === 'instagram' && f.estado === 'lido');
    const quem = ig.usuario ? ' de <b>@' + esc(ig.usuario) + '</b>' : '';
    const texto = lendo ? `<p class="dica">Lendo a bio${quem}, as legendas dos posts e as mensagens que <b>você</b> mandou no direct…</p>`
      : lido ? `<p class="dica">Lido em ${esc(dia(lido.criado))}${lido.aprendeu ? ': ' + esc(lido.aprendeu) : ''}. Postou coisa nova ou mudou o jeito de responder? Leia de novo.</p>`
      : `<p class="dica">Ele lê a bio${quem}, as legendas dos posts e as mensagens que <b>você</b> mandou no direct, para falar do seu jeito. As mensagens dos seus clientes ele não guarda.</p>`;
    box.innerHTML = topo(`<h2>Ler o meu Instagram ${lido && !lendo ? '<span class="selo ok">lido</span>' : ''}</h2>${texto}`)
      + `<div><button class="bt${lido ? ' fraco' : ''}" type="button" id="cb-ler-ig" ${lendo ? 'disabled' : ''}>${svg('camera')} ${lendo ? 'Lendo…' : lido ? 'Ler de novo' : 'Ler o meu Instagram'}</button></div>`;
    $('cb-ler-ig').onclick = () => { enfileiraOutro('instagram'); const l = document.querySelector('[data-fila-lista]'); if (l) l.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  }
  function pintaCerebro() {
    pintaInsta();
    const c = cerebroDe();
    const a = $('cb-anel'); if (a) { a.innerHTML = anel(c.nivel, 132); enche(a); }
    const n = $('cb-nivel'); if (n) n.textContent = c.nivel >= 85 ? `O ${NOME()} está afiado.` : c.pronto ? `O ${NOME()} já atende. Dá para deixar ele mais esperto.` : `Falta o básico para o ${NOME()} atender.`;
    const ck = $('cb-check');
    if (ck) {
      ck.innerHTML = c.itens.map((i) => { const d = DICAS[i.id] || { nome: i.nome, frase: '' }; const meio = !i.ok && (i.meio || (+i.parcial || 0) > 0);
        return `<li class="ck ${i.ok ? 'ok' : meio ? 'meio' : ''}"><span class="marca">${i.ok ? svg('check') : meio ? '½' : ''}</span>
          <div class="meio-t"><b>${esc(i.nome || d.nome)}</b><span>${esc(i.ok ? (i.nota || 'pronto') : (i.dica || i.nota || (meio ? 'tem um pouco; dá para completar' : 'ainda não sabe')))}</span></div>
          ${i.ok ? '' : `<button type="button" class="bt pequeno fraco" data-contar="${esc(i.id)}">Contar</button>`}</li>`; }).join('');
      ck.querySelectorAll('[data-contar]').forEach((b) => b.onclick = () => {
        if (!CHAT_TREINO) return;
        const i = c.itens.find((x) => x.id === b.dataset.contar) || {}, d = DICAS[b.dataset.contar] || {};
        CHAT_TREINO.escreve(i.pede || String(d.frase || '').replace('o Sol', 'o ' + NOME()));
        $('cb-chat').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    const fl = $('cb-fontes');
    if (fl) {
      const l = fontes();
      fl.innerHTML = l.length ? `<ul class="fontes">${l.map(itemFonte).join('')}</ul>` : `<p class="vazio">Nada lido ainda. O primeiro arquivo que você mandar aparece aqui, com o que ele aprendeu.</p>`;
      ligaFontes(fl, pintaCerebro);
      l.forEach((f) => { delete f._novo; });
    }
    const sb = $('cb-sabe'); if (sb) sb.innerHTML = quadroSabe(EU.sabe);
    const bv = $('cb-boas'); if (bv) bv.hidden = !contaNova();
  }

  async function telaCerebro(alvo, topo) {
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba com-anel"><div><p class="rotulo">Cérebro do ${esc(NOME())}</p><h1>O que ele sabe do seu negócio</h1>
        <p class="lede" id="cb-nivel"></p></div><div id="cb-anel"></div></div>
      ${quadroTeste()}
      <div class="cerebro">
        <div class="cerebro-col">
          <div class="cartao boas-vindas" id="cb-boas" ${contaNova() ? '' : 'hidden'}><h2>Alimente o seu agente em 3 minutos</h2>
            <p class="lede">Nada de formulário: mande o que você já tem e converse do seu jeito. Ele lê, organiza e grava sozinho.</p>
            <ol class="tres"><li><span class="n">1</span><b>Mande um arquivo</b><span class="dica">o cardápio, a tabela de preços, a apresentação</span></li>
              <li><span class="n">2</span><b>Cole o seu site</b><span class="dica">ou cole um texto, uma conversa com cliente</span></li>
              <li><span class="n">3</span><b>Converse com o treinador</b><span class="dica">ele pergunta só o que faltou</span></li></ol></div>
          ${zonaSoltar(false)}
          <div class="grade">
            <form class="cartao leve" id="cb-site"><h2>${ic('globo')} Tem site?</h2>
              <label class="campo">Cole o link do seu site ou cardápio online<span class="linha-campo"><input class="entrada" id="cb-url" inputmode="url" autocomplete="url" placeholder="www.seunegocio.com.br"><button class="bt" type="submit">Ler</button></span></label>
              <p class="dica">Ele lê a página e guarda o que serve: serviços, preços, horário. O Instagram ele lê sozinho quando você conecta a conta.</p></form>
            <form class="cartao leve" id="cb-texto"><h2>${ic('texto')} Colar texto ou conversa</h2>
              <label class="campo">Cole uma conversa boa com cliente, um texto seu, as regras da casa<textarea class="entrada" id="cb-txt" rows="3" placeholder="Cliente: Oi, faz entrega?&#10;Eu: Faço sim! No Batel e Água Verde a entrega é grátis…"></textarea></label>
              <div><button class="bt fraco" type="submit">Mandar para ele ler</button></div></form>
          </div>
          <div class="cartao leve insta-c" id="cb-insta"></div>
          <div class="cartao"><h2>${ic('cerebro')} O que ele precisa saber</h2><p class="dica">Os seis pontos que deixam o agente bom de verdade. Toque em "Contar" e fale do seu jeito no chat.</p>
            <ul class="checklist" id="cb-check"></ul></div>
          <div class="cartao"><h2>${ic('doc')} O que ele já leu</h2><div id="cb-fontes"></div></div>
          <div class="cartao"><h2>${ic('balao')} O jeito de falar</h2><p class="dica">Toque no jeito que combina com você. Dá para trocar quando quiser.</p><div id="cb-pers"></div></div>
          <details class="cartao dobra"><summary>Ver tudo o que o ${esc(NOME())} sabe</summary><div id="cb-sabe"></div></details>
        </div>
        <div class="cerebro-lado" id="cb-chat"></div>
      </div></section>`;
    pintaCerebro();
    ligaSoltar(alvo);
    $('cb-site').onsubmit = (e) => {
      e.preventDefault();
      let u = $('cb-url').value.trim(); if (!u) return $('cb-url').focus();
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      try { new URL(u); } catch (_) { return $('cb-site').insertAdjacentHTML('beforeend', aviso('erro', 'Esse link não parece certo. Confira e tente de novo.')); }
      $('cb-url').value = ''; enfileiraOutro('site', u);
      document.querySelector('[data-fila-lista]').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    $('cb-texto').onsubmit = (e) => {
      e.preventDefault();
      const t = $('cb-txt').value.trim(); if (t.length < 20) return $('cb-txt').focus();
      $('cb-txt').value = ''; enfileiraOutro('texto', t);
      document.querySelector('[data-fila-lista]').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    cartoesPersonalidade($('cb-pers'), EU.estilo, async (escolha) => {
      const novo = await api('/personalidade', escolha);
      if (novo.erro) return $('cb-pers').insertAdjacentHTML('afterbegin', aviso('erro', novo.erro));
      EU = novo; cartoesPersonalidade($('cb-pers'), EU.estilo, null, true); seloCerebro(); pintaCerebro();
    });
    CHAT_TREINO = montaChat($('cb-chat'), {
      id: 'treino', titulo: `Treinador do ${NOME()}`, sub: 'Ele grava na hora o que você contar',
      placeholder: 'Escreva do seu jeito…', pensando: 'anotando',
      envia: (texto) => api('/ensinar', { texto }),
      depois: (res) => { absorve({ sabe: res.sabe, cerebro: res.cerebro }); },
      sugestoes: [
        { rotulo: 'Colar a tabela de preços', texto: 'Esta é a minha tabela de preços:\n' },
        { rotulo: 'Meu horário e entrega', texto: 'Atendo de segunda a sexta, das 9h às 18h. Entrego em ' },
        { rotulo: 'Nunca dá desconto', texto: 'O agente nunca pode dar desconto nem prometer prazo. Isso é comigo.', manda: true },
        { rotulo: 'Reclamação vem para mim', texto: 'Quando for reclamação ou pedido de desconto, passa para mim.', manda: true },
        { rotulo: 'Pedir nome e @', texto: 'Para orçamento, pede o nome e o @ do Instagram da pessoa.', manda: true },
      ],
    });
    const r = await api('/ensinar');
    if (!$('treino-msgs')) return;   /* trocou de aba no meio */
    for (const m of (r.conversa || [])) CHAT_TREINO.poe(m.role === 'user' ? 'eu' : 'ele', m.content);
    if (r.sabe && !EU.sabe) { EU.sabe = r.sabe; pintaCerebro(); }
  }

  /* ---------- as personalidades: cartões de tocar, com um exemplo de resposta (sem gastar IA) ---------- */
  function cartoesPersonalidade(alvo, atual, aoEscolher, soPintar) {
    if (soPintar && alvo.dataset.feito) {
      alvo.querySelectorAll('[data-estilo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.estilo === atual)));
      return;
    }
    alvo.dataset.feito = '1';
    alvo.innerHTML = `<div class="pers">${(EU.personalidades || []).map((p) => `<button type="button" class="per" data-estilo="${esc(p.id)}" aria-pressed="${p.id === atual}">
        <b>${esc(p.nome)}</b><span class="bolha-ex">${esc(p.exemplo)}</span></button>`).join('')}
      <button type="button" class="per" data-estilo="meu" aria-pressed="${atual === 'meu'}"><b>Do meu jeito</b><span class="bolha-ex vazia">Escreva como você quer que ele fale.</span></button></div>
      <div class="meu-jeito" hidden><textarea class="entrada" rows="3" aria-label="Como você quer que ele fale" placeholder="Ex.: fala como eu, bem mineira, chama todo mundo pelo nome e nunca usa gíria."></textarea>
      <div><button class="bt pequeno" type="button">Usar este jeito</button></div></div>`;
    const caixa = alvo.querySelector('.meu-jeito');
    alvo.querySelectorAll('[data-estilo]').forEach((b) => b.onclick = () => {
      alvo.querySelectorAll('[data-estilo]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (b.dataset.estilo === 'meu') { caixa.hidden = false; caixa.querySelector('textarea').focus(); return; }
      caixa.hidden = true;
      if (aoEscolher) aoEscolher({ estilo: b.dataset.estilo });
    });
    caixa.querySelector('button').onclick = () => { const j = caixa.querySelector('textarea').value.trim(); if (j && aoEscolher) aoEscolher({ jeito: j }); };
  }

  /* ---------- Testar ---------- */
  function telaTestar(alvo, topo) {
    const c = cerebroDe();
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba"><div><p class="rotulo">Teste</p><h1>Escreva como se fosse um cliente</h1>
      <p class="lede">É o mesmo ${esc(NOME())} que vai responder no Instagram, com tudo o que você ensinou. Este teste não conta no seu plano.</p></div></div>
      ${(EU.sabe && (EU.sabe.servicos || []).length) ? '' : aviso('atencao', `Ele ainda não conhece os seus serviços. <a href="#cerebro">Alimente o cérebro</a> antes de testar.`, true)}
      <div class="conversa"><div id="chat-testar"></div>
      <aside class="cartao"><h2>${ic('info')} Dicas</h2>
        <p>Pergunte o que os seus clientes perguntam de verdade. Se ele errar, vá no <a href="#cerebro">Cérebro</a> e conte o certo: ele aprende na hora.</p>
        <div style="display:flex;align-items:center;gap:14px">${anel(c.nivel, 84)}<p class="dica">Quanto mais cheio o cérebro, menos ele passa para você.</p></div>
        <div><button class="bt fraco pequeno" id="limpar" type="button">Começar a conversa de novo</button></div></aside></div></section>`;
    enche(alvo);
    montaChat($('chat-testar'), {
      id: 'teste', titulo: EU.instagram && EU.instagram.usuario ? '@' + EU.instagram.usuario : (EU.negocio || 'Seu negócio'), sub: `${NOME()} · conversa de teste`,
      placeholder: 'Escreva como um cliente escreveria…', pensando: 'digitando',
      envia: (texto) => { try { localStorage.setItem('robo-testou', '1'); } catch (_) {} return api('/testar', { texto }); },
      sugestoes: [
        { rotulo: 'Oi, quanto custa?', texto: 'Oi! Quanto custa?', manda: true },
        { rotulo: 'Vocês entregam?', texto: 'Vocês entregam? Eu moro longe.', manda: true },
        { rotulo: 'Quero um desconto', texto: 'Consegue fazer um desconto pra mim?', manda: true },
        { rotulo: 'Quero marcar um horário', texto: 'Queria marcar para sábado de manhã, pode ser?', manda: true },
        { rotulo: 'Falar com alguém', texto: 'Queria falar com uma pessoa de verdade.', manda: true },
        { rotulo: 'Em inglês', texto: 'Hi! Do you ship abroad?', manda: true },
      ],
    });
    $('limpar').onclick = async () => { await api('/testar', { limpar: true }); telaTestar(alvo, ''); };
  }

  /* ---------- Conectar ---------- */
  function cartaoDrive(curto) {
    const d = drive();
    if (!d.disponivel) return `<article class="cartao drive"><span class="canal-ic dr" aria-hidden="true">${svg('nuvem')}</span><div style="display:grid;gap:10px">
      <h2>Google Drive <span class="selo breve">em breve</span></h2><p>Tudo o que você mandar aqui vai sozinho para uma pasta no seu Drive. Estamos ligando essa conexão.</p>
      <div class="acoes"><button class="bt fraco" type="button" disabled>Conectar Google Drive</button></div></div></article>`;
    if (!d.ligado) return `<article class="cartao drive"><span class="canal-ic dr" aria-hidden="true">${svg('nuvem')}</span><div style="display:grid;gap:10px">
      <h2>Google Drive</h2><p>Tudo o que você mandar aqui vai sozinho para uma pasta no seu Drive.${curto ? '' : ' A Ti Artes só mexe na pasta que o agente criar: o resto do seu Drive fica fechado.'}</p>
      <div class="acoes"><button class="bt" type="button" id="drive-ligar">${svg('nuvem')} Conectar Google Drive</button></div></div></article>`;
    return `<article class="cartao drive"><span class="canal-ic dr" aria-hidden="true">${svg('nuvem')}</span><div style="display:grid;gap:10px">
      <h2>Google Drive <span class="selo ok">conectado</span></h2><p>${d.email ? `Conta <b>${esc(d.email)}</b>. ` : ''}Tudo o que você mandar vai sozinho para a pasta do agente.</p>
      <div class="acoes">${d.pasta_link ? `<a class="bt" href="${esc(d.pasta_link)}" target="_blank" rel="noopener">${svg('pasta')} Abrir a pasta</a>` : ''}<button class="bt fraco" type="button" id="drive-desligar">Desconectar</button></div></div></article>`;
  }
  function ligaDrive(alvo) {
    const l = $('drive-ligar');
    if (l) l.onclick = async () => { l.disabled = true; const r = await api('/drive', {}); if (r.url) location.href = r.url; else { l.disabled = false; alvo.insertAdjacentHTML('afterbegin', aviso('erro', naoExiste(r) ? 'A conexão com o Google Drive ainda está sendo ligada.' : (r.erro || 'Não deu certo.'))); } };
    const d = $('drive-desligar');
    if (d) d.onclick = async () => {
      if (d.dataset.certeza !== '1') { d.dataset.certeza = '1'; d.textContent = 'Tem certeza? Toque de novo'; return; }
      d.disabled = true; const r = await api('/drive-desligar', {}); if (!r.erro) EU = r; mostra();
    };
  }
  function telaConectar(alvo, topo) {
    const ig = EU.instagram, wa = EU.whatsapp;
    const vence = ig.vence ? Math.round((Date.parse(ig.vence) - Date.now()) / 86400000) : null;
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba"><div><p class="rotulo">Contas</p><h1>Conectar as suas contas</h1>
      <p class="lede">A conexão é pelo login oficial do Instagram, da Meta e do Google. A Ti Artes nunca vê a sua senha.</p></div></div>
      ${cartaoModo()}
      <div class="grade">
        <article class="cartao"><div class="canal-topo"><span class="canal-ic ig" aria-hidden="true">${svg('camera')}</span><h2>Instagram</h2></div>
          ${ig.conectado ? `<div class="perfil">${ig.foto ? `<img src="${esc(ig.foto)}" alt="">` : `<span class="ini">${esc((ig.usuario || '?')[0].toUpperCase())}</span>`}
            <div><b>@${esc(ig.usuario)}</b><br><span class="selo ok">conectado</span></div></div>
            ${ig.atende === false ? '<p class="dica">No seu plano, o Instagram não responde clientes: o atendimento é no WhatsApp. Para os dois, escolha o plano Completo.</p>' : ''}
            ${vence != null && vence < 15 ? aviso('atencao', `A autorização vence em ${vence} dia(s). Conecte de novo para renovar.`) : ''}
            <div class="botoes"><button class="bt pequeno fraco" id="ig-renovar" type="button">Conectar de novo</button>
            <button class="bt pequeno fraco" id="ig-desligar" type="button">Desconectar</button></div>`
          : ig.atende === false ? `<p>O atendimento no Instagram entra nos planos <b>Instagram</b> e <b>Completo</b>.</p><div><a class="bt fraco pequeno" href="#plano">Ver planos</a></div>`
          : `<p>O ${esc(NOME())} passa a responder o direct da sua conta profissional (Empresa ou Criador).</p>
            <div><button class="bt" id="ig-conectar" type="button">Conectar meu Instagram</button></div>
            <p class="dica">Abre o login do Instagram. Ele vai pedir para você permitir que a "Ti Artes Atendimento" leia o seu perfil e responda as suas mensagens.</p>`}
        </article>
        <article class="cartao"><div class="canal-topo"><span class="canal-ic wa" aria-hidden="true">${svg('balao')}</span><h2>WhatsApp</h2></div>
          ${wa.conectado ? '<p><span class="selo ok">conectado</span></p><p>O agente responde no seu número. O que você digitar no celular, ele vê e se cala naquela conversa.</p>'
          : wa.liberado ? `<p>Conecte o número que você já usa no WhatsApp Business, ou um número novo.</p>
            <div><button class="bt" id="wa-conectar" type="button">Conectar meu WhatsApp</button></div>
            <p class="dica">A Meta está liberando esta conexão para todos, com previsão para o começo de dezembro. As mensagens do WhatsApp são cobradas pela Meta, na conta Meta da sua empresa.</p>`
          : `<p>O atendimento no WhatsApp entra nos planos <b>WhatsApp</b> e <b>Completo</b>.</p><div><a class="bt fraco pequeno" href="#plano">Ver planos</a></div>`}
        </article>
      </div>
      ${cartaoAssistente()}
      ${cartaoDrive(true)}</section>`;
    ligaAssistente(alvo);
    ligaModo(alvo);
    const vai = async (rota, bt) => { bt.disabled = true; const r = await api(rota, {}); if (r.url) location.href = r.url; else { bt.disabled = false; alvo.insertAdjacentHTML('afterbegin', aviso('erro', r.erro || 'Não deu certo.')); } };
    if ($('ig-conectar')) $('ig-conectar').onclick = (e) => vai('/instagram', e.currentTarget);
    if ($('ig-renovar')) $('ig-renovar').onclick = (e) => vai('/instagram', e.currentTarget);
    if ($('wa-conectar')) $('wa-conectar').onclick = (e) => vai('/whatsapp', e.currentTarget);
    const bd = $('ig-desligar');
    if (bd) bd.onclick = async () => {
      if (bd.dataset.certeza !== '1') { bd.dataset.certeza = '1'; bd.textContent = 'Tem certeza? Toque de novo'; return; }
      bd.disabled = true; const r = await api('/instagram-desligar', {}); if (!r.erro) EU = r; mostra();
    };
    ligaDrive(alvo);
  }

  /* +55 41 96349-3440 a partir dos dígitos */
  const foneBonito = (d) => { const x = String(d || '').replace(/\D/g, ''); return /^55\d{10,11}$/.test(x) ? `+55 ${x.slice(2, 4)} ${x.slice(4, -4)}-${x.slice(-4)}` : '+' + x; };

  /* ---------- o modo da conta: os dois agentes, só o atendimento ou só o assistente ---------- */
  const MODOS = [
    { id: 'ambos', nome: 'Os dois', txt: 'Os clientes falam com o agente de atendimento, e você fala com a Dora, a sua secretária.' },
    { id: 'atendimento', nome: 'Só atendimento', txt: 'O agente responde os clientes. A Dora fica desligada.' },
    { id: 'assistente', nome: 'Só secretária', txt: 'Os clientes não recebem resposta automática. Você usa só a Dora para a agenda, as notas e os arquivos.' },
  ];
  function cartaoModo() {
    if (!(EU.assistente || {}).disponivel) return '';
    if (EU.plano && Array.isArray(EU.plano.canais) && !EU.plano.canais.length)
      return `<article class="cartao modos"><h2>Plano Secretária</h2><p>Só a ${esc(ASSIST())} trabalha, e só com você: os clientes não recebem resposta automática. Para ligar o atendimento, escolha um plano com Instagram ou WhatsApp.</p><div><a class="bt fraco pequeno" href="#plano">Ver planos</a></div></article>`;
    const atual = EU.modo || 'ambos';
    return `<article class="cartao modos"><h2>Como os agentes trabalham nesta conta</h2>
      <div class="modos-opcoes" role="radiogroup" aria-label="Como os agentes trabalham">${MODOS.map((x) => `<button type="button" role="radio" class="modo ${atual === x.id ? 'on' : ''}" aria-checked="${atual === x.id}" data-modo="${x.id}"><b>${esc(x.nome)}</b><span>${esc(x.txt)}</span></button>`).join('')}</div>
      <p class="dica">Troque quando quiser, sem mudar o preço.</p></article>`;
  }
  function ligaModo(alvo) {
    alvo.querySelectorAll('[data-modo]').forEach((b) => b.onclick = async () => {
      if (b.classList.contains('on')) return;
      alvo.querySelectorAll('[data-modo]').forEach((x) => { x.disabled = true; });
      const r = await api('/modo', { modo: b.dataset.modo });
      if (r.erro) { alvo.insertAdjacentHTML('afterbegin', aviso('erro', r.erro)); alvo.querySelectorAll('[data-modo]').forEach((x) => { x.disabled = false; }); return; }
      EU = r;
      avisoVolta = { tipo: 'info', texto: r.modo === 'assistente' ? `Pronto: agora só você recebe resposta, da ${ASSIST()}. Os clientes não recebem resposta automática.`
        : r.modo === 'atendimento' ? 'Pronto: o agente responde os clientes e a secretária fica desligada.' : 'Pronto: os dois agentes estão valendo.' };
      mostra();
    });
  }

  /* ---------- o agente assistente: o dono manda um código do perfil pessoal e passa a falar com o assistente ---------- */
  function cartaoAssistente() {
    const a = EU.assistente || {}, ig = EU.instagram || {};
    const topo = `<div class="canal-topo"><span class="canal-ic" aria-hidden="true">${svg('relogio')}</span><h2>Secretária <small style="font-weight:400;color:var(--grafite)">· ${esc(ASSIST())}</small></h2></div>`;
    if (!a.disponivel) return `<article class="cartao" id="assist">${topo}<p>Quando quem escreve no direct é você, quem responde é a ${esc(ASSIST())}: marca na agenda, anota e confirma os horários. <span class="selo breve">chega em breve</span></p></article>`;
    if (EU.modo === 'atendimento') return `<article class="cartao" id="assist">${topo}<p>Desligado: você escolheu <b>só atendimento</b>. Para usar a ${esc(ASSIST())}, escolha "Os dois" ou "Só secretária" aqui em cima.</p></article>`;
    /* o Otto central: um WhatsApp da Ti Artes, o mesmo para todos; o dono liga mandando o código de um toque */
    if (a.otto_wa) {
      const num = foneBonito(a.otto_wa);
      if (a.whatsapp) return `<article class="cartao" id="assist">${topo}<p><span class="selo ok">ligado no WhatsApp</span></p>
        <p>Fale com a ${esc(ASSIST())} pelo WhatsApp <b class="num">${esc(num)}</b>, do seu celular: texto, áudio, foto ou PDF. Ela marca na sua agenda, anota, confirma os horários que os clientes pediram e guarda nota fiscal e comprovante no seu Drive.</p>
        <div class="botoes"><a class="bt pequeno" href="https://wa.me/${esc(a.otto_wa)}" target="_blank" rel="noopener">${svg('balao')} Abrir o WhatsApp da ${esc(ASSIST())}</a><button class="bt pequeno fraco" id="assist-desligar" type="button">Desligar</button></div></article>`;
      return `<article class="cartao" id="assist">${topo}
        <p>A ${esc(ASSIST())} é a sua secretária: um número de WhatsApp da Ti Artes que fala só com você. Salve o número nos contatos; você manda texto, áudio, foto ou PDF, e ela marca na agenda, anota, confirma os horários que os clientes pediram e guarda o que você pedir no seu Drive.</p>
        <ol class="passinhos"><li>Toque em <b>Falar com a ${esc(ASSIST())}</b>: o WhatsApp abre com o seu código já escrito.</li><li>Envie. Pronto: ela reconhece você pelo seu número.</li></ol>
        <div class="botoes"><button class="bt pequeno" id="assist-wa" type="button">${svg('balao')} Falar com a ${esc(ASSIST())} no WhatsApp</button></div>
        <div id="assist-mostra" hidden></div></article>`;
    }
    if (a.ligado) return `<article class="cartao" id="assist">${topo}<p><span class="selo ok">ligado</span></p>
      <p>Quando você escreve no direct${ig.usuario ? ' do <b>@' + esc(ig.usuario) + '</b>' : ''} pelo seu perfil pessoal, quem responde é a ${esc(ASSIST())}. Peça por texto, áudio ou foto: "marca a Ana sexta às 15h", "o que eu tenho amanhã?".</p>
      <p class="dica">Para ver como os clientes são atendidos, escreva "modo cliente" (volta com "modo dono").</p>
      <div class="botoes"><button class="bt pequeno fraco" id="assist-desligar" type="button">Desligar</button></div></article>`;
    if (!ig.conectado) return `<article class="cartao" id="assist">${topo}<p>Primeiro conecte o Instagram do seu negócio aqui em cima. Depois você liga a ${esc(ASSIST())} em 1 minuto.</p></article>`;
    return `<article class="cartao" id="assist">${topo}
      <p>Quando quem escreve no direct é você, quem responde é a ${esc(ASSIST())}: marca na agenda, anota e confirma os horários que os clientes pediram. Para ela saber que é você:</p>
      <ol class="passinhos"><li>Toque em <b>Mostrar o meu código</b>.</li><li>Abra o Instagram no <b>seu perfil pessoal</b> (não no do negócio).</li><li>Mande o código numa mensagem para <b>@${esc(ig.usuario || 'o seu negócio')}</b>.</li></ol>
      <p class="dica">Não tem um perfil pessoal além do negócio? Crie um em dois minutos no Instagram: é dele que você vai falar com a ${esc(ASSIST())}.</p>
      <div class="botoes"><button class="bt pequeno" id="assist-codigo" type="button">Mostrar o meu código</button></div>
      <div id="assist-mostra" hidden></div></article>`;
  }
  function ligaAssistente(alvo) {
    const bw = $('assist-wa');
    if (bw) bw.onclick = async () => {
      bw.disabled = true;
      const r = await api('/dono-codigo', {});
      bw.disabled = false;
      const m = $('assist-mostra'); m.hidden = false;
      if (r.erro || !r.codigo || !r.otto_wa) { m.innerHTML = aviso('erro', r.erro || 'Não deu para gerar o código.'); return; }
      const link = `https://wa.me/${r.otto_wa}?text=${encodeURIComponent(r.codigo)}`;
      m.innerHTML = `<p class="dica">Se o WhatsApp não abriu, mande este código para <b class="num">${esc(foneBonito(r.otto_wa))}</b>: <b class="num">${esc(r.codigo)}</b> (vale ${r.minutos} minutos).</p>
        <div class="botoes"><a class="bt pequeno fraco" href="${esc(link)}" target="_blank" rel="noopener">Abrir de novo</a><button class="bt pequeno fraco" id="assist-ja" type="button">Já mandei</button></div>`;
      $('assist-ja').onclick = () => carrega();
      window.open(link, '_blank', 'noopener');
    };
    const bc = $('assist-codigo');
    if (bc) bc.onclick = async () => {
      bc.disabled = true;
      const r = await api('/dono-codigo', {});
      bc.disabled = false;
      const m = $('assist-mostra'); m.hidden = false;
      if (r.erro || !r.codigo) { m.innerHTML = aviso('erro', r.erro || 'Não deu para gerar o código.'); return; }
      m.innerHTML = `<p class="codigo-dono num" aria-label="Código">${esc(r.codigo.slice(0, 3))} ${esc(r.codigo.slice(3))}</p>
        <p class="dica">Vale por ${r.minutos} minutos e uma vez só. Mande só os 6 números para <b>@${esc(r.conta || 'o seu negócio')}</b>, do seu perfil pessoal. Ele responde confirmando.</p>
        <div class="botoes"><button class="bt pequeno fraco" id="assist-ja" type="button">Já mandei</button></div>`;
      $('assist-ja').onclick = () => carrega();
    };
    const bd = $('assist-desligar');
    if (bd) bd.onclick = async () => {
      if (bd.dataset.certeza !== '1') { bd.dataset.certeza = '1'; bd.textContent = 'Tem certeza? Toque de novo'; return; }
      bd.disabled = true; const r = await api('/dono-desligar', {}); if (!r.erro) EU = r; mostra();
    };
  }

  /* ---------- os arquivos que o dono mandou ao assistente (foto, comprovante, nota fiscal) ---------- */
  function cartaoGuardados() {
    if (!(EU.assistente || {}).disponivel || EU.modo === 'atendimento') return '';
    const G = EU.guardados || { itens: [] }, d = drive();
    const pastas = {};
    for (const g of G.itens || []) (pastas[g.pasta || 'Guardados'] = pastas[g.pasta || 'Guardados'] || []).push(g);
    const onde = (g) => g.drive === 'ok' ? `<span class="selo ok">no Drive</span>` : (g.drive === 'sem' || !d.ligado) ? '<span class="selo">só aqui</span>' : g.drive === 'erro' ? '<span class="selo atencao">tenta de novo</span>' : '<span class="selo">indo pro Drive</span>';
    return `<div class="cartao guardados"><h2>${ic('pasta')} Guardados pela ${esc(ASSIST())}</h2>
      <p class="dica">Mande no direct, do seu perfil: foto, comprovante, nota fiscal ou PDF, e diga "guarda". Ele lê, dá um nome que diz o que é e põe na pasta certa${d.ligado ? ' do seu Google Drive' : '. <b>Ligue o Google Drive</b> aqui em cima para irem para lá'}.</p>
      ${Object.keys(pastas).length ? Object.entries(pastas).map(([p, l]) => `<h3 class="pasta-nome">${ic('pasta')} ${esc(p)}</h3><ul class="fontes">${l.map((g) => `<li class="fonte"><div><b>${esc(g.nome)}</b><span class="dica">${esc(dia(g.guardado || g.quando))} ${onde(g)}</span></div>
        <div class="botoes"><button class="bt pequeno fraco" type="button" data-abrir-g="${esc(g.id)}">Abrir</button><button class="bt pequeno fraco" type="button" data-apagar-g="${esc(g.id)}">Apagar</button></div></li>`).join('')}</ul>`).join('')
        : `<p class="vazio">Nada guardado ainda.</p>`}
      <p class="dica num">${(+G.usados_mb || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB de ${inteiro(G.limite_mb || 0)} MB no app${G.recebidos ? ` · ${G.recebidos} arquivo${G.recebidos === 1 ? '' : 's'} esperando você dizer onde guardar (some${G.recebidos === 1 ? '' : 'm'} em 3 dias)` : ''}. O que já está no Drive sai do app em ${G.dias_no_app || 30} dias e fica no Drive.</p></div>`;
  }
  function ligaGuardados(alvo, pinta) {
    alvo.querySelectorAll('[data-abrir-g]').forEach((b) => b.onclick = async () => {
      const g = ((EU.guardados || {}).itens || []).find((x) => x.id === b.dataset.abrirG);
      if (g && g.drive_link && !g.no_app) { window.open(g.drive_link, '_blank', 'noopener'); return; }
      b.disabled = true; const r = await api('/guardado?id=' + encodeURIComponent(b.dataset.abrirG)); b.disabled = false;
      if (r.url) window.open(r.url, '_blank', 'noopener'); else alvo.insertAdjacentHTML('afterbegin', aviso('erro', r.erro || 'Não abriu.'));
    });
    alvo.querySelectorAll('[data-apagar-g]').forEach((b) => b.onclick = async () => {
      if (b.dataset.certeza !== '1') { b.dataset.certeza = '1'; b.textContent = 'Apagar do app?'; return; }
      b.disabled = true; const r = await api('/guardado-apagar', { id: b.dataset.apagarG }); if (!r.erro) { EU = r; pinta(); }
    });
  }

  /* ---------- Arquivos ---------- */
  function telaArquivos(alvo, topo) {
    const pinta = () => {
      const l = fontes().filter((f) => f.tipo === 'arquivo'), u = EU.arquivos;
      const pct = u && u.limite_mb ? Math.round((u.usados_mb / u.limite_mb) * 100) : 0;
      alvo.innerHTML = `<section class="aba">${topo}
        <div class="cabeca-aba"><div><p class="rotulo">Arquivos</p><h1>Os seus arquivos</h1>
        <p class="lede">O que você mandou para o ${esc(NOME())} ler fica guardado aqui. Ele aprende com cada um.</p></div></div>
        ${cartaoDrive(false)}
        ${cartaoGuardados()}
        <div class="arq-grade">
          <div class="cartao"><h2>${ic('pasta')} ${l.length} arquivo${l.length === 1 ? '' : 's'}</h2>
            ${l.length ? `<ul class="fontes" id="arq-lista">${l.map(itemFonte).join('')}</ul>` : `<p class="vazio">Nenhum arquivo ainda. Mande o primeiro aqui ao lado: o cardápio, a tabela de preços ou fotos do seu trabalho.</p>`}</div>
          <div style="display:grid;gap:16px;align-content:start">${zonaSoltar(true)}
            ${u ? `<div class="cartao leve"><h2 style="font-size:17px">Espaço usado</h2><div class="medidor ${pct >= 80 ? 'alto' : ''}" role="progressbar" aria-label="Espaço usado" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, pct)}%"></i></div>
              <p class="dica num">${(+u.usados_mb || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB de ${inteiro(u.limite_mb)} MB</p></div>` : ''}</div>
        </div></section>`;
      const lista = $('arq-lista'); if (lista) ligaFontes(lista, pinta);
      ligaSoltar(alvo); ligaDrive(alvo); ligaGuardados(alvo, pinta);
    };
    pinta();
  }

  /* ---------- Plano e uso ---------- */
  async function telaPlano(alvo, topo) {
    const p = EU.plano;
    const ST = { teste: `Em teste grátis até ${dia(EU.pago_ate)}. O cartão só é cobrado depois.`, ativa: EU.cancela_no_fim ? `Pago até ${dia(EU.pago_ate)}.` : `Ativa. Renova sozinha em ${dia(EU.pago_ate)}.`,
      atrasada: 'O último pagamento não passou. Atualize o cartão para o agente não parar.', cancelada: `Cancelada. O agente responde até ${dia(EU.pago_ate)}.`, vencida: 'O plano venceu e o agente parou.', novo: '' };
    /* o plano Secretária vive no WhatsApp do Otto: sem o número no ar, o cartão aparece, mas não vende */
    const semOtto = !(EU.assistente && EU.assistente.otto_wa);
    const itens = (x) => (x.canais.length ? [
      `Atendimento no ${x.canais.map((c) => (c === 'whatsapp' ? 'WhatsApp' : 'Instagram')).join(' e no ')}, até ${inteiro(x.respostas)} mensagens por mês`,
      `${ASSIST()}, a sua secretária no WhatsApp`, 'App de gestão: agenda, notas e arquivos',
      ...(x.canais.includes('whatsapp') ? ['WhatsApp numa linha nova, ou no seu número quando a Meta liberar (começo de dezembro)'] : []),
    ] : [`${ASSIST()}, a sua secretária no WhatsApp`, 'App de gestão: agenda, notas e arquivos', 'Para se organizar, com ou sem empresa', 'Sem atendimento de clientes']);
    const cartoes = EU.planos.map((x) => `<article class="plano ${(planoPedido === x.id || (p && p.id === x.id)) ? 'escolhido' : ''}">
      <h2>${esc(x.nome)}</h2><p class="preco">${esc(x.preco)}<small> por mês</small></p>
      <ul>${itens(x).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${x.id === 'otto' && semOtto ? `<p class="dica">Abre assim que o WhatsApp da ${esc(ASSIST())} estiver no ar.</p>` : `<div class="botoes"><button class="bt pequeno" type="button" data-plano="${x.id}" data-forma="cartao">${EU.status === 'novo' && EU.teste_dias ? `Cartão: ${EU.teste_dias} dias grátis` : 'Assinar no cartão'}</button>
      <button class="bt pequeno fraco" type="button" data-plano="${x.id}" data-forma="pix">Pagar 1 mês no Pix</button></div>`}</article>`).join('');
    const pagando = p && EU.em_dia;
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba"><div><p class="rotulo">Conta</p><h1>Plano e uso</h1></div></div>
      ${quadroTeste()}
      ${(EU.teste && !EU.teste.pagou && !EU.teste.cupom && !EU.plano) ? `<form class="cartao leve cupom" id="f-cupom"><label class="campo">Tem um cupom?
        <span class="linha-cupom"><input id="cupom" autocomplete="off" autocapitalize="characters" placeholder="Código do cupom"><button class="bt pequeno fraco" type="submit">Usar</button></span></label>
        <p id="cupom-msg" class="dica" hidden></p></form>` : ''}
      ${EU.teste_pagamento ? aviso('atencao', 'Modo de teste: nada é cobrado de verdade. No cartão, use 4242 4242 4242 4242, qualquer data futura e qualquer código.') : ''}
      ${pagando ? `<div class="cartao"><h2>${esc(p.nome)} <span class="selo ok">${esc(EU.status)}</span></h2><p>${esc(ST[EU.status] || '')}</p>
        <div class="botoes"><button class="bt pequeno" id="portal" type="button">Trocar cartão ou cancelar</button></div>
        <p class="dica">Abre a página segura do Stripe, que guarda o seu cartão. A Ti Artes não vê o número do cartão.</p></div>`
        : (EU.status !== 'novo' && ST[EU.status] ? aviso('atencao', ST[EU.status]) : '')}
      <div class="cartao" id="uso"><h2>${ic('relogio')} Uso do mês</h2><p class="dica">Carregando…</p></div>
      ${(EU.em_dia && (EU.robo.ativo || EU.pausado)) ? `<div class="cartao"><h2>${ic(EU.pausado ? 'play' : 'pausa')} Ligar e desligar</h2>
        <p class="dica">${EU.pausado ? 'Pausado, ele não responde ninguém. Religue quando quiser.' : 'Pausado, ele para de responder em todas as conversas, na hora.'}</p>
        <div><button class="bt ${EU.pausado ? '' : 'fraco'}" id="pausar" type="button">${EU.pausado ? 'Religar o agente' : 'Pausar o agente'}</button></div></div>` : ''}
      ${EU.cartao ? '<p class="dica">Para trocar de plano, use "Trocar cartão ou cancelar": a troca fica na mesma assinatura e você não paga duas vezes.</p>'
        : `<h2 style="font-size:24px">${pagando ? 'Pagar mais um mês' : 'Escolha o plano'}</h2>
      <div class="planos">${cartoes}</div>
      <p class="dica">No Pix, você paga um mês por vez (o Pix não renova sozinho). No cartão, renova todo mês e você cancela quando quiser. Na primeira assinatura, você tem 7 dias para desistir e receber o dinheiro de volta (<a href="termos.html" target="_blank" rel="noopener">termos de uso</a>).</p>`}
      ${EU.estudio && !EU.teste_pagamento ? `<div class="cartao leve"><h2>Teste de R$ 1 <span class="selo">só o estúdio</span></h2>
        <p class="dica">Paga R$ 1 no Pix de verdade, para provar que a cobrança libera a conta e cai nas Mensalidades. Conta como um mês do plano Instagram nesta conta.</p>
        <div><button class="bt pequeno fraco" type="button" data-plano="instagram" data-forma="pix" data-umreal="1">Pagar R$ 1 no Pix</button></div></div>` : ''}</section>`;
    alvo.querySelectorAll('[data-plano]').forEach((b) => b.onclick = async () => {
      b.disabled = true;
      const r = await api('/assinar', { plano: b.dataset.plano, forma: b.dataset.forma, ...(b.dataset.umreal ? { um_real: true } : {}) });
      if (r.url) location.href = r.url; else { b.disabled = false; alvo.insertAdjacentHTML('afterbegin', aviso('erro', r.erro || 'Não deu certo.')); }
    });
    const fc = $('f-cupom');
    if (fc) fc.onsubmit = async (e) => {
      e.preventDefault();
      const cod = $('cupom').value.trim(); if (!cod) return;
      const r = await api('/cupom', { codigo: cod });
      if (r.erro) { $('cupom-msg').textContent = r.erro; $('cupom-msg').hidden = false; return; }
      EU = r; avisoVolta = { tipo: 'info', texto: `Cupom aplicado: o seu teste grátis vai até ${hora(r.teste.ate)}.` }; mostra();
    };
    if ($('portal')) $('portal').onclick = async (e) => { e.currentTarget.disabled = true; const r = await api('/portal', {}); if (r.url) location.href = r.url; else alvo.insertAdjacentHTML('afterbegin', aviso('erro', r.erro || 'Não deu certo.')); };
    const bp = $('pausar');
    if (bp) bp.onclick = async () => { bp.disabled = true; const r = await api('/pausar', { pausado: !EU.pausado }); if (!r.erro) EU = r; mostra(); };
    usoDoMes();
  }
  async function usoDoMes(mes) {
    const el = $('uso'); if (!el) return;
    const r = await api('/uso' + (mes ? '?mes=' + mes : ''));
    if (!$('uso')) return;
    if (r.erro || !r.franquia) { el.innerHTML = `<h2>${ic('relogio')} Uso do mês</h2>${aviso('erro', r.erro || 'Não consegui ler o uso agora.')}`; return; }
    const pct = r.franquia.pct || 0;
    const anterior = (() => { const d = new Date(r.mes + '-15T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 7); })();
    const canais = r.mensagens && r.mensagens.por_canal ? Object.entries(r.mensagens.por_canal) : [];
    el.innerHTML = `<h2>${ic('relogio')} Uso de ${esc(nomeMes(r.mes))}</h2>
      <p class="num"><b style="font:700 34px var(--serif)">${inteiro(r.franquia.usadas)}</b> de ${inteiro(r.franquia.incluidas)} mensagens incluídas no seu plano</p>
      <div class="medidor ${pct >= 80 ? 'alto' : ''}" role="progressbar" aria-label="Mensagens usadas" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, pct)}%"></i></div>
      <p class="dica">${pct >= 100 ? 'Passou do limite do plano. O agente continua respondendo.' : pct >= 80 ? 'Já usou mais de 80%. O agente continua respondendo normalmente.' : 'Conta cada mensagem que o agente envia (texto e foto). Os testes do painel não entram.'}</p>
      <div class="numeros">
        <div><b>${inteiro(r.respostas)}</b><span>respostas escritas pelo agente</span></div>
        ${canais.length ? canais.map(([c, n]) => `<div><b>${inteiro(n)}</b><span>no ${esc(c === 'whatsapp' ? 'WhatsApp' : c === 'instagram' ? 'Instagram' : c)}</span></div>`).join('') : '<div><b>0</b><span>por canal</span></div>'}
        <div><b>${r.ultima ? dia(r.ultima) : '—'}</b><span>última resposta</span></div>
      </div>
      <div><button class="bt fraco pequeno" id="mes-anterior" type="button">Ver ${esc(nomeMes(anterior))}</button></div>`;
    $('mes-anterior').onclick = () => usoDoMes(anterior);
  }

  /* ---------- o mini app: Agenda ---------- */
  const diaLongo = (iso) => { const t = new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1); };
  async function telaAgenda(alvo, topo) {
    alvo.innerHTML = `<section class="aba">${topo}<div class="cabeca-aba"><div><p class="rotulo">O seu dia</p><h1>Agenda</h1></div></div><p class="dica">Carregando…</p></section>`;
    const r = await api('/agenda');
    if (abaAtual() !== 'agenda') return;
    const hoje = hojeIso();
    const vem = (r.agenda || []).filter((e) => e.dia >= hoje), foi = (r.agenda || []).filter((e) => e.dia < hoje);
    const porDia = {}; vem.forEach((e) => (porDia[e.dia] = porDia[e.dia] || []).push(e));
    const item = (e) => `<li class="ev"><span class="ev-hora num ${e.hora ? '' : 'dia-todo'}">${esc(e.hora || 'dia todo')}</span><div class="ev-txt"><b>${esc(e.titulo)}</b>${e.com ? `<span>com ${esc(e.com)}</span>` : ''}${e.nota && !/^pedido:/.test(e.nota) ? `<span class="dica">${esc(e.nota.replace(/pedido:\w+/, '').trim())}</span>` : ''}</div>
      ${e.origem === 'robo' ? `<span class="selo ok">do ${esc(NOME())}</span>` : '<span></span>'}<button type="button" class="bt-ic" data-apaga="${esc(e.id)}" aria-label="Apagar ${esc(e.titulo)}">${svg('x')}</button></li>`;
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba"><div><p class="rotulo">O seu dia</p><h1>Agenda</h1><p class="lede">Os seus compromissos e os horários que o ${esc(NOME())} combinou com os clientes.</p></div>
        <button class="bt fraco" id="ag-google" type="button">${svg('agenda')} Ver no Google Agenda</button></div>
      ${r.erro ? aviso('erro', r.erro) : ''}
      <div id="ag-link"></div>
      ${(r.pedidos || []).length ? `<div class="cartao pedido-h"><h2>${ic('relogio')} Pedidos de horário para confirmar</h2><ul class="linha-tempo">${r.pedidos.map((p) => `<li class="ev"><span class="ev-hora num duas">${esc(dia(p.dia + 'T12:00:00').slice(0, 5))}${p.hora ? `<small>${esc(p.hora)}</small>` : ''}</span>
        <div class="ev-txt"><b>${esc(p.titulo)}</b><span>${esc(p.com || '')}</span></div><span></span><button class="bt pequeno" type="button" data-confirma="${esc(p.id)}">Confirmar</button></li>`).join('')}</ul></div>` : ''}
      <form class="cartao marcar" id="ag-form"><h2>${ic('mais')} Marcar</h2><div class="linha-form">
        <label>Dia<input type="date" id="ag-dia" value="${hoje}" required></label><label>Hora<input type="time" id="ag-hora"></label>
        <label class="largo">O quê<input id="ag-tit" placeholder="Visita da Marina ao ateliê" required></label><label class="largo">Com quem<input id="ag-com" placeholder="Marina (opcional)"></label>
        <button class="bt" type="submit">Marcar</button></div><p class="aviso erro" id="ag-erro" hidden></p></form>
      ${Object.keys(porDia).length ? Object.entries(porDia).map(([d, l]) => `<div class="cartao"><h2 class="dia-tit">${esc(diaLongo(d))}${d === hoje ? ' <span class="selo ok">hoje</span>' : ''}</h2><ul class="linha-tempo">${l.map(item).join('')}</ul></div>`).join('')
        : `<div class="cartao"><p class="vazio">Nada marcado daqui para a frente. Marque o primeiro compromisso aqui em cima, ou confirme um pedido que o ${esc(NOME())} anotou.</p></div>`}
      ${foi.length ? `<details class="cartao dobra"><summary>Já passou (${foi.length})</summary><ul class="linha-tempo">${foi.slice(-30).reverse().map(item).join('')}</ul></details>` : ''}
    </section>`;
    const salva = async (corpo) => { const x = await api('/agenda', corpo); if (x.erro) { $('ag-erro').textContent = x.erro; $('ag-erro').hidden = false; return false; } telaAgenda(alvo, ''); return true; };
    $('ag-form').onsubmit = (e) => { e.preventDefault(); salva({ acao: 'criar', item: { dia: $('ag-dia').value, hora: $('ag-hora').value, titulo: $('ag-tit').value, com: $('ag-com').value } }); };
    alvo.querySelectorAll('[data-confirma]').forEach((b) => b.onclick = () => {
      const p = r.pedidos.find((x) => x.id === b.dataset.confirma);
      salva({ acao: 'criar', item: { dia: p.dia, hora: p.hora, titulo: p.titulo, com: p.com, nota: 'pedido:' + p.id, origem: 'robo' } });
    });
    alvo.querySelectorAll('[data-apaga]').forEach((b) => b.onclick = () => {
      if (b.dataset.certeza !== '1') { b.dataset.certeza = '1'; b.textContent = 'apagar?'; b.classList.add('certeza'); return; }
      salva({ acao: 'apagar', item: { id: b.dataset.apaga } });
    });
    $('ag-google').onclick = async () => {
      const x = await api('/agenda-link', {});
      if (!x.url) return;
      $('ag-link').innerHTML = `<div class="cartao"><h2>A sua agenda no Google Agenda</h2>
        <p>No Google Agenda do computador: <b>Outras agendas → + → Do URL</b>, cole o link e confirme. Ela aparece lá e se atualiza sozinha (o Google leva algumas horas).</p>
        <div class="copia"><input readonly value="${esc(x.url)}" id="ag-url" aria-label="Link da agenda"><button class="bt pequeno" type="button" id="ag-copia">Copiar</button></div>
        <p class="dica">O link é só seu: quem tiver ele vê os seus compromissos. Por enquanto vai só daqui para o Google.</p></div>`;
      $('ag-copia').onclick = async () => { try { await navigator.clipboard.writeText(x.url); $('ag-copia').textContent = 'Copiado'; } catch (_) { $('ag-url').select(); } };
    };
  }

  /* ---------- o mini app: Notas ---------- */
  async function telaNotas(alvo, topo) {
    const r = await api('/notas');
    if (abaAtual() !== 'notas') return;
    const l = r.notas || [];
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba"><div><p class="rotulo">O seu dia</p><h1>Notas</h1></div></div>
      ${r.erro ? aviso('erro', r.erro) : ''}
      <form class="cartao compor" id="nt-form"><label class="campo">Nova nota<textarea id="nt-txt" rows="3" placeholder="Anote o que não pode esquecer: ligar para o fornecedor, ideia de promoção…"></textarea></label>
        <div class="linha"><span class="dica">⌘ + Enter também anota</span><button class="bt" type="submit">${svg('mais')} Anotar</button></div><p class="aviso erro" id="nt-erro" hidden></p></form>
      ${l.length ? `<ul class="notas">${l.map((n) => `<li class="nota ${n.feita ? 'feita' : ''}"><label><input type="checkbox" data-feita="${esc(n.id)}" ${n.feita ? 'checked' : ''}><span class="txt">${esc(n.texto)}</span></label>
        <div class="rodape"><span class="dica num">${esc(dia(n.criado))}</span><button type="button" class="bt-ic" data-apaga="${esc(n.id)}" aria-label="Apagar a nota">${svg('lixo')}</button></div></li>`).join('')}</ul>`
        : '<div class="cartao"><p class="vazio">Nenhuma nota ainda. Escreva a primeira aqui em cima.</p></div>'}</section>`;
    const salva = async (corpo) => { const x = await api('/notas', corpo); if (x.erro) { $('nt-erro').textContent = x.erro; $('nt-erro').hidden = false; return; } telaNotas(alvo, ''); };
    $('nt-form').onsubmit = (e) => { e.preventDefault(); const t = $('nt-txt').value.trim(); if (t) salva({ acao: 'criar', item: { texto: t } }); };
    $('nt-txt').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) $('nt-form').requestSubmit(); });
    alvo.querySelectorAll('[data-feita]').forEach((c) => c.onchange = () => salva({ acao: 'mudar', item: { id: c.dataset.feita, feita: c.checked } }));
    alvo.querySelectorAll('[data-apaga]').forEach((b) => b.onclick = () => {
      if (b.dataset.certeza !== '1') { b.dataset.certeza = '1'; b.textContent = 'apagar?'; b.classList.add('certeza'); return; }
      salva({ acao: 'apagar', item: { id: b.dataset.apaga } });
    });
  }

  /* ---------- Pedidos ---------- */
  async function telaPedidos(alvo, topo) {
    alvo.innerHTML = `<section class="aba">${topo}<div class="cabeca-aba"><div><p class="rotulo">O seu dia</p><h1>Pedidos anotados</h1></div></div><p class="dica">Carregando…</p></section>`;
    const r = await api('/recados');
    if (abaAtual() !== 'pedidos') return;
    const l = r.recados || [];
    const canal = (c) => ({ instagram: 'Instagram', whatsapp: 'WhatsApp', teste: 'teste do painel', sistema: 'aviso do sistema' }[c] || c);
    alvo.innerHTML = `<section class="aba">${topo}
      <div class="cabeca-aba"><div><p class="rotulo">O seu dia</p><h1>Pedidos anotados</h1>
      <p class="lede">Quando um cliente pede orçamento, visita ou fala com uma pessoa, o ${esc(NOME())} anota aqui e avisa você.</p></div></div>
      ${r.erro ? aviso('erro', r.erro) : ''}
      ${l.length ? `<ul class="pedidos">${l.map((x) => `<li class="pedido"><div class="topo"><b>${esc(x.nome || 'Alguém')}</b><span class="selo ${x.canal === 'teste' ? 'desligado' : 'ok'}">${esc(canal(x.canal))}</span></div>
          <p>${esc(x.assunto || x.resumo || '')}</p>${x.quando_quer ? `<p class="dica">${ic('relogio')} ${esc(x.quando_quer)}</p>` : ''}
          <p class="contato">${esc([x.contato, x.instagram ? '@' + x.instagram : '', x.email].filter(Boolean).join(' · ') || 'sem contato')}</p>
          <span class="dica num">${esc(dia(x.quando))}</span></li>`).join('')}</ul>`
        : `<div class="cartao"><p class="vazio">Ainda nenhum pedido. Quando o ${esc(NOME())} anotar o primeiro, ele aparece aqui.</p><div><a class="bt fraco pequeno" href="#testar">Fazer um pedido de teste</a></div></div>`}</section>`;
  }

  /* ---------- Estúdio (só a Ti Artes) ---------- */
  async function telaEstudio(alvo, topo) {
    if (!EU.estudio) return telaInicio(alvo, topo);
    alvo.innerHTML = `<section class="aba">${topo}<h1>Estúdio</h1><p class="dica">Carregando…</p></section>`;
    const r = await api('/estudio');
    if (abaAtual() !== 'estudio') return;
    if (r.erro) { alvo.innerHTML = aviso('erro', r.erro); return; }
    const t = r.total, l = r.assinantes || [];
    const nomePlano = { otto: 'Secretária', instagram: 'Instagram', whatsapp: 'WhatsApp', completo: 'Completo' };
    alvo.innerHTML = `<section class="aba">${topo}<div class="cabeca-aba"><div><p class="rotulo">Só a Ti Artes</p><h1>Estúdio · ${esc(nomeMes(r.mes))}</h1>
      <p class="lede">O que cada assinante paga e quanto a IA dele custou de verdade neste mês (medido em cada resposta). IA em reais a R$ 6,50 por dólar.</p></div></div>
      <div class="numeros"><div><b>${reais(t.receita)}</b><span>entra no mês</span></div><div><b>${reais(t.ia)}</b><span>IA de todos</span></div><div><b>${reais(t.lucro)}</b><span>sobra, depois de IA, taxa, imposto e casa</span></div></div>
      <div class="cartao rolagem"><table><thead><tr><th>Negócio</th><th>Plano</th><th>Situação</th><th class="n">Mensagens</th><th class="n">IA (US$)</th><th class="n">Paga</th><th class="n">Custo</th><th class="n">Sobra</th><th class="n">Margem</th></tr></thead><tbody>
      ${l.map((x) => `<tr><td><b>${esc(x.negocio)}</b><br><span class="dica">${esc(x.email)}${x.instagram ? ' · @' + esc(x.instagram) : ''}</span></td><td>${esc(nomePlano[x.plano] || '—')}</td>
        <td><span class="selo ${x.ativo ? 'ok' : 'desligado'}">${esc(x.status)}</span></td><td class="n">${inteiro(x.mensagens)}</td><td class="n">${x.ia_usd.toFixed(4)}</td>
        <td class="n">${reais(x.conta.receita)}</td><td class="n">${reais(x.conta.custo)}</td><td class="n">${reais(x.conta.lucro)}</td><td class="n">${x.conta.receita ? x.conta.margem + '%' : '—'}</td></tr>`).join('')}
      </tbody><tfoot><tr><td colspan="5">Total (${l.length} assinante${l.length === 1 ? '' : 's'})</td><td class="n">${reais(t.receita)}</td><td class="n">${reais(t.custo)}</td><td class="n">${reais(t.lucro)}</td><td></td></tr></tfoot></table></div>
      <p class="dica">Custo = IA + Stripe (cartão 3,99% + 0,7% + R$ 0,39; Pix 1,19%) + imposto (6%, suposição) + R$ 5 de casa (Supabase). Quem está em teste grátis entra com R$ 0.</p></section>`;
  }

  carrega().catch((e) => { if (e.message !== 'login') $('conteudo').innerHTML = aviso('erro', 'Não consegui carregar o painel. Recarregue a página.'); });
})();

/* =====================================================================
   MENU LATERAL DE VIDRO (skill menu-lateral-vidro). Igual ao da skill, com três acréscimos:
   ícones da Ti Artes, `noite` (o tema nasce escuro) e `aoUsuario`; `recolher(sim, guarda)` aceita não guardar
   (a gaveta do celular abre o menu sem mudar o que a pessoa escolheu no computador).
   ===================================================================== */
function criaMenuVidro(raiz, o) {
  'use strict';
  const IC = {
    lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>',
    grade: '<circle cx="7.5" cy="7.5" r="3.5"/><circle cx="16.5" cy="7.5" r="3.5"/><circle cx="7.5" cy="16.5" r="3.5"/><circle cx="16.5" cy="16.5" r="3.5"/>',
    carteira: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11" rx="2.5"/><path d="M16 13.5h.01"/>',
    agenda: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
    balao: '<path d="M12 4c4.7 0 8.5 3.2 8.5 7.2s-3.8 7.2-8.5 7.2c-1 0-2-.2-2.9-.4L4.5 20l1.2-3.9C4.3 14.8 3.5 13.1 3.5 11.2 3.5 7.2 7.3 4 12 4z"/>',
    barras: '<path d="M4 20h16M7 16v-5M12 16V6M17 16V9"/>',
    casa: '<path d="m3.5 11 8.5-7 8.5 7"/><path d="M6 9.5V20h12V9.5"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>',
    cerebro: '<path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3.2 3.2 0 0 0 7 18a2.7 2.7 0 0 0 5 1V6.5a2.5 2.5 0 0 0-3-2z"/><path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3.2 3.2 0 0 1 17 18a2.7 2.7 0 0 1-5 1"/>',
    nota: '<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M14.5 3.5V7.5h4M9 12h6M9 15.5h4"/>',
    caixa: '<path d="M3.5 13.5 6 5.5h12l2.5 8V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 13.5h5l1 2.5h5l1-2.5h5"/>',
    pasta: '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    elo: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    sair: '<path d="M14.5 4.5h3a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3"/><path d="M10 8l-4 4 4 4M6 12h9.5"/>',
    seta: '<path d="m6 15 6-6 6 6"/>', esquerda: '<path d="m15 5-7 7 7 7"/>', sobe: '<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>',
  };
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = (n, cls) => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${IC[n] || IC.grade}</svg>`;
  const iniciais = s => String(s || '').trim().split(/\s+/).slice(0, 2).map(p => p[0] || '').join('').toUpperCase();
  const CHAVE = o.chave || 'menu-vidro';
  const le = k => { try { return localStorage.getItem(CHAVE + ':' + k); } catch (e) { return null; } };
  const grava = (k, v) => { try { localStorage.setItem(CHAVE + ':' + k, v); } catch (e) { /* sem armazenamento: só não lembra */ } };

  let ativo = o.ativo || (o.menu[0] && o.menu[0].itens[0] && o.menu[0].itens[0].id) || '';
  const selo = it => it.selo != null ? `<span class="gs-selo${it.alerta ? ' alerta' : ''}">${esc(it.selo)}</span>` : (it.ponto ? '<span class="gs-selo ponto" aria-label="falta alimentar"></span>' : '');
  const item = it => `<div class="gs-grupo" data-busca="${esc(it.rotulo)}"><a class="gs-item" href="${esc(it.href || '#')}" data-id="${esc(it.id)}" data-rotulo="${esc(it.rotulo)}">${svg(it.icone)}<span class="gs-rot">${esc(it.rotulo)}</span>${selo(it)}</a></div>`;
  const u = o.usuario || {};
  raiz.innerHTML = `
    <div class="gs-topo"><span class="gs-logo">${o.logo ? `<img src="${esc(o.logo)}" alt="">` : esc(iniciais(o.marca).slice(0, 1))}</span>
      <span class="gs-marca"><b>${esc(o.marca)}</b><small>${esc(o.subtitulo || '')}</small></span></div>
    <button type="button" class="gs-recolher">${svg('esquerda')}</button>
    <div class="gs-busca"><button type="button" class="gs-busca-ic" aria-label="Buscar">${svg('lupa')}</button><input type="search" placeholder="Buscar no painel" aria-label="Buscar no painel"><kbd>⌘K</kbd></div>
    <nav class="gs-nav" aria-label="Seções do painel"><span class="gs-rastro"></span><span class="gs-pilula"></span>
      ${o.menu.map(s => `<div class="gs-bloco">${s.secao ? `<span class="gs-secao">${esc(s.secao)}</span>` : ''}${s.itens.map(item).join('')}</div>`).join('')}</nav>
    <button type="button" class="gs-noite" role="switch" aria-checked="false" aria-label="Modo noite" data-rotulo="Modo noite">${svg('sol')}<span class="gs-rot">Modo noite</span><span class="gs-chave"><i></i></span></button>
    ${u.nome ? `<button type="button" class="gs-usuario" data-rotulo="${esc(u.nome)}" aria-label="Conta de ${esc(u.nome)}"><span class="gs-avatar">${esc(iniciais(u.nome))}</span><span class="gs-quem"><b>${esc(u.nome)}</b><small>${esc(u.email || '')}</small></span>${svg('sobe', 'gs-seta')}</button>` : ''}`;

  const $ = s => raiz.querySelector(s), $$ = s => [...raiz.querySelectorAll(s)];
  const nav = $('.gs-nav'), pilula = $('.gs-pilula'), rastro = $('.gs-rastro'), busca = $('.gs-busca input'), recolher = $('.gs-recolher'), noite = $('.gs-noite');
  const dica = document.createElement('div'); dica.className = 'gs-dica'; dica.setAttribute('role', 'tooltip'); document.body.appendChild(dica);

  function poe(alvo, el) {
    if (!el || !el.offsetParent) { alvo.style.opacity = 0; return; }
    const n = nav.getBoundingClientRect(), r = el.getBoundingClientRect();
    alvo.style.width = r.width + 'px'; alvo.style.height = r.height + 'px';
    alvo.style.transform = `translate(${r.left - n.left + nav.scrollLeft}px, ${r.top - n.top + nav.scrollTop}px)`;
    alvo.style.opacity = 1;
  }
  const itemAtivo = () => $$('.gs-item').find(x => x.dataset.id === ativo);
  function mover(el) { poe(pilula, el); poe(rastro, el); }
  const repoe = () => mover(itemAtivo());
  function marca() { $$('.gs-item').forEach(x => { if (x.dataset.id === ativo) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); }); }
  function recolhe(sim, guarda = true) {
    raiz.dataset.recolhido = sim ? '1' : '0';
    recolher.setAttribute('aria-expanded', String(!sim));
    recolher.setAttribute('aria-label', sim ? 'Abrir o menu' : 'Recolher o menu');
    if (guarda) grava('recolhido', sim ? '1' : '0');
    tiraDica();
  }
  const fechado = () => raiz.dataset.recolhido === '1';
  function mostraDica(el) {
    if (!fechado() || !el.dataset.rotulo) return;
    const r = el.getBoundingClientRect(), p = raiz.getBoundingClientRect();
    dica.textContent = el.dataset.rotulo; dica.classList.add('on');
    dica.style.left = (p.right + 14) + 'px'; dica.style.top = (r.top + r.height / 2 - dica.offsetHeight / 2) + 'px';
  }
  function tiraDica() { dica.classList.remove('on'); }

  nav.addEventListener('pointerover', e => { const el = e.target.closest('.gs-item'); if (el) { mover(el); mostraDica(el); } });
  nav.addEventListener('focusin', e => { const el = e.target.closest('.gs-item'); if (el) { mover(el); mostraDica(el); } });
  nav.addEventListener('pointerleave', () => { repoe(); tiraDica(); });
  nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) { repoe(); tiraDica(); } });
  nav.addEventListener('scroll', () => { tiraDica(); repoe(); }, { passive: true });
  [noite, $('.gs-usuario')].filter(Boolean).forEach(el => { el.addEventListener('pointerenter', () => mostraDica(el)); el.addEventListener('pointerleave', tiraDica); el.addEventListener('focus', () => mostraDica(el)); el.addEventListener('blur', tiraDica); });

  nav.addEventListener('click', e => {
    const el = e.target.closest('.gs-item'); if (!el) return;
    if (el.getAttribute('href') === '#') e.preventDefault();
    if (el.dataset.id !== 'sair') { ativo = el.dataset.id; marca(); mover(el); }
    if (o.aoEscolher) o.aoEscolher(el.dataset.id);
  });
  recolher.addEventListener('click', () => recolhe(!fechado()));
  noite.addEventListener('click', () => {
    const liga = noite.getAttribute('aria-checked') !== 'true';
    noite.setAttribute('aria-checked', String(liga)); raiz.dataset.noite = liga ? '1' : '0'; grava('noite', liga ? '1' : '0');
    if (o.aoMudarNoite) o.aoMudarNoite(liga);
  });
  const us = $('.gs-usuario'); if (us && o.aoUsuario) us.addEventListener('click', o.aoUsuario);

  const focaBusca = () => { if (fechado()) recolhe(false); setTimeout(() => busca.focus(), 40); };
  $('.gs-busca-ic').addEventListener('click', focaBusca);
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); focaBusca(); } });
  const sem = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  busca.addEventListener('input', () => {
    const q = sem(busca.value.trim());
    $$('.gs-grupo').forEach(g => { g.hidden = !!q && !sem(g.dataset.busca).includes(q); });
    $$('.gs-bloco').forEach(b => { b.hidden = !b.querySelector('.gs-grupo:not([hidden])'); });
    repoe();
  });
  /* Enter na busca abre o primeiro que sobrou */
  busca.addEventListener('keydown', e => { if (e.key === 'Enter') { const el = $$('.gs-grupo:not([hidden]) .gs-item')[0]; if (el) el.click(); } });

  if (window.ResizeObserver) new ResizeObserver(repoe).observe(nav);
  raiz.addEventListener('transitionend', e => { if (e.target === raiz) repoe(); });

  const salvo = le('recolhido');
  const celular = matchMedia('(max-width: 860px)').matches;
  recolhe(celular ? false : (salvo != null ? salvo === '1' : !!o.recolhido), false);
  const noiteSalva = le('noite');
  if (noiteSalva === '1' || (noiteSalva == null && o.noite)) { noite.setAttribute('aria-checked', 'true'); raiz.dataset.noite = '1'; }
  /* a primeira vez a pílula nasce no lugar (sem vir deslizando do topo); depois das letras chegarem, mede de novo */
  marca();
  pilula.style.transition = rastro.style.transition = 'none'; repoe(); void pilula.offsetWidth; pilula.style.transition = rastro.style.transition = '';
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repoe);
  return { recolher: recolhe, ativar(id) { ativo = id; marca(); repoe(); } };
}
