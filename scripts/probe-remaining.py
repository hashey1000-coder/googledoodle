"""
Probe specific remaining card games for doodle logos in iframe HTML.
These should all be real Google Doodles - checking why tryGlov3 misses them.
"""
import urllib.request, re, time, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src/data/games.json')) as f:
    data = json.load(f)['games']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
}

def fetch(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f'[ERR:{e}]'

TARGETS = [
    'doodle-valentines-day',     # 25811
    'birth-of-hip-hop-doodle-game', # 25778
    'chinese-new-year-snake-game',  # 25765
    'doctor-who-doodle',           # 25790
    'doodle-crossword-puzzle',     # 25789
    'doodle-cricket-game',         # 8484
    'doodle-kids-coding',          # 25793
    'doodle-oskar-fischinger',     # 25809
    'doodle-ludwig-van-beethovens-245th-year', # 25836
    'pacman',                      # 7622 (frame.html)
    'pony-express',                # 25758 (ponyexpress15.html)
    'slalom-canoe',                # 25760
    'blob-opera-google-game',      # gacembed.withgoogle.com
    'feud',                        # 25840
    'google-cat-game',             # 25754
    'google-maps-snake',           # 25812
]

results = {}

for slug in TARGETS:
    if slug not in data:
        print(f'  MISSING {slug}')
        continue
    url = data[slug].get('iframeUrl', '')
    html = fetch(url)
    if '[ERR' in html[:10]:
        print(f'  ERR {slug}: {html[:60]}')
        time.sleep(0.5)
        continue
    
    # Look for any image references
    logos = re.findall(r'["\']([^"\']*logos/doodles/[^"\']+)["\']', html, re.I)
    all_imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|png|gif|webp)', html)
    google_imgs = [i for i in all_imgs if 'google' in i]
    gstatic = re.findall(r'["\']([^"\']*(?:www\.gstatic\.com|lh\d\.googleusercontent)[^"\']+)["\']', html)
    title = re.search(r'<title[^>]*>([^<]+)</title>', html, re.I)
    
    print(f'  {slug} (len={len(html)}):')
    print(f'    url={url[:70]}')
    print(f'    title={title.group(1)[:50] if title else "none"}')
    print(f'    logos={logos[:2]}')
    print(f'    google_imgs={google_imgs[:2]}')
    print(f'    gstatic={gstatic[:2]}')
    if logos:
        results[slug] = logos[0]
    time.sleep(0.8)

print('\n=== Found logos ===')
for slug, path in results.items():
    if not path.startswith('http'):
        path = 'https://www.google.com' + path
    print(f'  {slug}: {path}')
print(json.dumps({s: ('https://www.google.com' + p if not p.startswith('http') else p) for s,p in results.items()}, indent=2))
