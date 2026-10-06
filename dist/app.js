import { toolkitLayers, technologies, getTechnology, visibleTechnologies } from '/toolkit.js?v=4';

const layers = [
  {name:'Interface',title:'Make the workflow clear.',desc:'A teacher taking attendance or a customer choosing delivery needs a clear next step. I use React and Next.js to connect those workflows to the data behind them.',example:'DevTrack brings school workflows into one teacher workspace.',code:'user action → application state → API request'},
  {name:'Application & API',title:'Put the rules where they belong.',desc:'Laravel is my main backend tool. Routes, authentication and domain logic turn a user action into a controlled operation with a predictable response.',example:'Deskplan connects QR check-in, lesson periods and seat sessions through its API.',code:'request → authentication → domain logic → response'},
  {name:'Data model',title:'Model the problem before the screen.',desc:'Useful software starts with clear relationships. I work with MySQL and PostgreSQL to model schools, users, lessons, sessions and the other entities a product depends on.',example:'Deskplan separates classroom layout from the history of who occupied each desk.',code:'school → classroom → desk\nperiod → seat_session ← user'},
  {name:'Integrations',title:'Connect the pieces thoughtfully.',desc:'External services bring their own limits and assumptions. My projects combine billing, timetable data, delivery carriers and other APIs with the application’s own workflows.',example:'Vinnis combines product and package rules with carrier-specific delivery constraints.',code:'external data → application rules → useful outcome'}
];
let activeLayer = 0;

function selectLayer(index){
  activeLayer=index;
  document.querySelectorAll('[data-layer]').forEach(button=>{const active=Number(button.dataset.layer)===index;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  const layer=layers[index];
  document.querySelector('#layer-kicker').textContent=`LAYER 0${index+1} / ${layer.name.toUpperCase()}`;
  document.querySelector('#layer-title').textContent=layer.title;
  document.querySelector('#layer-desc').textContent=layer.desc;
  document.querySelector('#layer-example').textContent=layer.example;
  document.querySelector('#layer-code').textContent=layer.code;
  window.dispatchEvent(new CustomEvent('portfolio:layer',{detail:index}));
}
document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>selectLayer(Number(button.dataset.layer))));
let selectedTechnology='react',toolkitExpanded=false;
const coreArt=document.querySelector('.hero-art');
function updateToolkitVisibility(){
  const tech=getTechnology(selectedTechnology),visible=new Set(visibleTechnologies(tech.layer,toolkitExpanded&&!matchMedia('(max-width:760px)').matches).map(item=>item.id));
  document.querySelectorAll('[data-tech]').forEach(button=>{button.hidden=!coreArt.classList.contains('core-static')&&!visible.has(button.dataset.tech);});
}
function selectTechnology(id){
  const tech=getTechnology(id);if(!tech)return;
  selectedTechnology=id;
  document.querySelectorAll('[data-tech]').forEach(button=>{const active=button.dataset.tech===id;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
  document.querySelectorAll('[data-core-layer]').forEach(button=>{const active=Number(button.dataset.coreLayer)===tech.layer;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  document.querySelector('#core-tech-name').textContent=tech.name;
  document.querySelector('#core-tech-icon').src=`/assets/tech/${tech.icon}.svg`;
  document.querySelector('#core-tech-layer').textContent=`0${tech.layer+1} / ${toolkitLayers[tech.layer].name.toUpperCase()}`;
  document.querySelector('#core-tech-title').textContent=tech.title;
  document.querySelector('#core-tech-description').textContent=tech.description;
  const proof=document.querySelector('#core-proof');proof.href=tech.href;proof.textContent=tech.link;
  if(tech.href.startsWith('https://')){proof.target='_blank';proof.rel='noopener';}else{proof.removeAttribute('target');proof.removeAttribute('rel');}
  coreArt.style.setProperty('--core-color',`#${toolkitLayers[tech.layer].color.toString(16).padStart(6,'0')}`);
  updateToolkitVisibility();
  window.dispatchEvent(new CustomEvent('portfolio:technology',{detail:id}));
}
function hoverTechnology(id){
  coreArt.classList.toggle('is-inspecting',Boolean(id));
  document.querySelectorAll('[data-tech]').forEach(button=>button.classList.toggle('is-hovered',button.dataset.tech===id));
  window.dispatchEvent(new CustomEvent('portfolio:technology-hover',{detail:id}));
}
document.querySelectorAll('[data-tech]').forEach(button=>{
  button.addEventListener('click',()=>selectTechnology(button.dataset.tech));
  button.addEventListener('pointerenter',()=>hoverTechnology(button.dataset.tech));
  button.addEventListener('pointerleave',()=>hoverTechnology(document.activeElement===button?button.dataset.tech:null));
  button.addEventListener('focus',()=>hoverTechnology(button.dataset.tech));
  button.addEventListener('blur',()=>hoverTechnology(null));
});
document.querySelectorAll('[data-core-layer]').forEach(button=>button.addEventListener('click',()=>selectTechnology(toolkitLayers[Number(button.dataset.coreLayer)].primary)));
window.addEventListener('portfolio:layer',event=>selectTechnology(toolkitLayers[event.detail].primary));
window.addEventListener('portfolio:toolkit-reveal',event=>{toolkitExpanded=event.detail;coreArt.classList.toggle('is-expanded',toolkitExpanded);updateToolkitVisibility();});
window.addEventListener('portfolio:scene-ready',updateToolkitVisibility);
matchMedia('(max-width:760px)').addEventListener('change',updateToolkitVisibility);
window.addEventListener('portfolio:scene-fallback',()=>{coreArt.classList.add('core-static');updateToolkitVisibility();});
document.querySelector('#core-proof').addEventListener('click',event=>{
  const href=event.currentTarget.getAttribute('href');
  if(href.startsWith('#source-'))document.querySelector(href).open=true;
});
selectTechnology(selectedTechnology);
document.querySelector('#year').textContent=new Date().getFullYear();
function selectCodeTab(button){
  const lab=button.closest('.source-panel');
  lab.querySelectorAll('[role="tab"]').forEach(tab=>{
    const selected=tab===button;
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
  });
}
document.querySelectorAll('.source-tablist').forEach(list=>{
  list.addEventListener('click',event=>{const button=event.target.closest('[role="tab"]');if(button)selectCodeTab(button);});
  list.addEventListener('keydown',event=>{
    const keys=['ArrowRight','ArrowLeft','Home','End'];
    if(!keys.includes(event.key))return;
    const tabs=[...list.querySelectorAll('[role="tab"]')],index=tabs.indexOf(document.activeElement);
    if(index<0)return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    selectCodeTab(tabs[next]);tabs[next].focus();
  });
});
document.querySelectorAll('.copy-code').forEach(button=>button.addEventListener('click',async()=>{
  const code=button.closest('.code-window').querySelector('code').textContent;
  try{
    await navigator.clipboard.writeText(code);
    button.textContent='Copied';
    setTimeout(()=>{button.textContent='Copy code';},1800);
  }catch{
    const selection=getSelection(),range=document.createRange();
    range.selectNodeContents(button.closest('.code-window').querySelector('code'));
    selection.removeAllRanges();selection.addRange(range);
    button.textContent='Code selected';
    setTimeout(()=>{button.textContent='Copy code';},1800);
  }
}));
import('/matcher-demo.js').then(({checkMatch})=>{
  const input=document.querySelector('#guess-input'),output=document.querySelector('#match-result');
  const update=()=>{
    const accepted=checkMatch(input.value,'Prāta Vētra');
    output.textContent=input.value.trim()?(accepted?'Match accepted':'No match'):'Type an answer';
    output.classList.toggle('accepted',accepted);
  };
  input.addEventListener('input',update);update();
}).catch(()=>{document.querySelector('#match-result').textContent='Demo unavailable';});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const traceButton=document.querySelector('#trace-run');
const traceOutput=document.querySelector('#trace-lines');
const traceSteps=[['01','Receive QR desk identifier'],['02','Resolve user & lesson period'],['03','Validate the check-in context'],['04','Write the seat session'],['05','Return the classroom state'],['06','Complete illustrative request']];
let traceTimer;
function traceStep(index){
  if(index>=traceSteps.length){traceButton.disabled=false;traceButton.textContent='Run again';document.querySelector('#trace-status').textContent='COMPLETE';return;}
  const line=document.createElement('li');line.textContent=`${traceSteps[index][0]}  ${traceSteps[index][1]}`;traceOutput.append(line);
  if(reducedMotion.matches)traceStep(index+1);else traceTimer=setTimeout(()=>traceStep(index+1),420);
}
traceButton.addEventListener('click',()=>{clearTimeout(traceTimer);traceOutput.replaceChildren();traceButton.disabled=true;traceButton.textContent='Tracing…';document.querySelector('#trace-status').textContent='RUNNING';traceStep(0);});


// Motion enhances the content; the page remains readable without JavaScript.
const progress=document.querySelector('#reading-progress');
let scrollScheduled=false;
function updateProgress(){
 scrollScheduled=false;
 const total=document.documentElement.scrollHeight-innerHeight;
 progress.style.transform=`scaleX(${total>0?Math.min(1,scrollY/total):0})`;
 if(!reducedMotion.matches){
   const hero=document.querySelector('.hero'),amount=Math.min(1,Math.max(0,scrollY/Math.max(1,hero.offsetHeight)));
   hero.style.setProperty('--hero-scroll',String(amount));
   document.querySelectorAll('.mini-visual').forEach(visual=>{
     const rect=visual.getBoundingClientRect();
     if(rect.bottom>0&&rect.top<innerHeight){const shift=Math.max(-10,Math.min(10,(innerHeight/2-rect.top-rect.height/2)*.025));visual.style.setProperty('--visual-shift',`${shift}px`);}
   });
 }
}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
addEventListener('resize',updateProgress);updateProgress();
reducedMotion.addEventListener('change',()=>{document.querySelector('.hero').style.setProperty('--hero-scroll','0');document.querySelectorAll('.mini-visual').forEach(v=>v.style.setProperty('--visual-shift','0px'));updateProgress();});
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.06});
 document.querySelectorAll('.code-project-grid>.project,.timeline article').forEach((element,index)=>element.style.setProperty('--reveal-delay',`${index%2*.08}s`));
 document.querySelectorAll('.section-head,.project,.api-project,.layer-content,.trace,.about-body,.portrait-panel,.timeline article,.next').forEach(element=>{element.classList.add('reveal');observer.observe(element);});
 document.documentElement.classList.add('js-effects');
 const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.nav nav a').forEach(link=>{const active=link.hash===`#${entry.target.id}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-12% 0px -58% 0px',threshold:0});
 document.querySelectorAll('#work,#system,#about').forEach(section=>sectionObserver.observe(section));
}
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reducedMotion.matches){
 const light=document.querySelector('#cursor-light');
 document.addEventListener('pointermove',event=>{light.style.left=`${event.clientX}px`;light.style.top=`${event.clientY}px`;light.style.opacity='1';},{passive:true});
 document.addEventListener('pointerleave',()=>{light.style.opacity='0';});
 document.querySelectorAll('.project').forEach(card=>{
  card.addEventListener('pointermove',event=>{
   if(reducedMotion.matches)return;
   const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
   card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);
   card.style.setProperty('--rx',`${(y-.5)*-2.2}deg`);card.style.setProperty('--ry',`${(x-.5)*2.2}deg`);
  });
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
 });
 document.querySelectorAll('.magnetic').forEach(element=>{
  element.addEventListener('pointermove',event=>{if(reducedMotion.matches)return;const r=element.getBoundingClientRect();element.style.translate=`${(event.clientX-r.left-r.width/2)*.035}px ${(event.clientY-r.top-r.height/2)*.09}px`;});
  element.addEventListener('pointerleave',()=>{element.style.translate='0 0';});
 });
}
import('/scene.js?v=4').then(({createScene})=>createScene({reducedMotion,initialTechnology:selectedTechnology})).catch(()=>{
 window.dispatchEvent(new CustomEvent('portfolio:scene-fallback'));
 document.querySelector('#fallback').hidden=false;document.querySelector('#world').hidden=true;
 document.querySelector('#motion-toggle').hidden=true;document.querySelector('#explode-toggle').hidden=true;
 document.querySelector('#scene-hint').textContent='SELECT A TECHNOLOGY TO EXPLORE';
});
