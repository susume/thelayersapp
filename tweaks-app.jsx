
// tweaks-app.jsx — Layers Guard Dashboard tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#0D9488",
  "cardStyle": "borderless",
  "heroStyle": "dark",
  "density": "comfortable"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  // Accent color
  root.style.setProperty('--accent', t.accentColor);
  // Compute accent light/dim from accent
  const accents = {
    '#0D9488': { light: '#E6F7F5', dim: '#B2DFDB', dark: '#0F1F1C', hover: '#0B8578' },
    '#2A9D5C': { light: '#EDFAF2', dim: '#C8E8D4', dark: '#0C1810', hover: '#228B4B' },
    '#3B82F6': { light: '#EFF6FF', dim: '#BFDBFE', dark: '#0C1629', hover: '#2563EB' },
    '#7C5CFC': { light: '#F0ECFF', dim: '#C4B5FD', dark: '#1A0F2E', hover: '#6D4DE6' },
  };
  const a = accents[t.accentColor] || accents['#0D9488'];
  root.style.setProperty('--accent-light', a.light);
  root.style.setProperty('--accent-dim', a.dim);
  root.style.setProperty('--hero-bg', t.heroStyle === 'dark' ? a.dark : '#FFFFFF');

  // Card style
  if (t.cardStyle === 'bordered') {
    root.style.setProperty('--card-border', 'var(--surface)');
    document.querySelectorAll('.card, .summary-card').forEach(c => {
      c.style.border = '1px solid var(--surface)';
    });
  } else {
    root.style.setProperty('--card-border', 'transparent');
    document.querySelectorAll('.card, .summary-card').forEach(c => {
      c.style.border = 'none';
    });
  }

  // Hero style
  const heroCard = document.querySelector('.hero-card');
  if (heroCard) {
    if (t.heroStyle === 'dark') {
      heroCard.style.background = a.dark;
      heroCard.style.color = '#fff';
    } else {
      heroCard.style.background = '#fff';
      heroCard.style.color = 'var(--text)';
      heroCard.style.boxShadow = 'var(--shadow)';
    }
  }

  // Density
  const main = document.querySelector('.main-content');
  if (main) {
    if (t.density === 'compact') {
      root.style.setProperty('--sp-lg', '18px');
      root.style.setProperty('--sp-xl', '24px');
      root.style.setProperty('--radius', '14px');
    } else if (t.density === 'spacious') {
      root.style.setProperty('--sp-lg', '28px');
      root.style.setProperty('--sp-xl', '40px');
      root.style.setProperty('--radius', '24px');
    } else {
      root.style.setProperty('--sp-lg', '24px');
      root.style.setProperty('--sp-xl', '32px');
      root.style.setProperty('--radius', '20px');
    }
  }
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    applyTweaks(t);
  }, [t.accentColor, t.cardStyle, t.heroStyle, t.density]);

  return (
    <TweaksPanel>
      <TweakSection label="Theme" />
      <TweakColor
        label="Accent color"
        value={t.accentColor}
        options={['#0D9488', '#2A9D5C', '#3B82F6', '#7C5CFC']}
        onChange={(v) => setTweak('accentColor', v)}
      />
      <TweakRadio
        label="Hero"
        value={t.heroStyle}
        options={['dark', 'light']}
        onChange={(v) => setTweak('heroStyle', v)}
      />
      <TweakSection label="Layout" />
      <TweakRadio
        label="Cards"
        value={t.cardStyle}
        options={['borderless', 'bordered']}
        onChange={(v) => setTweak('cardStyle', v)}
      />
      <TweakSelect
        label="Density"
        value={t.density}
        options={['compact', 'comfortable', 'spacious']}
        onChange={(v) => setTweak('density', v)}
      />
    </TweaksPanel>
  );
}

// Mount tweaks
const tweaksRoot = document.createElement('div');
tweaksRoot.id = 'tweaks-root';
document.body.appendChild(tweaksRoot);
ReactDOM.createRoot(tweaksRoot).render(<TweaksApp />);
