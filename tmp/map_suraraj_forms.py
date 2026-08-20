from pypdf import PdfReader
from pathlib import Path
for fn in ['Form_3A_0526.pdf','N5_0526.pdf','N119_0526.pdf','N215_0626.pdf']:
 print('\n---',fn,'---')
 r=PdfReader(Path('tmp/suraraj-authoring-sources')/fn)
 for i,p in enumerate(r.pages):
  a=p.get('/Annots') or []
  if a:
   print('page',i+1)
   for x in a:
    o=x.get_object(); parent=o.get('/Parent'); parent=parent.get_object() if parent else o
    print(parent.get('/T'), list(o.get('/Rect',[])))
