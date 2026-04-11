(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const style = document.createElement('style')
    style.textContent = `
      #pet-stage,
      #pet-stage *{
        box-sizing:border-box;
        user-select:none;
        -webkit-user-select:none;
        -webkit-tap-highlight-color:transparent;
        touch-action:none;
      }
      #pet-stage{
        position:fixed;
        inset:0;
        width:100vw;
        height:100vh;
        overflow:hidden;
        pointer-events:none;
        z-index:2147483646;
        background:transparent;
      }
      #pet-overlay{
        position:absolute;
        inset:0;
        background:rgba(0,0,0,.18);
        opacity:0;
        transition:opacity .35s ease;
        pointer-events:none;
      }
      #pet-overlay.show{
        opacity:1;
      }
      #pet-laugh{
        position:absolute;
        left:50%;
        top:18%;
        transform:translateX(-50%) scale(.8);
        padding:10px 16px;
        border-radius:999px;
        background:rgba(255,255,255,.92);
        color:#3e255a;
        font:700 18px/1 system-ui,sans-serif;
        letter-spacing:.04em;
        opacity:0;
        transition:opacity .18s ease,transform .18s ease;
        box-shadow:0 10px 24px rgba(0,0,0,.18);
      }
      #pet-laugh.show{
        opacity:1;
        transform:translateX(-50%) scale(1);
      }
      #pet-stage .obstacle{
        position:absolute;
        border-radius:18px;
        background:rgba(90,70,130,.12);
        border:2px dashed rgba(90,70,130,.25);
        pointer-events:none;
      }
      #pet-float{
        position:absolute;
        width:150px;
        height:170px;
        left:90px;
        top:90px;
        z-index:2147483647;
        cursor:grab;
        pointer-events:auto;
        transform-origin:50% 80%;
        will-change:left,top,transform;
      }
      #pet-float.dragging{cursor:grabbing}
      #pet-float.face-left{transform:scaleX(-1)}
      #pet-float .wrap{
        position:absolute;
        inset:0;
        filter:drop-shadow(0 10px 12px rgba(0,0,0,.18));
        animation:petIdleHop .8s ease-in-out infinite;
      }
      #pet-float:hover .wrap{animation:petIdleHopHover .65s ease-in-out infinite}
      #pet-float.sliding .wrap{animation:petSlideFloat .18s linear infinite}
      #pet-float.chatting .wrap{animation:petChatHop .42s linear infinite}
      #pet-float.laughing .wrap{animation:petLaughHop .22s linear infinite}
      #pet-float.covering .wrap{animation:petCoverBounce .35s ease-in-out infinite}
      #pet-float.dragging .wrap{
        animation:none;
        transform:rotate(-5deg) scale(1.02);
      }
      #pet-float .shadow{
        position:absolute;
        left:50%;
        bottom:8px;
        width:56px;
        height:14px;
        transform:translateX(-50%);
        border-radius:50%;
        background:rgba(0,0,0,.16);
        filter:blur(3px);
        animation:petShadowIdle .8s ease-in-out infinite;
      }
      #pet-float:hover .shadow{animation:petShadowHover .65s ease-in-out infinite}
      #pet-float.sliding .shadow{animation:petShadowSlide .18s linear infinite}
      #pet-float.chatting .shadow{animation:petShadowChat .42s linear infinite}
      #pet-float.laughing .shadow{animation:petShadowLaugh .22s linear infinite}
      #pet-float.covering .shadow{animation:petShadowCover .35s ease-in-out infinite}
      #pet-float.dragging .shadow{
        animation:none;
        opacity:.08;
        transform:translateX(-50%) scale(.72);
      }
      #pet-float .sprite{
        position:absolute;
        inset:0;
      }
      #pet-float img{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:contain;
        pointer-events:none;
        -webkit-user-drag:none;
        user-select:none;
      }
      #pet-float .idle-img{opacity:1}
      #pet-float .grab-img{opacity:0}
      #pet-float.dragging .idle-img,
      #pet-float.sliding .idle-img{opacity:0}
      #pet-float.dragging .grab-img,
      #pet-float.sliding .grab-img{opacity:1}
      @keyframes petIdleHop{
        0%,100%{transform:translateY(0) scaleX(1) scaleY(1)}
        40%{transform:translateY(-10px) scaleX(.98) scaleY(1.02)}
        50%{transform:translateY(-14px) scaleX(.97) scaleY(1.03)}
        70%{transform:translateY(0) scaleX(1.02) scaleY(.98)}
      }
      @keyframes petIdleHopHover{
        0%,100%{transform:translateY(0) scaleX(1) scaleY(1)}
        40%{transform:translateY(-14px) scaleX(.98) scaleY(1.02)}
        50%{transform:translateY(-20px) scaleX(.97) scaleY(1.03)}
        70%{transform:translateY(0) scaleX(1.03) scaleY(.97)}
      }
      @keyframes petSlideFloat{
        0%,100%{transform:translateY(0) rotate(0deg)}
        50%{transform:translateY(-1px) rotate(.7deg)}
      }
      @keyframes petChatHop{
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-12px)}
      }
      @keyframes petLaughHop{
        0%,100%{transform:translateY(0) rotate(-2deg)}
        50%{transform:translateY(-14px) rotate(2deg)}
      }
      @keyframes petCoverBounce{
        0%,100%{transform:translateY(0) scale(1)}
        50%{transform:translateY(-8px) scale(1.03)}
      }
      @keyframes petShadowIdle{
        0%,100%{transform:translateX(-50%) scale(1);opacity:.14}
        50%{transform:translateX(-50%) scale(.8);opacity:.07}
      }
      @keyframes petShadowHover{
        0%,100%{transform:translateX(-50%) scale(1);opacity:.14}
        50%{transform:translateX(-50%) scale(.64);opacity:.05}
      }
      @keyframes petShadowSlide{
        0%,100%{transform:translateX(-50%) scale(.95);opacity:.1}
        50%{transform:translateX(-50%) scale(.82);opacity:.06}
      }
      @keyframes petShadowChat{
        0%,100%{transform:translateX(-50%) scale(.9);opacity:.1}
        50%{transform:translateX(-50%) scale(.7);opacity:.05}
      }
      @keyframes petShadowLaugh{
        0%,100%{transform:translateX(-50%) scale(.88);opacity:.12}
        50%{transform:translateX(-50%) scale(.6);opacity:.05}
      }
      @keyframes petShadowCover{
        0%,100%{transform:translateX(-50%) scale(1.2);opacity:.15}
        50%{transform:translateX(-50%) scale(.9);opacity:.08}
      }
    `
    document.head.appendChild(style)

    const stage = document.createElement('div')
    stage.id = 'pet-stage'
    stage.innerHTML = `
      <div id="pet-overlay"></div>
      <div id="pet-laugh">JA JA JA</div>
      <div class="obstacle" style="left:14%; top:72%; width:120px; height:34px;"></div>
      <div class="obstacle" style="left:44%; top:68%; width:150px; height:38px;"></div>
      <div class="obstacle" style="right:12%; top:72%; width:110px; height:34px;"></div>
      <div id="pet-float">
        <div class="shadow"></div>
        <div class="wrap">
          <div class="sprite">
            <img class="idle-img" src="https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png">
            <img class="grab-img" src="https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png">
          </div>
        </div>
      </div>
    `
    document.body.appendChild(stage)

    const pet = document.getElementById('pet-float')
    const overlay = document.getElementById('pet-overlay')
    const laughBubble = document.getElementById('pet-laugh')

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
      hopRange: 18,
      targetX: 0,
      targetY: 0,
      chatRect: null,
      nextActionAt: performance.now() + 3000,
      actionUntil: 0,
      inputActive: false,
      typingUntil: 0,
      chatInputBound: false,
      hiddenBehindChat: false,
      coverActive: false,
      maskRect: null
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v))
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min
    }

    function now() {
      return performance.now()
    }

    function point(e) {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
      return { x: e.clientX, y: e.clientY }
    }

    function stageSize() {
      return { w: stage.clientWidth, h: stage.clientHeight }
    }

    function ground() {
      return Math.max(0, stage.clientHeight - state.h)
    }

    function applyPos() {
      pet.style.left = state.x + 'px'
      pet.style.top = state.y + 'px'
      refreshPetMask()
    }

    function setPetLayer(front = true) {
      pet.style.zIndex = front ? '2147483647' : '2147483645'
    }

    function hideBehindChatStep() {
      const done = moveToTarget(0.16, 18, 6)

      if (done) {
        state.x = state.targetX
        state.y = state.targetY + Math.sin(performance.now() * 0.016) * 3
      }

      refreshPetMask()

      if (performance.now() > state.typingUntil) {
        if (Math.random() < 0.55) beginPeekChat()
        else finishAction()
      }
    }

    function setPetClip(hidden) {
      if (!hidden || !state.chatRect) {
        pet.style.clipPath = 'none'
        pet.style.webkitClipPath = 'none'
        return
      }

      const px = state.x
      const py = state.y
      const pw = state.w
      const ph = state.h

      const rx1 = state.chatRect.left
      const ry1 = state.chatRect.top
      const rx2 = state.chatRect.right
      const ry2 = state.chatRect.bottom

      const ix1 = Math.max(px, rx1)
      const iy1 = Math.max(py, ry1)
      const ix2 = Math.min(px + pw, rx2)
      const iy2 = Math.min(py + ph, ry2)

      if (ix2 <= ix1 || iy2 <= iy1) {
        pet.style.clipPath = 'none'
        pet.style.webkitClipPath = 'none'
        return
      }

      const left = ((ix1 - px) / pw) * 100
      const right = ((ix2 - px) / pw) * 100
      const top = ((iy1 - py) / ph) * 100
      const bottom = ((iy2 - py) / ph) * 100

      const polygon = `polygon(
        0% 0%,
        100% 0%,
        100% ${top}%,
        ${right}% ${top}%,
        ${right}% ${bottom}%,
        100% ${bottom}%,
        100% 100%,
        0% 100%,
        0% ${bottom}%,
        ${left}% ${bottom}%,
        ${left}% ${top}%,
        0% ${top}%
      )`

      pet.style.clipPath = polygon
      pet.style.webkitClipPath = polygon
    }

    function refreshPetMask() {
      setPetClip(state.hiddenBehindChat)
    }

    function face() {
      if (state.facing < 0) pet.classList.add('face-left')
      else pet.classList.remove('face-left')
    }

    function setMode(mode) {
      state.mode = mode
      pet.classList.remove('sliding', 'dragging', 'chatting', 'laughing', 'covering')
      if (mode === 'slide') pet.classList.add('sliding')
      if (mode === 'drag') pet.classList.add('dragging')
      if (mode === 'approach-chat' || mode === 'peek-chat' || mode === 'hide-behind-chat') pet.classList.add('chatting')
      if (mode === 'laugh') pet.classList.add('laughing')
      if (mode === 'cover-screen') pet.classList.add('covering')
    }

    function showLaugh(text = 'JA JA JA') {
      laughBubble.textContent = text
      laughBubble.classList.add('show')
    }

    function hideLaugh() {
      laughBubble.classList.remove('show')
    }

    function getObstacles() {
      const sr = stage.getBoundingClientRect()
      return [...stage.querySelectorAll('.obstacle')].map(el => {
        const r = el.getBoundingClientRect()
        return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height }
      })
    }

    function hit(a, b) {
      return a.x < b.x + b.w &&
             a.x + a.w > b.x &&
             a.y < b.y + b.h &&
             a.y + a.h > b.y
    }

    function solve(nx, ny) {
      const box = { x: nx, y: ny, w: state.w, h: state.h }
      const size = stageSize()
      const obs = getObstacles()
      let hitX = false
      let hitY = false

      if (box.x < 0) { box.x = 0; hitX = true }
      if (box.y < 0) { box.y = 0; hitY = true }
      if (box.x + box.w > size.w) { box.x = size.w - box.w; hitX = true }
      if (box.y + box.h > size.h) { box.y = size.h - box.h; hitY = true }

      for (const o of obs) {
        if (!hit(box, o)) continue
        const l = box.x + box.w - o.x
        const r = o.x + o.w - box.x
        const t = box.y + box.h - o.y
        const b = o.y + o.h - box.y
        const m = Math.min(l, r, t, b)
        if (m === l) { box.x = o.x - box.w; hitX = true }
        else if (m === r) { box.x = o.x + o.w; hitX = true }
        else if (m === t) { box.y = o.y - box.h; hitY = true }
        else { box.y = o.y + o.h; hitY = true }
      }

      return { x: box.x, y: box.y, hitX, hitY }
    }

    function startDrag(e) {
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
      state.lastMoveTime = now()
      state.vx = 0
      state.vy = 0
      overlay.classList.remove('show')
      hideLaugh()
      setMode('drag')
    }

    function moveDrag(e) {
      if (!state.drag) return
      e.preventDefault()
      const p = point(e)
      const sr = stage.getBoundingClientRect()
      const t = now()
      const dt = Math.max(8, t - state.lastMoveTime)

      state.pointerVX = (p.x - state.lastPointerX) / dt * 16
      state.pointerVY = (p.y - state.lastPointerY) / dt * 16
      state.lastPointerX = p.x
      state.lastPointerY = p.y
      state.lastMoveTime = t

      const nx = p.x - sr.left - state.offsetX
      const ny = p.y - sr.top - state.offsetY
      const s = solve(nx, ny)

      state.x = s.x
      state.y = s.y
      state.hopBaseX = state.x
      applyPos()
    }

    function endDrag() {
      if (!state.drag) return
      state.drag = false
      state.vx = clamp(state.pointerVX * 1.25, -34, 34)
      state.vy = clamp(state.pointerVY * 1.2, -34, 34)
      state.facing = state.vx < 0 ? -1 : 1
      face()
      state.nextActionAt = now() + rand(1800, 3200)
      setMode('slide')
    }

    function idleStep() {
      const floor = ground()
      state.y = floor
      state.hopPhase += state.hopSpeed
      const offset = Math.sin(state.hopPhase) * state.hopRange
      const nextX = state.hopBaseX + offset
      const s = solve(nextX, floor)
      state.x = s.x
      state.y = floor

      if (s.hitX) {
        state.hopSpeed *= -1
        state.hopPhase += state.hopSpeed * 2
        state.facing *= -1
        face()
        state.hopBaseX = state.x
      } else {
        const dx = nextX - state.x
        if (Math.abs(dx) > 0.05) {
          state.facing = dx < 0 ? -1 : 1
          face()
        }
      }

      if (Math.abs(Math.sin(state.hopPhase)) < 0.03) state.hopBaseX = state.x
    }

    function slideStep() {
      state.vy += 0.9
      state.vx *= 0.992
      state.vy *= 0.996

      const sx = solve(state.x + state.vx, state.y)
      state.x = sx.x
      if (sx.hitX) {
        state.vx *= -0.68
        state.vy *= 0.96
        state.facing = state.vx < 0 ? -1 : 1
        face()
      }

      const sy = solve(state.x, state.y + state.vy)
      state.y = sy.y
      if (sy.hitY) {
        if (state.vy > 0) {
          state.vy *= -0.48
          state.vx *= 0.93
        } else {
          state.vy *= -0.3
        }
      }

      if (Math.abs(state.vx) < 0.35 && Math.abs(state.vy) < 0.6 && sy.hitY) {
        state.vx = 0
        state.vy = 0
        state.y = ground()
        state.hopBaseX = state.x
        state.hopPhase = 0
        setMode('idle')
      }
    }

    function isVisible(el) {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 20 && r.height > 20 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'
    }

    function scoreChatElement(el) {
      if (!isVisible(el)) return -1
      const r = el.getBoundingClientRect()
      let score = 0
      const txt = `${el.id || ''} ${el.className || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.innerText || ''}`.toLowerCase()

      if (txt.includes('wix chat')) score += 120
      if (txt.includes('chat')) score += 70
      if (txt.includes('message')) score += 25
      if (el.tagName === 'IFRAME') score += 30
      if (r.right > window.innerWidth * 0.55) score += 25
      if (r.bottom > window.innerHeight * 0.55) score += 25
      if (r.width >= 40 && r.width <= 520) score += 15
      if (r.height >= 40 && r.height <= 900) score += 15

      return score
    }

    function findChatElement() {
      const selectors = [
        'iframe[title*="chat" i]',
        'iframe[aria-label*="chat" i]',
        '[aria-label*="wix chat" i]',
        '[aria-label*="chat" i]',
        '[title*="wix chat" i]',
        '[title*="chat" i]',
        '[id*="chat" i]',
        '[class*="chat" i]',
        'button',
        'div',
        'iframe'
      ]

      let best = null
      let bestScore = -1

      for (const selector of selectors) {
        const list = document.querySelectorAll(selector)
        for (const el of list) {
          const score = scoreChatElement(el)
          if (score > bestScore) {
            best = el
            bestScore = score
          }
        }
      }

      return bestScore >= 40 ? best : null
    }

    function updateChatRect() {
      const el = findChatElement()
      if (!el) {
        state.chatRect = null
        return null
      }
      const r = el.getBoundingClientRect()
      if (r.width < 20 || r.height < 20) {
        state.chatRect = null
        return null
      }
      state.chatRect = r
      return r
    }

    function isChatOpen() {
      const r = updateChatRect()
      if (!r) return false
      return r.width > 180 || r.height > 180
    }

    function setTargetNearChat() {
      const r = updateChatRect()
      if (!r) return false
      state.targetX = clamp(r.left + r.width * 0.5 - state.w * 0.5, 0, window.innerWidth - state.w)
      state.targetY = ground()
      return true
    }

    function setRandomRoamTarget() {
      state.targetX = rand(24, Math.max(24, window.innerWidth - state.w - 24))
      state.targetY = ground()
    }

    function moveToTarget(speed = 0.14, maxStep = 16, hopAmp = 8) {
      const dx = state.targetX - state.x
      if (Math.abs(dx) < 4) {
        state.x = state.targetX
        state.y = ground()
        return true
      }

      state.facing = dx < 0 ? -1 : 1
      face()

      const stepX = clamp(dx * speed, -maxStep, maxStep)
      const hop = Math.sin(now() * 0.02) * hopAmp
      const s = solve(state.x + stepX, ground() + hop)
      state.x = s.x
      state.y = s.y
      return false
    }

    function beginHideBehindChat() {
      if (!setTargetBehindChat()) return false
      state.actionUntil = performance.now() + 1400 + Math.random() * 1800
      state.hiddenBehindChat = true
      setPetLayer(true)
      setMode('hide-behind-chat')
      return true
    }

    function beginApproachChat() {
      if (!setTargetNearChat()) return false
      state.actionUntil = now() + rand(1800, 3200)
      setMode('approach-chat')
      return true
    }

    function beginPeekChat() {
      if (!setTargetPeekChat()) return false
      state.actionUntil = performance.now() + 1000 + Math.random() * 1200
      state.hiddenBehindChat = false
      setPetLayer(true)
      setMode('peek-chat')
      return true
    }

    function beginRoam() {
      setRandomRoamTarget()
      state.actionUntil = now() + rand(1400, 2800)
      setMode('roam')
    }

    function beginLaugh(text = 'JA JA JA') {
      state.actionUntil = now() + rand(1200, 2200)
      showLaugh(text)
      setMode('laugh')
    }

    function beginCoverScreen() {
      state.targetX = clamp(window.innerWidth * 0.5 - state.w * 0.5, 0, window.innerWidth - state.w)
      state.targetY = clamp(window.innerHeight * 0.28 - state.h * 0.5, 0, window.innerHeight - state.h)
      state.actionUntil = now() + rand(1800, 2600)
      overlay.classList.add('show')
      showLaugh('jeje')
      state.coverActive = true
      setMode('cover-screen')
    }

    function finishAction() {
      overlay.classList.remove('show')
      hideLaugh()
      state.coverActive = false
      state.hiddenBehindChat = false
      setPetLayer(true)
      pet.style.clipPath = 'none'
      pet.style.webkitClipPath = 'none'
      state.hopBaseX = state.x
      state.hopPhase = 0
      state.nextActionAt = performance.now() + 1800 + Math.random() * 2600
      setMode('idle')
    }

    function decideNextAction() {
      if (state.drag || state.mode === 'slide') return
      if (now() < state.nextActionAt) return

      const chatOpen = isChatOpen()
      const roll = Math.random()

      if (chatOpen && roll < 0.45) {
        beginApproachChat()
        return
      }

      if (chatOpen && roll < 0.7) {
        beginCoverScreen()
        return
      }

      if (roll < 0.82) {
        beginRoam()
        return
      }

      beginLaugh('JA JA JA')
    }

    function roamStep() {
      const done = moveToTarget(0.1, 11, 5)
      if (done || now() > state.actionUntil) finishAction()
    }

    function approachChatStep() {
      const done = moveToTarget(0.16, 18, 10)
      if (done) {
        state.actionUntil = now() + rand(900, 1600)
        setMode('peek-chat')
      }
      if (now() > state.actionUntil && state.mode === 'approach-chat') finishAction()
    }

    function peekChatStep() {
      if (!state.chatRect) {
        finishAction()
        return
      }

      const r = state.chatRect
      const chatCenter = r.left + r.width * 0.5
      state.facing = state.x + state.w * 0.5 > chatCenter ? -1 : 1
      face()

      state.y = ground() + Math.sin(now() * 0.024) * 6
      if (Math.random() < 0.015) showLaugh('...')
      else if (Math.random() < 0.02) showLaugh('jeje')

      if (now() > state.actionUntil) {
        hideLaugh()
        if (Math.random() < 0.5) beginLaugh('jeje')
        else finishAction()
      }
    }

    function laughStep() {
      state.y = ground() + Math.sin(now() * 0.03) * 8
      if (now() > state.actionUntil) finishAction()
    }

    function coverScreenStep() {
      const dx = state.targetX - state.x
      const dy = state.targetY - state.y

      state.facing = dx < 0 ? -1 : 1
      face()

      state.x += clamp(dx * 0.18, -20, 20)
      state.y += clamp(dy * 0.18, -16, 16)

      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        state.x = state.targetX
        state.y = state.targetY + Math.sin(now() * 0.035) * 8
      }

      if (now() > state.actionUntil) finishAction()
    }

    function watchChat() {
      function scan() {
        updateChatRect()
        refreshPetMask()
      }

      const observer = new MutationObserver(scan)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true })
      window.addEventListener('click', () => setTimeout(scan, 160))
      window.addEventListener('resize', scan)
      setInterval(scan, 700)
      scan()
    }
    
    function loop() {
      decideNextAction()

      if (state.mode === 'idle') {
        idleStep()
      } else if (state.mode === 'slide') {
        slideStep()
      } else if (state.mode === 'roam') {
        roamStep()
      } else if (state.mode === 'approach-chat') {
        approachChatStep()
      } else if (state.mode === 'peek-chat') {
        peekChatStep()
      } else if (state.mode === 'laugh') {
        laughStep()
      } else if (state.mode === 'cover-screen') {
        coverScreenStep()
      }

      applyPos()
      requestAnimationFrame(loop)
    }

    window.addEventListener('resize', function () {
      const s = stageSize()
      state.x = clamp(state.x, 0, Math.max(0, s.w - state.w))
      state.y = ground()
      state.hopBaseX = state.x
      applyPos()
    })

    pet.addEventListener('mousedown', startDrag)
    pet.addEventListener('touchstart', startDrag, { passive: false })
    window.addEventListener('mousemove', moveDrag, { passive: false })
    window.addEventListener('touchmove', moveDrag, { passive: false })
    window.addEventListener('mouseup', endDrag)
    window.addEventListener('touchend', endDrag)
    window.addEventListener('touchcancel', endDrag)

    state.y = ground()
    face()
    applyPos()
    setMode('idle')
    watchChat()
    loop()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
