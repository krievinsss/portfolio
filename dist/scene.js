import { toolkitLayers, technologies, getTechnology } from '/toolkit.js?v=4';
import * as THREE from 'three';
import { EffectComposer } from './assets/three-addons/postprocessing/EffectComposer.js';
import { RenderPass } from './assets/three-addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './assets/three-addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './assets/three-addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from './assets/three-addons/environments/RoomEnvironment.js';

export async function createScene({reducedMotion,initialTechnology='react'}){
 const canvas=document.querySelector('#world'),labelHost=document.querySelector('#scene-labels');
 let small=matchMedia('(max-width:760px)').matches;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:!small,alpha:true,powerPreference:'low-power'});
 const pixelRatio=Math.min(devicePixelRatio,small?1.2:1.5);
 renderer.setPixelRatio(pixelRatio);renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;
 const scene=new THREE.Scene();scene.background=null;scene.fog=new THREE.FogExp2(0x07090c,.025);
 const camera=new THREE.PerspectiveCamera(36,1,.1,50);camera.position.set(0,.2,9.8);camera.lookAt(0,0,0);
 const environmentGenerator=new THREE.PMREMGenerator(renderer);
 const room=new RoomEnvironment();const environment=environmentGenerator.fromScene(room,.04);
 scene.environment=environment.texture;scene.environmentIntensity=.85;room.dispose();environmentGenerator.dispose();
 scene.add(new THREE.AmbientLight(0xa7c5b4,.45));
 const key=new THREE.DirectionalLight(0xdfffe1,2.5);key.position.set(-3,5,4);scene.add(key);
 const rim=new THREE.DirectionalLight(0x95b9ff,1.8);rim.position.set(4,-1,1);scene.add(rim);
 const glowLight=new THREE.PointLight(0xc4ff80,6,12);glowLight.position.set(-1,2,3);scene.add(glowLight);
 const root=new THREE.Group();root.position.y=small?.55:.17;scene.add(root);
 const coreGroup=new THREE.Group();root.add(coreGroup);
 const silver=new THREE.MeshPhysicalMaterial({color:0xb6c2b6,metalness:1,roughness:.2,clearcoat:1,clearcoatRoughness:.18,envMapIntensity:1.1});
 const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(1.02,.225,small?180:280,small?18:28,2,3),silver);knot.rotation.set(.4,.2,.1);coreGroup.add(knot);
 const darkChrome=new THREE.MeshPhysicalMaterial({color:0x253c30,metalness:.94,roughness:.17,clearcoat:1,envMapIntensity:1.5});
 const innerKnot=new THREE.Mesh(new THREE.TorusKnotGeometry(.89,.04,160,10,3,2),darkChrome);innerKnot.rotation.set(-.2,1.3,.3);coreGroup.add(innerKnot);
 const luminous=new THREE.MeshBasicMaterial({color:new THREE.Color(0xc4ff80).multiplyScalar(1.15)});
 const filament=new THREE.Mesh(new THREE.TorusKnotGeometry(1.025,.012,220,7,2,3),luminous);filament.rotation.copy(knot.rotation);filament.scale.setScalar(1.17);coreGroup.add(filament);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.39,1),new THREE.MeshPhysicalMaterial({color:0x8bac6a,metalness:.7,roughness:.2,emissive:0x84b950,emissiveIntensity:.09}));coreGroup.add(core);core.visible=false;
 const outer=new THREE.Group();root.add(outer);
 const orbits=toolkitLayers.map((layer,i)=>{
  const group=new THREE.Group();group.rotation.set(.32+i*.2,.18+i*.62,i*.65);outer.add(group);
  const radius=1.7+i*.18;
  const material=new THREE.MeshBasicMaterial({color:layer.color,transparent:true,opacity:.16});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.007,5,180),material);group.add(ring);
  return {group,ring,radius,baseZ:i*.65};
 });
 // Analytic points morph between a flowing torus and a spherical data cloud.
 const count=small?4000:11000;const positions=new Float32Array(count*3),destinations=new Float32Array(count*3),seeds=new Float32Array(count);
 for(let i=0;i<count;i++){
  const u=(i/count)*Math.PI*2*23,v=i*2.399963;
  const radius=1.65+.18*Math.cos(v),z=.48*Math.sin(v);
  positions[i*3]=radius*Math.cos(u);positions[i*3+1]=radius*Math.sin(u);positions[i*3+2]=z;
  const y=1-2*(i+.5)/count,ringRadius=Math.sqrt(1-y*y),sphere=2.2+.18*Math.sin(i*1.31);
  destinations[i*3]=Math.cos(v)*ringRadius*sphere;destinations[i*3+1]=y*sphere;destinations[i*3+2]=Math.sin(v)*ringRadius*sphere;
  seeds[i]=((i*73)%997)/997;
 }
 const cloudGeometry=new THREE.BufferGeometry();cloudGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));cloudGeometry.setAttribute('aDestination',new THREE.BufferAttribute(destinations,3));cloudGeometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const cloudMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uExpand:{value:0},uColor:{value:new THREE.Color(0xc4ff80)},uPixelRatio:{value:pixelRatio}},vertexShader:`
  attribute vec3 aDestination;
  attribute float aSeed;
  uniform float uTime;
  uniform float uExpand;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main(){
   vec3 p=mix(position,aDestination,uExpand);
   float a=uTime*.1+(aSeed-.5)*.15;
   p.xy=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xy;
   p.z+=sin(uTime*.6+aSeed*20.)*.045;
   vec4 mv=modelViewMatrix*vec4(p,1.);
   gl_Position=projectionMatrix*mv;
   gl_PointSize=clamp((1.1+aSeed*1.5)*uPixelRatio*5./-mv.z,1.,3.);
   vAlpha=.16+aSeed*.42;
  }`,fragmentShader:`
  uniform vec3 uColor;
  varying float vAlpha;
  void main(){
   float d=length(gl_PointCoord-.5);
   if(d>.5) discard;
   gl_FragColor=vec4(uColor,vAlpha*(1.-smoothstep(.1,.5,d)));
  }`});
 const cloud=new THREE.Points(cloudGeometry,cloudMaterial);cloud.rotation.set(.42,0,.15);root.add(cloud);
 const nodes=[],connections=[],packets=[],anchors=[];
 technologies.forEach((tech,i)=>{
  const orbit=orbits[tech.layer],members=technologies.filter(item=>item.layer===tech.layer);
  const memberIndex=members.findIndex(item=>item.id===tech.id);
  const angle=memberIndex*Math.PI*2/members.length+.55+tech.layer*.6;
  const node=new THREE.Group();node.position.set(Math.cos(angle)*orbit.radius,Math.sin(angle)*orbit.radius,0);orbit.group.add(node);
  const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(.17,1),new THREE.MeshPhysicalMaterial({color:0x657a70,metalness:.87,roughness:.2,clearcoat:1,envMapIntensity:1.1}));shell.userData.technology=tech.id;node.add(shell);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.24,.006,6,60),new THREE.MeshBasicMaterial({color:toolkitLayers[tech.layer].color,transparent:true,opacity:.3}));halo.rotation.set(i*.4,.5+i*.2,.3);node.add(halo);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(.184,0),new THREE.MeshBasicMaterial({color:toolkitLayers[tech.layer].color,wireframe:true,transparent:true,opacity:.14}));node.add(inner);
  const entry={tech,node,shell,halo,inner,orbit,angle,rootPosition:new THREE.Vector3()};nodes.push(entry);
  const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:toolkitLayers[tech.layer].color,transparent:true,opacity:.08}));root.add(line);connections.push(line);
  const packet=new THREE.Mesh(new THREE.SphereGeometry(.023,6,6),new THREE.MeshBasicMaterial({color:toolkitLayers[tech.layer].color}));root.add(packet);packets.push({packet,entry,offset:i*.17});
  const label=document.querySelector(`[data-tech="${tech.id}"]`);anchors.push({node,label,tech});
 });
 // A small field of points sits behind the model, with no external image assets.
 const stars=[];for(let i=0;i<120;i++){const a=i*2.399963,r=2.5+((i*19)%43)/20;stars.push(Math.cos(a)*r,Math.sin(a)*r,-2-((i*13)%19)/15);}
 const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:0x91b78d,size:.012,transparent:true,opacity:.33})));
 let composer=null,bloom=null;
 // Postprocessing is optional: a direct render remains a complete experience.
 if(!small){
  try{composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.12,.3,1.2);composer.addPass(bloom);composer.addPass(new OutputPass());}catch{composer?.dispose();composer=null;}
 }
 let width=0,height=0,paused=reducedMotion.matches,inView=true,dragging=false,lastX=0,dragDistance=0;
 let yaw=-.25,pitch=.2,currentYaw=yaw,currentPitch=pitch,autoYaw=0,clock=0,expansion=0,pausedExpansion=0,expanded=false,currentLayer=0,currentTechnology=initialTechnology,hoveredTechnology=null,lastReveal=false;
 let scrollAmount=0,hoverX=0,hoverY=0,lastTime=performance.now(),lastRender=0,frameId,dirty=true,disposed=false;
 const colors=toolkitLayers.map(layer=>layer.color);let targetColor=new THREE.Color(colors[0]);
 const pauseButton=document.querySelector('#motion-toggle'),expandButton=document.querySelector('#explode-toggle');
 function syncPause(){pauseButton.textContent=paused?'Resume motion':'Pause motion';pauseButton.setAttribute('aria-pressed',String(paused));}
 syncPause();
 pauseButton.addEventListener('click',()=>{paused=!paused;if(paused)pausedExpansion=expansion;dirty=true;syncPause();});
 expandButton.addEventListener('click',()=>{expanded=!expanded;pausedExpansion=expanded?1:0;expandButton.setAttribute('aria-pressed',String(expanded));expandButton.textContent=expanded?'Collapse toolkit':'Expand toolkit';dirty=true;});
 function highlightTechnology(id){
  const tech=getTechnology(id)||getTechnology(currentTechnology);targetColor.setHex(colors[tech.layer]);dirty=true;
  orbits.forEach((orbit,i)=>{orbit.ring.material.color.setHex(colors[i]);orbit.ring.material.opacity=i===tech.layer?.55:.1;});
  nodes.forEach((entry,i)=>{
   const active=entry.tech.id===tech.id,sameLayer=entry.tech.layer===tech.layer;
   entry.shell.material.color.setHex(active?colors[tech.layer]:sameLayer?0x82988c:0x35453e);
   entry.halo.material.opacity=active?.95:sameLayer?.38:.12;entry.inner.material.opacity=active?.5:sameLayer?.2:.06;
   connections[i].material.opacity=active?.32:sameLayer?.17:.045;
  });
  packets.forEach(({packet,entry})=>{packet.visible=entry.tech.layer===tech.layer;});
 }
 function setTechnology(id){
  const tech=getTechnology(id);if(!tech)return;
  currentTechnology=id;currentLayer=tech.layer;highlightTechnology(hoveredTechnology||id);
  document.querySelector('#scene-mode').textContent=`TOOLKIT / ${toolkitLayers[currentLayer].name.toUpperCase()}`;
 }
 window.addEventListener('portfolio:technology',event=>setTechnology(event.detail));
 window.addEventListener('portfolio:technology-hover',event=>{hoveredTechnology=event.detail;highlightTechnology(hoveredTechnology||currentTechnology);});
 setTechnology(initialTechnology);
 reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;hoverX=0;hoverY=0;dirty=true;syncPause();});
 function onScroll(){scrollAmount=Math.min(1,Math.max(0,scrollY/Math.max(1,canvas.closest('.hero').offsetHeight)));dirty=true;}
 addEventListener('scroll',onScroll,{passive:true});onScroll();
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 canvas.addEventListener('pointerdown',event=>{if(document.activeElement?.matches('[data-tech]'))document.activeElement.blur();dragging=true;dragDistance=0;lastX=event.clientX;dirty=true;if(event.pointerType==='mouse')canvas.setPointerCapture(event.pointerId);});
 canvas.addEventListener('pointermove',event=>{
  const rect=canvas.getBoundingClientRect();
  if(!reducedMotion.matches&&event.pointerType==='mouse'){hoverX=(event.clientX-rect.left)/rect.width-.5;hoverY=(event.clientY-rect.top)/rect.height-.5;dirty=true;}
  if(!dragging)return;
  const dx=event.clientX-lastX;dragDistance+=Math.abs(dx);yaw+=dx*.005;lastX=event.clientX;dirty=true;
 });
 canvas.addEventListener('pointerup',event=>{
  dragging=false;dirty=true;
  if(dragDistance<7){const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(nodes.map(n=>n.shell),false)[0];if(hit)document.querySelector(`[data-tech="${hit.object.userData.technology}"]`).click();}
 });
 canvas.addEventListener('pointercancel',()=>{dragging=false;dirty=true;});
 canvas.addEventListener('pointerleave',()=>{dragging=false;hoverX=0;hoverY=0;dirty=true;});
 const projected=new THREE.Vector3(),anchorOffset=new THREE.Vector3(0,.3,0),centerProjected=new THREE.Vector3();
 const monogram=document.querySelector('#core-monogram');
 function draw(time){
  const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
  if(!paused&&!dragging&&!hoveredTechnology){clock+=dt;autoYaw+=dt*.045;}
  const targetExpansion=expanded?1:reducedMotion.matches?0:paused?pausedExpansion:scrollAmount*.9;
  const lerp=1-Math.pow(.001,dt);
  expansion=reducedMotion.matches?targetExpansion:THREE.MathUtils.lerp(expansion,targetExpansion,lerp);
  const targetYaw=yaw+autoYaw+(!reducedMotion.matches?hoverX*.13:0);
  currentYaw=THREE.MathUtils.lerp(currentYaw,targetYaw,lerp);
  currentPitch=THREE.MathUtils.lerp(currentPitch,pitch+(!reducedMotion.matches?hoverY*.1+scrollAmount*.12:0),lerp);
  root.rotation.set(currentPitch,currentYaw,-.1);root.position.y=small?.55:.17;
  root.scale.setScalar(small?.84:1);
  coreGroup.scale.setScalar(1-expansion*.24);coreGroup.rotation.set(clock*.07+expansion*.22,.2+clock*.09+expansion*.35,0);
  knot.rotation.z=.1+clock*.055;innerKnot.rotation.y=1.3-clock*.12;
  cloudMaterial.uniforms.uTime.value=clock;cloudMaterial.uniforms.uExpand.value=expansion;
  cloudMaterial.uniforms.uColor.value.lerp(targetColor,lerp);luminous.color.lerp(targetColor.clone().multiplyScalar(1.15),lerp);glowLight.color.lerp(targetColor,lerp);
  const reveal=expanded||(!small&&!reducedMotion.matches&&expansion>.22);
  if(reveal!==lastReveal){lastReveal=reveal;window.dispatchEvent(new CustomEvent('portfolio:toolkit-reveal',{detail:reveal}));}
  orbits.forEach((orbit,i)=>{orbit.group.rotation.z=orbit.baseZ+clock*.035*(i%2?-1:1);orbit.group.scale.setScalar(1+expansion*.23);orbit.group.updateMatrix();});
  nodes.forEach((entry,i)=>{
   const angle=entry.angle+clock*.04*(entry.tech.layer%2?-1:1);
   entry.node.position.set(Math.cos(angle)*entry.orbit.radius,Math.sin(angle)*entry.orbit.radius,0);
   entry.rootPosition.copy(entry.node.position).applyMatrix4(entry.orbit.group.matrix);
   entry.shell.rotation.set(clock*.12+i,clock*.08+i*.5,0);entry.halo.rotation.z=clock*.2+i;
   const a=connections[i].geometry.attributes.position;a.setXYZ(0,entry.rootPosition.x*.45,entry.rootPosition.y*.45,entry.rootPosition.z*.45);a.setXYZ(1,entry.rootPosition.x,entry.rootPosition.y,entry.rootPosition.z);a.needsUpdate=true;
  });
  packets.forEach(({packet,entry,offset})=>{const t=(clock*.2+offset)%1;packet.position.copy(entry.rootPosition).multiplyScalar(.47+t*.48);});
  try{if(composer&&!small)composer.render();else renderer.render(scene,camera);}catch{composer?.dispose();composer=null;renderer.render(scene,camera);}
  root.getWorldPosition(centerProjected);centerProjected.project(camera);
  const centerX=(centerProjected.x*.5+.5)*width,centerY=(-centerProjected.y*.5+.5)*height;
  monogram.style.transform=`translate(${centerX}px,${centerY}px) translate(-50%,-50%)`;
  const occupied=[{x:centerX-48,y:centerY-36,width:96,height:72}];
  const offsets=[[0,0],[0,-44],[0,44],[70,0],[-70,0],[0,-88],[0,88],[70,-44],[-70,44],[70,44],[-70,-44]];
  const ordered=anchors.filter(item=>!item.label.hidden).sort((a,b)=>{
   const priority=item=>item.tech.id===currentTechnology?0:toolkitLayers[item.tech.layer].primary===item.tech.id?1:2;
   return priority(a)-priority(b);
  });
  ordered.forEach(({node,label})=>{
   node.getWorldPosition(projected);projected.add(anchorOffset);projected.project(camera);
   const w=label.offsetWidth,h=label.offsetHeight,rawX=(projected.x*.5+.5)*width,rawY=(-projected.y*.5+.5)*height;
   let best=null;
   offsets.forEach(([dx,dy])=>{
    const x=THREE.MathUtils.clamp(rawX+dx,w/2+9,width-w/2-9),y=THREE.MathUtils.clamp(rawY+dy,52+h/2,height-h/2-20);
    const box={x:x-w/2,y:y-h/2,width:w,height:h};
    const overlap=occupied.reduce((sum,other)=>sum+Math.max(0,Math.min(box.x+w+5,other.x+other.width+5)-Math.max(box.x,other.x))*Math.max(0,Math.min(box.y+h+5,other.y+other.height+5)-Math.max(box.y,other.y)),0);
    const score=overlap+Math.hypot(x-rawX,y-rawY)*.15;
    if(!best||score<best.score)best={x,y,box,score};
   });
   occupied.push(best.box);label.style.transform=`translate(${best.x}px,${best.y}px) translate(-50%,-50%)`;label.style.opacity=projected.z>1?'0':'1';
  });
  document.querySelector('#scene-angle').textContent=String(Math.round(((currentYaw*180/Math.PI)%360+360)%360)).padStart(3,'0');
  const color=cloudMaterial.uniforms.uColor.value;
  const colorDifference=Math.abs(color.r-targetColor.r)+Math.abs(color.g-targetColor.g)+Math.abs(color.b-targetColor.b);
  const settling=Math.abs(expansion-targetExpansion)>.002||Math.abs(currentYaw-targetYaw)>.001||Math.abs(currentPitch-(pitch+(!reducedMotion.matches?hoverY*.1+scrollAmount*.12:0)))>.001||colorDifference>.003;
  dirty=settling;lastRender=time;
 }
 function resize(){small=matchMedia('(max-width:760px)').matches;const r=canvas.getBoundingClientRect();width=r.width;height=r.height;if(!width||!height)return;const ratio=Math.min(devicePixelRatio,small?1.2:1.5);renderer.setPixelRatio(ratio);cloudMaterial.uniforms.uPixelRatio.value=ratio;renderer.setSize(width,height,false);composer?.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);resize();
 const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;dirty=true;},{threshold:.01});visibilityObserver.observe(canvas);
 function tick(time){if(disposed)return;frameId=requestAnimationFrame(tick);if(document.hidden||!inView){lastTime=time;return;}const moving=!paused&&!hoveredTechnology;if((moving||dirty)&&time-lastRender>(small?32:20)&&width&&height)draw(time);else if(!moving&&!dirty)lastTime=time;}
 canvas.closest('.hero-art').classList.remove('core-static');window.dispatchEvent(new CustomEvent('portfolio:scene-ready'));
 frameId=requestAnimationFrame(tick);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;cancelAnimationFrame(frameId);window.dispatchEvent(new CustomEvent('portfolio:scene-fallback'));canvas.hidden=true;document.querySelector('#fallback').hidden=false;pauseButton.hidden=true;expandButton.hidden=true;});
 window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frameId);resizeObserver.disconnect();visibilityObserver.disconnect();removeEventListener('scroll',onScroll);composer?.dispose();environment.dispose();scene.traverse(object=>{object.geometry?.dispose();const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>m?.dispose());});renderer.dispose();},{once:true});
}
