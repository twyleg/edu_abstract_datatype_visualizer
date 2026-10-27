import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'dist-visualizer');
const prefix='/edu_abstract_datatype_visualizer/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.zip':'application/zip'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const path=resolve(root,pathname.slice(prefix.length)||'index.html');
  if(!path.startsWith(root+'/'))throw Error('Invalid path');
  res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext(),page=await context.newPage();
 const errors=[],external=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(origin+'/'))external.push(r.url());});
 page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
 await page.goto(origin+prefix);
 await page.waitForFunction(()=>window.online_ide_access?.getIDE('edu_abstract_datatype_visualizer'),null,{timeout:120000});
 await page.waitForTimeout(1500);
 await page.locator('.img_start-dark.jo_button').first().click();
 await page.waitForFunction(()=>document.querySelector('#state')?.textContent.startsWith('stopped')&&document.querySelector('#metrics')?.textContent.includes('Anzahl: 2'),null,{timeout:120000});
 assert.deepEqual(await context.cookies(),[]);
 const storage=await page.evaluate(async()=>({local:localStorage.length,session:sessionStorage.length,databases:(await indexedDB.databases()).map(db=>db.name)}));
 assert.deepEqual(storage,{local:0,session:0,databases:[]});
 await page.getByRole('button',{name:'Datenschutz und Quelltext',exact:true}).click();
 assert.equal(await page.locator('#site-information a').count(),3);
 for(const path of ['privacy.html','LICENSE.txt','UPSTREAM.md','build-info.json','source.zip','index.html']){
  const response=await context.request.get(origin+prefix+path);assert.equal(response.status(),200,path);
 }
 assert.deepEqual(external,[]);assert.deepEqual(failed,[]);assert.deepEqual(errors,[]);
 console.log('PASS Pages repository subpath: IDE, workers, normal run, legal/source downloads; no cookies, browser storage, or external startup requests.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
