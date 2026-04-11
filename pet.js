<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Float Pet Imágenes</title>
<style>
*{
  box-sizing:border-box;
  user-select:none;
  -webkit-tap-highlight-color:transparent;
  touch-action:none;
}

html,body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:transparent;
}

.stage{
  position:fixed;
  inset:0;
  width:100vw;
  height:100vh;
  pointer-events:none;
}

.pet{
  position:absolute;
  width:150px;
  height:170px;
  left:90px;
  top:90px;
  z-index:10;
  cursor:grab;
  pointer-events:auto;
  transform-origin:50% 80%;
  will-change:left,top,transform;
}

.pet.dragging{
  cursor:grabbing;
}

.pet.face-left{
  transform:scaleX(-1);
}

.wrap{
  position:absolute;
  inset:0;
  filter:drop-shadow(0 10px 12px rgba(0,0,0,.18));
  animation:idleHop .8s ease-in-out infinite;
}

.pet:hover .wrap{
  animation:idleHopHover .65s ease-in-out infinite;
}

.pet.sliding .wrap{
  animation:slideFloat .18s linear infinite;
}

.pet.dragging .wrap{
  animation:none;
  transform:rotate(-5deg) scale(1.02);
}

.shadow{
  position:absolute;
  left:50%;
  bottom:8px;
  width:56px;
  height:14px;
  transform:translateX(-50%);
  border-radius:50%;
  background:rgba(0,0,0,.16);
  filter:blur(3px);
  animation:shadowIdle .8s ease-in-out infinite;
}

.pet:hover .shadow{
  animation:shadowHover .65s ease-in-out infinite;
}

.pet.sliding .shadow{
  animation:shadowSlide .18s linear infinite;
}

.pet.dragging .shadow{
  animation:none;
  opacity:.08;
  transform:translateX(-50%) scale(.72);
}

.sprite{
  position:absolute;
  inset:0;
}

.sprite img{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:contain;
  pointer-events:none;
  -webkit-user-drag:none;
  user-select:none;
}

.idle-img{
  opacity:1;
}

.grab-img{
  opacity:0;
}

.pet.dragging .idle-img,
.pet.sliding .idle-img{
  opacity:0;
}

.pet.dragging .grab-img,
.pet.sliding .grab-img{
  opacity:1;
}

.obstacle{
  position:absolute;
  border-radius:18px;
  background:rgba(90,70,130,.12);
  border:2px dashed rgba(90,70,130,.25);
}

@keyframes idleHop{
  0%,100%{ transform:translateY(0) scaleX(1) scaleY(1); }
  40%{ transform:translateY(-10px) scaleX(.98) scaleY(1.02); }
  50%{ transform:translateY(-14px) scaleX(.97) scaleY(1.03); }
  70%{ transform:translateY(0) scaleX(1.02) scaleY(.98); }
}

@keyframes idleHopHover{
  0%,100%{ transform:translateY(0) scaleX(1) scaleY(1); }
  40%{ transform:translateY(-14px) scaleX(.98) scaleY(1.02); }
  50%{ transform:translateY(-20px) scaleX(.97) scaleY(1.03); }
  70%{ transform:translateY(0) scaleX(1.03) scaleY(.97); }
}

@keyframes slideFloat{
  0%,100%{ transform:translateY(0) rotate(0deg); }
  50%{ transform:translateY(-1px) rotate(.7deg); }
}

@keyframes shadowIdle{
  0%,100%{ transform:translateX(-50%) scale(1); opacity:.14; }
  50%{ transform:translateX(-50%) scale(.8); opacity:.07; }
}

@keyframes shadowHover{
  0%,100%{ transform:translateX(-50%) scale(1); opacity:.14; }
  50%{ transform:translateX(-50%) scale(.64); opacity:.05; }
}

@keyframes shadowSlide{
  0%,100%{ transform:translateX(-50%) scale(.95); opacity:.1; }
  50%{ transform:translateX(-50%) scale(.82); opacity:.06; }
}
</style>
</head>
<body>
<div class="stage" id="stage">
  <div class="obstacle" style="left:14%; top:72%; width:120px; height:34px;"></div>
  <div class="obstacle" style="left:44%; top:68%; width:150px; height:38px;"></div>
  <div class="obstacle" style="right:12%; top:72%; width:110px; height:34px;"></div>

  <div class="pet" id="pet">
    <div class="shadow"></div>
    <div class="wrap">
      <div class="sprite">
        <img class="idle-img" src="https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png">
        <img class="grab-img" src="https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png">
      </div>
    </div>
  </div>
</div>

<script>
const stage = document.getElementById('stage')
const pet = document.getElementById('pet')

const state = {
  x: 90,
  y: 0,
  w: 150,
  h: 170,
  vx: 0,
  vy: 0,
  drag: false,
  mode: 'idle',
  facing: 1,
  offsetX: 0,
  offsetY: 0,
  lastPointerX: 0,
  lastPointerY: 0,
  pointerVX: 0,
  pointerVY: 0,
  lastMoveTime: 0,
  hopBaseX: 90,
  hopPhase: Math.random() * Math.PI * 2,
  hopSpeed: 0.11,
  hopRange: 18
}

function clamp(v,min,max){
  return Math.max(min,Math.min(max,v))
}

function point(e){
  if(e.touches && e.touches.length) return {x:e.touches[0].clientX,y:e.touches[0].clientY}
  if(e.changedTouches && e.changedTouches.length) return {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}
  return {x:e.clientX,y:e.clientY}
}

function stageSize(){
  return {w:stage.clientWidth,h:stage.clientHeight}
}

function ground(){
  return Math.max(0, stage.clientHeight - state.h)
}

function applyPos(){
  pet.style.left = state.x + 'px'
  pet.style.top = state.y + 'px'
}

function face(){
  if(state.facing < 0) pet.classList.add('face-left')
  else pet.classList.remove('face-left')
}

function setMode(mode){
  state.mode = mode
  pet.classList.remove('sliding','dragging')
  if(mode === 'slide') pet.classList.add('sliding')
  if(mode === 'drag') pet.classList.add('dragging')
}

function getObstacles(){
  const sr = stage.getBoundingClientRect()
  return [...stage.querySelectorAll('.obstacle')].map(el=>{
    const r = el.getBoundingClientRect()
    return {
      x:r.left - sr.left,
      y:r.top - sr.top,
      w:r.width,
      h:r.height
    }
  })
}

function hit(a,b){
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y
}

function solve(nx,ny){
  const box = {x:nx,y:ny,w:state.w,h:state.h}
  const size = stageSize()
  const obs = getObstacles()
  let hitX = false
  let hitY = false

  if(box.x < 0){ box.x = 0; hitX = true }
  if(box.y < 0){ box.y = 0; hitY = true }
  if(box.x + box.w > size.w){ box.x = size.w - box.w; hitX = true }
  if(box.y + box.h > size.h){ box.y = size.h - box.h; hitY = true }

  for(const o of obs){
    if(!hit(box,o)) continue

    const l = box.x + box.w - o.x
    const r = o.x + o.w - box.x
    const t = box.y + box.h - o.y
    const b = o.y + o.h - box.y
    const m = Math.min(l,r,t,b)

    if(m === l){ box.x = o.x - box.w; hitX = true }
    else if(m === r){ box.x = o.x + o.w; hitX = true }
    else if(m === t){ box.y = o.y - box.h; hitY = true }
    else { box.y = o.y + o.h; hitY = true }
  }

  return {x:box.x,y:box.y,hitX,hitY}
}

function startDrag(e){
  e.preventDefault()
  const p = point(e)
  const r = pet.getBoundingClientRect()

  state.drag = true
  state.offsetX = p.x - r.left
  state.offsetY = p.y - r.top
  state.lastPointerX = p.x
  state.lastPointerY = p.y
  state.pointerVX = 0
  state.pointerVY = 0
  state.lastMoveTime = performance.now()
  state.vx = 0
  state.vy = 0

  setMode('drag')
}

function moveDrag(e){
  if(!state.drag) return
  e.preventDefault()

  const p = point(e)
  const sr = stage.getBoundingClientRect()
  const now = performance.now()
  const dt = Math.max(8, now - state.lastMoveTime)

  state.pointerVX = (p.x - state.lastPointerX) / dt * 16
  state.pointerVY = (p.y - state.lastPointerY) / dt * 16

  state.lastPointerX = p.x
  state.lastPointerY = p.y
  state.lastMoveTime = now

  const nx = p.x - sr.left - state.offsetX
  const ny = p.y - sr.top - state.offsetY
  const s = solve(nx,ny)

  state.x = s.x
  state.y = s.y
  state.hopBaseX = state.x
  applyPos()
}

function endDrag(){
  if(!state.drag) return

  state.drag = false
  state.vx = clamp(state.pointerVX * 1.25, -34, 34)
  state.vy = clamp(state.pointerVY * 1.2, -34, 34)
  state.facing = state.vx < 0 ? -1 : 1
  face()
  setMode('slide')
}

function idleStep(){
  const floor = ground()
  state.y = floor
  state.hopPhase += state.hopSpeed

  const offset = Math.sin(state.hopPhase) * state.hopRange
  const nextX = state.hopBaseX + offset
  const s = solve(nextX, floor)

  state.x = s.x
  state.y = floor

  if(s.hitX){
    state.hopSpeed *= -1
    state.hopPhase += state.hopSpeed * 2
    state.facing *= -1
    face()
    state.hopBaseX = state.x
  }else{
    const dx = nextX - state.x
    if(Math.abs(dx) > 0.05){
      state.facing = dx < 0 ? -1 : 1
      face()
    }
  }

  if(Math.abs(Math.sin(state.hopPhase)) < 0.03){
    state.hopBaseX = state.x
  }
}

function slideStep(){
  state.vy += 0.9
  state.vx *= 0.992
  state.vy *= 0.996

  let sx = solve(state.x + state.vx, state.y)
  state.x = sx.x
  if(sx.hitX){
    state.vx *= -0.68
    state.vy *= 0.96
    state.facing = state.vx < 0 ? -1 : 1
    face()
  }

  let sy = solve(state.x, state.y + state.vy)
  state.y = sy.y
  if(sy.hitY){
    if(state.vy > 0){
      state.vy *= -0.48
      state.vx *= 0.93
    }else{
      state.vy *= -0.3
    }
  }

  if(Math.abs(state.vx) < 0.35 && Math.abs(state.vy) < 0.6 && sy.hitY){
    state.vx = 0
    state.vy = 0
    state.y = ground()
    state.hopBaseX = state.x
    state.hopPhase = 0
    setMode('idle')
  }
}

function loop(){
  if(state.mode === 'idle'){
    idleStep()
    applyPos()
  }else if(state.mode === 'slide'){
    slideStep()
    applyPos()
  }
  requestAnimationFrame(loop)
}

window.addEventListener('resize', ()=>{
  const s = stageSize()
  state.x = clamp(state.x,0,Math.max(0,s.w - state.w))
  state.y = ground()
  state.hopBaseX = state.x
  applyPos()
})

pet.addEventListener('mousedown', startDrag)
pet.addEventListener('touchstart', startDrag, { passive:false })
window.addEventListener('mousemove', moveDrag, { passive:false })
window.addEventListener('touchmove', moveDrag, { passive:false })
window.addEventListener('mouseup', endDrag)
window.addEventListener('touchend', endDrag)
window.addEventListener('touchcancel', endDrag)

state.y = ground()
face()
applyPos()
setMode('idle')
loop()
</script>
</body>
</html>
