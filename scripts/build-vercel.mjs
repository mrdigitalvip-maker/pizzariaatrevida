import{cp,mkdir,readFile,writeFile,rm,readdir}from'node:fs/promises';
await rm('vercel-public',{recursive:true,force:true});await mkdir('vercel-public',{recursive:true});await cp('public','vercel-public',{recursive:true});
try{for(const name of await readdir('.assets-base64',{recursive:true})){if(!name.endsWith('.b64'))continue;const target='vercel-public/'+name.replace(/^public\//,'').replace(/\.b64$/,'');await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await writeFile(target,Buffer.from(await readFile('.assets-base64/'+name,'utf8'),'base64'));}}catch(e){if(e.code!=='ENOENT')throw e}

const origin=process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:'https://pizzariaatrevida.vercel.app');
if(origin){const url=new URL(origin);if(url.protocol!=='https:')throw Error('SITE_URL must be https');for(const file of ['index.html','sitemap.xml','robots.txt']){const p='vercel-public/'+file;const value=await readFile(p,'utf8');await writeFile(p,value.replaceAll('https://pizzaria-atrevida-lem.mr-bruno01.chatgpt.site',url.origin))}}
