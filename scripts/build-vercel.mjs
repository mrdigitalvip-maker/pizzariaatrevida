import{cp,mkdir,readFile,writeFile,rm,readdir}from'node:fs/promises';
await rm('vercel-public',{recursive:true,force:true});await mkdir('vercel-public',{recursive:true});await cp('public','vercel-public',{recursive:true});
try{for(const name of await readdir('.assets-base64',{recursive:true})){if(!name.endsWith('.b64'))continue;const target='vercel-public/'+name.replace(/^public\//,'').replace(/\.b64$/,'');await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await writeFile(target,Buffer.from(await readFile('.assets-base64/'+name,'utf8'),'base64'));}}catch(e){if(e.code!=='ENOENT')throw e}

// Canonical is the business domain, never an ephemeral deployment URL.
const origin='https://pizzariaatrevida.pizza';
