"""
Full scan of all card games to collect real image URLs.
Results are printed as JSON for use in generate-thumbnails.js.
"""
import json, urllib.request, re, time, os, html as htmlmod

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/data/games.json')) as f:
    data = json.load(f)
games = data['games']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
}

def fetch(url, timeout=10):
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
        r'og:image[^>]+content=["\'](https?://[^"\']+)["\']',
        r'content=["\'](https?://[^"\']+)["\'][^>]*og:image',
    ]:
        m = re.search(pat, html, re.I)
        if m:
            return htmlmod.unescape(m.group(1))
    return None

def page_title(html):
    m = re.search(r'<title[^>]*>([^<]+)</title>', html, re.I)
    return m.group(1).strip() if m else ''

results = {}  # slug -> image_url

# ----------------------------------------------------------------
# 1. GLOV3.ME games — use glov3.me/{id} → mod.fnfhub.net/{id}
# ----------------------------------------------------------------
print("=== GLOV3.ME card games ===", flush=True)
glov3_games = [(s, g) for s, g in games.items() 
               if re.search(r'glov3\.me/uploads/game/html5/(\d+)', g.get('iframeUrl',''))]

# Separate doodle games (already have logos) from card games
IMAGES_DIR = os.path.join(ROOT, 'public/assets/images')
def is_card(slug):
    jpg = os.path.join(IMAGES_DIR, slug + '-thumb.jpg')
    if not os.path.exists(jpg):
        return True
    # Check if it's an SVG-generated card by checking file size < 100KB typically
    # Actually just try to re-fetch for all
    return True

for slug, g in glov3_games:
    m = re.search(r'/html5/(\d+)/', g['iframeUrl'])
    if not m:
        continue
    gid = m.group(1)
    
    url = f'https://glov3.me/{gid}'
    html, final = fetch(url)
    
    if not html or 'fnfhub.net' not in final:
        print(f"  SKIP {slug} (id={gid}): bad redirect to {final[:50]}")
        continue
    
    # Get og:image from the mod.fnfhub.net page
    og = og_image(html)
    title = page_title(html)
    
    # Also look for game icon pattern
    icon_pat = re.findall(r'(https?://mod\.fnfhub\.net/uploads/game/icon/[^\s"\'<>]+\.(?:jpg|png|webp))', html)
    
    # Pick best image - prefer og:image, then first icon
    img_url = None
    if og and 'fnfhub.net' in og:
        img_url = og
    elif icon_pat:
        # Use the icon matching this specific ID if possible
        matching = [i for i in icon_pat if f'/icon/{gid}/' in i]
        if matching:
            img_url = matching[0]
        else:
            img_url = icon_pat[0]  # fallback to first icon
    
    # Title match check
    # Normalize for comparison
    norm_slug = slug.lower().replace('-','').replace('_','')
    norm_title = title.lower().replace(' ','').replace('-','').replace('_','')
    
    print(f"  {slug} (id={gid}): title='{title[:40]}' img={str(img_url)[:70]}")
    
    if img_url:
        results[slug] = img_url
    
    time.sleep(0.25)

# ----------------------------------------------------------------
# 2. CRAZYGAMES
# ----------------------------------------------------------------
print("\n=== CrazyGames ===", flush=True)
cg_games = [(s, g) for s, g in games.items() if 'crazygames.com' in g.get('iframeUrl','')]
for slug, g in cg_games:
    html, final = fetch(f'https://www.crazygames.com/game/{slug}')
    og = og_image(html)
    if og:
        print(f"  {slug}: {og[:80]}")
        results[slug] = og
    else:
        print(f"  {slug}: no og:image")
    time.sleep(0.5)

# ----------------------------------------------------------------
# 3. DOODLES.GOOGLE games
# ----------------------------------------------------------------
print("\n=== doodles.google ===", flush=True)
dg_games = [(s, g) for s, g in games.items() if 'doodles.google' in g.get('iframeUrl','')]
for slug, g in dg_games:
    html, _ = fetch(g['iframeUrl'])
    og = og_image(html)
    lh3 = re.findall(r'https?://lh\d\.googleusercontent\.com/[^\s"\'<>]+', html)
    logos = re.findall(r'https?://www\.google\.com/logos/doodles/[^\s"\'<>]+', html)
    img = og or (lh3[0] if lh3 else None) or (logos[0] if logos else None)
    print(f"  {slug}: {str(img)[:80]}")
    if img:
        results[slug] = img
    time.sleep(0.3)

# ----------------------------------------------------------------
# 4. GOOGLE.COM games (doodle-halloween-2020, memory)
# ----------------------------------------------------------------
print("\n=== google.com games ===", flush=True)
gc_games = [(s, g) for s, g in games.items() if g.get('iframeUrl','').startswith('https://www.google.com')]
for slug, g in gc_games:
    html, _ = fetch(g['iframeUrl'])
    og = og_image(html)
    logos = re.findall(r'https?://www\.google\.com/logos/doodles/[^\s"\'<>]+', html)
    lh3 = re.findall(r'https?://lh\d\.googleusercontent\.com/[^\s"\'<>]+', html)
    img = og or (logos[0] if logos else None) or (lh3[0] if lh3 else None)
    print(f"  {slug}: og={og}, logos={logos[:1]}")
    if img:
        results[slug] = img
    time.sleep(0.3)

# ----------------------------------------------------------------
# 5. GAMEARTER
# ----------------------------------------------------------------
print("\n=== gamearter ===", flush=True)
ga_games = [(s, g) for s, g in games.items() if 'gamearter' in g.get('iframeUrl','')]
for slug, g in ga_games:
    html, _ = fetch(f'https://www.gamearter.com/game/{slug}')
    og = og_image(html)
    print(f"  {slug}: {str(og)[:80]}")
    if og:
        results[slug] = og
    time.sleep(0.3)

# ----------------------------------------------------------------
# 6. GAMEMONETIZE
# ----------------------------------------------------------------
print("\n=== gamemonetize ===", flush=True)
gm_games = [(s, g) for s, g in games.items() if 'gamemonetize' in g.get('iframeUrl','')]
for slug, g in gm_games:
    url = g['iframeUrl']
    # Try fetching the iframe HTML to find gamemonetize ID
    html, _ = fetch(url)
    # Look for the game ID (usually an alphanumeric string)
    m = re.search(r'gamemonetize\.com/([A-Z0-9a-z]+)', url)
    gid = m.group(1) if m else None
    # Try CDN pattern
    cdn_url = f'https://img.gamemonetize.com/{gid}/512x384.jpg' if gid else None
    if cdn_url:
        print(f"  {slug}: id={gid}, CDN={cdn_url}")
        results[slug] = cdn_url
    time.sleep(0.3)

# ----------------------------------------------------------------
# 7. IKOP.XYZ - try parent site
# ----------------------------------------------------------------
print("\n=== ikop.xyz ===", flush=True)
ikop_games = [(s, g) for s, g in games.items() if 'ikop.xyz' in g.get('iframeUrl','')]
for slug, g in ikop_games:
    url = g['iframeUrl']
    m = re.search(r'ikop\.xyz/([^/]+)/?', url)
    game_path = m.group(1) if m else None
    
    # Try the main ikop.xyz/game/{slug} page  
    for try_url in [f'https://ikop.xyz/game/{slug}', f'https://www.ikop.xyz/{game_path}', f'https://ikop.xyz/{slug}']:
        html, final = fetch(try_url)
        if html and len(html) > 500:
            og = og_image(html)
            title = page_title(html)
            imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|png|webp)', html)
            print(f"  {slug}: url={try_url} → {final[:50]}")
            print(f"    title={title[:40]}, og={str(og)[:60]}, imgs={imgs[:2]}")
            if og:
                results[slug] = og
            break
    time.sleep(0.3)

# ----------------------------------------------------------------
# 8. Other remaining games
# ----------------------------------------------------------------
print("\n=== Other single games ===", flush=True)
other_hosts = ['blob-opera', 'dino-swords', 'dinosaur', 'gold-digger-frvr', 
               'google-santa-tracker', 'popcorn-chef-2', 't-rex-run-3d-google',
               'google-doodle-football', 'soccer-2012']
for slug in other_hosts:
    if slug in games and slug not in results:
        g = games[slug]
        url = g.get('iframeUrl', '')
        html, _ = fetch(url)
        og = og_image(html)
        lh3 = re.findall(r'https?://lh\d\.googleusercontent\.com/[^\s"\'<>]+', html)
        logos = re.findall(r'https?://www\.google\.com/logos/doodles/[^\s"\'<>]+', html)
        img = og or (lh3[0] if lh3 else None) or (logos[0] if logos else None)
        print(f"  {slug}: host={url[:40]} img={str(img)[:60]}")
        if img:
            results[slug] = img
        time.sleep(0.3)

# ----------------------------------------------------------------
# Final output
# ----------------------------------------------------------------
print(f"\n\n=== SUMMARY: Found {len(results)} real images ===")
print(json.dumps(results, indent=2))
