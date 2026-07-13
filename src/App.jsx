import { useEffect, useRef, useState } from 'react';

const STEPS = Array.from({ length: 16 }, (_, index) => index);

function SequencerCanvas({ energy }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let raf = 0;
    let pointer = { x: 0.5, y: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    };
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#28231d';
      context.fillRect(0, 0, width, height);
      const time = reduced ? 0 : frame * 0.018;
      for (let row = 0; row < 7; row += 1) {
        context.beginPath();
        for (let x = 0; x <= width; x += 8) {
          const proximity = 1 - Math.min(1, Math.abs(x / width - pointer.x) * 2.4);
          const amplitude = 10 + energy * 24 + proximity * 28;
          const y = height * (row + 1) / 8 + Math.sin(x * 0.022 + time + row * 1.3) * amplitude * (0.25 + pointer.y);
          if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.strokeStyle = row % 3 === 0 ? '#efe92b' : row % 3 === 1 ? '#ef4b2f' : '#4569dc';
        context.globalAlpha = 0.45 + row * 0.06;
        context.lineWidth = row % 3 === 0 ? 3 : 1.5;
        context.stroke();
      }
      context.globalAlpha = 1;
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
  }, [energy]);

  return <canvas className="wave-canvas" ref={ref} aria-hidden="true" />;
}

function Knob({ label, value, onChange, color }) {
  return <label className="knob-control">
    <span>{label}</span>
    <span className="knob" style={{ '--turn': `${-135 + value * 2.7}deg`, '--cap': color }}>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <i />
    </span>
    <output>{String(value).padStart(3, '0')}</output>
  </label>;
}

function App() {
  const [tone, setTone] = useState(62);
  const [fold, setFold] = useState(38);
  const [activeSteps, setActiveSteps] = useState(new Set([0, 3, 6, 8, 11, 14]));
  const toggleStep = (step) => setActiveSteps((current) => {
    const next = new Set(current);
    if (next.has(step)) next.delete(step); else next.add(step);
    return next;
  });
  const energy = (tone + fold + activeSteps.size * 5) / 250;

  return <main>
    <nav className="nav" aria-label="Primary">
      <a href="#top" className="wordmark">KAN<span>SO</span></a>
      <p>Instruments for unfinished music<br />Built in Berlin</p>
      <a className="nav-cta" href="#order">Request allocation ↘</a>
    </nav>

    <header className="hero" id="top">
      <div className="hero-title" aria-label="Pulse zero four">
        <span>PU</span><span className="offset">LSE</span><span>/04</span>
      </div>
      <div className="hero-note"><strong>Touch creates voltage.</strong><br />A four-voice rhythm instrument that rewards interruption.</div>
      <div className="instrument" aria-label="Interactive Pulse 04 instrument demonstration">
        <div className="instrument-head">
          <span>KANSO / PULSE 04</span><span>CV RHYTHM SCULPTOR</span><span>230V / 18HP</span>
        </div>
        <SequencerCanvas energy={energy} />
        <div className="controls">
          <Knob label="TONE" value={tone} onChange={setTone} color="var(--signal)" />
          <Knob label="FOLD" value={fold} onChange={setFold} color="var(--patch)" />
          <div className="steps" aria-label="Sixteen step sequencer">
            {STEPS.map((step) => <button key={step} className={activeSteps.has(step) ? 'active' : ''} aria-pressed={activeSteps.has(step)} onClick={() => toggleStep(step)}><span>{String(step + 1).padStart(2, '0')}</span></button>)}
          </div>
        </div>
        <p className="try-it">Turn the controls. Break the sequence.</p>
      </div>
    </header>

    <div className="ticker" aria-hidden="true"><div>NO PRESETS · NO MENUS · NO WRONG PATCH · NO PRESETS · NO MENUS · NO WRONG PATCH ·</div></div>

    <section className="manifesto">
      <p className="section-index">01 / PLAY</p>
      <h2>It starts where your timing slips.</h2>
      <div className="manifesto-copy">
        <p>Pulse/04 turns taps, gates, pressure, and imperfect repetition into four related voices. The signal path stays visible. Each control gives something back immediately.</p>
        <p>Save nothing. Find it again differently tomorrow.</p>
      </div>
    </section>

    <section className="anatomy">
      <div className="anatomy-word">OPEN</div>
      <div className="spec-list">
        <article><b>01</b><h3>Four analog voices</h3><p>Kick, body, metal, and noise share one unruly clock.</p></article>
        <article><b>02</b><h3>Touch and CV</h3><p>Every pad accepts fingers, gates, or control voltage.</p></article>
        <article><b>03</b><h3>Built to repair</h3><p>Socketed chips, documented parts, standard fasteners.</p></article>
        <article><b>04</b><h3>Small workshop run</h3><p>Twenty-four units assembled in Wedding each quarter.</p></article>
      </div>
    </section>

    <section className="workshop">
      <div className="workshop-copy"><p className="section-index">02 / WORKSHOP</p><h2>Designed with a soldering iron in reach.</h2><p>Founder Mina Okafor designs the circuits, lays out every panel, and documents each revision with a small assembly team. Production stays limited because every instrument is calibrated, played, and signed at the same Berlin workbench.</p></div>
      <div className="circuit-art" aria-label="Abstract illustration of the Pulse 04 circuit board" role="img"><span className="chip c1">VCO</span><span className="chip c2">CLK</span><span className="chip c3">FOLD</span><i/><i/><i/><i/><i/></div>
    </section>

    <section className="order" id="order">
      <p className="section-index">03 / ORDER</p>
      <h2>Make room<br />for noise.</h2>
      <div><p>Pulse/04 is €980 including VAT. The next workshop run is planned for October 2026. Tell us where the instrument would live and we will reply with availability.</p><a href="mailto:allocation@kanso-instruments.example?subject=Pulse%2F04%20allocation">Request an allocation <span>↗</span></a></div>
    </section>
    <footer><a href="#top">Kanso Instruments</a><p>Koloniestraße 10, 13357 Berlin<br />Fictional portfolio concept</p><p>© 2026 · Built to be opened</p></footer>
  </main>;
}

export default App;
