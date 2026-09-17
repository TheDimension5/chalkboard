import re, json, importlib, os, sys, html as _h
sys.path.insert(0,'.')
from graph import HUB, BOARDS, STRANDS, TITLES, LESSON, EDGES, UNITS
from choice import CHOICE
BOARDS_URL=HUB+'boards/'
LV=['k5','g8','hs','col','max']
BAND={'k5':0,'g8':1,'hs':2,'col':3,'max':3}
base=open('one-rule.html',encoding='utf-8').read()
CSS=re.search(r'<style>(.*?)</style>',base,re.S).group(1)
CSS+=open('extra.css',encoding='utf-8').read()
ENGINE=open('engine.js',encoding='utf-8').read()
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Nunito:wght@400;700;900&display=swap">'
SPEAKER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
READ=f'<button class="btn read" data-lv="k5 g8" type="button">{SPEAKER}<span>Read to me</span></button>'
STD={}
SKILL={'launch':{'l1','l1b','l3','l3b','l3c','l3d','l5','l5b'},'heat':{'ht3','ht6','bo1','bo2','bo3','bo4','bo5'},'einstein':{'ch2a','ch2b','ch2c','ch2d','ch6c','ch7a','ch7b','ch9c','ch10a','ch10c'},'electricity':set(),'infinity':set(),'history':set(),'life':{'lf2d','lf4d','lf4e','lf5d','lf6c'},'scale':{'sc1e','sc2g'}}
EIN_STD={1:"3-PS2-3, 5-PS2-1, MS-PS2-3, MS-PS2-4",2:"5-PS2-1, MS-PS2-4, HS-PS2-4",3:"3-PS2-3, MS-PS2-5, HS-PS2-5",4:"MS-PS2-5, HS-PS2-4",5:"HS-PS2-4",6:"HS-PS2-4",7:"HS-PS2-4",8:"MS-PS2-4, HS-PS1-8",9:"HS-ETS1-1",10:"MS-PS2-4, HS-PS2-4"}
for n,v in EIN_STD.items(): STD[('einstein',n)]=v
CARDS={'boards':[]}
import re as _re
_strip=lambda h:_re.sub(r'\s+',' ',_re.sub(r'<[^>]+>','',h)).strip()
UNITS_OF={}
for u in UNITS:
    for i,st in enumerate(u['steps']): UNITS_OF.setdefault(st,[]).append((u,i+1))
def chapter_url(bid,n): return BOARDS[bid]['url']+f'#ch{n}'
def levelbar():
    return f'''<nav class="levels" aria-label="Reading level">
  <div class="wrap levels-in">
    <a class="home" href="{BOARDS_URL}">The Chalkboard</a>
    <span class="levels-label">Who's reading?</span>
    <div class="levels-btns" role="tablist">
      <button role="tab" data-level="k5" aria-selected="true">Kids<small>K to 5th</small></button>
      <button role="tab" data-level="g8" aria-selected="false">8th grade<small>middle school</small></button>
      <button role="tab" data-level="hs" aria-selected="false">High school<small>physics class</small></button>
      <button role="tab" data-level="col" aria-selected="false">College<small>major</small></button>
      <button role="tab" data-level="max" aria-selected="false">Max<small>no limits</small></button>
    </div>
    <span class="mcount" id="mcount"></span>
    <button class="lowpow" id="lowpow" type="button" aria-pressed="false" title="Fewer effects for older computers">Low power</button>
  </div>
</nav>'''
# ---- Einstein discussion questions, parsed from the teacher's guide ----
EIN_DISCUSS={}
tg=open('teachers.html',encoding='utf-8').read()
for bi,band in enumerate(re.findall(r'<section class="band">(.*?)</section>',tg,re.S)):
    for chap in re.findall(r'<div class="chap">(.*?)</div>',band,re.S):
        m=re.search(r'<h3>(\d+) ·',chap); qs=re.findall(r'<li>(.*?)</li>',re.search(r'<ol class="qs">(.*?)</ol>',chap,re.S).group(1)) if '<ol class="qs">' in chap else None
        if m and qs: EIN_DISCUSS.setdefault(int(m.group(1)),{})[bi]=qs
def warmup(bid,n):
    L=LESSON[(bid,n)]; return f'<p class="warmup"><b>Warm-up</b>{L["warm"]}</p>'
def lesson_end(bid,n):
    L=LESSON[(bid,n)]
    if L['discuss'] is None:
        d=EIN_DISCUSS.get(n,{});ol=''.join(f'<ol class="lv lv-{l}">'+''.join(f'<li>{q}</li>' for q in d.get(BAND[l],[]))+'</ol>' for l in LV)
    else: ol='<ol>'+''.join(f'<li>{q}</li>' for q in L['discuss'])+'</ol>'
    before=[a for a,b in EDGES if b==(bid,n)]; after=[b for a,b in EDGES if a==(bid,n)]
    links=[]
    if before: links.append('Before this: '+', '.join(f'<a href="{chapter_url(*x)}">{BOARDS[x[0]]["title"]} {x[1]}, {TITLES[x]}</a>' for x in before))
    if after: links.append('After this: '+', '.join(f'<a href="{chapter_url(*x)}">{BOARDS[x[0]]["title"]} {x[1]}, {TITLES[x]}</a>' for x in after))
    badges=''.join(f'<span class="unitbadge">{u["title"]} · step {i}</span>' for u,i in UNITS_OF.get((bid,n),[]))
    std=STD.get((bid,n))
    return f'''<div class="lesson-end">
      <p class="skill"><b>You can now:</b> {L["skill"]}.</p>
      <details class="discuss"><summary>Discuss</summary>{ol}</details>
      <p class="exit"><b>Exit ticket</b> {L["exit"]}</p>
      {('<p class="links">'+' · '.join(links)+'</p>') if links else ''}
      {('<p class="links">'+badges+'</p>') if badges else ''}
      {('<p class="links std"><b>Standards</b> '+std+'</p>') if std else ''}
      <div class="handin" data-ch="ch{n}" data-board="{_h.escape(BOARDS[bid]['title'],True)}" data-title="{_h.escape(TITLES[(bid,n)],True)}"><p class="mh">Hand it in</p><p>Write your exit ticket answer, put your name, and make a receipt to show your teacher. Nothing is sent anywhere.</p><div class="row"><input class="hi-name" type="text" placeholder="your name or initials" aria-label="your name"></div><textarea class="hi-exit" placeholder="your exit ticket answer" aria-label="your exit ticket answer"></textarea><div class="row"><button class="btn hi-make" type="button">Make my receipt</button><span class="hi-tools row" hidden><button class="btn hi-copy" type="button">Copy</button><button class="btn hi-print" type="button">Print</button></span></div><pre class="receipt" hidden></pre></div>
    </div>'''
def checkbox_numeric(P,n):
    CK=P.CHECK; opts='<option value="">unit…</option>'+''.join(f'<option value="{u}">{nm}</option>' for u,nm in P.UNITS); parts=[]
    for l in LV:
        q,a,u,tol,hint,ok=CK[n][l]
        parts.append(f'<div class="lv lv-{l}"><p class="q">{q}</p><form class="cf" data-a="{a}" data-u="{_h.escape(u,True)}" data-tol="{tol}" data-hint="{_h.escape(hint,True)}" data-ok="{_h.escape(ok,True)}"><input type="number" step="any" inputmode="decimal" placeholder="number" required aria-label="your answer"><select aria-label="unit">{opts}</select><button class="btn" type="submit">Check</button></form></div>')
    return f'<div class="check" data-ch="ch{n}"><p class="mh">Teach it back</p>'+''.join(parts)+'<p class="fb" aria-live="polite"></p></div>'
def checkbox_choice(bid,n):
    parts=[]
    for l in LV:
        q,opts,idx,hint,ok=CHOICE[bid][n][l]; name=f'c-{bid}-{n}-{l}'
        radios=''.join(f'<label class="opt"><input type="radio" name="{name}" value="{i}"> {_h.escape(o)}</label>' for i,o in enumerate(opts))
        parts.append(f'<div class="lv lv-{l}"><p class="q">{q}</p><form class="cf choice" data-type="choice" data-a="{idx}" data-hint="{_h.escape(hint,True)}" data-ok="{_h.escape(ok,True)}">{radios}<button class="btn" type="submit">Check</button></form></div>')
    return f'<div class="check" data-ch="ch{n}"><p class="mh">Teach it back</p>'+''.join(parts)+'<p class="fb" aria-live="polite"></p></div>'
def tb_missions(nchap): return [(f'tb{n}',f'ch{n}',LV,"Teach it back: answer the check question below.") for n in range(1,nchap+1)]
def wrap(frag):
    head,rest=frag.split('</style>',1)
    pwa='<meta name="theme-color" content="#1B2923">\n<link rel="manifest" href="'+HUB+'manifest.json">\n<link rel="apple-touch-icon" href="'+HUB+'icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Chalkboard">\n'
    sw='<script>if("serviceWorker" in navigator&&location.hostname.endsWith("github.io")){addEventListener("load",()=>navigator.serviceWorker.register("'+HUB+'sw.js").catch(()=>{}))}</script>\n'
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'+pwa+head+'</style>\n</head>\n<body>\n'+rest+sw+'</body>\n</html>\n'
HERO_ART=json.load(open('hero_art.json',encoding='utf-8'))
# ================= engine-built boards =================
def build_page(mod,sims):
    P=importlib.import_module(mod); bid=P.KEY
    for n,v in getattr(P,'STANDARDS',{}).items(): STD[(bid,n)]=v
    trail=''.join(f'<li><a href="#{a}" data-for="{a}"><span>{t}</span></a></li>' for a,t in P.TRAIL)
    lede=''.join(f'<div class="lv lv-{l}"><p class="lede">{P.HERO[l]}</p></div>' for l in LV)
    has_num=hasattr(P,'CHECK'); has_choice=bid in CHOICE
    secs=[]
    for n in sorted(P.CH):
        blocks=[]
        for l in LV:
            h2,when,paras=P.CH[n][l]
            blocks.append(f'<div class="lv lv-{l}"><h2>{h2}</h2>'+(f'<p class="when">{when}</p>' if when else '')+''.join(f'<p>{x}</p>' for x in paras)+'</div>')
        grown=f'<details class="grownups lv lv-k5 lv-g8"><summary>For grown-ups</summary><p>{P.GROWN[n]}</p></details>' if n in P.GROWN else ''
        check=checkbox_numeric(P,n) if has_num else (checkbox_choice(bid,n) if has_choice else '')
        secs.append(f'''<section class="chapter" id="ch{n}">
  <div class="text">
    <p class="eyebrow">Chapter {n}</p>
    {READ}
    {warmup(bid,n)}
    {chr(10).join('    '+b for b in blocks).strip()}
    {grown}
  </div>
  <figure class="lab">
    {P.FIG[n]}
    <ul class="missions" data-ch="ch{n}"></ul>
    {check}
    {lesson_end(bid,n)}
  </figure>
</section>''')
    missions=list(P.MISSIONS)+(tb_missions(len(P.CH)) if has_choice else [])
    defs=json.dumps([dict({'id':i,'ch':c,'lv':l,'text':t},**({'try':True} if i in SKILL.get(bid,set()) else {})) for i,c,l,t in missions],ensure_ascii=False)
    js=open(sims,encoding='utf-8').read()
    if has_choice:
        js=js.replace('checks:{','checks:Object.assign(TB_CHECKS,{',1); js=js[:js.rindex('}});')]+'})});'+js[js.rindex('}});')+4:]
        js='const TB_CHECKS={'+','.join(f"tb{n}:()=>Chalk.checkPassed('ch{n}')" for n in range(1,len(P.CH)+1))+'};\n'+js
    body=f'''<meta charset="utf-8">
<title>{P.TITLE}</title>
<meta name="description" content="{P.DESC}">
{FONTS}
<style>{CSS}</style>
<a class="skip" href="#ch1">Skip to the story</a>
<ul class="trail" aria-label="Chapters">{trail}</ul>
{levelbar()}
<div class="wrap" id="top">
<header class="hero">
  <div class="text">
    <p class="eyebrow">{P.EYEBROW}</p>
    {READ}
    <h1>{P.TITLE}</h1>
    {lede}
    <div class="hero-cta"><a class="btn primary" href="#ch1">Start the story</a></div>
  </div>
  <div class="panel hero-art">{HERO_ART[bid]}</div>
</header>
<main>
{chr(10).join(secs)}
</main>
<footer class="closing">
  <p class="eyebrow">The end, for now</p>
  <p>{P.CLOSING[1]}</p>
  <p class="big" style="margin-left:auto;margin-right:auto">{P.CLOSING[0]}</p>
  <div class="cert" id="cert" hidden data-board="{_h.escape(BOARDS[bid]["title"],True)}"><p class="mh">Certificate</p><p class="cert-note"></p><button class="btn primary" id="cert-go" type="button">Print my certificate</button><div class="certout" hidden></div></div>
  <p class="teach"><a href="{BOARDS_URL}">More boards at The Chalkboard</a></p>
</footer>
</div>
<div class="tray" aria-hidden="true"></div>
<script>{ENGINE}</script>
<script>
const MISSION_DEFS={defs};
const UNIT_WHY={json.dumps(getattr(P,'UNIT_WHY',{}),ensure_ascii=False)};
{js}
</script>
'''
    return P,body,missions
# ================= Einstein: migrate onto the engine =================
def einstein_page():
    s=base
    a=s.index('<script>');b=s.rindex('</script>')+9
    js=s[a+8:b-9]; lines=js.split('\n')
    def cut(start_pred,end_pred):
        nonlocal lines
        i=next(k for k,l in enumerate(lines) if start_pred(l)); j=next(k for k in range(i+1,len(lines)) if end_pred(lines[k]))
        lines=lines[:i]+lines[j:]
    # drop wrapper + globals up to chalk helpers
    cut(lambda l:l.startswith('(function'),lambda l:l.startswith('/* ---------- chalk drawing helpers'))
    dup=('function text(','function circle(','function glow(','function shade(','function poly(','function rr(','function marble(','let LEVEL=','const fmt=','const SUP=','function readout(','function arrow(')
    lines=[l for l in lines if not l.startswith(dup)]
    cut(lambda l:l.startswith('/* ---------- sim framework'),lambda l:l.startswith('/* ---------- level-aware helpers'))
    cut(lambda l:l.startswith('let mdone=new Set()'),lambda l:l.startswith('/* ---------- read aloud'))
    i=next(k for k,l in enumerate(lines) if l.startswith('/* ---------- read aloud')); lines=lines[:i]
    js='\n'.join(lines)
    # rename MISSION_DEFS line to include teach-backs
    m=re.search(r'const MISSION_DEFS=(\[.*?\]);',js); defs=json.loads(m.group(1))
    defs+= [{'id':f'tb{n}','ch':f'ch{n}','lv':LV,'text':"Teach it back: answer the check question below."} for n in range(1,11)]
    for d in defs:
        if d['id'] in SKILL['einstein']: d['try']=True
    js=js[:m.start()]+'const MISSION_DEFS='+json.dumps(defs,ensure_ascii=False)+';'+js[m.end():]
    head='const {C,REDUCE,rgba,clamp,dist,$,fmt,sup,pct,text,circle,glow,shade,poly,rr,box,marble,readout,arrow,rng,at,makeSim,hook,slide}=Chalk;\n'
    tail='''
try{if(!localStorage.getItem('chalk:einstein:missions')&&localStorage.getItem('one-rule-missions'))localStorage.setItem('chalk:einstein:missions',localStorage.getItem('one-rule-missions'))}catch(e){}
Chalk.start({key:'einstein',missions:MISSION_DEFS,checks:Object.assign(MCHECK,{'''+','.join(f"tb{n}:()=>Chalk.checkPassed('ch{n}')" for n in range(1,11))+'})});\n'
    script='<script>'+ENGINE+'</script>\n<script>\n'+head+js+tail+'</script>'
    h=s[:a]+script+s[b:]
    # HTML: warm-ups after read buttons; checks + lesson-ends after missions
    for n in range(1,11):
        sec=re.search(rf'<section class="chapter[^"]*" id="ch{n}">.*?</section>',h,re.S); t=sec.group(0)
        t=t.replace('<span>Read to me</span></button>','<span>Read to me</span></button>\n    '+warmup('einstein',n),1)
        tail_html='\n    '+checkbox_choice('einstein',n)+'\n    '+lesson_end('einstein',n)
        if n==2: t=t.replace('<ul class="missions" data-ch="ch2t"></ul>','<ul class="missions" data-ch="ch2t"></ul>'+tail_html,1)
        elif n==8: t=t.replace('\n  </div>\n</section>',tail_html+'\n  </div>\n</section>',1)
        else: t=t.replace(f'<ul class="missions" data-ch="ch{n}"></ul>',f'<ul class="missions" data-ch="ch{n}"></ul>'+tail_html,1)
        h=h[:sec.start()]+t+h[sec.end():]
    h=h.replace('</style>',open('extra.css',encoding='utf-8').read()+'</style>',1)
    h=h.replace('<a class="home" href="https://thedimension5.github.io/chalkboard/">','<a class="home" href="'+BOARDS_URL+'">',1)
    h=h.replace('https://thedimension5.github.io/one-rule-for-everything/teachers.html',HUB+'einstein/teachers.html')
    h=h.replace('<p class="teach">','<div class=\"cert\" id=\"cert\" hidden data-board=\"One Rule for Everything\"><p class=\"mh\">Certificate</p><p class=\"cert-note\"></p><button class=\"btn primary\" id=\"cert-go\" type=\"button\">Print my certificate</button><div class=\"certout\" hidden></div></div><p class="teach">',1)
    return h,defs
# ================= build =================
for d in ['site/infinity','site/history','site/electricity','site/launch','site/heat','site/life','site/scale','frag']: os.makedirs(d,exist_ok=True)
MAPDATA={'boards':[],'edges':[[a[0],a[1],b[0],b[1]] for a,b in EDGES],'units':[{'id':u['id'],'title':u['title'],'steps':[list(x) for x in u['steps']]} for u in UNITS]}
def board_entry(bid,missions,nch):
    ch=[]
    for n in range(1,nch+1):
        ids=[i for i,c,l,t in missions if c in (f'ch{n}',f'ch{n}t')]
        ch.append({'n':n,'title':TITLES[(bid,n)],'warm':LESSON[(bid,n)]['warm'],'missions':ids})
    return {'id':bid,'title':BOARDS[bid]['title'],'url':BOARDS[bid]['url'],'strand':BOARDS[bid]['strand'],'subject':BOARDS[bid]['subject'],'chapters':ch}
ein_html,ein_defs=einstein_page()
os.makedirs('site/einstein',exist_ok=True)
open('frag/einstein.html','w',encoding='utf-8').write(ein_html); open('einstein-index.html','w',encoding='utf-8').write(wrap(ein_html)); open('site/einstein/index.html','w',encoding='utf-8').write(wrap(ein_html))
MAPDATA['boards'].append(board_entry('einstein',[(d['id'],d['ch'],d['lv'],d['text']) for d in ein_defs],10))
_echs=[]
for n in range(1,11):
    sec=_re.search(rf'<section class="chapter[^"]*" id="ch{n}">.*?</section>',base,_re.S).group(0)
    titles={l:_strip(_re.search(rf'<div class="lv lv-{l}"><h2>(.*?)</h2>',sec,_re.S).group(1)) for l in LV}
    fc=_re.search(r'<figcaption>(.*?)</figcaption>',sec,_re.S);L=LESSON[('einstein',n)]
    ck={l:{'type':'choice','q':CHOICE['einstein'][n][l][0],'opts':CHOICE['einstein'][n][l][1],'idx':CHOICE['einstein'][n][l][2],'hint':CHOICE['einstein'][n][l][3],'ok':CHOICE['einstein'][n][l][4]} for l in LV}
    _echs.append({'n':n,'title':titles,'std':STD.get(('einstein',n),''),'warm':L['warm'],'skill':L['skill'],'exit':L['exit'],'discuss':[EIN_DISCUSS.get(n,{}).get(b,[]) for b in range(4)],'figcap':_strip(fc.group(1)) if fc else 'Play the experiment on the page.','missions':[{'id':d['id'],'text':d['text'],'lv':d['lv'],'skill':d['id'] in SKILL['einstein']} for d in ein_defs if d['ch'] in (f'ch{n}',f'ch{n}t')],'check':ck})
CARDS['boards'].insert(0,{'id':'einstein','title':BOARDS['einstein']['title'],'url':BOARDS['einstein']['url'],'subject':BOARDS['einstein']['subject'],'chapters':_echs})
print('einstein',len(ein_html))
for mod,sims in [('page_heat','sims_heat.js'),('page_launch','sims_launch.js'),('page_electric','sims_electric.js'),('page_infinity','sims_infinity.js'),('page_history','sims_history.js'),('page_life','sims_life.js'),('page_scale','sims_scale.js')]:
    P,frag,missions=build_page(mod,sims)
    chs=[]
    for n in sorted(P.CH):
        ck={}
        if hasattr(P,'CHECK') and n in P.CHECK:
            un=dict(P.UNITS)
            for l in LV:
                q,a,u,tol,hint,ok=P.CHECK[n][l];ck[l]={'type':'num','q':q,'a':a,'u':u,'uname':un.get(u,u),'tol':tol,'hint':hint,'ok':ok}
        elif P.KEY in CHOICE:
            for l in LV:
                q,opts,idx,hint,ok=CHOICE[P.KEY][n][l];ck[l]={'type':'choice','q':q,'opts':opts,'idx':idx,'hint':hint,'ok':ok}
        L=LESSON[(P.KEY,n)]
        chs.append({'n':n,'title':{l:P.CH[n][l][0] for l in LV},'std':STD.get((P.KEY,n),''),'warm':L['warm'],'skill':L['skill'],'exit':L['exit'],'discuss':L['discuss'],'figcap':_strip(_re.search(r'<figcaption>(.*?)</figcaption>',P.FIG[n],_re.S).group(1)),'missions':[{'id':i,'text':x,'lv':l,'skill':i in SKILL.get(P.KEY,set())} for i,c,l,x in missions if c==f'ch{n}'],'check':ck})
    CARDS['boards'].append({'id':P.KEY,'title':BOARDS[P.KEY]['title'],'url':BOARDS[P.KEY]['url'],'subject':BOARDS[P.KEY]['subject'],'chapters':chs})
    open(f'frag/{P.KEY}.html','w',encoding='utf-8').write(frag); open(f'site/{P.KEY}/index.html','w',encoding='utf-8').write(wrap(frag))
    MAPDATA['boards'].append(board_entry(P.KEY,missions,len(P.CH)))
    print(P.KEY,len(frag))
# ================= hub =================
def card(b,meta,svg,badge=''):
    B=BOARDS[b];bd=f'<span class="badge">{badge}</span>' if badge else '';return f'<a class="card" href="{B["url"]}">{bd}<span class="subj">{B["subject"]}</span>{svg}<h2>{B["title"]}</h2><p>{meta[0]}</p><span class="meta">{meta[1]}</span><span class="go">Open the board →</span></a>'
ICONS=json.load(open('icons.json',encoding='utf-8'))
cards_html='\n'.join([
 card('launch',("Push it, drop it, launch it, crash it, fling it into orbit. Newton's laws keep score.","6 chapters · 21 missions"),ICONS['launch'],'Good first board'),
 card('heat',("Turn a fire into electricity, then get through a winter blackout on it.","8 chapters · 30 missions"),ICONS['heat']),
 card('electricity',("Watts to fields, one idea at a time, with a checker for any system you meet.","10 chapters · 23 missions"),ICONS['elec']),
 card('einstein',("Einstein's thirty-year hunt for one rule behind gravity and magnetism.","10 chapters · 31 missions"),ICONS['phys']),
 card('infinity',("Some infinities are bigger than others. Prove it yourself.","5 chapters · 15 missions"),ICONS['math']),
 card('history',("How the past reaches us, from scribes and dead scripts to bit rot.","6 chapters · 18 missions"),ICONS['hist']),
 card('life',("Copy a recipe, hunt moths as the bird, flip peas, race germs, then rebuild the tree of life.","6 chapters · 29 missions"),ICONS['life'],'New'),
 card('scale',("Telescope and microscope in one eyepiece: from the edge of the universe to the Planck length.","2 chapters · 14 missions"),ICONS['scale'],'New')])
units_html=''.join(f'''<div class="unit" data-unit="{u["id"]}"><h3>{u["title"]}</h3><p>{u["blurb"]}</p><ol>'''+''.join(f'<li><a href="{chapter_url(*st)}">{TITLES[st]}</a> <small>{BOARDS[st[0]]["title"]}, chapter {st[1]}</small></li>' for st in u['steps'])+'</ol></div>' for u in UNITS)
qlist=''.join(f'<li><a href="{chapter_url(b,n)}">{LESSON[(b,n)]["warm"]}</a><small>{BOARDS[b]["title"]} {n}</small></li>' for (b,n) in sorted(LESSON,key=lambda k:(list(BOARDS).index(k[0]),k[1])))
grade='<div class="grade"><span class="lbl">Who\'s reading?</span><button class="btn" data-glevel="k5">Kids</button><button class="btn" data-glevel="g8">8th grade</button><button class="btn" data-glevel="hs">High school</button><button class="btn" data-glevel="col">College</button><button class="btn" data-glevel="max">Max</button><span class="hint" id="gnote"></span></div>'
HEAD=lambda title,desc:f'<meta charset="utf-8">\n<title>{title}</title>\n<meta name="description" content="{desc}">\n{FONTS}\n<style>{CSS}</style>'
BASE=[
 ('Launch Lab','Forces and motion','K-PS2, 3-PS2, MS-PS2, HS-PS2','built',HUB+'launch/'),
 ('Electricity From Zero','Electricity and circuits','4-PS3, MS-PS2-3, HS-PS2-4, HS-PS3','built',HUB+'electricity/'),
 ('Hot Side, Cold Side','Heat, energy transfer, thermoelectric power','4-PS3, MS-PS3, HS-PS3, HS-ETS1','built',HUB+'heat/'),
 ('One Rule for Everything','Gravity, fields, and the open puzzle','5-PS2, MS-PS2-4, HS-PS2-4','built',BOARDS['einstein']['url']),
 ('Nothing Is Ever Lost','Energy: forms, transfer, conservation','4-PS3, MS-PS3, HS-PS3','next',''),
 ('Everything Is a Wave','Light, sound, and signals','1-PS4, 4-PS4, MS-PS4, HS-PS4','next',''),
 ('What Everything Is Made Of','Matter, particles, atoms, reactions','2-PS1, 5-PS1, MS-PS1, HS-PS1','next',''),
 ('Where We Are','Earth, Moon, Sun, and the universe','1-ESS1, 5-ESS1, MS-ESS1, HS-ESS1','next',''),
 ('The Restless Planet','Plates, volcanoes, erosion','2-ESS2, 4-ESS2, MS-ESS2, HS-ESS2','next',''),
 ('The Sky Machine','Weather and climate','K-ESS2, 3-ESS2, MS-ESS3, HS-ESS3','next',''),
 ('The Web That Feeds Everything','Ecosystems and food webs','K-LS1, 5-LS2, MS-LS2, HS-LS2','next',''),
 ('A City of Cells','Cells and the body','1-LS1, 4-LS1, MS-LS1, HS-LS1','next',''),
 ('How Life Changes','Heredity and evolution','3-LS3, MS-LS3, MS-LS4, HS-LS4','built',HUB+'life/'),
]
base_html=''.join(f'<li class="{st}"><span class="pill">{"Built" if st=="built" else "Next"}</span>'+(f'<a href="{u}">{t}</a>' if u else f'<b>{t}</b>')+f'<span class="what">{w}</span><span class="ngss">{n}</span></li>' for t,w,n,st,u in BASE)
hub=f'''{HEAD("The Chalkboard","Hard ideas made playable: interactive science, math, biology and history boards with five reading levels, missions and teach-backs.")}
<div class="wrap" id="top">
<header class="hero hub-hero">
  <div class="text">
    <p class="eyebrow">Hard ideas, made playable</p>
    <h1>The Chalkboard</h1>
    <p class="lede">Eight boards. Every chapter is an experiment you play, a mission it scores, and a question you answer back, at five reading levels from kindergarten to graduate school.</p>
    {grade}
  </div>
</header>
<main>
<div class="cards">
{cards_html}
</div>
<div class="how">
  <div><h3>Pick who's reading</h3><p>The words, the readouts and the experiments all change with the level. Nothing is dumbed down; it is only slowed down.</p></div>
  <div><h3>Play, then teach it back</h3><p>Missions light up as the physics awards them. A question at the end of every chapter checks the number and the unit.</p></div>
  <div><h3>Read to me</h3><p>On the two youngest levels a button reads each chapter aloud, so a six-year-old can play alone.</p></div>
</div>
<div class="teachers"><span class="eyebrow">For teachers</span><p>Every chapter is a 25-minute lesson. <a href="{HUB}classroom/">The Classroom</a> gives you a printable lesson card for any chapter, with the answer key, a student link at the right level, and a checker for the receipts students hand in. <a href="{HUB}map/">The Map</a> shows all 53 chapters, the units, and a search by question. <a href="{HUB}kits/">Chalk Kits</a> are the hands-on twins of the experiments.</p></div>
</main>
<footer class="closing" style="padding-top:3rem">
  <p class="eyebrow">Made with chalk</p>
  <p class="big" style="margin-left:auto;margin-right:auto">Nothing here is dumbed down. It is only ever slowed down.</p>
</footer>
</div>
<div class="tray" aria-hidden="true"></div>
<script>
const MAP={json.dumps(MAPDATA,ensure_ascii=False)};
{open('map.js',encoding='utf-8').read()}
</script>
'''
mappage=f'''{HEAD("The Chalkboard Map","Every chapter on The Chalkboard as a map with prerequisites and progress, plus ready-made units, a search by question, and the science roadmap.")}
<div class="wrap" id="top">
<header class="hero hub-hero">
  <div class="text">
    <p class="eyebrow"><a class="home" href="{BOARDS_URL}">The Chalkboard</a></p>
    <h1>The Map</h1>
    <p class="lede">Fifty-three chapters on eight boards. Arrows are prerequisites between boards. Lit chapters are ones you have done missions in. Pick a unit to see its path, or start from a question.</p>
    {grade}
  </div>
</header>
<main>
<div class="mapwrap">
  <div class="mapbar"><span class="lbl">Units</span><button class="btn is-on" data-mapunit="">Show all</button>{''.join(f'<button class="btn" data-mapunit="{u["id"]}">{u["title"]}</button>' for u in UNITS)}</div>
  <div class="map"><canvas id="cv-map" aria-label="Map of all chapters with prerequisite arrows and your progress."></canvas><div class="tip" id="maptip"></div></div>
</div>
<section class="units-sec"><p class="eyebrow" style="margin-top:2.6rem">Units for teachers</p><p class="lede" style="max-width:60ch;margin-top:.2rem;font-size:1.05rem">Each unit is a path across boards. One chapter is one lesson: warm-up, experiment, mission, teach it back, discuss, exit ticket. About 25 minutes each.</p><div class="units">{units_html}</div></section>
<section class="qsearch"><p class="eyebrow">Start from a question</p><input type="search" id="qbox" placeholder="Type a word: battery, infinity, magnet, fire…" aria-label="Search the warm-up questions"><ul class="qlist" id="qlist">{qlist}</ul></section>
<section class="base"><p class="eyebrow" style="margin-top:3rem">The science base layer</p><p class="lede" style="max-width:62ch;margin-top:.2rem;font-size:1.05rem">Thirteen boards that cover what science teachers actually teach from kindergarten to the end of high school, each a single board with five reading levels. NGSS anchors are listed so you can find your lesson. Five are built.</p><ul class="baselist">{base_html}</ul></section>
</main>
<footer class="closing" style="padding-top:3rem">
  <p class="eyebrow">The Chalkboard</p>
  <p class="big" style="margin-left:auto;margin-right:auto"><a href="{BOARDS_URL}" style="text-decoration:none">Back to the boards</a></p>
</footer>
</div>
<div class="tray" aria-hidden="true"></div>
<script>
const MAP={json.dumps(MAPDATA,ensure_ascii=False)};
{open('map.js',encoding='utf-8').read()}
</script>
'''
os.makedirs('site/map',exist_ok=True)
open('frag/map.html','w',encoding='utf-8').write(mappage); open('site/map/index.html','w',encoding='utf-8').write(wrap(mappage))
os.makedirs('site/boards',exist_ok=True)
open('frag/hub.html','w',encoding='utf-8').write(hub); open('site/boards/index.html','w',encoding='utf-8').write(wrap(hub)); open('site/.nojekyll','w').write('')
intro=open('intro.html',encoding='utf-8').read().replace('__FONTS__',FONTS).replace('__BOARDS__',BOARDS_URL).replace('__MAP__',HUB+'classroom/')
os.makedirs('site/classroom',exist_ok=True)
classroom=f'''{HEAD("The Classroom","Lesson cards for every chapter of The Chalkboard: pick a grade, a board and a chapter, print the card, and check student receipts.")}
<div class="wrap" id="top">
<header class="hero hub-hero">
  <div class="text">
    <p class="eyebrow"><a class="home" href="{BOARDS_URL}">The Chalkboard</a></p>
    <h1>The Classroom</h1>
    <p class="lede">Pick a grade, a board and a chapter. You get a one-page lesson card with timing, standards, missions, the answer key, discussion questions and the exit ticket, plus a student link that opens at the right level. Students hand in a receipt at the end of each chapter; check it below.</p>
    {grade}
  </div>
</header>
<main>
<div class="picker"><label class="slider">Board <select id="cb-board"></select></label><label class="slider">Chapter <select id="cb-chapter"></select></label><button class="btn primary" id="cb-print">Print this card</button><button class="btn" id="cb-printall">Print every chapter of this board</button><a class="btn" href="{HUB}map/">The map and units</a><a class="btn" href="{HUB}kits/">Chalk Kits: hands-on twins</a></div>
<div id="cards"></div>
<section class="verify"><p class="eyebrow">Find a lesson by standard</p><input type="search" id="sbox" placeholder="Type a code: MS-PS2, HS-PS3-1, 5-PS2…" aria-label="search by standard"><ul class="qlist" id="sout"></ul></section>
<section class="verify"><p class="eyebrow">Build a class roster</p><p class="lede" style="max-width:60ch;margin-top:.2rem;font-size:1.02rem">Paste every receipt your class handed in, one after another. You get a grid of students by chapter, and a button that copies it as a spreadsheet.</p><textarea id="ro" rows="8" placeholder="Paste many receipts here…" aria-label="paste many receipts"></textarea><div class="row"><button class="btn primary" id="ro-go">Build the roster</button></div><div id="ro-out"></div></section>
<section class="verify"><p class="eyebrow">Check a receipt</p><p class="lede" style="max-width:60ch;margin-top:.2rem;font-size:1.02rem">Paste the receipt a student made. The code is computed from the receipt's own text, so an edited receipt will not check out. Nothing here is stored or sent.</p><textarea id="vr" rows="8" placeholder="THE CHALKBOARD RECEIPT&#10;Board: …" aria-label="paste a receipt"></textarea><div class="row"><button class="btn" id="vr-go">Check the code</button></div><p id="vr-out" class="fb" aria-live="polite"></p></section>
</main>
<footer class="closing" style="padding-top:3rem"><p class="eyebrow">The Chalkboard</p><p class="big" style="margin-left:auto;margin-right:auto"><a href="{BOARDS_URL}" style="text-decoration:none">Back to the boards</a></p></footer>
</div>
<div class="tray" aria-hidden="true"></div>
<script>
const CARDS={json.dumps(CARDS,ensure_ascii=False)};
{open('classroom.js',encoding='utf-8').read()}
</script>
'''
open('frag/classroom.html','w',encoding='utf-8').write(classroom); open('site/classroom/index.html','w',encoding='utf-8').write(wrap(classroom))
open('frag/intro.html','w',encoding='utf-8').write(intro); open('site/index.html','w',encoding='utf-8').write(wrap(intro))

# ================= kits =================
from kits import KITS
kit_html=''
for bid,items in KITS:
    B=BOARDS[bid]
    cards=''.join(f'''<div class="kit"><span class="pair"><a href="{chapter_url(bid,k["ch"])}">pairs with chapter {k["ch"]}: {TITLES[(bid,k["ch"])]}</a> · {k["mins"]} min</span><h3>{k["title"]}</h3><p class="mat"><b>You need:</b> {k["materials"]}</p><ol>{''.join(f"<li>{s}</li>" for s in k["steps"])}</ol><p class="notice"><b>What to notice:</b> {k["notice"]}</p></div>''' for k in items)
    kit_html+=f'<section class="kitboard"><h2>{B["title"]}</h2><p class="sub">{B["subject"]} · {len(items)} activities</p><div class="kitgrid">{cards}</div></section>'
kits_page=f'''{HEAD("Chalk Kits","The physical twin of every experiment on The Chalkboard: cheap classroom activities with materials, steps and what to notice, paired to the digital missions.")}
<div class="wrap" id="top">
<header class="hero hub-hero"><div class="text"><p class="eyebrow"><a class="home" href="{BOARDS_URL}">The Chalkboard</a></p><h1>Chalk Kits</h1><p class="lede">Every experiment on the boards has a twin you can do with things already in the room. Coins for the crash lab, a balloon for rockets, a ruler for the launch, a candle for the module. Each one takes minutes, and each points back to the chapter and its missions.</p></div></header>
<main><div class="kits">{kit_html}</div></main>
<footer class="closing" style="padding-top:3rem"><p class="eyebrow">The Chalkboard</p><p class="big" style="margin-left:auto;margin-right:auto"><a href="{HUB}classroom/" style="text-decoration:none">Lesson cards are in the Classroom</a></p></footer>
</div><div class="tray" aria-hidden="true"></div>
'''
os.makedirs('site/kits',exist_ok=True);open('frag/kits.html','w',encoding='utf-8').write(kits_page);open('site/kits/index.html','w',encoding='utf-8').write(wrap(kits_page))
# ================= qa =================
qa_boards=json.dumps([{'id':b,'url':BOARDS[b]['url']} for b in BOARDS])
qa=f'''{HEAD("Chalkboard Self-Test","Loads every board, drives every simulation for ten seconds, and reports what painted, what errored, and whether the missions engine is alive.")}
<div class="wrap qa" id="top">
<header class="hero hub-hero"><div class="text"><p class="eyebrow"><a class="home" href="{BOARDS_URL}">The Chalkboard</a></p><h1>Self-test</h1><p class="lede">Loads every board in the background, steps every simulation 600 times, and checks that every canvas painted, no script error fired, missions rendered, and the level switch works. Run it after any change.</p><div class="row"><button class="btn primary" id="qa-go">Run the self-test</button></div></div></header>
<main><table id="qa-table"><thead><tr><th>Board</th><th>Canvases</th><th>Painted</th><th>Missions</th><th>Levels</th><th>Errors</th><th>Result</th></tr></thead><tbody id="qa-body"></tbody></table><div id="qa-frames"></div></main>
</div>
<script>
const BOARDS={qa_boards};
const $=id=>document.getElementById(id);
function painted(doc){{const cs=[...doc.querySelectorAll('canvas')];let n=0;for(const c of cs){{try{{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let k=0;for(let i=3;i<d.length;i+=40)if(d[i]>0){{k++;break}}if(k)n++}}catch(e){{}}}}return[n,cs.length]}}
async function testBoard(b){{const tr=document.createElement('tr');tr.innerHTML=`<td>${{b.id}}</td><td colspan="6">loading…</td>`;$('qa-body').appendChild(tr);
  const f=document.createElement('iframe');f.src=b.url+'?level=hs';$('qa-frames').appendChild(f);const errs=[];
  await new Promise(r=>{{f.onload=r;setTimeout(r,15000)}});const w=f.contentWindow,doc=f.contentDocument;try{{w.addEventListener('error',e=>errs.push(String(e.message)))}}catch(e){{}}
  await new Promise(r=>setTimeout(r,800));let ticked=0;try{{doc.querySelectorAll('.chapter').forEach(s=>s.scrollIntoView());for(let i=0;i<600;i++){{w.Chalk.tick(1/60);ticked++}}}}catch(e){{errs.push('tick: '+e.message)}}
  let lv='?';try{{doc.querySelector('.levels-btns [data-level="k5"]').click();await new Promise(r=>setTimeout(r,200));lv=doc.documentElement.dataset.level==='k5'?'ok':'stuck'}}catch(e){{lv='no bar'}}
  const [p,n]=painted(doc);const ms=doc.querySelectorAll('.missions li.m').length;const ok=errs.length===0&&p===n&&n>0&&ms>0&&lv==='ok';
  tr.innerHTML=`<td>${{b.id}}</td><td>${{n}}</td><td>${{p}}/${{n}}</td><td>${{ms}}</td><td>${{lv}}</td><td>${{errs.length?errs.join('; ').slice(0,120):'none'}}</td><td class="${{ok?'ok':'fail'}}">${{ok?'PASS':'FAIL'}}</td>`;f.remove()}}
$('qa-go').addEventListener('click',async()=>{{$('qa-body').innerHTML='';for(const b of BOARDS)await testBoard(b)}});
</script>
'''
os.makedirs('site/qa',exist_ok=True);open('site/qa/index.html','w',encoding='utf-8').write(wrap(qa))
# ================= einstein extras: teacher guide + redirect stub for the old repo =================
open('site/einstein/teachers.html','w',encoding='utf-8').write(wrap(open('teachers.html',encoding='utf-8').read().split('\n',1)[1] if open('teachers.html',encoding='utf-8').read().startswith('<meta charset') else open('teachers.html',encoding='utf-8').read()))
open('redirect-index.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=https://thedimension5.github.io/chalkboard/einstein/"><link rel="canonical" href="https://thedimension5.github.io/chalkboard/einstein/"><title>One Rule for Everything has moved</title></head><body style="font-family:sans-serif;padding:2rem"><p>This board moved to <a href="https://thedimension5.github.io/chalkboard/einstein/">thedimension5.github.io/chalkboard/einstein/</a>.</p></body></html>')
open('redirect-teachers.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=https://thedimension5.github.io/chalkboard/einstein/teachers.html"><title>Moved</title></head><body><a href="https://thedimension5.github.io/chalkboard/einstein/teachers.html">Moved here.</a></body></html>')

print('hub',len(hub))
