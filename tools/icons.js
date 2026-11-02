const p=require('/tmp/pt/node_modules/puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});const pg=await b.newPage();
for(const s of [180,192,512]){await pg.setViewport({width:s,height:s});await pg.goto('file://'+__dirname+'/icon.html#'+s);await pg.reload();const el=await pg.$('canvas');await el.screenshot({path:__dirname+'/../icons/icon-'+s+'.png'});}
await b.close();})();
