"""
Strategy: For each game that is a real Google Doodle, fetch its page on
https://www.google.com/doodles/{slug} and extract the og:image.
Also handles games that need it from other sources.
"""
import json, urllib.request, re, time, os, html as htmlmod

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/data/games.json')) as f:
    data = json.load(f)
games = data['games']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9',
}

def fetch(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore'), r.geturl()
    except Exception as e:
        return '', ''

def og_image(html):
    for pat in [
        r'property=["\']og:image["\']\s+content=["\'](https?://[^"\']+)["\']',
        r'content=["\'](https?://[^"\']+)["\'][^>]*property=["\']og:image["\']',
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](https?://[^"\']+)["\']',
    ]:
        m = re.search(pat, html, re.I | re.S)
        if m:
            return htmlmod.unescape(m.group(1))
    return None

results = {}  # slug -> image_url

# Map our game slugs to Google Doodle page slugs
# Format: our_slug -> google_doodle_slug
DOODLE_SLUG_MAP = {
    'baseball':                          'baseball-2011',
    'basketball-2012-google-doodle':     'basketball-2012',
    'birth-of-hip-hop-doodle-game':      'birth-of-hip-hop',
    'celebrating-johann-sebastian-bach': 'celebrating-bach',
    'celebrating-lake-xochimilco':       'celebrating-lake-xochimilco-2017',
    'celebrating-pani-puri':             'celebrating-pani-puri',
    'celebrating-petanque':              'celebrating-petanque',
    'chamion-island-games':              'doodle-champion-island-games-begin',
    'chinese-new-year-snake-game':       'celebrating-the-chinese-new-year',
    'doctor-who-doodle':                 'doctor-who',
    'doodle-celebrating-loteria':        'celebrating-loteria',
    'doodle-celebrating-mbira':          'celebrating-mbira',
    'doodle-clara-rockmore':             'clara-rockmores-105th-birthday',
    'doodle-cricket-game':               'icc-champions-trophy-2017',
    'doodle-crossword-puzzle':           'crossword-puzzle-anniversary',
    'doodle-earth-day-2020':             'earth-day-2020',
    'doodle-googles-15th-birthday':      'googles-15th-birthday',
    'doodle-history-of-pizza':           'pizza-margherita',
    'doodle-kids-coding':                'kids-coding',
    'doodle-ludwig-van-beethovens-245th-year': 'beethoven-anniversary',
    'doodle-oskar-fischinger':           'oskar-fishingers-117th-birthday',
    'doodle-qixi-festival-chilseok':     'celebrating-qixi-festival',
    'doodle-roswells-66th-anniversary':  'roswells-66th-anniversary',
    'doodle-scoville':                   'wilbur-scovilles-151st-birthday',
    'doodle-valentines-day':             'valentines-day-2017',
    'doodle-valentines-day-2022':        'valentines-day-2022',
    'eiji-tsuburayas-birthday':          'eiji-tsuburayas-114th-birthday',
    'feud':                              'the-great-british-bake-off',
    'garden-gnomes':                     'garden-gnomes',
    'google-cat-game':                   'meow',
    'google-maps-snake':                 'google-maps-snake',
    'halloween':                         'halloween-2016',
    'jerry-lawson':                      'jerry-lawson',
    'magic-cat-academy':                 'halloween-2016',
    'mothers-day-2013-doodle':           'mothers-day-2013',
    'mothers-day-2020-doodle':           'mothers-day-2020',
    'pony-express':                      'pony-express',
    'slalom-canoe':                      'slalom-canoe',
    'swing-dancing-and-the-savoy-ballroom': 'swing-dancing',
    'doodle-scoville':                   'wilbur-scovilles-151st-birthday',
    'doodle-jump':                       None,  # not a google doodle
    'doodle-jump-2':                     None,
    'doodle-jump-3':                     None,
    'boba-bubble-tea':                   'celebrating-boba',
    'capyloop-snack':                    None,
    'block-puzzle-2020':                 None,
    'car-football':                      None,
    'basket-random-pro':                 None,
    'chess1':                            None,
    'coffee-craze-sorting-game':         None,
    'dice-roll-protect-the-relic':       None,
    'growmi':                            None,
    'handless-millionaire':              None,
    'longcat':                           None,
    'marble-race-creator':               None,
    'odd-bot-out':                       None,
    'ooze-odyssey-2':                    None,
    'pacman':                            'pac-man',
    'penguin-fight':                     None,
    'pixel-art-color-by-numbers':        None,
    'popcorn-time':                      None,
    'retro-basketball':                  None,
    'snake-football':                    None,
    'snake1':                            None,
    'solitaire':                         None,
    'space-invaders-google':             None,
    'stickman-party':                    None,
    'tap-tap-goal':                      None,
    'tic-tac-toe':                       None,
    'zuma-deluxe':                       None,
    'doodle-halloween-2020':             'halloween-2020',
    'memory':                            None,
    'doodle-jump':                       None,
    'minesweeper':                       None,
    'blob-opera-google-game':            'blob-opera',
    'google-santa-tracker':              None,
    'dino-swords':                       None,
    'dinosaur':                          None,
    'gold-digger-frvr':                  None,
    'popcorn-chef-2':                    None,
    't-rex-run-3d-google':               None,
    'iron-snout-pig-fighting-game':      None,
    'no-internet-dinosaur-game-google-chrome-dino': None,
    'stickman-hook':                     None,
    'temple-of-boom':                    None,
    'uno-online':                        None,
}

print("=== Google Doodle pages og:image ===", flush=True)
for slug, doodle_slug in DOODLE_SLUG_MAP.items():
    if doodle_slug is None:
        continue
    if slug not in games:
        continue
    
    url = f'https://www.google.com/doodles/{doodle_slug}'
    html, final = fetch(url)
    og = og_image(html)
    
    # Also look for logo paths in HTML
    logos = re.findall(r'["\']([^"\']*logos/doodles/[^"\']+\.(png|jpg|gif))["\']', html, re.I)
    lh3 = re.findall(r'https?://lh\d\.googleusercontent\.com/[^\s"\'<>]+', html)
    
    img = og
    if not img and logos:
        path = logos[0][0]
        if path.startswith('/'):
            img = 'https://www.google.com' + path
        elif path.startswith('http'):
            img = path
    if not img and lh3:
        img = lh3[0]
    
    status = '✅' if img else '❌'
    print(f"  {status} {slug}: {str(img)[:80]}")
    
    if img:
        results[slug] = img
    time.sleep(0.4)

print(f"\n=== Found {len(results)} doodle images ===")

# Also try some direct image URL guesses for remaining games
print("\n=== Trying known Google Doodle CDN patterns ===", flush=True)

# For games we didn't get yet, try gstatic/lh3 patterns
KNOWN_IMAGES = {
    'doodle-halloween-2020': 'https://www.google.com/logos/doodles/2020/halloween-2020-6753651837109529-l.gif',
    'doodle-valentines-day': 'https://www.google.com/logos/doodles/2017/valentines-day-2017-4965973932916736-l.gif',
    'memory': None,
}

for slug, img_url in KNOWN_IMAGES.items():
    if img_url and slug not in results:
        print(f"  hardcoded {slug}: {img_url}")
        results[slug] = img_url

print(f"\n\n=== FINAL SUMMARY: {len(results)} images found ===")
print(json.dumps(results, indent=2))
