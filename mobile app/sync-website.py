import urllib.request, urllib.parse, re, pathlib, concurrent.futures, json
ROOT = pathlib.Path(__file__).parent
BASE = 'https://www.teenlaunch.app/'
queue = {'index.html','js/home-simplified.js','pages/about.html','pages/help.html','pages/career_dna_test.html','pages/my-journey.html','pages/portfolio-builder.html','pages/career-copilot.html','pages/profile.html','pages/settings.html','assets/icons/app_icon.png'}
seen=set(); errors=[]
def get(path):
    try:
        data=urllib.request.urlopen(BASE+urllib.parse.quote(path,safe='/'),timeout=25).read()
        dest=ROOT/'site'/path; dest.parent.mkdir(parents=True,exist_ok=True); dest.write_bytes(data)
        links=set()
        if dest.suffix in ('.html','.css','.js'):
            content=data.decode('utf-8')
            refs=re.findall(r'''(?:src|href)\s*=\s*["']([^"']+)["']|url\(["']?([^)'" ]+)|["']((?:\.?\.?/)?(?:pages|js|css|data|assets|components)/[^"'`<>\s]+)["']''',content)
            for match in refs:
                ref=next((x for x in match if x),'')
                u=urllib.parse.urlparse(urllib.parse.urljoin(BASE+path,ref))
                p=urllib.parse.unquote(u.path).lstrip('/')
                if u.netloc=='www.teenlaunch.app' and p and pathlib.Path(p).suffix.lower() in ('.html','.css','.js','.json','.png','.jpg','.jpeg','.svg','.webp','.ico','.pdf'):
                    links.add(p)
        return links
    except Exception as e:
        errors.append({'path':path,'error':str(e)}); return set()
while queue and len(seen)<240:
    batch=sorted(queue-seen); queue=set(); seen.update(batch)
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for links in pool.map(get,batch): queue.update(links-seen)
(ROOT/'download-report.json').write_text(json.dumps({'downloaded':len(seen)-len(errors),'errors':errors},indent=2))
print(json.dumps({'downloaded':len(seen)-len(errors),'errors':errors}))
