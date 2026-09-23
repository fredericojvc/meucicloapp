async function check() {
  const res = await fetch('https://meuciclo.app.br/');
  const html = await res.text();
  console.log('Live domain HTTP status:', res.status);
  console.log('Navbar link present:', html.includes('Concursos &amp; Provas em Destaque'));
  console.log('Section #concursos-destaque present:', html.includes('id="concursos-destaque"'));
  console.log('News JSON accessible:', (await fetch('https://meuciclo.app.br/api/concursos-news.json')).status === 200);
}
check();
