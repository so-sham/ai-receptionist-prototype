const { chromium } = require('playwright');
const A = []; const ok=(c,m)=>A.push((c?'PASS  ':'FAIL  ')+m);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1400,height:1000} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/claude/proto/ai-receptionist-prototype.html');

  const run = async (id, mode) => p.evaluate(([id,mode])=>{
    CONFIG.mode = mode; selectScenario(id);
    while(idx < scn.turns.length) step();
    endCall();
    return {mode:effectiveMode(scn), body:$('#transcript').innerText,
            rec: STATE.emitted.find(r=>r.call_id==='call_'+id)};
  },[id,mode]);

  // 1 blackout beats direct write
  let r = await run('blackout','direct');
  ok(r.mode==='capture', 'blackout type forces capture-only even in direct mode  (got '+r.mode+')');

  // 2 practice-disabled write -> approval, not silent capture
  await p.evaluate(()=>{STATE.practiceCap.appointment_write=false;});
  r = await run('implant','direct');
  ok(r.mode==='approval', 'practice-disabled appointment_write -> approval flow  (got '+r.mode+')');
  await p.evaluate(()=>{STATE.practiceCap.appointment_write=true;});

  // 3 system-unsupported write -> capture & queue language, never a confirmation
  await p.evaluate(()=>{STATE.pms='eaglesoft';});
  r = await run('implant','direct');
  ok(r.mode==='unsupported', 'unsupported PMS write -> capture & queue  (got '+r.mode+')');
  ok(!/You're all set|You're booked/.test(r.body), 'no confirmation language promised on an unsupported write path');
  ok(/office will confirm by 9am/.test(r.body), 'caller is told the office will confirm');
  await p.evaluate(()=>{STATE.pms='opendental';});

  // 4 approval mode never reports booked at emission
  r = await run('implant','approval');
  ok(r.rec.outcome==='pending_approval', 'approval mode emits pending_approval, not booked  (got '+r.rec.outcome+')');
  const nApp = await p.evaluate(()=>STATE.approvals.length);
  ok(nApp>0, 'approval task created');

  // 5 emergency: verbatim config text, hold released, nothing booked
  const custom = 'GO TO THE EMERGENCY ROOM NOW AND CALL 512-555-0190.';
  await p.evaluate(t=>{CONFIG.emergency=t;}, custom);
  r = await run('emergency','direct');
  ok(r.body.includes(custom), 'emergency instruction delivered verbatim from practice config');
  ok(r.rec.outcome==='escalated_queue', 'emergency abandons the booking flow  (got '+r.rec.outcome+')');
  ok(/hold released/i.test(r.body), 'soft hold released mid-booking');

  // 6 redaction: full member id never in any rendered body
  await run('implant','approval');
  await p.evaluate(()=>{inspTab='note'; renderInspector();});
  let dom = await p.evaluate(()=>document.body.innerText);
  ok(!dom.includes('882410397') && !dom.includes('8 8 2 4 1 0 3 9 7'.replace(/ /g,'')), 'no full member ID in the comm log');
  ok(dom.includes('••••0397'), 'masked reference present');
  await p.click('.navbtn[data-view="approval"]');
  dom = await p.evaluate(()=>document.body.innerText);
  ok(!dom.includes('882410397'), 'no full member ID in the approval task body');

  // 7 minor: no identity retained, no booking
  r = await run('minor','direct');
  ok(r.rec.outcome!=='booked', 'no booking for a suspected minor');
  ok(/identity not retained|deleted/i.test(r.body), 'identity collected before recognition is deleted');

  // 8 vendor never counted as an opportunity
  r = await run('vendor','direct');
  ok(r.rec.is_opportunity===false, 'supply vendor using treatment vocabulary is not an opportunity');

  // 9 collision: conditional write fails rather than overwriting, one appointment
  r = await run('collision','approval');
  ok(/Conditional write fails rather than overwriting/i.test(r.body), 'conditional write fails rather than overwriting');
  ok((r.body.match(/idem_ab4419c0/g)||[]).length>=2 && /committed once/.test(r.body), 'retry reuses the idempotency key and commits once');

  // 10 human request escalates with a context card
  r = await run('bargein','direct');
  ok(/Context card/.test(r.body), 'escalation carries a context card');
  ok(r.rec.outcome==='escalated_live', 'explicit request for a human escalates live');

  console.log(A.join('\n'));
  console.log('\npage errors: '+ (errs.length?errs.join(' | '):'none'));
  console.log('FAILURES: '+A.filter(x=>x.startsWith('FAIL')).length);
  await b.close();
})();
