/* Ápice · figura anatômica dos exercícios (vista lateral, virada para a direita).
   Corpo cinza-claro com volume; o músculo que trabalha fica avermelhado (principal forte, auxiliar suave).
   Contrato: window.APICE_FIG = { viewBox, ground, draw(ex, pose) -> string SVG interno, mix(A,B,t) }
   ex usa: prim[], sec[] (nomes do mapa: quadriceps, gluteo, posterior, panturrilha, biceps, triceps,
   antebraco, ombro, peito, abdomen, obliquo, dorsal, lombar, trapezio) e kit[] (plate, db, bench, mat, cable). */
(function () {
  const L = { torso: 58, neck: 9, head: 11, ua: 27, fa: 25, th: 46, sh: 44, foot: 15 };
  const R = Math.PI / 180;
  const dir = a => [Math.sin(a * R), Math.cos(a * R)];
  const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
  const f1 = n => (Math.round(n * 10) / 10).toString();

  function solve(P) {
    let hip, knee, ankle;
    if (P.anchor) { ankle = P.anchor; knee = add(ankle, dir(P.sh), -L.sh); hip = add(knee, dir(P.th), -L.th); }
    else { hip = P.hip; knee = add(hip, dir(P.th), L.th); ankle = add(knee, dir(P.sh), L.sh); }
    const knee2 = add(hip, dir(P.th2 ?? P.th), L.th), ankle2 = add(knee2, dir(P.sh2 ?? P.sh), L.sh);
    const fa1 = P.footA ?? 90, fa2 = P.footA2 ?? P.footA ?? 90;
    const u = dir(P.torso), sho = add(hip, u, L.torso);
    const n = [-u[1], u[0]];
    const head = add(sho, u, L.neck + L.head);
    const rot = P.rel ? P.torso - 180 : 0;
    const elb = add(sho, dir(P.ua + rot), L.ua), wr = add(elb, dir(P.fa + rot), L.fa);
    const elb2 = add(sho, dir((P.ua2 ?? P.ua) + rot), L.ua), wr2 = add(elb2, dir((P.fa2 ?? P.fa) + rot), L.fa);
    return { hip, knee, ankle, knee2, ankle2, fa1, fa2, sho, head, elb, wr, elb2, wr2, u, n };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function mix(A, B, t) {
    const o = {};
    for (const k in A) { const a = A[k], b = B[k] ?? a; o[k] = Array.isArray(a) ? [lerp(a[0], b[0], t), lerp(a[1], b[1], t)] : typeof a === 'number' ? lerp(a, b, t) : a; }
    return o;
  }

  /* ---------- curvas suaves ---------- */
  function smooth(pts) { // Catmull-Rom fechado -> Bézier
    const n = pts.length; let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return d + 'Z';
  }
  function frame(a, b, torso) {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, d = [dx / len, dy / len];
    let f = [d[1], -d[0]]; if (torso) f = [-f[0], -f[1]];
    return { d, f, len };
  }
  const at = (a, fr, t) => [a[0] + fr.d[0] * fr.len * t, a[1] + fr.d[1] * fr.len * t];
  function wid(st, t) { // estações [t, frente, trás]
    if (t <= st[0][0]) return [st[0][1], st[0][2]];
    for (let i = 1; i < st.length; i++) if (t <= st[i][0]) { const a = st[i - 1], b = st[i], k = (t - a[0]) / (b[0] - a[0]); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
    const z = st[st.length - 1]; return [z[1], z[2]];
  }
  const TS = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1];
  function segPath(a, b, st, torso) {
    const fr = frame(a, b, torso), F = [], B = [];
    TS.forEach(t => { const [wf, wb] = wid(st, t), p = at(a, fr, t); F.push(add(p, fr.f, wf)); B.push(add(p, fr.f, -wb)); });
    const [f0, b0] = wid(st, 0), [f9, b9] = wid(st, 1);
    return smooth([...F, add(b, fr.d, (f9 + b9) * .42), ...B.reverse(), add(a, fr.d, -(f0 + b0) * .42)]);
  }
  function region(a, b, st, torso, side, t0, t1, depth) {
    const fr = frame(a, b, torso), O = [], I = [], N = 8;
    for (let i = 0; i <= N; i++) {
      const t = t0 + (t1 - t0) * i / N, pr = Math.pow(Math.sin(Math.PI * i / N), .7), [wf, wb] = wid(st, Math.min(1, Math.max(0, t))), p = at(a, fr, t);
      if (side === 'c') { O.push(add(p, fr.f, wf * .85 * pr)); I.push(add(p, fr.f, -wb * .85 * pr)); }
      else { const s = side === 'f' ? 1 : -1, w = side === 'f' ? wf : wb; O.push(add(p, fr.f, s * w * .94)); I.push(add(p, fr.f, s * w * (.94 - depth * pr))); }
    }
    return smooth([...O, ...I.reverse()]);
  }

  /* ---------- medidas do corpo (largura para frente / para trás) ---------- */
  const ST = {
    torso: [[0, 12, 12.5], [.2, 11, 11.5], [.4, 11, 10.5], [.62, 14, 12.5], [.8, 16.5, 14], [.93, 13.5, 12.5], [1, 9, 9.5]],
    thigh: [[0, 11.5, 12], [.28, 12.5, 11.5], [.6, 10.5, 9.2], [.88, 7.2, 6.6], [1, 6.4, 6]],
    shin: [[0, 6, 6.2], [.22, 5.4, 9.6], [.45, 4.8, 8.2], [.75, 3.6, 4.4], [1, 3.3, 3.3]],
    ua: [[0, 8.2, 8.2], [.35, 8, 7.8], [.75, 6, 5.6], [1, 4.8, 4.8]],
    fa: [[0, 5.2, 5.2], [.25, 5.8, 5.6], [.7, 3.9, 3.8], [1, 3.1, 3.1]],
    neck: [[0, 6, 6.5], [1, 4.8, 5.2]]
  };
  /* músculo -> onde aparece no corpo: [parte, lado, t0, t1, profundidade] */
  const MUS = {
    quadriceps: [['thigh', 'f', .06, .9, 1.05]], posterior: [['thigh', 'b', .1, .86, 1]],
    panturrilha: [['shin', 'b', .06, .62, 1.1]], biceps: [['ua', 'f', .14, .86, 1]], triceps: [['ua', 'b', .08, .86, 1]],
    antebraco: [['fa', 'c', .04, .62, 0]], peito: [['torso', 'f', .6, .93, 1.05]], abdomen: [['torso', 'f', .18, .58, .8]],
    obliquo: [['torso', 'c', .22, .55, 0]], dorsal: [['torso', 'b', .45, .9, 1]], lombar: [['torso', 'b', .1, .46, .85]],
    trapezio: [['torso', 'b', .84, 1.02, .9]]
  };
  const SKIN = 'url(#apPele)', SKINF = 'url(#apPeleF)', LINE = '#8F897F', LINEF = '#6F6A62';
  const RED = '#E5484D', REDF = '#B23A3E';
  const DEFS = `<defs>
<linearGradient id="apPele" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F1EC"/><stop offset=".55" stop-color="#E2DDD5"/><stop offset="1" stop-color="#C9C2B7"/></linearGradient>
<linearGradient id="apPeleF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9B3AA"/><stop offset="1" stop-color="#958F86"/></linearGradient>
<radialGradient id="apAnilha" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3A3E46"/><stop offset="1" stop-color="#1D2025"/></radialGradient>
<filter id="apBrilho" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>
<filter id="apSombra" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>`;

  function draw(ex, P) {
    const J = solve(P), prim = ex.prim || [], sec = ex.sec || [], kit = ex.kit || [];
    const nivel = m => prim.includes(m) ? 1 : sec.includes(m) ? .45 : 0;
    let s = DEFS;
    // chão e aparelhos de fundo
    const groundX = (J.ankle[0] + J.ankle2[0]) / 2;
    s += `<ellipse cx="${f1(groundX + 4)}" cy="194" rx="${kit.includes('bench') || kit.includes('mat') ? 70 : 30}" ry="4" fill="#000" opacity=".45" filter="url(#apSombra)"/>`;
    if (kit.includes('bench')) s += `<rect x="64" y="140" width="102" height="10" rx="4" fill="#2E3138" stroke="#40444C"/><rect x="74" y="150" width="7" height="42" rx="2" fill="#26292F"/><rect x="149" y="150" width="7" height="42" rx="2" fill="#26292F"/>`;
    if (kit.includes('mat')) s += `<rect x="0" y="188" width="232" height="4" rx="2" fill="#2A2D33"/>`;
    if (kit.includes('cable')) s += `<rect x="204" y="-30" width="8" height="222" rx="3" fill="#24272D"/><circle cx="198" cy="-20" r="7" fill="#2E3138" stroke="#5A5F68" stroke-width="2"/><line x1="196" y1="-13" x2="${f1(J.wr[0])}" y2="${f1(J.wr[1])}" stroke="#7A7F88" stroke-width="1.4"/>`;

    const part = (a, b, st, torso, far, musKey) => {
      let o = `<path d="${segPath(a, b, st, torso)}" fill="${far ? SKINF : SKIN}" stroke="${far ? LINEF : LINE}" stroke-width=".9" stroke-linejoin="round"/>`;
      // sombra de volume no lado de trás
      o += `<path d="${region(a, b, st, torso, 'b', .05, .95, .55)}" fill="#000" opacity="${far ? .1 : .07}"/>`;
      for (const m in MUS) for (const r of MUS[m]) if (r[0] === musKey) {
        const v = nivel(m); if (!v) continue;
        o += `<path d="${region(a, b, st, torso, r[1], r[2], r[3], r[4])}" fill="${far ? REDF : RED}" opacity="${f1(v * (far ? .8 : .92))}" filter="url(#apBrilho)"/>`;
      }
      return o;
    };
    const foot = (ank, fa, far) => {
      const fd = dir(fa), dn = [-fd[1], fd[0]], up = [-dn[0], -dn[1]];
      const pts = [add(add(ank, fd, -4.5), dn, 2.5), add(add(ank, up, 3.4), fd, -2), add(add(ank, up, 2.4), fd, 6), add(add(ank, fd, L.foot), up, .6), add(add(ank, fd, L.foot + 2.5), dn, 1.6), add(add(ank, fd, 8), dn, 3.4), add(ank, dn, 3.6)];
      return `<path d="${smooth(pts)}" fill="${far ? '#7C776F' : '#D8D3CB'}" stroke="${far ? LINEF : LINE}" stroke-width=".9"/>`;
    };
    const hand = (w, e, far) => { const d = frame(e, w).d; const c = add(w, d, 2.2); return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="4" ry="4.6" fill="${far ? SKINF : SKIN}" stroke="${far ? LINEF : LINE}" stroke-width=".9"/>`; };
    const sh2 = add(J.sho, J.n, -2.5);

    // lado de longe (braço e perna de trás, mais escuros)
    s += part(J.hip, J.knee2, ST.thigh, false, true, 'thigh') + part(J.knee2, J.ankle2, ST.shin, false, true, 'shin') + foot(J.ankle2, J.fa2, true);
    s += part(sh2, add(J.elb2, J.n, -2.5), ST.ua, false, true, 'ua') + part(add(J.elb2, J.n, -2.5), add(J.wr2, J.n, -2.5), ST.fa, false, true, 'fa') + hand(add(J.wr2, J.n, -2.5), add(J.elb2, J.n, -2.5), true);

    // glúteo (volume atrás do quadril)
    const gc = add(add(J.hip, J.n, -6), J.u, 3), gv = nivel('gluteo');
    s += `<ellipse cx="${f1(gc[0])}" cy="${f1(gc[1])}" rx="9.5" ry="11.5" transform="rotate(${f1(-Math.atan2(J.u[0], J.u[1]) / R)} ${f1(gc[0])} ${f1(gc[1])})" fill="${SKIN}" stroke="${LINE}" stroke-width=".9"/>`;
    // perna da frente
    s += part(J.hip, J.knee, ST.thigh, false, false, 'thigh') + part(J.knee, J.ankle, ST.shin, false, false, 'shin') + foot(J.ankle, J.fa1, false);

    // tronco
    s += part(J.hip, J.sho, ST.torso, true, false, 'torso');
    if (gv) s += `<ellipse cx="${f1(gc[0] - J.n[0] * 1.5)}" cy="${f1(gc[1] - J.n[1] * 1.5)}" rx="7" ry="9" transform="rotate(${f1(-Math.atan2(J.u[0], J.u[1]) / R)} ${f1(gc[0])} ${f1(gc[1])})" fill="${RED}" opacity="${f1(gv * .92)}" filter="url(#apBrilho)"/>`;
    // linhas do peito e do abdômen
    const pc = add(add(J.hip, J.u, L.torso * .6), J.n, 9), pe = add(add(J.hip, J.u, L.torso * .64), J.n, 2);
    s += `<path d="M${f1(pc[0])},${f1(pc[1])} Q${f1(pe[0] + J.n[0] * 2)},${f1(pe[1] + J.n[1] * 2)} ${f1(pe[0])},${f1(pe[1])}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width=".9"/>`;
    // pescoço e cabeça
    const nk = add(J.sho, J.u, L.neck + 3);
    s += part(add(J.sho, J.u, -2), nk, ST.neck, true, false, 'neck');
    const hc = J.head, jaw = add(add(hc, J.u, -5.5), J.n, 4.2), nose = add(add(hc, J.n, 10.2), J.u, .5);
    s += `<path d="${smooth([add(hc, J.u, 10.5), add(add(hc, J.u, 7.5), J.n, 7.5), nose, add(add(hc, J.n, 8.5), J.u, -3), add(jaw, J.n, 3), add(jaw, J.u, -3.2), add(add(hc, J.u, -7), J.n, -4), add(add(hc, J.n, -10), J.u, 1), add(add(hc, J.u, 7.5), J.n, -7.5)])}" fill="${SKIN}" stroke="${LINE}" stroke-width=".9"/>`;
    const ear = add(hc, J.n, -1.5);
    s += `<ellipse cx="${f1(ear[0])}" cy="${f1(ear[1])}" rx="1.8" ry="2.8" transform="rotate(${f1(-Math.atan2(J.u[0], J.u[1]) / R)} ${f1(ear[0])} ${f1(ear[1])})" fill="#000" opacity=".12"/>`;
    // ombro (deltoide)
    const dv = nivel('ombro');
    s += `<ellipse cx="${f1(J.sho[0])}" cy="${f1(J.sho[1])}" rx="8" ry="9" transform="rotate(${f1(-Math.atan2(J.elb[0] - J.sho[0], J.elb[1] - J.sho[1]) / R)} ${f1(J.sho[0])} ${f1(J.sho[1])})" fill="${SKIN}" stroke="${LINE}" stroke-width=".9"/>`;
    if (dv) s += `<ellipse cx="${f1(J.sho[0])}" cy="${f1(J.sho[1])}" rx="6.2" ry="7.2" transform="rotate(${f1(-Math.atan2(J.elb[0] - J.sho[0], J.elb[1] - J.sho[1]) / R)} ${f1(J.sho[0])} ${f1(J.sho[1])})" fill="${RED}" opacity="${f1(dv * .92)}" filter="url(#apBrilho)"/>`;
    // braço da frente
    s += part(add(J.sho, J.u, -2), J.elb, ST.ua, false, false, 'ua') + part(J.elb, J.wr, ST.fa, false, false, 'fa') + hand(J.wr, J.elb, false);

    // pesos na frente
    if (kit.includes('plate')) s += `<circle cx="${f1(J.wr[0])}" cy="${f1(J.wr[1])}" r="19" fill="url(#apAnilha)" stroke="#4E535C" stroke-width="1.6"/><circle cx="${f1(J.wr[0])}" cy="${f1(J.wr[1])}" r="12.5" fill="none" stroke="#454A53" stroke-width="1"/><circle cx="${f1(J.wr[0])}" cy="${f1(J.wr[1])}" r="3.6" fill="#9AA0A9"/>`;
    if (kit.includes('db')) s += `<circle cx="${f1(J.wr[0])}" cy="${f1(J.wr[1])}" r="8.5" fill="url(#apAnilha)" stroke="#4E535C" stroke-width="1.4"/><circle cx="${f1(J.wr[0])}" cy="${f1(J.wr[1])}" r="2.4" fill="#9AA0A9"/>`;
    return s;
  }

  window.APICE_FIG = { viewBox: '-5 -32 250 228', ground: 192, draw, mix };
})();
