"""
Fix failed doodles with alternate slugs + JSON API search.
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

def fetch_json(url, timeout=12):
    try:
        h = dict(HEADERS)
        h['Accept'] = 'application/json,*/*'
        req = urllib.request.Request(url, headers=h)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode('utf-8', errors='ignore')), r.geturl()
    except Exception as e:
        return None, ''

def og_image(html):
    for pat in [
        r'property=["\']og:image["\']\s+content=["\'](https?://[^"\']+)["\']',
        r'content=["\'](https?://[^"\']+)["\'][^>]*property=["\']og:image["\']',
    ]:
        m = re.search(pat, html, re.I | re.S)
        if m:
            return htmlmod.unescape(m.group(1))
    # Also look for logos path in HTML source
    m = re.search(r'["\']([^"\']*logos/doodles/[^"\']+\.(png|jpg|gif))["\']', html, re.I)
    if m:
        path = m.group(1)
        if path.startswith('/'):
            return 'https://www.google.com' + path
        return path
    return None

results = {}

# ---------------------------------------------------------
# Retry with alternate slugs
# ---------------------------------------------------------
RETRY_SLUGS = {
    'baseball':                           ['google-baseball', 'google-2010-baseball', 'baseball-2010', 'baseball-world-series'],
    'birth-of-hip-hop-doodle-game':       ['birth-of-hip-hop', 'hip-hop'],
    'celebrating-lake-xochimilco':        ['celebrating-lake-xochimilco-2017', 'protecting-lake-xochimilco', 'xochimilco'],
    'celebrating-johann-sebastian-bach':  ['celebrating-bach', 'celebrating-johanns-bach', 'j-s-bach', 'bach'],
    'chinese-new-year-snake-game':        ['chinese-new-year-2013', 'year-of-the-snake', 'year-of-the-snake-2013', 'celebrating-chinese-new-year'],
    'doctor-who-doodle':                  ['doctor-whos-50th-anniversary', 'doctor-who-50th', '50-years-of-doctor-who'],
    'doodle-cricket-game':                ['icc-champions-trophy-2017', 'icc-champions-trophy-2017-begin', 'cricket-world-cup-2016', 'cricket'],
    'doodle-crossword-puzzle':            ['crossword-puzzle-101st-anniversary', 'crossword', 'crossword-anniversary', 'crossword-puzzle'],
    'doodle-history-of-pizza':            ['pizza-margherita', 'worldwide-pizza-day', 'pizza'],
    'doodle-kids-coding':                 ['kids-coding', 'more-carrots', 'doodle-more-carrots'],
    'doodle-ludwig-van-beethovens-245th-year': ['beethoven-anniversary-2020', 'beethoven', 'beethovens-245th-birthday', 'beethovens-anniversary'],
    'doodle-oskar-fischinger':            ['oskar-fishingers-117th-birthday', 'oskar-fischinger', 'fischinger'],
    'doodle-qixi-festival-chilseok':      ['celebrating-qixi-festival-chilseok', 'qixi-festival-2020', 'qixi-festival'],
    'feud':                               ['celebrating-the-great-barrier-reef', 'word-coach', 'feud'],
    'garden-gnomes':                      ['gnome-palooza', 'garden-gnomes-2018', 'doodle-gnomes'],
    'google-cat-game':                    ['meow', 'cat-game', 'google-halloween-2012', 'halloween-2012'],
    'google-maps-snake':                  ['snake-world-tour', 'google-maps-snake', 'maps-snake'],
    'jerry-lawson':                       ['jerry-lawson-jerry-lawson'],
    'mothers-day-2020-doodle':            ['mothers-day-2020', 'mothers-day-2020-1'],
    'pony-express':                       ['celebrating-the-pony-express', 'pony-express-150th-anniversary', 'pony-express'],
    'slalom-canoe':                       ['2012-london-olympics', 'slalom-canoeing', 'canoe-slalom'],
    'swing-dancing-and-the-savoy-ballroom': ['the-savoy-ballroom', 'swing-dancing-at-the-savoy', 'savoy-ballroom'],
    'boba-bubble-tea':                    ['celebrating-boba', 'boba-tea', 'boba'],
    'pacman':                             ['pac-man-30th-anniversary', 'pac-man', 'pacman'],
    'blob-opera-google-game':             ['blob-opera', 'blob-opera-holiday'],
}

print("=== Retrying with alternate slugs ===", flush=True)
for slug, alt_slugs in RETRY_SLUGS.items():
    if slug not in games:
        continue
    found = False
    for alt in alt_slugs:
        url = f'https://www.google.com/doodles/{alt}'
        html, final = fetch(url)
        if not html:
            continue
        og = og_image(html)
        if og:
            print(f"  ✅ {slug} → [{alt}]: {og[:70]}")
            results[slug] = og
            found = True
            break
        time.sleep(0.2)
    if not found:
        print(f"  ❌ {slug}: all alts failed")
    time.sleep(0.3)

# ---------------------------------------------------------
# JSON API search for remaining
# ---------------------------------------------------------
print("\n=== Google Doodles JSON API ===", flush=True)
remaining = [s for s in RETRY_SLUGS if s not in results and s in games]
print(f"  Remaining: {remaining}")

# Collect doodle database
doodle_db = []  # list of {name, title, url, hires_url}

years = list(range(2010, 2024))
months = list(range(1, 13))

print("  Fetching JSON doodle database...", flush=True)
for year in years:
    for month in months:
        url = f'https://www.google.com/doodles/json/{year}/{month}?limit=1000&hl=en'
        jdata, _ = fetch_json(url)
        if jdata and isinstance(jdata, list) and len(jdata) > 0:
            for d in jdata:
                name = d.get('name','')
                title = d.get('title','')
                # Get the high-res URL
                img_path = d.get('hires_url') or d.get('url','')
                if img_path:
                    if not img_path.startswith('http'):
                        img_path = 'https://www.google.com' + img_path
                    doodle_db.append({'name': name, 'title': title.lower(), 'img': img_path})
        time.sleep(0.1)
    print(f"    year {year} done, db size={len(doodle_db)}", flush=True)

print(f"  Total doodles in DB: {len(doodle_db)}")

# Now search for remaining games in the DB
def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

for slug in remaining:
    if slug not in games:
        continue
    g = games[slug]
    game_title = g.get('title', slug)
    norm_title = normalize(game_title)
    norm_slug = normalize(slug)
    
    best = None
    best_score = 0
    for d in doodle_db:
        # Score by how much the title matches
        dn = normalize(d['name'])
        dt = normalize(d['title'])
        score = 0
        if norm_title in dt: score += 5
        if dt in norm_title: score += 3
        if norm_slug in dn: score += 4
        if dn in norm_slug: score += 2
        # Word overlap
        words = [w for w in norm_title.split() if len(w) > 3]
        for w in words:
            if w in dt or w in dn:
                score += 1
        if score > best_score:
            best_score = score
            best = d
    
    if best and best_score >= 3:
        print(f"  ✅ {slug} (title='{game_title}'): matched '{best['name']}' score={best_score}")
        print(f"     img: {best['img'][:70]}")
        results[slug] = best['img']
    else:
        print(f"  ❌ {slug}: no match (best score={best_score}, best='{best['name'] if best else None}')")

print(f"\n=== FINAL: {len(results)} images ===")
print(json.dumps(results, indent=2))
