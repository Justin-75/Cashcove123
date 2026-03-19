## Asset file names to drop in

All assets live under `app/public/assets/`.

### Symbols (required)
Put these files in `app/public/assets/symbols/`:
- `a.png`
- `k.png`
- `q.png`
- `j.png`
- `10.png`
- `9.png`
- `f1.png`
- `f2.png`
- `f3.png`
- `f4.png`
- `wild.png`
- `scatter.png`
- `background.jpg` (or `background.png`)
- `logo.png`
- `frame.png`
These are already wired to CSS selectors in `app/public/styles.css` using:
`div.cell[data-symbol="..."] { background-image: url(...) }`.

### Background / UI (optional but recommended)
Put these in `app/public/assets/ui/`:
- `background.jpg` (or `background.png`)
- `logo.png`
- `frame.png`

### Audio (optional, hooks ready to add next)
Put these in `app/public/assets/audio/`:
- `bgm.mp3`
- `spin.wav`
- `stop.wav`
- `win.wav`
- `bonus.wav`

