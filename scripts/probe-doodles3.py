"""
Probe doodles.google pages with corrected og:image extraction (handles https:https:// bug).
"""
import urllib.request, re, time, json, html as htmlmod

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,*/*;q=0.9',
}

def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore'), r.geturl()
    except Exception as e:
        return '', ''

def get_doodle_image(html):
    """Extract image from doodles.google page (handles double https: bug)."""
    # Look for lh3 URLs in og:image or itemprop:image content attributes
    m = re.search(r'content=["\'](https?:)?(https?://(?:lh\d\.googleusercontent\.com|www\.google\.com/logos/doodles)/[^"\']+)["\']', html, re.I)
    if m:
        return m.group(2)
    # Also look for lh3 directly
    m = re.search(r'(https://lh\d\.googleusercontent\.com/[^\s"\'<>]+)', html)
    if m:
        return m.group(1)
    # And google logos
    m = re.search(r'(https://www\.google\.com/logos/doodles/[^\s"\'<>]+)', html)
    if m:
        return m.group(1)
    return None

# All remaining games and their likely doodles.google slug(s)
SLUG_TRIES = {
    'birth-of-hip-hop-doodle-game': [
        '44th-anniversary-of-hip-hop', 'hip-hop', 'birth-of-hip-hop',
    ],
    'chinese-new-year-snake-game': ['chinese-new-year-2013'],
    'doctor-who-doodle': ['doctor-whos-50th-anniversary'],
    'doodle-crossword-puzzle': [
        'crossword-puzzle-101st-anniversary', 'crossword',
    ],
    'doodle-cricket-game': ['icc-champions-trophy-2017', 'cricket'],
    'doodle-kids-coding': ['kids-coding', 'more-carrots'],
    'doodle-oskar-fischinger': ['oskar-fishingers-117th-birthday'],
    'doodle-ludwig-van-beethovens-245th-year': [
        'beethoven-anniversary-2020', 'beethoven',
    ],
    'pacman': ['pac-man-30th-anniversary', 'pac-man'],
    'slalom-canoe': ['london-2012-olympic-games', 'slalom-canoe', '2012-london-olympics-slalom-canoe'],
    'feud': ['the-great-break-in', 'feud', 'game'],
    'google-cat-game': ['halloween-2012'],
    'google-maps-snake': ['google-maps-snake', 'snake-world-tour'],
    'blob-opera-google-game': ['blob-opera'],
    'baseball': ['baseball-2011', 'google-baseball', 'baseball'],
}

results = {}

for slug, slug_list in SLUG_TRIES.items():
    found = False
    for dslug in slug_list:
        url = f'https://doodles.google/doodle/{dslug}/'
        print(f'  {slug} → {dslug} ... ', end='', flush=True)
        html, final = fetch(url)
        if not html or len(html) < 1000:
            print(f'empty')
            time.sleep(1.5)
            continue
        img = get_doodle_image(html)
        title = re.search(r'<title[^>]*>([^<]+)</title>', html, re.I)
        print(f'✅ img={str(img)[:60]}' if img else f'no-img (len={len(html)}, title={title.group(1)[:30] if title else "?"})')
        if img:
            results[slug] = img
            found = True
            break
        time.sleep(2)
    if not found:
        print(f'  ❌ {slug}')
    time.sleep(1)

print(f'\n=== Found {len(results)} ===')
print(json.dumps(results, indent=2))
