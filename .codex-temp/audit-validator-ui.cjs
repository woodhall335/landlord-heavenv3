const fs=require('fs');
const v=fs.readFileSync('src/lib/validation/tenancy-details-validator.ts','utf8');
const flow=fs.readFileSync('src/components/wizard/flows/TenancySectionFlow.tsx','utf8');
const standalone=fs.readFileSync('src/lib/residential-letting/standalone-flow-config.ts','utf8');
const cat=fs.readFileSync('src/lib/wizard/tenancy-supplemental-fields.json','utf8');
const fields=new Set([...v.matchAll(/(?:missing|invalid)\.add\(['`]([^'`$]+)['`]/g)].map(x=>x[1]));
for(const f of [...fields].sort()) if(!flow.includes(f)&&!standalone.includes(f)&&!cat.includes(f)) console.log(f);
