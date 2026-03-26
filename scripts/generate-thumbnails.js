import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GAMES_JSON = path.join(ROOT, 'src/data/games.json');
const IMG_DIR = path.join(ROOT, 'public/assets/images');

const args = process.argv.slice(2).reduce((acc, a) => {
  if (!a.startsWith('--')) return acc;
  const [k, v] = a.slice(2).split('=');
  acc[k] = v ?? true;
  return acc;
}, {});
const ONLY_SLUG = args.slug ?? null;
const FORCE = !!args.force;
const W = 480, H = 360;

function fetchBuffer(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout }, res => {
      if (res.statusCode === 301 || res.statusCode === 302)
        return fetchBuffer(res.headers.location, timeout).then(resolve).catch(reject);
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const THEMES = {
  'snake-games':    { from: '#1a7f37', to: '#0d4f22', accent: '#56d364' },
  'classroom':      { from: '#1a73e8', to: '#0d47a1', accent: '#8ab4f8' },
  'mini':           { from: '#7b2ff7', to: '#4a0e8f', accent: '#c084fc' },
  'sports':         { from: '#e84a1a', to: '#a32e0a', accent: '#fca97b' },
  'dinosaur-games': { from: '#5a7a2b', to: '#2e4010', accent: '#aacc55' },
  'anniversary':    { from: '#c4860a', to: '#7a4f05', accent: '#fcd264' },
  'popular':        { from: '#c4186a', to: '#7a0d42', accent: '#f896c8' },
  'default':        { from: '#1a73e8', to: '#0d47a1', accent: '#8ab4f8' },
};

function getTheme(game) {
  for (const cat of (game.categories ?? [])) if (THEMES[cat]) return THEMES[cat];
  return THEMES.default;
}

function escXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Strip emoji and non-ASCII to prevent Pango from requesting emoji fonts
function cleanTitle(title) {
  return title
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  // emoji blocks
    .replace(/[\u{2600}-\u{27BF}]/gu, '')     // misc symbols
    .replace(/[^\x00-\x7F]/g, '')             // any remaining non-ASCII
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapTitle(title, max = 16) {
  const words = title.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= max) cur = (cur + ' ' + w).trim();
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function buildSVG(game) {
  const t = getTheme(game);
  const rawTitle = cleanTitle(game.title || game.slug);
  const lines = wrapTitle(rawTitle, 16);
  const fsize = lines.some(l => l.length > 12) ? 34 : 40;
  const lineH = fsize * 1.25;
  const textY = (H - lines.length * lineH) / 2 + 10;
  const playY = H * 0.72;
  const texts = lines.map((l, i) =>
    `<text x="${W/2}" y="${textY + i*lineH + fsize}" font-family="Arial,sans-serif" font-weight="800" font-size="${fsize}" fill="white" text-anchor="middle" filter="url(#sh)">${escXml(l)}</text>`
  ).join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.from}"/><stop offset="100%" stop-color="${t.to}"/></linearGradient><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.6)"/></filter></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><circle cx="-40" cy="-40" r="160" fill="${t.accent}" opacity="0.08"/><circle cx="${W+40}" cy="${H+40}" r="200" fill="${t.accent}" opacity="0.06"/><circle cx="${W/2}" cy="${playY}" r="28" fill="white" opacity="0.18"/><circle cx="${W/2}" cy="${playY}" r="22" fill="white" opacity="0.28"/><polygon points="${W/2-8},${playY-11} ${W/2+14},${playY} ${W/2-8},${playY+11}" fill="white" opacity="0.95"/>${texts}<rect x="0" y="${H-38}" width="${W}" height="38" fill="rgba(0,0,0,0.35)"/><text x="${W/2}" y="${H-12}" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="${t.accent}" text-anchor="middle" letter-spacing="2">DOODLEARCADE.COM</text></svg>`;
}

// ─── Hardcoded real image URLs collected from probing ────────────────────────
// These override automatic strategies for games where dynamic loading
// prevents us finding the asset path in the HTML.
const HARDCODED = {
  // Google Doodle artwork (from www.google.com/doodles og:image)
  'baseball':                          'https://lh3.googleusercontent.com/gOmTSNV3z1lqTzjiXjQTFQViTnIfb6xvFr1SAT68fEE-1Ie6-Qb-WqUafS1MutWGiyC7bnhtEbcBfECosAquuQ7ZZ1Z7-aZkYja6te0=s660',
  'basketball-2012-google-doodle':     'https://lh3.googleusercontent.com/H39vSnm9Va10y8fPoxN3xVPwv34cJT8pllL7h8pI6SU16TYR3Lm3zdJALjiH1stwCxjuGLbA_vXllLRGURgP13BGKZNpcZMwuQRvPf1e=s660',
  'birth-of-hip-hop-doodle-game':      'https://www.google.com/logos/doodles/2020/stay-and-play-at-home-with-popular-past-google-doodles-hip-hop-2017-6753651837108774-2xa.gif',
  'blob-opera-google-game':            'https://lh3.googleusercontent.com/ci/AL18g_SSBHn71L5etc3zvGp3U8FpQiGJ0zf4Zmku4WMhnxV5IEEjfSyC2Tk6wSXJhZ8Kv6jK1H2y2w',
  'celebrating-pani-puri':             'https://www.google.com/logos/doodles/2023/celebrating-pani-puri-6753651837110029.2-2xa.gif',
  'celebrating-petanque':              'https://www.google.com/logos/doodles/2022/celebrating-petanque-6753651837109257-2xa.gif',
  'chamion-island-games':              'https://www.google.com/logos/doodles/2021/doodle-champion-island-games-begin-6753651837108462.2-2xa.gif',
  'chinese-new-year-snake-game':       'https://lh3.googleusercontent.com/udxvvLOX9xvT6b4aE1bq_U0VJtCYtL1vsKzaz62G4NO2PfaXMaz4ffj0qj3DntKb1VGvXrdJsgEkhPhvSJhHj-2Wg4Kyp5yTGULj9JVcQA=s660',
  'doctor-who-doodle':                 'https://lh3.googleusercontent.com/4pkeK2qvHn8N_qn9Ts8dp9ughqbWKDC30vmOgTdvdOdfrH2LuHJhM4LkkWBSH4VT1Ngq94-f8_6wUEPHLal3l2kIZZ2ODjrxQSm06zLwpg=s660',
  'doodle-celebrating-loteria':        'https://www.google.com/logos/doodles/2019/celebrating-loteria-6753651837108226.3-2xa.gif',
  'doodle-celebrating-mbira':          'https://www.google.com/logos/doodles/2020/celebrating-mbira-5807476258635776-2xa.gif',
  'doodle-clara-rockmore':             'https://www.google.com/logos/doodles/2016/clara-rockmores-105th-birthday-5705876574830592.3-hp2x.jpg',
  'doodle-crossword-puzzle':           'https://lh3.googleusercontent.com/Rr2X9m8HrCIGJrOKG3MOr9pRYERaa4yBLWUTeB6YNgJVlseJSMIbFWDc9nX6O2Y9HeWRf-2qL1gy0TInmKtKfRIBAJVPK4eglImapFb9=s660',
  'doodle-earth-day-2020':             'https://www.google.com/logos/doodles/2020/earth-day-2020-6753651837108357.2-2xa.gif',
  'doodle-googles-15th-birthday':      'https://lh3.googleusercontent.com/uV-G02k08X2Ir7NCiPEgWA-qViwlnfT6PD-YUzEhcHreQLuch1SLuvay_squB0IkrxE67FMZM0TOuPjkGKiKOzfsqExZ8J8yKXOCPsOk=s660',
  'doodle-halloween-2020':             'https://www.google.com/logos/doodles/2020/halloween-2020-6753651837108597.5-2xa.gif',
  'doodle-halloween-2022':             'https://www.google.com/logos/doodles/2022/halloween-2022-6753651837109529-2xa.gif',
  'doodle-kids-coding':                'https://www.google.com/logos/doodles/2020/stay-and-play-at-home-with-popular-past-google-doodles-coding-2017-6753651837108765-2xa.gif',
  'doodle-ludwig-van-beethovens-245th-year': 'https://www.google.com/logos/doodles/2015/beethovens-245th-birthday-4687587541254144-hp2x.jpg',
  'doodle-oskar-fischinger':           'https://www.google.com/logos/doodles/2017/oskar-fischingers-117th-birthday-5635181101711360-2xa.gif',
  'doodle-roswells-66th-anniversary':  'https://lh3.googleusercontent.com/0XVkBECr7YxpxkJfdxJSz3rBhEV8_9tMcHciSV737fGhA8D22Hf-IvJze4_4sDdSvh5e-Hb6-Rzl_FDfpHcJuxX3DDMb27PiEx67aU84=s660',
  'doodle-scoville':                   'https://www.google.com/logos/doodles/2016/wilbur-scovilles-151st-birthday-6275288709201920.3-hp2x.png',
  'doodle-qixi-festival-chilseok':     'https://www.google.com/logos/doodles/2020/qixi-festival-2020-taiwan-6753651837108511-2x.jpg',
  'doodle-valentines-day':             'https://www.google.com/logos/doodles/2017/valentines-day-2017-day-4-5165155370401792-hp2x.jpg',
  'doodle-cricket-game':               'https://www.google.com/logos/doodles/2017/icc-champions-trophy-2017-begins-5642111205507072.4-2xa.gif',
  'doodle-valentines-day-2022':        'https://www.google.com/logos/doodles/2022/valentines-day-2022-6753651837109186.4-2xa.gif',
  'eiji-tsuburayas-birthday':          'https://www.google.com/logos/doodles/2015/eiji-tsuburayas-114th-birthday-4809204506296320-hp2x.jpg',
  'feud':                              'https://googlefeud.com/images/site_image.jpg',
  'google-cat-game':                   'https://lh3.googleusercontent.com/hBCBRkmZ72Foztp1wlyr2KTCKLNzziYx-aw4Wo-UQt_9HzO3X6uEjQewwNvyanYSkBVwGDlAqrKBkERy4bC0UT_-xd8GG20-gY_PBA1d=s660',
  'halloween':                         'https://www.google.com/logos/doodles/2016/halloween-2016-5643419163557888-hp2x.gif',
  'magic-cat-academy':                 'https://www.google.com/logos/doodles/2016/halloween-2016-5643419163557888-hp2x.gif',
  'mothers-day-2013-doodle':           'https://lh3.googleusercontent.com/wDXccuVUTACkKZnPzFUU7EYuIeAiBDihbM0uXJX_7wljxdH0m1C2Gurr87pC93ZQcOwi3iUHkp64eBV1DiPRRbUL4ip9WppykUMCFHk5oA=s660',
  'pacman':                            'https://www.google.com/logos/doodles/2020/stay-and-play-at-home-with-popular-past-google-doodles-pac-man-2010-6753651837108775.2-2xa.gif',
  'pony-express':                      'https://www.google.com/logos/doodles/2015/155th-anniversary-of-the-pony-express-5959391580782592.2-hp.jpg',
  'slalom-canoe':                      'https://www.google.com/logos/2012/slalom_canoe-2012-hp.jpg',
  // Google Doodle football/soccer (from doodles.google page lh3 images)
  'google-doodle-football':            'https://lh3.googleusercontent.com/3KPEgX05dz5fSJ1KP1Lo14zp0J3fhAXyAWpSIbbN3YBE1rTFfzwmAXVSu_FXJDz8cB4tcM8C1-lWxfXSux6z6qznrvATh6VBNtPYBjil=s660',
  'soccer-2012':                       'https://lh3.googleusercontent.com/3KPEgX05dz5fSJ1KP1Lo14zp0J3fhAXyAWpSIbbN3YBE1rTFfzwmAXVSu_FXJDz8cB4tcM8C1-lWxfXSux6z6qznrvATh6VBNtPYBjil=s660',
  // CrazyGames (from www.crazygames.com og:image)
  'snake-fit':                         'https://imgs.crazygames.com/snake-fit/20220905151650/snake-fit-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'table-tennis-world-tour':           'https://imgs.crazygames.com/table-tennis-world-tour_16x9/20230908041108/table-tennis-world-tour_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  // CrazyGames covers
  'basket-random-pro':                 'https://imgs.crazygames.com/basket-random_16x9/20240617090207/basket-random_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'dinosaur':                          'https://imgs.crazygames.com/games/chrome-dino/cover-1669113832091.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'doodle-jump':                       'https://imgs.crazygames.com/games/doodle-jump/cover-1669135753297.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'doodle-jump-2':                     'https://imgs.crazygames.com/games/doodle-jump/cover-1669135753297.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'doodle-jump-3':                     'https://imgs.crazygames.com/games/doodle-jump/cover-1669135753297.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'gold-digger-frvr':                  'https://imgs.crazygames.com/gold-digger-frvr_16x9/20250519082511/gold-digger-frvr_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'growmi':                            'https://imgs.crazygames.com/growmi/20230406063042/growmi-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'no-internet-dinosaur-game-google-chrome-dino': 'https://imgs.crazygames.com/games/chrome-dino/cover-1669113832091.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'snake-football':                    'https://game3.glov3.me/uploads/game/html5/29729/icons/icon-512.png',
  'space-invaders-google':             'https://imgs.crazygames.com/games/space-invaders/cover_16x9-1714708168967.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'tic-tac-toe':                       'https://imgs.crazygames.com/games/tic-tac-toe/thumb-1579168809142.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'uno-online':                        'https://imgs.crazygames.com/games/uno-online/cover-1679068977831.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  // Poki game thumbnails
  'chess1':                            'https://a.silvergames.com/screenshots/chess-online/board.jpg',
  'google-maps-snake':                 'https://game3.glov3.me/uploads/game/html5/25812/static/img/bg/world.png',
  'iron-snout-pig-fighting-game':      'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/b6cbf50f539ae0330a2840e501b91a28/iron-snout.png',
  'minesweeper':                       'https://a.silvergames.com/screenshots/minesweeper/1_menu.jpg',
  'odd-bot-out':                       'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/fb59034a96e02ccaa8b9466d1dbd4246/odd-bot-out.png',
  'retro-basketball':                  'https://a.silvergames.com/screenshots/basket-swooshes/1_menu.jpg',
  'snake':                             'https://a.silvergames.com/screenshots/google-snake/3_gameplay.jpg',
  'snake1':                            'https://a.silvergames.com/screenshots/google-snake/2_retro-fun.jpg',
  'solitaire':                         'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/b1a4654a-e8b1-4024-bf96-b7bece553a0a/solitaire.jpg',
  'catpad':                            'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/fcb4f4ddcb233ca1948cef6ed812fe9f/catpad.png',
  'longcat':                           'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/ec15abd72b846d7a64a0f9936e2350a4/longcat.png',
  'stickman-hook':                     'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/99e090d154caf30f3625df7e456d5984/stickman-hook.png',
  'temple-of-boom':                    'https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=1200,height=1200,fit=cover,f=png/d710fe8830d731072485a582881605ea/temple-of-boom.png',
  // CrazyGames confirmed
  'dice-roll-protect-the-relic':       'https://imgs.crazygames.com/dice-roll-protect-the-relic_16x9/20241004021941/dice-roll-protect-the-relic_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'moto-xm-bike-race-game':            'https://imgs.crazygames.com/games/moto-x3m/cover_16x9-1700625476572.png?metadata=none&quality=100&width=1200&height=630&fit=crop',
  // Y8.com thumbnails (for GD-hosted games)
  'chicken-invaders':                  'https://cdn2.y8.com/cloudimage/165579/file/w380h285_retina_webp-6f1fdad71f77889b6620461b40014458.webp',
  'happy-snakes':                      'https://cdn2.y8.com/cloudimage/106891/file/w380h285_retina_webp-54266175d6d37dbfa5605ad57c716008.webp',
  'poker-with-friends':                'https://cdn2.y8.com/cloudimage/58345/file/w380h285_retina_webp-ba4397dc4754708787195b3eafa08c1e.webp',
  'toilet-rush':                       'https://cdn2.y8.com/cloudimage/71555/file/w380h285_retina_webp-b736e31ade292c7109d057282a06580d.webp',
  'popcorn-chef-2':                    'https://cdn2.y8.com/cloudimage/20269/file/w380h285_retina_webp-991eaf2a881498d2d9d731376d072825.webp',
  'ooze-odyssey-2':                    'https://cdn2.y8.com/cloudimage/11083/file/w380h285_retina_webp-502fee37b80d5e820372f988d28eabd1.webp',
  // fnfhub.net game icons (ID mirrors glov3.me game IDs)
  'block-puzzle-2020':                 'https://a.silvergames.com/j/b/s/block-puzzle.jpg',
  'capyloop-snack':                    'https://minigamesville.com/wp-content/uploads/2025/08/Capyloop_Snack.png',
  'car-football':                      'https://www3.minijuegosgratis.com/v3/games/thumbnails/208812_1.jpg',
  'coffee-craze-sorting-game':         'https://kizicdn.com/system/static/thumbs/tile_thumb/95308/thumb150_coffee-craze_150x150.jpg?17485172',
  'handless-millionaire':              'https://a.silvergames.com/j/b/s/handless-millionaire.jpg',
  'marble-race-creator':               'https://imgs.crazygames.com/marble-race-creator_16x9/20241106070736/marble-race-creator_16x9-cover?metadata=none&quality=100&width=1200&height=630&fit=crop',
  'memory':                            'https://a.silvergames.com/j/b/s/memory.jpg',
  'penguin-fight':                     'https://game3.glov3.me/uploads/game/html5/29677/icon-256.png',
  'pixel-art-color-by-numbers':        'https://a.silvergames.com/j/b/s/pixel-art.jpg',
  'popcorn-box':                       'https://kizicdn.com/system/static/thumbs/tile_thumb/8764/thumb150_popcorn-box-kizi.jpg?1594133863',
  'popcorn-time':                      'https://a.silvergames.com/j/b/s/popcorn-time.jpg',
  'real-snakesio':                     'https://kizicdn.com/system/static/thumbs/tile_thumb/5733/thumb150_real.jpg?1564744611',
  'stickman-party':                    'https://www2.minijuegosgratis.com/v3/games/thumbnails/232157_1.jpg',
  't-rex-run-3d-google':               'https://a.silvergames.com/j/b/s/t-rex-run-3d.jpg',
  'tap-tap-goal':                      'https://game3.glov3.me/uploads/game/html5/29552/icons/icon-512.png',
  'the-scale-of-the-universe-online':  'https://scaleofuniverse.com/assets/embed/en.png',
  'zuma-deluxe':                       'https://a.silvergames.com/screenshots/marble-lines/1_menu.jpg',
  // Misc sources
  'adventures-of-brave-bob':           'https://mod.fnfhub.net/uploads/game/icon/5711/adventures-of-brave-bob.jpg',
  'hangman-challenge':                 'https://www.gamearter.com/games/hangman-challenge/thumbnails/fbimage.jpg',
  'temple-run-2':                      'https://img.gamemonetize.com/pkyyuilfrqkcdnmrxsg60j22ypk0peje/512x384.jpg',
  'dino-swords':                       'https://dinoswords.gg/social/sharecard-facebook.png',
  'google-santa-tracker':              'https://santatracker.google.com/images/og.png',
};

async function tryHardcoded(slug) {
  const url = HARDCODED[slug];
  if (!url) return null;
  try {
    return await fetchBuffer(url);
  } catch (e) { return null; }
}

async function tryGlov3(url) {
  if (!url.includes('glov3.me')) return null;
  try {
    const html = (await fetchBuffer(url, 10000)).toString('utf8');
    // Match quoted paths: "'/logos/doodles/..." or unquoted in CSS: url(/logos/doodles/...)
    const m = html.match(/(?:['"]|url\()(\/?logos\/doodles\/[^'")\s>]+\.(png|jpg|gif))/i);
    if (!m) return null;
    const imgPath = m[1].startsWith('/') ? m[1] : '/' + m[1];
    return await fetchBuffer('https://www.google.com' + imgPath);
  } catch (e) { return null; }
}

async function tryGD(url) {
  const m = url.match(/html5\.gamedistribution\.com\/([a-f0-9]{32})/i);
  if (!m) return null;
  try { return await fetchBuffer('https://img.gamedistribution.com/' + m[1] + '-512x512.jpg'); }
  catch (e) { return null; }
}

async function processGame(slug, game) {
  const dest = path.join(IMG_DIR, slug + '-thumb.jpg');
  if (!FORCE && fs.existsSync(dest)) return slug + '-thumb.jpg';
  const url = game.iframeUrl || '';

  const hardcodedBuf = await tryHardcoded(slug);
  if (hardcodedBuf) {
    try {
      await sharp(hardcodedBuf).resize(W, H, { fit: 'cover', position: 'centre' }).jpeg({ quality: 90 }).toFile(dest);
      process.stdout.write('real    ' + slug + '\n');
      return slug + '-thumb.jpg';
    } catch(e) {}
  }

  const glovBuf = await tryGlov3(url);
  if (glovBuf) {
    try {
      await sharp(glovBuf).resize(W, H, { fit: 'contain', background: { r:255,g:255,b:255 } }).jpeg({ quality: 90 }).toFile(dest);
      process.stdout.write('doodle  ' + slug + '\n');
      return slug + '-thumb.jpg';
    } catch(e) {}
  }

  const gdBuf = await tryGD(url);
  if (gdBuf) {
    try {
      await sharp(gdBuf).resize(W, H, { fit: 'cover', position: 'centre' }).jpeg({ quality: 88 }).toFile(dest);
      process.stdout.write('GD      ' + slug + '\n');
      return slug + '-thumb.jpg';
    } catch(e) {}
  }

  try {
    await sharp(Buffer.from(buildSVG(game))).resize(W, H).jpeg({ quality: 90 }).toFile(dest);
    process.stdout.write('card    ' + slug + '\n');
    return slug + '-thumb.jpg';
  } catch(e) {
    process.stdout.write('FAIL ' + slug + ' -- ' + e.message + '\n');
    return null;
  }
}

async function main() {
  const data = JSON.parse(fs.readFileSync(GAMES_JSON, 'utf8'));
  const games = data.games;
  let slugs = Object.keys(games);
  if (ONLY_SLUG) slugs = slugs.filter(s => s === ONLY_SLUG);
  console.log('Generating ' + slugs.length + ' thumbnails...\n');
  let updated = 0;
  const failed = [];
  for (let i = 0; i < slugs.length; i += 4) {
    const batch = slugs.slice(i, i + 4);
    const results = await Promise.all(batch.map(s => processGame(s, games[s])));
    results.forEach((r, idx) => {
      if (r) { games[batch[idx]].thumbnail = r; updated++; }
      else failed.push(batch[idx]);
    });
  }
  fs.writeFileSync(GAMES_JSON, JSON.stringify(data, null, 2));
  console.log('\nDone -- ' + updated + ' thumbnails generated.');
  if (failed.length) console.log('Failed: ' + failed.join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
