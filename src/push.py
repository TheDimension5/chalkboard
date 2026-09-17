import subprocess,json,base64,sys,os,filecmp
REPO='TheDimension5/chalkboard'
def push(rel,msg):
    p=os.path.join('site',rel);data=open(p,'rb').read()
    r=subprocess.run(['gh','api',f'repos/{REPO}/contents/{rel}','--jq','.sha'],capture_output=True,text=True);sha=r.stdout.strip() if r.returncode==0 else ''
    payload={'message':msg,'content':base64.b64encode(data).decode()}
    if sha:payload['sha']=sha
    open('payload.json','w').write(json.dumps(payload))
    r=subprocess.run(['gh','api','-X','PUT',f'repos/{REPO}/contents/{rel}','--input','payload.json','--jq','.content.path'],capture_output=True,text=True)
    print(('ok ' if r.returncode==0 else 'FAIL ')+rel,r.stderr.strip()[:120])
    return r.returncode==0
if __name__=='__main__':
    msg=sys.argv[1];files=sys.argv[2:]
    if files==['--changed']:
        B='/Users/ianmessina/Desktop/E=MC/chalkboard';files=[]
        for root,ds,fs in os.walk('site'):
            for f in fs:
                p=os.path.join(root,f);rel=os.path.relpath(p,'site');q=os.path.join(B,rel)
                if not os.path.exists(q) or not filecmp.cmp(p,q,shallow=False):files.append(rel)
        print('changed:',files)
    ok=all([push(f,msg) for f in files]);sys.exit(0 if ok else 1)
