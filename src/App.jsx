import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_STEPS = [0, 3, 6, 8, 11, 14];
const MODES = ['Pulse', 'Divide', 'Scatter'];

function SignalCanvas({ energy, mode, activeCount }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let raf = 0;
    let pointer = { x: 0.56, y: 0.45 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * scale);
      canvas.height = Math.max(1, rect.height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      };
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#241f1a';
      context.fillRect(0, 0, width, height);

      context.strokeStyle = 'rgba(255,244,216,.12)';
      context.lineWidth = 1;
      for (let x = 0; x < width; x += 42) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
      }
      for (let y = 0; y < height; y += 42) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
      }

      const time = reduced ? 0 : frame * 0.016;
      const colors = ['#f4eb29', '#ff4a31', '#4777ff'];
      for (let row = 0; row < 5; row += 1) {
        context.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const normalized = x / Math.max(width, 1);
          const proximity = 1 - Math.min(1, Math.abs(normalized - pointer.x) * 2.1);
          const base = height * (row + 1) / 6;
          const amplitude = 7 + energy * 23 + proximity * 20;
          let signal = Math.sin(x * 0.018 + time * (1 + row * 0.12) + row * 1.4);
          if (mode === 'Divide') signal = Math.sign(signal) * Math.pow(Math.abs(signal), .45);
          if (mode === 'Scatter') signal += Math.sin(x * 0.061 - time * 1.8 + row) * .42;
          const rhythm = Math.sin(normalized * Math.PI * Math.max(activeCount, 1)) * pointer.y * 7;
          const y = base + signal * amplitude * (.42 + pointer.y * .55) + rhythm;
          if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.strokeStyle = colors[row % colors.length];
        context.globalAlpha = .66 + row * .06;
        context.lineWidth = row === 2 ? 3 : 1.5;
        context.stroke();
      }
      context.globalAlpha = 1;

      const scanX = reduced ? width * .62 : (frame * 2.3) % Math.max(width, 1);
      context.fillStyle = '#f4eb29';
      context.fillRect(scanX, 0, 2, height);
      frame += 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', move);
    };
  }, [activeCount, energy, mode]);

  return <canvas className="signal-canvas" ref={ref} aria-hidden="true" />;
}

function Knob({ label, hint, value, onChange, color }) {
  return <label className="knob-control">
    <span className="control-label"><b>{label}</b><small>{hint}</small></span>
    <span className="knob" style={{ '--turn': `${-138 + value * 2.76}deg`, '--cap': color }}>
      <input aria-label={`${label}: ${value}`} type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <i aria-hidden="true" />
    </span>
    <output>{String(value).padStart(3, '0')}</output>
  </label>;
}

function InstrumentPanel() {
  const [tone, setTone] = useState(62);
  const [fold, setFold] = useState(38);
  const [motion, setMotion] = useState(54);
  const [mode, setMode] = useState('Pulse');
  const [activeSteps, setActiveSteps] = useState(() => new Set(DEFAULT_STEPS));

  const toggleStep = (step) => setActiveSteps((current) => {
    const next = new Set(current);
    if (next.has(step)) next.delete(step); else next.add(step);
    return next;
  });

  const randomize = () => {
    const next = new Set();
    for (let index = 0; index < 16; index += 1) if (Math.random() > .58) next.add(index);
    if (next.size === 0) next.add(0);
    setActiveSteps(next);
  };

  const reset = () => {
    setTone(62); setFold(38); setMotion(54); setMode('Pulse'); setActiveSteps(new Set(DEFAULT_STEPS));
  };

  const energy = (tone + fold + motion + activeSteps.size * 5) / 330;
  const description = useMemo(() => {
    const brightness = tone > 66 ? 'bright' : tone < 34 ? 'muted' : 'balanced';
    const density = activeSteps.size > 9 ? 'dense' : activeSteps.size < 5 ? 'sparse' : 'open';
    return `${mode} mode. ${activeSteps.size} of 16 steps active. ${brightness} tone and ${density} rhythm.`;
  }, [activeSteps.size, mode, tone]);

  return <section className="instrument" id="instrument" aria-labelledby="instrument-title">
    <div className="panel-topline">
      <div><span>Pulse/04</span><b id="instrument-title">Visual signal playground</b></div>
      <p><i aria-hidden="true" /> Silent demo, no audio<br />Move the pointer over the signal</p>
    </div>

    <div className="screen">
      <SignalCanvas energy={energy} mode={mode} activeCount={activeSteps.size} />
      <div className="screen-readout"><span>MODE / {mode.toUpperCase()}</span><span>ACTIVE / {String(activeSteps.size).padStart(2, '0')}</span></div>
    </div>

    <div className="panel-controls">
      <div className="knob-bank">
        <Knob label="Tone" hint="signal brightness" value={tone} onChange={setTone} color="var(--signal)" />
        <Knob label="Fold" hint="wave pressure" value={fold} onChange={setFold} color="var(--patch)" />
        <Knob label="Motion" hint="visual movement" value={motion} onChange={setMotion} color="var(--solder)" />
      </div>

      <div className="mode-bank">
        <span>Shape</span>
        <div>{MODES.map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)} aria-pressed={mode === item}>{item}</button>)}</div>
      </div>

      <div className="sequencer-bank">
        <div className="bank-heading"><span>16-step pattern</span><p>Tap pads to change the visual rhythm.</p></div>
        <div className="steps">
          {Array.from({ length: 16 }, (_, step) => <button key={step} className={activeSteps.has(step) ? 'active' : ''} aria-label={`Step ${step + 1}`} aria-pressed={activeSteps.has(step)} onClick={() => toggleStep(step)}><span>{String(step + 1).padStart(2, '0')}</span></button>)}
        </div>
        <div className="pattern-actions"><button onClick={randomize}>Randomize</button><button onClick={() => setActiveSteps(new Set())}>Clear</button><button onClick={reset}>Reset</button></div>
      </div>
    </div>

    <p className="live-status" aria-live="polite"><span>Current signal</span>{description}</p>
  </section>;
}

function App() {
  return <main id="top">
    <nav className="nav" aria-label="Primary">
      <a href="#top" className="wordmark">KAN<span>SO</span></a>
      <div className="nav-links"><a href="#instrument">Play</a><a href="#signal-path">Signal path</a><a href="#workshop">Workshop</a></div>
      <a className="nav-cta" href="#order">Request Pulse/04 <span>↘</span></a>
    </nav>

    <header className="hero">
      <div className="hero-copy">
        <p className="hero-kicker">Kanso Instruments · Berlin / 2026</p>
        <h1><span>Pulse</span><b>/04</b></h1>
        <p className="hero-deck">A four-voice rhythm instrument built for the moment a clean pattern starts to misbehave.</p>
        <div className="hero-actions"><a href="#instrument">Play the visual panel <span>↓</span></a><a href="#signal-path">See the signal path</a></div>
      </div>
      <aside className="hero-specs" aria-label="Pulse 04 summary">
        <div><strong>04</strong><span>analog voices</span></div>
        <div><strong>16</strong><span>touch steps</span></div>
        <div><strong>18</strong><span>HP Eurorack</span></div>
        <p>Silent on this page.<br />Tactile in the rack.</p>
      </aside>
      <div className="hero-cable" aria-hidden="true"><i/><i/><i/></div>
    </header>

    <InstrumentPanel />

    <section className="signal-path" id="signal-path">
      <div className="section-heading"><p>01 / Signal path</p><h2>Every move<br />has somewhere to go.</h2></div>
      <div className="path-line" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="path-list">
        <article><b>IN</b><div><h3>Touch or voltage</h3><p>Use fingers, gates, or control voltage. Every input reaches the same visible path.</p></div><span>01</span></article>
        <article><b>SHAPE</b><div><h3>Fold without menus</h3><p>Pressure, tone, and timing remain on the front panel. No preset browser interrupts the patch.</p></div><span>02</span></article>
        <article><b>DRIFT</b><div><h3>Let timing loosen</h3><p>Related voices can pull apart without losing the pulse that connects them.</p></div><span>03</span></article>
        <article><b>OUT</b><div><h3>Patch the result</h3><p>Four independent voices, clock output, and a reset point that gets you home.</p></div><span>04</span></article>
      </div>
    </section>

    <section className="workshop" id="workshop">
      <div className="workshop-copy"><p>02 / Workshop</p><h2>Designed with the case open.</h2><p>Founder Mina Okafor designs the circuits, lays out every panel, and documents each revision with a small assembly team. Socketed chips, standard fasteners, and a public service manual make Pulse/04 repairable beyond its first owner.</p><dl><div><dt>Run size</dt><dd>24 units / quarter</dd></div><div><dt>Assembly</dt><dd>Wedding, Berlin</dd></div><div><dt>Calibration</dt><dd>Played and signed</dd></div></dl></div>
      <div className="board" aria-label="Abstract circuit board diagram for Pulse 04" role="img"><span className="chip chip-a">VCO</span><span className="chip chip-b">CLK</span><span className="chip chip-c">FOLD</span><span className="chip chip-d">OUT</span><svg viewBox="0 0 800 720" aria-hidden="true"><path d="M40 120H230V250H530V80H760M40 520H180V390H390V630H760M110 40V210H640V520H770M260 700V560H520V330H760"/><circle cx="230" cy="250" r="8"/><circle cx="530" cy="80" r="8"/><circle cx="390" cy="630" r="8"/><circle cx="640" cy="520" r="8"/></svg></div>
    </section>

    <section className="order" id="order">
      <p>03 / Allocation</p>
      <h2>Leave room<br />for noise.</h2>
      <div className="order-bottom"><p>Pulse/04 is €980 including VAT. The next workshop run is planned for October 2026. Tell us about your rack and we will reply with availability, dimensions, and the service manual.</p><a href="mailto:allocation@kanso-instruments.example?subject=Pulse%2F04%20allocation">Request an allocation <span>↗</span></a></div>
    </section>

    <footer><a href="#top" className="wordmark">KAN<span>SO</span></a><p>Koloniestraße 10, 13357 Berlin<br />Fictional portfolio concept</p><p>Pulse/04 · built to be opened<br />© 2026</p></footer>
  </main>;
}

export default App;
