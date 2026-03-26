"""
Probe various sources to find real thumbnail images for card games.
"""
import json, urllib.request, re, time, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/data/games.json')) as f:
    data = json.load(f)
games = data['games']

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

def fetch(url, timeout=8):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore'), r.geturl()
    except Exception as e:
        return '', ''

def og_image(html):
    patterns = [
        r'property=["\']og:image["\']\s+content=["\'](https?://[^"\']+)["\']',
        r'content=["\'](https?://[^"\']+\.(jpg|jpeg|png|webp))["\']\s+property=["\']og:image["\']',
        r'<meta[^>]+og:image[^>]+content=["\'](https?://[^"\']+)["\']',
        r'<meta[^>]+content=["\'](https?://[^"\']+\.(jpg|jpeg|png|webp))["\'][^>]+og:image',
    ]
    for p in patterns:
        m = re.search(p, html, re.IGNORECASE)
        if m:
            return m.group(1)
    return None

# --- Test 1: glov3.me parent site ---
print("=== Testing glov3.me parent site ===")
for slug, g in list(games.items())[:3]:
    url = g.get('iframeUrl', '')
    m = re.search(r'/html5/(\d+)/', url)
    if not m: continue
    gid = m.group(1)
    html, final = fetch('https://glov3.me/game/' + gid)
    og = og_image(html)
    imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp)', html)
    print(f"  {slug} (id={gid}): og={og}, imgs={imgs[:2]}, len={len(html)}, final={final[:60]}")
    time.sleep(0.3)

# --- Test 2: CrazyGames og:image ---
print("\n=== Testing CrazyGames ===")
cg_games = [(s,g) for s,g in games.items() if 'crazygames.com' in g.get('iframeUrl','')]
for slug, g in cg_games[:3]:
    url = g['iframeUrl']
    # Try to scrape the game page on crazygames.com
    # Extract slug from URL
    html, final = fetch(url)
    og = og_image(html)
    print(f"  {slug}: og={og}, len={len(html)}")
    time.sleep(0.3)

# --- Test 3: doodles.google games ---
print("\n=== Testing doodles.google ===")
doodle_games = [(s,g) for s,g in games.items() if 'doodles.google' in g.get('iframeUrl','')]
for slug, g in doodle_games:
    url = g['iframeUrl']
    html, final = fetch(url)
    og = og_image(html)
    imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp|gif)', html)
    lh3 = re.findall(r'lh\d\.googleusercontent\.com/[^\s"<>]+', html)
    gstatic = re.findall(r'www\.gstatic\.com/[^\s"<>]+\.(?:png|jpg|gif)', html)
    print(f"  {slug}: og={og}")
    if imgs: print(f"    imgs: {imgs[:2]}")
    if lh3: print(f"    lh3: {lh3[:2]}")
    if gstatic: print(f"    gstatic: {gstatic[:2]}")
    time.sleep(0.3)

# --- Test 4: game-cdn.ikop.xyz games ---
print("\n=== Testing ikop.xyz games ===")
ikop_games = [(s,g) for s,g in games.items() if 'ikop.xyz' in g.get('iframeUrl','')]
for slug, g in ikop_games:
    url = g['iframeUrl']
    html, final = fetch(url)
    og = og_image(html)
    imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp)', html)
    print(f"  {slug}: og={og}, imgs={imgs[:2]}, len={len(html)}")
    time.sleep(0.3)

# --- Test 5: gamemonetize ---
print("\n=== Testing gamemonetize ===")
gm_games = [(s,g) for s,g in games.items() if 'gamemonetize' in g.get('iframeUrl','')]
for slug, g in gm_games:
    url = g['iframeUrl']
    html, final = fetch(url)
    og = og_image(html)
    imgs = re.findall(r'https?://[^\s"<>]+\.(?:jpg|png|webp)', html)
    print(f"  {slug}: og={og}, imgs={imgs[:2]}")
    time.sleep(0.3)
