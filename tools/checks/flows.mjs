/**
 * End-to-end flow checks for a built iteration (run from the project root):
 *   node tools/checks/flows.mjs Output_A
 * Covers: sign up + questionnaire -> dashboard, food confirm and cancel,
 * sleep edit + persistence, account deletion, deleted account cannot log in,
 * storage key separation, and uncaught page errors.
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname } from 'node:path';
const out = process.argv[2];
const dist = join(process.cwd(), out, 'hi-fi/app/dist');
const srv=createServer((q,r)=>{const p=new URL(q.url,'http://x').pathname;const f=join(dist,p==='/'?'index.html':p);if(!existsSync(f)){r.writeHead(404).end();return;}r.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html'}[extname(f)]});r.end(readFileSync(f));});
await new Promise(r=>srv.listen(0,r)); const url=`http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? process.env.HOME + '/.cache/ms-playwright/chromium-1140/chrome-linux/chrome' });
const c=await b.newContext({viewport:{width:390,height:844}}); c.setDefaultTimeout(5000);
const p=await c.newPage(); const errors=[]; p.on('pageerror',e=>errors.push(e.message));
const ok=(m)=>console.log(`${out} ✓ ${m}`);
await p.goto(url);
// T1
await p.getByLabel('Email').fill('kim@example.com'); await p.getByLabel('Password').fill('Secret123');
await p.getByRole('button',{name:'Create account'}).click();
await p.getByText('1 to 2 times a week').click(); await p.getByRole('button',{name:'Next'}).click();
await p.getByText('Casual',{exact:true}).click(); await p.getByRole('button',{name:'Next'}).click();
await p.getByText('Sleep',{exact:true}).click(); await p.getByText('Nutrition',{exact:true}).click();
await p.getByRole('button',{name:'Create my dashboard'}).click();
await p.getByText('dashboard is ready').waitFor(); ok('questionnaire → dashboard');
const widgets = await p.locator('[data-widget]').evaluateAll(els=>els.map(e=>e.dataset.widget));
console.log(`${out}   widgets shown: ${widgets.join(',')} (expected sleep,nutrition order from question = nutrition,sleep)`);
// food confirm
await p.getByRole('link',{name:/Nutrition/}).first().click();
await p.getByRole('button',{name:'Add food'}).click(); await p.getByRole('button',{name:/Oatmeal bowl/}).click();
await p.getByRole('button',{name:'Confirm and save'}).click(); await p.getByText('Food saved: Oatmeal').waitFor(); ok('food confirmed & saved');
// cancel food
await p.getByRole('button',{name:'Add food'}).click(); await p.getByRole('button',{name:'Cancel'}).click();
await p.getByRole('dialog').waitFor({ state: 'detached', timeout: 2000 }); ok('food cancel closes dialog');
// sleep edit
await p.getByRole('navigation',{name:'Main menu'}).getByRole('link',{name:'Sleep'}).click();
await p.getByRole('region',{name:'Sleep log'}).getByRole('button').first().click();
await p.getByRole('button',{name:'Edit sleep'}).click();
await p.getByLabel('Bedtime').fill('22:15'); await p.getByRole('button',{name:'Save sleep'}).click();
await p.getByText(/Sleep updated for/).waitFor(); ok('sleep edited (updated message)');
// persistence
await p.reload(); await p.getByText('22:15 to').first().waitFor(); ok('sleep edit persisted after reload');
// delete account
if (out==='Output_A') await p.getByRole('navigation',{name:'Main menu'}).getByRole('link',{name:'Profile'}).click();
else await p.getByRole('link',{name:'Settings'}).click();
await p.getByRole('button',{name:'Delete account'}).click(); await p.getByRole('button',{name:'Delete my account'}).click();
await p.getByText('Your account and its data were deleted').waitFor(); ok('account deleted → login with message');
await p.getByLabel('Email').fill('kim@example.com'); await p.getByLabel('Password').fill('Secret123');
await p.getByRole('button',{name:'Log in'}).click(); await p.getByText('incorrect').waitFor(); ok('deleted account cannot log in');
const keys = await p.evaluate(()=>Object.keys(localStorage)); console.log(`${out}   storage keys: ${keys.join(', ')}`);
console.log(`${out}   page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
await b.close(); srv.close();
