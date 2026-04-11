(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const style = document.createElement('style')
    style.textContent = `
      #pet-stage,#pet-stage *{
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
      #pet-float.hiding .wrap{animation:none}
      #pet-float.peeking .wrap{animation:petPeekBob 1.3s ease-in-out infinite}
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
      #pet-float.hiding .shadow{animation:none;opacity:.05;transform:translateX(-50%) scale(.62)}
      #pet-float.peeking .shadow{animation:petShadowPeek 1.3s ease-in-out infinite}
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
      #pet-float.sliding .idle-img,
      #pet-float.chatting .idle-img{opacity:0}
      #pet-float.dragging .grab-img,
      #pet-float.sliding .grab-img,
      #pet-float.chatting .grab-img{opacity:1}
      #pet-float.hiding .idle-img,
      #pet-float.peeking .idle-img{opacity:1}
      #pet-float.hiding .grab-img,
      #pet-float.peeking .grab-img{opacity:0}

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
      @keyframes petPeekBob{
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-5px)}
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
      @keyframes petShadowPeek{
        0%,100%{transform:translateX(-50%) scale(.68);opacity:.06}
        50%{transform:translateX(-50%) scale(.6);opacity:.04}
      }
    `
    document.head.appendChild(style)

    const stage = document.createElement('div')
    stage.id = 'pet-stage'
    stage.innerHTML = `
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
      hideAnchorX: 0,
      hideAnchorY: 0,
      hideOffset: 58,
      peekAmount: 26,
      peekTimer: 0,
      peekDuration: 0,
      nextPeekAt: 0
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v))
    }

    function point(e) {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
      return { x: e.clientX, y: e.clientY }
    }

    function ground() {
      return Math.max(0, window.innerHeight - state.h)
    }

    function applyPos() {
      pet.style.left = state.x + 'px'
      pet.style.top = state.y + 'px'
    }

    function face() {
      if (state.facing < 0) pet.classList.add('face-left')
      else pet.classList.remove('face-left')
    }

    function setMode(mode) {
      state.mode = mode
      pet.classList.remove('sliding', 'dragging', 'chatting', 'hiding', 'peeking')
      if (mode === 'slide') pet.classList.add('sliding')
      if (mode === 'drag') pet.classList.add('dragging')
      if (mode === 'chat') pet.classList.add('chatting')
      if (mode === 'hide') pet.classList.add('hiding')
      if (mode === 'peek') pet.classList.add('peeking')
    }

    function solve(nx, ny) {
      return {
        x: clamp(nx, 0, Math.max(0, window.innerWidth - state.w)),
        y: clamp(ny, 0, Math.max(0, window.innerHeight - state.h)),
        hitX: nx < 0 || nx > Math.max(0, window.innerWidth - state.w),
        hitY: ny < 0 || ny > Math.max(0, window.innerHeight - state.h)
      }
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
      state.lastMoveTime = performance.now()
      state.vx = 0
      state.vy = 0
      setMode('drag')
    }

    function moveDrag(e) {
      if (!state.drag) return
      e.preventDefault()
      const p = point(e)
      const now = performance.now()
      const dt = Math.max(8, now - state.lastMoveTime)

      state.pointerVX = (p.x - state.lastPointerX) / dt * 16
      state.pointerVY = (p.y - state.lastPointerY) / dt * 16
      state.lastPointerX = p.x
      state.lastPointerY = p.y
      state.lastMoveTime = now

      const nx = p.x - state.offsetX
      const ny = p.y - state.offsetY
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

      let sx = solve(state.x + state.vx, state.y)
      state.x = sx.x
      if (sx.hitX) {
        state.vx *= -0.68
        state.vy *= 0.96
        state.facing = state.vx < 0 ? -1 : 1
        face()
      }

      let sy = solve(state.x, state.y + state.vy)
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

    function safeQuery(selector) {
      try {
        return Array.from(document.querySelectorAll(selector))
      } catch (e) {
        return []
      }
    }

    function scoreChatElement(el) {
      if (!isVisible(el)) return -1
      const r = el.getBoundingClientRect()
      const text = [
        el.id || '',
        typeof el.className === 'string' ? el.className : '',
        el.getAttribute('aria-label') || '',
        el.getAttribute('title') || '',
        el.innerText || ''
      ].join(' ').toLowerCase()

      let score = 0
      if (text.includes('wix chat')) score += 120
      if (text.includes('chat')) score += 70
      if (text.includes('message')) score += 20
      if (el.tagName === 'IFRAME') score += 20
      if (r.right > window.innerWidth * 0.55) score += 20
      if (r.bottom > window.innerHeight * 0.55) score += 20
      return score
    }

    function findChatElement() {
      const selectors = [
        'iframe[title*="chat"]',
        'iframe[aria-label*="chat"]',
        '[aria-label*="chat"]',
        '[title*="chat"]',
        '[id*="chat"]',
        '[class*="chat"]',
        'button',
        'div',
        'iframe'
      ]

      let best = null
      let bestScore = -1

      selectors.forEach(selector => {
        safeQuery(selector).forEach(el => {
          const score = scoreChatElement(el)
          if (score > bestScore) {
            best = el
            bestScore = score
          }
        })
      })

      if (bestScore >= 35) return best

      const fallback = safeQuery('button,div,iframe').filter(isVisible)
      fallback.sort((a, b) => {
        const ar = a.getBoundingClientRect()
        const br = b.getBoundingClientRect()
        return (br.right + br.bottom) - (ar.right + ar.bottom)
      })

      return fallback[0] || null
    }

    function getChatRect() {
      const el = findChatElement()
      if (!el) return null
      const r = el.getBoundingClientRect()
      if (r.width < 20 || r.height < 20) return null
      return r
    }

    function isChatOpen() {
      const r = getChatRect()
      if (!r) return false
      return r.width > 180 || r.height > 180
    }

    function getChatTarget() {
      const r = getChatRect()
      if (r) {
        return {
          x: clamp(r.left + r.width * 0.5 - state.w * 0.5, 0, Math.max(0, window.innerWidth - state.w)),
          rect: r
        }
      }

      return {
        x: Math.max(0, window.innerWidth - state.w - 24),
        rect: null
      }
    }

    function beginHideMode() {
      const t = getChatTarget()
      const anchorX = t.rect
        ? clamp(t.rect.left + t.rect.width - state.w + 22, 0, Math.max(0, window.innerWidth - state.w))
        : t.x

      state.hideAnchorX = anchorX
      state.hideAnchorY = ground()
      state.peekTimer = 0
      state.peekDuration = 0
      state.nextPeekAt = performance.now() + 800 + Math.random() * 1400
      state.facing = 1
      face()
      state.x = anchorX + state.hideOffset
      state.y = state.hideAnchorY
      setMode('hide')
    }

    function goToChat() {
      const t = getChatTarget()
      state.targetX = t.x
      setMode('chat')
    }

    function chatStep() {
      const t = getChatTarget()
      state.targetX = t.x
      const dx = state.targetX - state.x

      if (Math.abs(dx) < 6) {
        state.x = state.targetX
        state.y = ground()
        beginHideMode()
        return
      }

      state.facing = dx < 0 ? -1 : 1
      face()

      const stepX = clamp(dx * 0.14, -16, 16)
      const hop = Math.sin(performance.now() * 0.02) * 10
      const s = solve(state.x + stepX, ground() + hop)
      state.x = s.x
      state.y = s.y
    }

    function hideStep(now) {
      state.facing = 1
      face()
      state.x = state.hideAnchorX + state.hideOffset
      state.y = state.hideAnchorY

      if (now >= state.nextPeekAt) {
        state.peekDuration = 900 + Math.random() * 900
        state.peekTimer = now + state.peekDuration
        setMode('peek')
      }
    }

    function peekStep(now) {
      state.facing = 1
      face()

      const p = 1 - Math.max(0, (state.peekTimer - now) / state.peekDuration)
      const wave = Math.sin(p * Math.PI)
      state.x = state.hideAnchorX + state.hideOffset - state.peekAmount * wave
      state.y = state.hideAnchorY - Math.sin(now * 0.01) * 2

      if (now >= state.peekTimer) {
        state.nextPeekAt = now + 1400 + Math.random() * 2200
        setMode('hide')
      }
    }

    function watchChat() {
      let lastOpen = false

      function scan() {
        try {
          const open = isChatOpen()
          if (open && !lastOpen && !state.drag) goToChat()
          if (!open && lastOpen && (state.mode === 'chat' || state.mode === 'hide' || state.mode === 'peek')) {
            state.hopBaseX = state.x
            state.hopPhase = 0
            setMode('idle')
          }
          lastOpen = open
        } catch (e) {}
      }

      const observer = new MutationObserver(scan)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true })
      window.addEventListener('click', function () { setTimeout(scan, 200) })
      window.addEventListener('resize', scan)
      setInterval(scan, 700)
      scan()
    }

    function loop(now) {
      if (state.mode === 'idle') {
        idleStep()
      } else if (state.mode === 'slide') {
        slideStep()
      } else if (state.mode === 'chat') {
        chatStep()
      } else if (state.mode === 'hide') {
        hideStep(now || performance.now())
      } else if (state.mode === 'peek') {
        peekStep(now || performance.now())
      }

      applyPos()
      requestAnimationFrame(loop)
    }

    window.addEventListener('resize', function () {
      state.x = clamp(state.x, 0, Math.max(0, window.innerWidth - state.w))
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
