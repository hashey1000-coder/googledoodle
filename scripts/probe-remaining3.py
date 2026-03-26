"""
Batch probe CrazyGames and other sites for remaining 52 card games.
"""
import urllib.request, re, time, json, os, html as htmlmod

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/data/games.json')) as f:
    data = json.load(f)['games']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    'Accept': 'text/html,*/*;q=0.9',
}

def fetch(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore'), r.geturl()
    except Exception as e:
        return '', str(e)

def og_image_from_html(html):
    """Extract og:image specifically."""
    # Look for og:image property+content in same or adjacent meta tag
    m = re.search(r'property=["\']og:image["\']\s+content=["\'](https?://[^"\']+)["\']', html, re.I)
    if m: return htmlmod.unescape(m.group(1))
    m = re.search(r'content=["\'](https?://[^"\']+)["\'][^>]*property=["\']og:image["\']', html, re.I)
    if m: return htmlmod.unescape(m.group(1))
    return None

# Remaining card games with their CrazyGames slug (or None if different site)
# Format: our_slug -> cg_slug (or dict with alternative sources)
CARD_GAMES_CG = {
    'basket-random-pro':                'basket-random',
    'capyloop-snack':                   'capyloop-snack',
    'car-football':                     'car-football',
    'catpad':                           None,
    'chess1':                           'chess',
    'chicken-invaders':                 'chicken-invaders',
    'coffee-craze-sorting-game':        None,
    'dice-roll-protect-the-relic':      None,
    'dinosaur':                         'chrome-dino',
    'doodle-cricket-game':              None,
    'doodle-jump':                      'doodle-jump',
    'doodle-jump-2':                    'doodle-jump',
    'doodle-jump-3':                    'doodle-jump',
    'doodle-valentines-day':            None,
    'gold-digger-frvr':                 'gold-digger-frvr',
    'google-maps-snake':                'google-snake',
    'growmi':                           'growmi',
    'handless-millionaire':             'handless-millionaire',
    'happy-snakes':                     None,
    'iron-snout-pig-fighting-game':     'iron-snout',
    'longcat':                          None,
    'marble-race-creator':              None,
    'memory':                           None,
    'minesweeper':                      'minesweeper',
    'moto-xm-bike-race-game':           None,
    'no-internet-dinosaur-game-google-chrome-dino': 'chrome-dino',
    'odd-bot-out':                      None,
    'ooze-odyssey-2':                   None,
    'penguin-fight':                    None,
    'pixel-art-color-by-numbers':       None,
    'poker-with-friends':               None,
    'popcorn-box':                      None,
    'popcorn-chef-2':                   None,
    'popcorn-time':                     None,
    'real-snakesio':                    'slither-io',
    'retro-basketball':                 None,
    'snake':                            'google-snake',
    'snake-football':                   'soccer-random',
    'snake1':                           'google-snake',
    'solitaire':                        'klondike-solitaire',
    'space-invaders-google':            'space-invaders',
    'stickman-hook':                    'stickman-hook',
    'stickman-party':                   'stickman-party',
    't-rex-run-3d-google':              't-rex-dino-runner-3d',
    'tap-tap-goal':                     None,
    'temple-of-boom':                   'temple-of-boom',
    'the-scale-of-the-universe-online': None,
    'tic-tac-toe':                      'tic-tac-toe-original',
    'toilet-rush':                      None,
    'uno-online':                       'uno-online',
    'block-puzzle-2020':                None,
    'zuma-deluxe':                      'zuma-revenge',
}

results = {}
tried_cg_slugs = set()

print("=== CrazyGames ===", flush=True)
for slug, cg_slug in CARD_GAMES_CG.items():
    if not cg_slug: continue
    if cg_slug in tried_cg_slugs:
        # Reuse image from previous game with same cg slug
        for s, img in results.items():
            if CARD_GAMES_CG.get(s) == cg_slug:
                results[slug] = img
                print(f'  ↔ {slug}: reuse {cg_slug}')
                break
        continue
    
    url = f'https://www.crazygames.com/game/{cg_slug}'
    html, final = fetch(url)
    og = og_image_from_html(html)
    
    # Filter out favicon
    if og and ('favicon' in og or 'touch-icon' in og or 'logo' in og.lower()):
        og = None
    
    if og:
        print(f'  ✅ {slug} [{cg_slug}]: {og[:70]}')
        results[slug] = og
        tried_cg_slugs.add(cg_slug)
    else:
        # Look for imgs.crazygames.com/games/ URL
        imgs = re.findall(r'https://imgs\.crazygames\.com/games/[^\s"\'<>]+\.(?:png|jpg|webp)', html)
        if imgs:
            img = imgs[0]
            # Remove HTML-encoded query params
            img = htmlmod.unescape(img.split('?')[0]) + '?metadata=none&quality=100&width=1200&height=630&fit=crop'
            print(f'  ✅ {slug} [{cg_slug}] (fallback): {img[:70]}')
            results[slug] = img
            tried_cg_slugs.add(cg_slug)
        else:
            print(f'  ❌ {slug} [{cg_slug}]: len={len(html)}, final={final[:50]}')
    time.sleep(0.5)

# === Other sites for specific games ===
print("\n=== Other sites ===", flush=True)

# doodle-valentines-day: search doodles.google sitemap for correct slug
OTHER_SOURCES = {
    'doodle-valentines-day': 'https://doodles.google/doodle/valentines-day-2017/',
    'doodle-cricket-game':   'https://doodles.google/doodle/icc-champions-trophy-2017/',
    'google-maps-snake':     'https://www.google.com/about/products/',
    'memory':                'https://artsandculture.google.com/experiment/puzzle-party/EwGHSo',
    'doodle-cricket-game2':  'https://doodles.google/doodle/icc-champions-trophy-2017-begin/',
}

for name, url in OTHER_SOURCES.items():
    html, final = fetch(url)
    og = og_image_from_html(html)
    lh3 = re.findall(r'https://lh\d\.googleusercontent\.com/[^\s"\'<>]+', html)
    logos = re.findall(r'https://www\.google\.com/logos/doodles/[^\s"\'<>]+', html)
    img = og or (lh3[0] if lh3 else None) or (logos[0] if logos else None)
    print(f'  {name}: {str(img)[:70] if img else "FAIL len="+str(len(html))+", final="+final[:40]}')
    if img:
        actual_slug = name.replace('2','').replace('-alt','')
        results[actual_slug] = img
    time.sleep(1)

print(f'\n=== SUMMARY: {len(results)} images found ===')
print(json.dumps(results, indent=2))
