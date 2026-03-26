"""
Phase 2 probe: mod.fnfhub.net game pages, CrazyGames main site, ikop.xyz, lh3 images.
"""
import json, urllib.request, re, time, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/data/games.json')) as f:
    data = json.load(f)
games = data['games']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def fetch(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            ct = r.headers.get('content-type','')
            if 'text' in ct or 'html' in ct or ct=='':
                return r.read().decode('utf-8', errors='ignore'), r.geturl()
            return '[BINARY]', r.geturl()
    except Exception as e:
        return f'[ERR: {e}]', ''

def og_image(html):
    m = re.search(r'property=["\']og:image["\']\s+content=["\'](https?://[^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(r'content=["\'](https?://[^"\']+)["\'][^>]*property=["\']og:image["\']', html, re.I)
    if not m:
        m = re.search(r'og:image.*?content=["\'](https?://[^"\']+)["\']', html, re.I)
    return m.group(1) if m else None

# --- Test 1: mod.fnfhub.net game pages ---
print("=== mod.fnfhub.net game pages ===")
# The glov3.me games have IDs like 5711, 25769, etc. -- try mod.fnfhub.net/game/{id}
test_ids = [('adventures-of-brave-bob', '5711'), ('baseball', '25769'), ('basket-random-pro', '29686'), 
            ('chess1', '29728'), ('catpad', '26030'), ('doodle-jump', '25784')]
for slug, gid in test_ids:
    for url_pattern in [f'https://mod.fnfhub.net/game/{gid}', f'https://glov3.me/{gid}', f'https://www.glov3.me/game/{gid}']:
        html, final = fetch(url_pattern)
        og = og_image(html)
        imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp)', html)
        icon_imgs = [i for i in imgs if 'icon' in i or 'thumb' in i or 'game' in i]
        if og or icon_imgs or (len(html) > 1000 and '[ERR' not in html and 'fnfhub' not in final):
            print(f"  {slug}: URL={url_pattern}")
            print(f"    og={og}, icon_imgs={icon_imgs[:2]}, final={final[:70]}")
    time.sleep(0.3)

# --- Test 2: CrazyGames main site og:image ---
print("\n=== CrazyGames main site ===")
cg_games = [(s,g) for s,g in games.items() if 'crazygames.com' in g.get('iframeUrl','')]
for slug, g in cg_games:
    # Try the main crazygames.com page
    url = f'https://www.crazygames.com/game/{slug}'
    html, final = fetch(url)
    og = og_image(html)
    imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp)', html)
    icon_imgs = [i for i in imgs if 'thumbnail' in i or 'thumb' in i or 'icon' in i or '/game' in i]
    print(f"  {slug}: og={og}")
    if icon_imgs: print(f"    icon_imgs={icon_imgs[:3]}")
    print(f"    final={final[:70]}, len={len(html)}")
    time.sleep(0.5)

# --- Test 3: doodles.google lh3 images ---
print("\n=== doodles.google lh3 images ===")
for slug, g in games.items():
    if 'doodles.google' in g.get('iframeUrl', '') or slug in ['google-doodle-football','soccer-2012']:
        url = g['iframeUrl']
        html, _ = fetch(url)
        lh3 = re.findall(r'https?://lh\d\.googleusercontent\.com/[^\s"<>]+', html)
        doodle_logos = re.findall(r'https?://www\.google\.com/logos/doodles/[^\s"<>\'\"]+', html)
        og = og_image(html)
        print(f"  {slug}:")
        print(f"    og={og}")
        if lh3: print(f"    lh3={lh3[:2]}")
        if doodle_logos: print(f"    logos={doodle_logos[:2]}")
        time.sleep(0.3)

# --- Test 4: ikop.xyz - get game names in HTML ---
print("\n=== ikop.xyz HTML content ===")
ikop_games = [(s,g) for s,g in games.items() if 'ikop.xyz' in g.get('iframeUrl','')]
for slug, g in ikop_games:
    url = g['iframeUrl']
    html, final = fetch(url)
    # Look for any image
    imgs = re.findall(r'["\']([^"\']*\.(?:jpg|png|webp|gif))["\']', html)
    title = re.search(r'<title[^>]*>([^<]+)</title>', html, re.I)
    print(f"  {slug}: title={title.group(1) if title else '?'}, len={len(html)}, imgs={imgs[:3]}")
    time.sleep(0.3)

# --- Test 5: gamearter.com ---
print("\n=== gamearter.com ===")
ga_games = [(s,g) for s,g in games.items() if 'gamearter' in g.get('iframeUrl','')]
for slug, g in ga_games:
    url = g['iframeUrl']
    html, _ = fetch(url)
    og = og_image(html)
    imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp)', html)
    print(f"  {slug}: og={og}, imgs={imgs[:3]}")
    # Also try main site
    url2 = f'https://www.gamearter.com/game/{slug}'
    html2, _ = fetch(url2)
    og2 = og_image(html2)
    print(f"    main page og={og2}")
    time.sleep(0.3)

# --- Test 6: gamemonetize main site ---
print("\n=== gamemonetize.com ===")
gm_games = [(s,g) for s,g in games.items() if 'gamemonetize' in g.get('iframeUrl','')]
for slug, g in gm_games:
    url = g['iframeUrl']
    # Extract game ID
    m = re.search(r'gamemonetize\.com/([A-Z0-9]+)', url)
    gid = m.group(1) if m else 'unknown'
    # GameMonetize CDN pattern
    cdn_url = f'https://img.gamemonetize.com/{gid}/512x384.jpg'
    html, _ = fetch(cdn_url)
    ok = '[BINARY]' in html or (not html.startswith('[ERR'))
    print(f"  {slug}: id={gid}, CDN attempt: {cdn_url}")
    print(f"    result={'OK (binary/success)' if ok and 'ERR' not in html else html[:100]}")
    time.sleep(0.3)
