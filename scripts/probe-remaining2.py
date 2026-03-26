"""
Fresh probe for remaining doodle games after rate-limit cooldown.
Each request has a 3-second delay.
"""
import urllib.request, re, time, json, html as htmlmod

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
}

def fetch(url, timeout=15):
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
    ]:
        m = re.search(pat, html, re.I)
        if m:
            return htmlmod.unescape(m.group(1))
    # Also look for logos path
    m = re.search(r'["\']([^"\']*logos/doodles/[^"\']+\.(png|jpg|gif))["\']', html, re.I)
    if m:
        p = m.group(1)
        return ('https://www.google.com' + p) if p.startswith('/') else p
    return None

# Games with correct slug guesses
SLUG_MAP = {
    'birth-of-hip-hop-doodle-game': '44th-anniversary-of-hip-hop',
    'chinese-new-year-snake-game':  'chinese-new-year-2013',
    'doctor-who-doodle':            'doctor-whos-50th-anniversary',
    'doodle-crossword-puzzle':      'crossword-puzzle-101st-anniversary',
    'doodle-cricket-game':          'icc-champions-trophy-2017-begin',
    'doodle-kids-coding':           'more-carrots',
    'doodle-oskar-fischinger':      'oskar-fishingers-117th-birthday',
    'doodle-ludwig-van-beethovens-245th-year': 'beethoven-anniversary-2020',
    'pacman':                       'pac-man-30th-anniversary',
    'slalom-canoe':                 '2012-london-olympics-slalom-canoe',
    'feud':                         'google-feud',
    'google-cat-game':              'halloween-2012',
    'google-maps-snake':            'google-maps-snake-world-tour',
    'blob-opera-google-game':       'blob-opera',
    'baseball':                     'google-baseball',
}

# Also try alternate slugs for each
SLUG_ALTS = {
    'birth-of-hip-hop-doodle-game': ['44th-anniversary-of-hip-hop', 'hip-hop-anniversary', 'birth-of-hip-hop-2017'],
    'chinese-new-year-snake-game':  ['chinese-new-year-2013', 'year-of-the-snake', 'chinese-new-year-of-the-snake'],
    'doctor-who-doodle':            ['doctor-whos-50th-anniversary', '50-years-of-doctor-who', 'doctor-who'],
    'doodle-crossword-puzzle':      ['crossword-puzzle-101st-anniversary', 'crossword-anniversary', 'crossword'],
    'doodle-cricket-game':          ['icc-champions-trophy-2017-begin', 'icc-champions-trophy-2017', 'cricket-game'],
    'doodle-kids-coding':           ['more-carrots', 'doodle-more-carrots', 'kids-coding'],
    'doodle-oskar-fischinger':      ['oskar-fishingers-117th-birthday', 'oskar-fischinger-birthday'],
    'doodle-ludwig-van-beethovens-245th-year': ['beethoven-anniversary-2020', 'beethoven-245th', 'beethoven'],
    'pacman':                       ['pac-man-30th-anniversary', 'pac-man'],
    'slalom-canoe':                 ['2012-london-olympics-slalom-canoe', 'slalom-canoe', 'canoe-slalom'],
    'feud':                         ['google-feud', 'feud'],
    'google-cat-game':              ['halloween-2012', 'halloween-2013', 'google-halloween'],
    'google-maps-snake':            ['google-maps-snake', 'snake-world-tour'],
    'blob-opera-google-game':       ['blob-opera'],
    'baseball':                     ['google-baseball', 'doodle-baseball', 'baseball'],
}

results = {}

for slug, alts in SLUG_ALTS.items():
    found = False
    for alt in alts:
        url = f'https://www.google.com/doodles/{alt}'
        print(f'  Trying {slug} → [{alt}]...', flush=True)
        html, final = fetch(url)
        if not html:
            print(f'    empty response')
            time.sleep(2)
            continue
        og = og_image(html)
        page_title = re.search(r'<title[^>]*>([^<]+)</title>', html, re.I)
        print(f'    len={len(html)}, final={final[:60]}, title={page_title.group(1)[:40] if page_title else "?"}')
        if og:
            print(f'    ✅ og={og[:80]}')
            results[slug] = og
            found = True
            break
        time.sleep(3)
    if not found:
        print(f'  ❌ {slug}: all attempts failed')
    time.sleep(2)

print(f'\n=== Found {len(results)} ===')
print(json.dumps(results, indent=2))
