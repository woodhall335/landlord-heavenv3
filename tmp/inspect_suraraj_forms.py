from pypdf import PdfReader
from pathlib import Path
for p in Path('tmp/suraraj-authoring-sources').glob('*.pdf'):
 r=PdfReader(p)
 f=r.get_fields() or {}
 print('\n---',p.name,len(f),'fields ---')
 for k,v in f.items(): print(k, v.get('/FT'), v.get('/V'))
