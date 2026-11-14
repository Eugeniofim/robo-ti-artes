/* Onde a plataforma fala com a nuvem (14/11/2026). A chave anon do Supabase é pública por natureza: ela só deixa
   o navegador ENTRAR (login); as tabelas têm RLS e quem lê e grava é a função `robo`, do lado do servidor.
   Rodando no Mac (localhost), tudo vai para a prévia local com o mundo de mentira (testes/robo-local.ts). */
window.ROBO = (function () {
  /* a prévia com o mundo de mentira roda na porta 8979 (testes/robo-local.ts); qualquer outro endereço fala com a nuvem */
  const falso = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port === '8979';
  if (falso) return { funcao: location.origin + '/functions/v1/robo', auth: location.origin, anon: 'anon-falso', local: true };
  return {
    funcao: 'https://uopfqlogjzuqpabptxkb.supabase.co/functions/v1/robo',
    auth: 'https://uopfqlogjzuqpabptxkb.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcGZxbG9nanp1cXBhYnB0eGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxODAyNTYsImV4cCI6MjEwMjc1NjI1Nn0.SnJWAidcHAZPcUvmxFoH4m2Y-gK6dnrgxogj58Vqho8',
    local: false,
  };
})();
