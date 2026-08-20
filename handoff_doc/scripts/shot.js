const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto('file:///home/claude/proto/ai-receptionist-prototype.html');
  await p.waitForTimeout(400);

  // play the implant scenario at 3x
  await p.click('#speedSeg button[data-speed="3"]');
  await p.click('#btnPlay');
  await p.waitForTimeout(8000);
  await p.screenshot({ path: 'shots/1-call.png', fullPage: false });
  await p.click('#inspTabs button[data-tab="note"]');
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/2-note.png' });
  await p.click('#inspTabs button[data-tab="latency"]');
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/3-lat.png' });

  for (const v of ['approval','review','config','capability','dashboard','eval']) {
    await p.click(`.navbtn[data-view="${v}"]`);
    await p.waitForTimeout(350);
    await p.screenshot({ path: `shots/${v}.png`, fullPage: true });
  }
  console.log('ERRORS:', JSON.stringify(errs, null, 1));
  await b.close();
})();
