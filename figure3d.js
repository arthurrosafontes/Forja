'use strict';
/* =========================================================
   Forja — personagem 3D realista (Three.js)
   Usa o mesmo esqueleto das animações (poses → pontos 3D) e
   monta um corpo atlético com músculos modelados, luz e sombra.
   ========================================================= */
const ANGLES3D = [
  { n: '3/4', az: 38, el: 16 },
  { n: 'Diagonal direita · de cima', az: 45, el: 42 },
  { n: 'Diagonal esquerda · de cima', az: 135, el: 42 },
  { n: 'Lateral direita', az: 0, el: 6 },
  { n: 'Lateral esquerda', az: 180, el: 6 },
  { n: 'Frente', az: 90, el: 6 },
  { n: 'Costas', az: -90, el: 10 },
  { n: 'De cima', az: 90, el: 80 },
];

const Fig3D = (function () {
  const T3 = window.THREE;
  let ok = false;
  try { const c = document.createElement('canvas'); ok = !!(T3 && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { ok = false; }
  if (!ok) return { ok: false, fillSnaps() {}, mount() { return false; }, setAngle() {}, setSlow() {} };
  if (T3.ColorManagement) T3.ColorManagement.legacyMode = false;
  const V = T3.Vector3;
  const P = (p) => new V(p[0] - 60, 108 - p[1], p[2]);
  const tmpS = new V();

  /* ---------- materiais ---------- */
  const std = (color, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0 }, o));
  const MAT = {
    skin: std('#c68b62', { roughness: 0.58 }),
    muscle: std('#c2865d', { roughness: 0.55 }),
    prim: std('#ff3a12', { roughness: 0.42, emissive: '#5c0b00', emissiveIntensity: 0.45 }),
    sec: std('#ff9a52', { roughness: 0.5, emissive: '#3b1600', emissiveIntensity: 0.25 }),
    shorts: std('#1f2228', { roughness: 0.85 }),
    shirtTrim: std('#ff7a1a', { roughness: 0.6 }),
    shoe: std('#2c3037', { roughness: 0.55 }),
    sole: std('#eeeeee', { roughness: 0.7 }),
    hair: std('#24170f', { roughness: 0.95 }),
    eye: std('#121212', { roughness: 0.3 }),
    lip: std('#a8604a', { roughness: 0.6 }),
    metal: std('#b4b9bf', { roughness: 0.28, metalness: 0.85 }),
    plate: std('#1c1c1f', { roughness: 0.5, metalness: 0.25 }),
    plateRim: std('#ff7a1a', { roughness: 0.5 }),
    pad: std('#2b2b30', { roughness: 0.75 }),
    frame: std('#5a5f66', { roughness: 0.4, metalness: 0.6 }),
    cable: std('#d7dade', { roughness: 0.4, metalness: 0.4 }),
  };

  /* ---------- geometrias base ---------- */
  const SPH = new T3.SphereGeometry(1, 30, 22);
  const CYL = new T3.CylinderGeometry(1, 1, 1, 28, 1);
  const BOX = new T3.BoxGeometry(1, 1, 1);
  const lathe = (prof) => new T3.LatheGeometry(prof.map(([t, r]) => new T3.Vector2(r, t)), 30);
  const GEO = {
    ua: lathe([[0, 3.2], [0.12, 3.25], [0.5, 2.95], [0.85, 2.4], [1, 2.25]]),
    fa: lathe([[0, 2.3], [0.18, 2.75], [0.45, 2.45], [0.8, 1.75], [1, 1.5]]),
    th: lathe([[0, 5.5], [0.25, 5.15], [0.6, 4.4], [0.88, 3.3], [1, 3.05]]),
    sh: lathe([[0, 3.05], [0.18, 3.2], [0.4, 2.95], [0.75, 2.05], [1, 1.75]]),
    shortLeg: lathe([[0, 6.0], [0.3, 5.55], [0.34, 5.45]]),
  };

  /* ---------- utilidades de matriz ---------- */
  function basisFrom(Y, hint) {
    const y = Y.clone().normalize();
    let z = hint.clone().sub(y.clone().multiplyScalar(hint.dot(y)));
    if (z.lengthSq() < 1e-4) { z = new V(1, 0, 0).sub(y.clone().multiplyScalar(y.x)); }
    z.normalize();
    const x = new V().crossVectors(y, z).normalize();
    return { x, y, z };
  }
  function setM(m, B, sx, sy, sz, pos) {
    const f = (m.userData && m.userData.hlS) || 1;
    if (f !== 1) { sx *= f; sy *= f; sz *= f * 1.12; }
    m.matrix.makeBasis(B.x, B.y, B.z);
    m.matrix.scale(tmpS.set(sx, sy, sz));
    m.matrix.setPosition(pos);
    m.matrixWorldNeedsUpdate = true;
  }

  /* ---------- corpo ---------- */
  function makeHuman(group) {
    const meshes = [];
    const mk = (geo, mat, tag) => {
      const m = new T3.Mesh(geo, mat);
      m.castShadow = true; m.receiveShadow = true; m.matrixAutoUpdate = false;
      m.userData = { tag: tag || null, base: mat };
      group.add(m); meshes.push(m); return m;
    };
    const H = {};
    // tronco
    H.rib = mk(SPH, MAT.skin); H.girdle = mk(SPH, MAT.skin); H.waist = mk(SPH, MAT.skin); H.pelvis = mk(SPH, MAT.shorts);
    H.band = mk(SPH, MAT.shirtTrim);
    H.pec = [mk(SPH, MAT.muscle, 'peitoral'), mk(SPH, MAT.muscle, 'peitoral')];
    H.abs = [0, 1, 2, 3, 4, 5].map(() => mk(SPH, MAT.muscle, 'abdomen'));
    H.absLow = mk(SPH, MAT.muscle, 'abdomen');
    H.obl = [mk(SPH, MAT.muscle, 'obliquos'), mk(SPH, MAT.muscle, 'obliquos')];
    H.ser = [mk(SPH, MAT.muscle, 'peitoral'), mk(SPH, MAT.muscle, 'peitoral')];
    H.lat = [mk(SPH, MAT.muscle, 'dorsais'), mk(SPH, MAT.muscle, 'dorsais')];
    H.trap = mk(SPH, MAT.muscle, 'trapezio'); H.trapLow = mk(SPH, MAT.muscle, 'trapezio');
    H.low = [mk(SPH, MAT.muscle, 'lombares'), mk(SPH, MAT.muscle, 'lombares')];
    H.glu = [mk(SPH, MAT.shorts, 'gluteos'), mk(SPH, MAT.shorts, 'gluteos')];
    H.abd = [mk(SPH, MAT.shorts, 'abdutores'), mk(SPH, MAT.shorts, 'abdutores')];
    // cabeça
    H.neck = mk(CYL, MAT.skin); H.scm = [mk(SPH, MAT.skin), mk(SPH, MAT.skin)];
    H.head = mk(SPH, MAT.skin); H.jaw = mk(SPH, MAT.skin); H.hair = mk(SPH, MAT.hair);
    H.nose = mk(SPH, MAT.skin); H.ear = [mk(SPH, MAT.skin), mk(SPH, MAT.skin)];
    H.eye = [mk(SPH, MAT.eye), mk(SPH, MAT.eye)]; H.brow = [mk(SPH, MAT.hair), mk(SPH, MAT.hair)]; H.lip = mk(SPH, MAT.lip);
    // membros
    H.side = ['R', 'L'].map(() => ({
      ua: mk(GEO.ua, MAT.skin), fa: mk(GEO.fa, MAT.skin), th: mk(GEO.th, MAT.skin), sh: mk(GEO.sh, MAT.skin), sl: mk(GEO.shortLeg, MAT.shorts),
      elb: mk(SPH, MAT.skin), wri: mk(SPH, MAT.skin), kne: mk(SPH, MAT.skin), ank: mk(SPH, MAT.skin),
      hand: mk(SPH, MAT.skin), thumb: mk(SPH, MAT.skin), shoe: mk(SPH, MAT.shoe), sole: mk(SPH, MAT.sole),
      delt: mk(SPH, MAT.muscle, 'ombros'), deltR: mk(SPH, MAT.muscle, 'ombros'), bic: mk(SPH, MAT.muscle, 'biceps'), tri: mk(SPH, MAT.muscle, 'triceps'), tri2: mk(SPH, MAT.muscle, 'triceps'),
      fo1: mk(SPH, MAT.muscle, 'antebracos'), fo2: mk(SPH, MAT.muscle, 'antebracos'),
      quad: mk(SPH, MAT.muscle, 'quadriceps'), vmo: mk(SPH, MAT.muscle, 'quadriceps'), vl: mk(SPH, MAT.muscle, 'quadriceps'),
      ham: mk(SPH, MAT.muscle, 'isquiotibiais'), add: mk(SPH, MAT.shorts, 'adutores'),
      gas1: mk(SPH, MAT.muscle, 'panturrilhas'), gas2: mk(SPH, MAT.muscle, 'panturrilhas'), tib: mk(SPH, MAT.skin),
    }));

    function setMuscles(ex) {
      const pr = new Set(ex.m || []), sc = new Set(ex.s || []);
      meshes.forEach((m) => {
        const t = m.userData.tag;
        m.material = t && pr.has(t) ? MAT.prim : t && sc.has(t) ? MAT.sec : m.userData.base;
        m.userData.hlS = t && pr.has(t) ? 1.13 : t && sc.has(t) ? 1.06 : 1;
      });
    }

    function update(J, prone) {
      const R = J.R, L = J.L;
      const c = (o) => ({ sh: P(o.sh), el: P(o.el), ha: P(o.ha), hip: P(o.hip), kn: P(o.kn), ft: P(o.ft), to: P(o.to) });
      const S = [c(R), c(L)];
      const head = P(J.head);
      const shM = S[0].sh.clone().add(S[1].sh).multiplyScalar(0.5);
      const hipM = S[0].hip.clone().add(S[1].hip).multiplyScalar(0.5);
      const up = shM.clone().sub(hipM); const Ls = up.length(); up.normalize();
      // frente do tronco: perpendicular à coluna, no plano sagital
      let fwd = new V(up.y, -up.x, 0); if (fwd.lengthSq() < 1e-4) fwd.set(1, 0, 0);
      fwd.normalize(); if (prone) fwd.multiplyScalar(-1);
      const TB = basisFrom(up, fwd); // x lateral, y para cima, z para frente
      const k = Ls / 31;
      const tp = (x, y, z) => shM.clone().add(TB.x.clone().multiplyScalar(x)).add(TB.y.clone().multiplyScalar(y * k)).add(TB.z.clone().multiplyScalar(z));
      const tor = (m, x, y, z, rx, ry, rz, tilt = 0) => {
        let B = TB;
        if (tilt) { const ct = Math.cos(tilt), st = Math.sin(tilt); B = { x: TB.x.clone().multiplyScalar(ct).add(TB.y.clone().multiplyScalar(st)), y: TB.y.clone().multiplyScalar(ct).sub(TB.x.clone().multiplyScalar(st)), z: TB.z }; }
        setM(m, B, rx, ry * k, rz, tp(x, y, z));
      };
      // tronco base (formato em V)
      tor(H.girdle, 0, -1.2, -0.6, 10.6, 3.4, 4.6);
      tor(H.rib, 0, -8.5, 0, 9.3, 10.8, 5.7);
      tor(H.waist, 0, -19.5, 0.1, 7.1, 8.6, 4.7);
      tor(H.pelvis, 0, -27.8, -0.4, 7.7, 5.6, 5.0);
      tor(H.band, 0, -24.4, -0.2, 7.35, 1.1, 4.85);
      [-1, 1].forEach((sx, i) => {
        tor(H.pec[i], sx * 4.5, -5.4, 3.75, 4.9, 3.5, 2.05, sx * 0.14);
        tor(H.ser[i], sx * 7.5, -11.5, 2.1, 1.5, 3.4, 1.7, sx * 0.3);
        tor(H.obl[i], sx * 5.8, -18.6, 1.4, 1.8, 5.1, 2.5, sx * -0.1);
        tor(H.lat[i], sx * 6.3, -10.5, -1.6, 2.8, 8.0, 2.4, sx * 0.28);
        tor(H.low[i], sx * 1.8, -21.5, -3.6, 1.5, 5.2, 1.15);
        tor(H.glu[i], sx * 3.8, -29.4, -2.5, 4.1, 4.4, 3.1);
        tor(H.abd[i], sx * 6.6, -27, -0.6, 2.2, 3.1, 2.4);
      });
      [[-13.2, 4.35], [-16.7, 4.25], [-20.1, 4.0]].forEach(([y, z], r) => [-1, 1].forEach((sx, i) => tor(H.abs[r * 2 + i], sx * 1.8, y, z - 0.1, 1.7, 1.75, 0.78)));
      tor(H.absLow, 0, -23.6, 3.7, 3.1, 2.7, 1.2);
      tor(H.trap, 0, 0.9, -1.4, 6.6, 3.0, 2.7);
      tor(H.trapLow, 0, -8, -4.3, 3.0, 6.0, 1.1);

      // pescoço e cabeça
      const nb = tp(0, 1.2, -0.4);
      const hy = head.clone().sub(nb).normalize();
      const HB = basisFrom(hy, TB.z);
      const nTop = head.clone().sub(hy.clone().multiplyScalar(3.2));
      const nMid = nb.clone().add(nTop).multiplyScalar(0.5);
      setM(H.neck, basisFrom(nTop.clone().sub(nb), TB.z), 2.75, nTop.distanceTo(nb) + 1.5, 2.75, nMid);
      [-1, 1].forEach((sx, i) => setM(H.scm[i], basisFrom(nTop.clone().sub(nb), TB.z), 0.9, 3.2, 0.9, nMid.clone().add(HB.x.clone().multiplyScalar(sx * 1.5)).add(HB.z.clone().multiplyScalar(1.2))));
      const hp = (x, y, z) => head.clone().add(HB.x.clone().multiplyScalar(x)).add(HB.y.clone().multiplyScalar(y)).add(HB.z.clone().multiplyScalar(z));
      setM(H.head, HB, 5.0, 6.0, 5.6, head);
      setM(H.jaw, HB, 3.9, 3.3, 4.2, hp(0, -2.7, 1.0));
      setM(H.hair, HB, 5.25, 5.3, 5.55, hp(0, 1.25, -0.8));
      setM(H.nose, HB, 0.7, 1.15, 0.85, hp(0, -0.6, 5.45));
      setM(H.lip, HB, 1.3, 0.45, 0.5, hp(0, -2.9, 4.55));
      [-1, 1].forEach((sx, i) => {
        setM(H.ear[i], HB, 0.8, 1.55, 1.15, hp(sx * 5.0, -0.3, -0.3));
        setM(H.eye[i], HB, 0.62, 0.48, 0.4, hp(sx * 1.85, 0.75, 4.85));
        setM(H.brow[i], HB, 1.25, 0.32, 0.5, hp(sx * 1.85, 1.85, 4.85));
      });

      // membros
      S.forEach((j, i) => {
        const M = H.side[i];
        const med = hipM.clone().sub(j.hip); if (med.lengthSq() < 1e-4) med.copy(TB.x); med.normalize();
        const seg = (mesh, A, B2, rl = 1, ra = 1) => {
          const u = B2.clone().sub(A); const len = u.length() || 0.01;
          let hint = fwd.clone(); if (Math.abs(hint.dot(u.clone().normalize())) > 0.94) hint = up.clone();
          const Bs = basisFrom(u, hint);
          setM(mesh, Bs, rl, len, ra, A);
          return { A, u: u.normalize(), len, B: Bs };
        };
        const on = (mesh, sg, t, offA, offM, rl, rlen, ra) => {
          const mperp = med.clone().sub(sg.u.clone().multiplyScalar(med.dot(sg.u))).normalize();
          const pos = sg.A.clone().add(sg.u.clone().multiplyScalar(t * sg.len)).add(sg.B.z.clone().multiplyScalar(offA)).add(mperp.multiplyScalar(offM));
          setM(mesh, sg.B, rl, rlen * sg.len, ra, pos);
        };
        const ua = seg(M.ua, j.sh, j.el), fa = seg(M.fa, j.el, j.ha);
        const th = seg(M.th, j.hip, j.kn, 1.0, 0.95), sh = seg(M.sh, j.kn, j.ft);
        setM(M.sl, th.B, 1, th.len, 0.97, j.hip);
        const ball = (m, p, r) => setM(m, TB, r, r, r, p);
        ball(M.elb, j.el, 2.25); ball(M.wri, j.ha, 1.5); ball(M.kne, j.kn, 3.05); ball(M.ank, j.ft, 1.75);
        // músculos dos braços
        on(M.delt, ua, 0.07, 0.35, -0.9, 3.3, 0.29, 3.5);
        on(M.deltR, ua, 0.1, -1.6, -0.6, 2.8, 0.26, 2.6);
        on(M.bic, ua, 0.56, 1.25, 0, 1.8, 0.24, 1.65);
        on(M.tri, ua, 0.42, -1.45, 0.4, 1.95, 0.27, 1.65);
        on(M.tri2, ua, 0.5, -1.15, -1.0, 1.45, 0.22, 1.4);
        on(M.fo1, fa, 0.24, 0.6, -0.8, 1.75, 0.22, 1.6);
        on(M.fo2, fa, 0.28, -0.5, 0.7, 1.55, 0.2, 1.45);
        // mão (punho fechado) e polegar
        const hc = j.ha.clone().add(fa.u.clone().multiplyScalar(2.0));
        setM(M.hand, fa.B, 1.75, 2.5, 1.35, hc);
        setM(M.thumb, fa.B, 0.75, 1.3, 0.75, hc.clone().add(fa.B.z.clone().multiplyScalar(1.2)).add(med.clone().multiplyScalar(0.9)));
        // pernas
        on(M.quad, th, 0.48, 1.6, 0, 3.5, 0.33, 2.25);
        on(M.vmo, th, 0.8, 0.95, 1.6, 2.0, 0.13, 1.75);
        on(M.vl, th, 0.5, 0.4, -2.0, 2.2, 0.3, 2.2);
        on(M.ham, th, 0.5, -1.6, 0, 3.2, 0.32, 2.0);
        on(M.add, th, 0.24, 0.2, 2.3, 2.1, 0.22, 2.2);
        on(M.gas1, sh, 0.28, -1.15, 0.85, 1.9, 0.2, 1.85);
        on(M.gas2, sh, 0.3, -1.05, -0.85, 1.75, 0.19, 1.7);
        on(M.tib, sh, 0.38, 1.05, -0.4, 1.1, 0.25, 1.0);
        // tênis
        const fd = j.to.clone().sub(j.ft); const fl = Math.max(4, fd.length());
        const FB = basisFrom(fd, new V(0, 1, 0));
        const sc = j.ft.clone().add(FB.y.clone().multiplyScalar(fl * 0.42)).sub(FB.z.clone().multiplyScalar(0.4));
        setM(M.shoe, FB, 2.35, fl * 0.5 + 2.7, 1.95, sc);
        setM(M.sole, FB, 2.55, fl * 0.5 + 3.0, 0.65, sc.clone().sub(FB.z.clone().multiplyScalar(1.45)));
      });
      return { shM, hipM, up, fwd, S, head };
    }
    return { update, setMuscles };
  }

  /* ---------- equipamentos ---------- */
  function rot2(ex) {
    const r = (ex.r || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return (x, y) => (r ? [50 + (x - 50) * c - (y - 74) * s, 74 + (x - 50) * s + (y - 74) * c] : [x, y]);
  }
  function makeEquip(group, ex, pat) {
    const items = [];
    const mk = (geo, mat, shadow = true) => { const m = new T3.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; m.matrixAutoUpdate = false; group.add(m); items.push(m); return m; };
    const R2 = rot2(ex), rr = -(ex.r || 0) * Math.PI / 180;
    const box = (cx, cy, cz, w, h, d, mat, rz = 0) => {
      const m = mk(BOX, mat); const q = new T3.Quaternion().setFromAxisAngle(new V(0, 0, 1), rz);
      m.matrix.compose(new V(cx, cy, cz), q, new V(w, h, d)); return m;
    };
    const cylBetween = (A, B, r, mat) => {
      const m = mk(CYL, mat); const u = B.clone().sub(A); const len = u.length() || 0.01;
      setM(m, basisFrom(u, Math.abs(u.y) < 0.9 * len ? new V(0, 1, 0) : new V(1, 0, 0)), r, len, r, A.clone().add(B).multiplyScalar(0.5)); return m;
    };
    const special = ex.a;
    (pat.env || []).forEach((e) => {
      if (e[0] === 'rect') {
        const [, x, y, w, h] = e;
        const [cx2, cy2] = R2(x + w / 2, y + h / 2);
        const c3 = P([cx2, cy2, 0]);
        if (h <= 3.5 && (special === 'pullup' || special === 'hanging_raise')) { cylBetween(new V(c3.x, c3.y, -24), new V(c3.x, c3.y, 24), 0.9, MAT.metal); [-24, 24].forEach((z) => box(c3.x, c3.y / 2 + 0.5, z, 2.4, c3.y + 1, 2.4, MAT.frame)); }
        else if (h <= 3.5 && special === 'dips') { [-11, 11].forEach((z) => { const a = R2(x, y + 1.5), b = R2(x + w, y + 1.5); cylBetween(P([a[0], a[1], z]), P([b[0], b[1], z]), 1.0, MAT.metal); }); }
        else if (w <= 4.5 && special === 'dips') { [-11, 11].forEach((z) => box(c3.x, c3.y, z, 2.4, h, 2.4, MAT.frame)); }
        else if (w <= 4.5 && h >= 30) box(c3.x, c3.y, 0, w, h, 17, MAT.pad, rr);
        else if (w <= 4.5) { [-8, 8].forEach((z) => box(c3.x, c3.y, z, 2.2, h, 2.2, MAT.frame, rr)); }
        else if (h <= 3.5) box(c3.x, c3.y, 0, w, h, 24, MAT.frame, rr);
        else box(c3.x, c3.y, 0, w, h + 1, 23, MAT.pad, rr);
      } else {
        const a = R2(e[1], e[2]), b = R2(e[3], e[4]);
        cylBetween(P([a[0], a[1], 0]), P([b[0], b[1], 0]), (e[5] || 2) / 2 + 0.3, MAT.frame);
      }
    });
    // coluna da polia
    let anchors = [];
    if (pat.anchor && ['handle', 'cable_ankle'].includes(ex.p)) {
      const [axp, ayp] = pat.anchor;
      if (pat.front) { const z = axp - 60; anchors = [new V(0, 108 - ayp, z), new V(0, 108 - ayp, -z)]; }
      else anchors = [P([axp, ayp, 0])];
      anchors.forEach((A) => {
        // coluna da máquina afastada do corpo, com braço até a polia
        const out = pat.front ? Math.sign(A.z) * 6 : 0;
        const cx = pat.front ? A.x - 4 : A.x + (A.x >= -10 ? 14 : -10);
        const top = Math.max(A.y, 10) + 3;
        box(cx, top / 2, A.z + out, 3.4, top, 3.4, MAT.frame);
        cylBetween(new V(cx, A.y + 1.5, A.z + out), new V(A.x, A.y + 1.5, A.z), 0.8, MAT.frame);
        const pul = mk(SPH, MAT.metal); setM(pul, { x: new V(1, 0, 0), y: new V(0, 1, 0), z: new V(0, 0, 1) }, 1.7, 1.7, 1.7, A);
      });
    }
    const dyn = { bar: null, plates: [], db: [], handles: [], cables: [], pad: null, sled: null };
    const p = ex.p;
    if (['barbell', 'hbar', 'barbell_back', 'barbell_hip'].includes(p)) {
      dyn.bar = mk(CYL, MAT.metal);
      dyn.plates = [0, 1].map(() => mk(CYL, MAT.plate)); dyn.rims = [0, 1].map(() => mk(CYL, MAT.metal)); dyn.coll = [0, 1].map(() => mk(CYL, MAT.metal));
    } else if (p === 'dumbbell') {
      dyn.db = [0, 1].map(() => ({ h: mk(CYL, MAT.metal), a: mk(CYL, MAT.plate), b: mk(CYL, MAT.plate) }));
    } else if (p === 'handle') dyn.handles = [0, 1].map(() => mk(CYL, MAT.metal));
    else if (p === 'pad') dyn.pad = mk(CYL, MAT.pad);
    else if (p === 'sled') dyn.sled = mk(BOX, MAT.frame);
    if (anchors.length) dyn.cables = [0, 1].map(() => mk(CYL, MAT.cable, false));

    function update(B, J) {
      const zAx = new V(0, 0, 1);
      const ZB = basisFrom(zAx, new V(0, 1, 0));
      const S = B.S;
      if (dyn.bar) {
        let c;
        if (p === 'barbell_back') c = B.shM.clone().sub(B.fwd.clone().multiplyScalar(3.5)).add(B.up.clone().multiplyScalar(1.2));
        else if (p === 'barbell_hip') c = B.hipM.clone().add(B.fwd.clone().multiplyScalar(5.5));
        else c = S[0].ha.clone().add(S[1].ha).multiplyScalar(0.5).add(new V(0, 0, 0));
        const half = p === 'hbar' ? 21 : 27, pr = p === 'hbar' ? 5.6 : 8.6;
        setM(dyn.bar, ZB, 0.55, half * 2, 0.55, c);
        [-1, 1].forEach((sg, i) => {
          const pc = c.clone().add(new V(0, 0, sg * (half - 5)));
          setM(dyn.plates[i], ZB, pr, 2.6, pr, pc);
          setM(dyn.rims[i], ZB, 1.7, 3.0, 1.7, pc);
          setM(dyn.coll[i], ZB, 1.1, 1.6, 1.1, pc.clone().add(new V(0, 0, sg * 2.2)));
        });
      }
      dyn.db.forEach((d, i) => {
        if (J.oneArm && i === 1) { d.h.visible = d.a.visible = d.b.visible = false; return; }
        const c = S[i].ha.clone();
        setM(d.h, ZB, 0.45, 9, 0.45, c);
        setM(d.a, ZB, 3.1, 1.9, 3.1, c.clone().add(new V(0, 0, 3.7)));
        setM(d.b, ZB, 3.1, 1.9, 3.1, c.clone().add(new V(0, 0, -3.7)));
      });
      dyn.handles.forEach((hm, i) => {
        if (J.oneArm && i === 1) { hm.visible = false; return; }
        setM(hm, ZB, 0.5, 6, 0.5, S[i].ha);
      });
      dyn.cables.forEach((cm, i) => {
        const target = pat.anchorTo === 'ft' ? S[0].ft : S[i].ha;
        const A = anchors[Math.min(i, anchors.length - 1)];
        if ((J.oneArm || pat.anchorTo === 'ft') && i === 1) { cm.visible = false; return; }
        const u = target.clone().sub(A), len = u.length() || 0.01;
        setM(cm, basisFrom(u, new V(1, 0, 0)), 0.28, len, 0.28, A.clone().add(target).multiplyScalar(0.5));
      });
      if (dyn.pad) {
        const at = ex.a === 'seated_calf' ? 'kn' : 'ft';
        const c = S[0][at].clone().add(S[1][at]).multiplyScalar(0.5);
        c.z = 0; setM(dyn.pad, ZB, 2.3, 22, 2.3, c);
      }
      if (dyn.sled) {
        const c = S[0].ft.clone().add(S[1].ft).multiplyScalar(0.5);
        const legDir = c.clone().sub(B.hipM).normalize();
        const SB = basisFrom(legDir, new V(0, 0, 1));
        dyn.sled.matrix.makeBasis(SB.x, SB.y, SB.z); dyn.sled.matrix.scale(tmpS.set(24, 2.2, 28)); dyn.sled.matrix.setPosition(c.clone().add(legDir.clone().multiplyScalar(2.5)));
      }
    }
    function dispose() { items.forEach((m) => group.remove(m)); }
    return { update, dispose };
  }

  /* ---------- cena ---------- */
  function makeStage(canvas, preserve) {
    const renderer = new T3.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!preserve });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T3.sRGBEncoding;
    renderer.toneMapping = T3.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T3.PCFSoftShadowMap;
    const scene = new T3.Scene();
    scene.add(new T3.HemisphereLight('#ffffff', '#3a3330', 0.75));
    const key = new T3.DirectionalLight('#fff4e8', 2.1);
    key.position.set(55, 140, 95); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -90, right: 90, top: 120, bottom: -40, near: 10, far: 400 });
    key.shadow.bias = -0.0008; key.shadow.radius = 4;
    scene.add(key);
    const fill = new T3.DirectionalLight('#cfe0ff', 0.55); fill.position.set(-90, 60, -40); scene.add(fill);
    const rim = new T3.DirectionalLight('#ffffff', 0.9); rim.position.set(-20, 90, -140); scene.add(rim);
    const floor = new T3.Mesh(new T3.CircleGeometry(80, 48), new T3.ShadowMaterial({ opacity: 0.32 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const disc = new T3.Mesh(new T3.CircleGeometry(46, 48), new T3.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.12 }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; scene.add(disc);
    const camera = new T3.PerspectiveCamera(28, 1, 1, 2000);
    const bodyG = new T3.Group(), equipG = new T3.Group();
    scene.add(bodyG); scene.add(equipG);
    const human = makeHuman(bodyG);
    return { renderer, scene, camera, human, equipG, ex: null, equip: null, frame: null, floor, disc };
  }
  function setExercise(st, ex) {
    if (st.ex === ex) return;
    st.ex = ex;
    if (st.equip) st.equip.dispose();
    const pat = PATTERNS[ex.a] || PATTERNS.curl;
    st.pat = pat;
    st.prone = !!((PAT_EXTRA[ex.a] || {}).prone);
    st.equip = makeEquip(st.equipG, ex, pat);
    st.human.setMuscles(ex);
    // enquadramento: caixa que contém o movimento inteiro
    const box = new T3.Box3();
    [0, 0.5, 1].forEach((t) => {
      const J = lift(pat, poseAt(pat, t), ex);
      ['R', 'L'].forEach((s) => Object.values(J[s]).forEach((p) => box.expandByPoint(P(p))));
      box.expandByPoint(P(J.head).add(new V(0, 7, 0)));
    });
    (pat.env || []).forEach((e) => { if (e[0] === 'rect') { box.expandByPoint(P([e[1], e[2], 0])); box.expandByPoint(P([e[1] + e[3], e[2] + e[4], 0])); } else { box.expandByPoint(P([e[1], e[2], 0])); box.expandByPoint(P([e[3], e[4], 0])); } });
    box.expandByPoint(new V(box.min.x, 0, 0));
    if (['barbell', 'hbar', 'barbell_back', 'barbell_hip'].includes(ex.p)) { box.expandByPoint(new V(box.min.x, box.min.y, -28)); box.expandByPoint(new V(box.max.x, box.max.y, 28)); }
    const c = box.getCenter(new V()), sz = box.getSize(new V());
    st.frame = { c, r: Math.max(sz.x, sz.y, sz.z * 0.8, 26) * 0.5 + 9 };
  }
  function pose(st, t) {
    const ex = st.ex, pat = st.pat;
    const J = lift(pat, poseAt(pat, ex.rev ? 1 - t : t), ex);
    const B = st.human.update(J, st.prone);
    st.equip.update(B, J);
  }
  function placeCam(st, az, el) {
    const f = st.frame, a = az * Math.PI / 180, e = el * Math.PI / 180;
    const dist = (f.r / Math.sin((st.camera.fov * Math.PI / 180) / 2)) * 0.92;
    st.camera.position.set(f.c.x + dist * Math.cos(e) * Math.sin(a), f.c.y + dist * Math.sin(e), f.c.z + dist * Math.cos(e) * Math.cos(a));
    st.camera.near = dist * 0.2; st.camera.far = dist * 3; st.camera.updateProjectionMatrix();
    st.camera.lookAt(f.c);
  }

  /* exercícios deitados: o ângulo 3/4 padrão vem do lado da cabeça */
  const AZ_OFF = { bench: -80, fly: -80, pullover: -80, skull: -80, crunch: -70, leg_raise: -70, hip_thrust: -75, leg_curl: -60, pushup: -70, plank: -70, back_ext: -60, leg_press: -55, cable_crunch: -40 };
  const presetAz = (ex, i) => ANGLES3D[i].az + (i === 0 ? (AZ_OFF[ex.a] || 0) : 0);
  /* ---------- visualizador ao vivo ---------- */
  let live = null;
  const view = { az: ANGLES3D[0].az, el: ANGLES3D[0].el, tAz: null, tEl: null, idx: 0, slow: false, drag: null, onAngle: null, raf: null, start: performance.now() };
  function ensureLive() {
    if (live) return live;
    const canvas = document.createElement('canvas');
    canvas.className = 'viewer-canvas';
    live = makeStage(canvas, false);
    live.canvas = canvas;
    canvas.addEventListener('pointerdown', (e) => { view.drag = { x: e.clientX, az: view.az, moved: false }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (!view.drag) return;
      const dx = e.clientX - view.drag.x;
      if (Math.abs(dx) > 4) view.drag.moved = true;
      view.az = view.drag.az - dx * 0.6; view.tAz = null;
    });
    const end = () => {
      if (!view.drag) return;
      const moved = view.drag.moved; view.drag = null;
      if (!moved) return;
      // encaixa no ângulo pronto mais próximo
      let best = 0, bd = 1e9;
      ANGLES3D.forEach((a, i) => { const d = Math.abs(((view.az - presetAz(live.ex, i) + 540) % 360) - 180) + Math.abs(view.el - a.el) * 0.8; if (d < bd) { bd = d; best = i; } });
      setAngle(best);
    };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    return live;
  }
  function setAngle(i) {
    view.idx = i;
    const a = ANGLES3D[i];
    const d = (((live && live.ex ? presetAz(live.ex, i) : a.az) - view.az + 540) % 360) - 180;
    view.tAz = view.az + d; view.tEl = a.el;
    if (view.onAngle) view.onAngle(i);
  }
  function loop(now) {
    view.raf = requestAnimationFrame(loop);
    if (!live || !live.canvas.isConnected) { cancelAnimationFrame(view.raf); view.raf = null; return; }
    if (view.tAz != null) { view.az += (view.tAz - view.az) * 0.14; view.el += (view.tEl - view.el) * 0.14; if (Math.abs(view.tAz - view.az) < 0.2 && Math.abs(view.tEl - view.el) < 0.2) { view.az = view.tAz; view.el = view.tEl; view.tAz = null; } }
    const pat = live.pat;
    const period = (pat.speed || 2.6) * 1000 * (view.slow ? 2.4 : 1);
    const ph = ((now - view.start) % period) / period;
    pose(live, (1 - Math.cos(ph * Math.PI * 2)) / 2);
    placeCam(live, view.az, view.el);
    live.renderer.render(live.scene, live.camera);
  }
  function mount(container, ex, opts = {}) {
    const st = ensureLive();
    const w = container.clientWidth || 320;
    container.appendChild(st.canvas);
    st.renderer.setSize(w, w, true);
    st.camera.aspect = 1; st.camera.updateProjectionMatrix();
    setExercise(st, ex);
    view.slow = !!opts.slow;
    view.onAngle = opts.onAngle || null;
    const i = opts.angle || 0;
    view.idx = i; view.az = presetAz(ex, i); view.el = ANGLES3D[i].el; view.tAz = null;
    if (!view.raf) view.raf = requestAnimationFrame(loop);
    return true;
  }

  /* ---------- fotos estáticas (passo a passo e miniaturas) ---------- */
  let snapSt = null;
  const cache = new Map();
  function snap(ex, t, angle, size) {
    const k = `${ex.id}|${t}|${angle}|${size}`;
    if (cache.has(k)) return cache.get(k);
    if (!snapSt) snapSt = makeStage(document.createElement('canvas'), true);
    const st = snapSt;
    st.renderer.setPixelRatio(1);
    st.renderer.setSize(size, size, false);
    st.camera.aspect = 1; st.camera.updateProjectionMatrix();
    setExercise(st, ex);
    pose(st, t);
    const ai = ANGLES3D[angle] ? angle : 0;
    placeCam(st, presetAz(ex, ai), ANGLES3D[ai].el);
    st.renderer.render(st.scene, st.camera);
    const url = st.renderer.domElement.toDataURL('image/png');
    cache.set(k, url);
    return url;
  }
  let queue = [], busy = false;
  function fillSnaps(root) {
    (root || document).querySelectorAll('[data-snap3d]:not([data-snapped])').forEach((el) => { el.setAttribute('data-snapped', '1'); queue.push(el); });
    if (!busy && queue.length) { busy = true; requestAnimationFrame(work); }
  }
  function work() {
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < 24) {
      const el = queue.shift();
      if (!el.isConnected) continue;
      const [id, t, ang, size] = el.getAttribute('data-snap3d').split('|');
      const ex = EX_LOOKUP(id);
      if (!ex) continue;
      try {
        const url = snap(ex, parseFloat(t || '0.55'), parseInt(ang || '0', 10), parseInt(size || '160', 10));
        el.innerHTML = `<img class="snap3d" src="${url}" alt="">`;
      } catch (e) { /* mantém o desenho 2D */ }
    }
    if (queue.length) requestAnimationFrame(work); else busy = false;
  }
  return { ok: true, mount, setAngle, setSlow(v) { view.slow = !!v; }, fillSnaps, snap, get angleIdx() { return view.idx; } };
})();
window.Fig3D = Fig3D;
