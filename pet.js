;(() => {
  if (window.__petLoaded) return
  window.__petLoaded = true

  const PET_W = 150
  const PET_H = 170

  const style = document.createElement('style')
  style.textContent = `
    #pet-stage, #pet-stage * {
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    #pet-stage {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      pointer-events: none;
      z-index: 2147483646;
    }

    #pet-float {
      position: absolute;
      width: ${PET_W}px;
      height: ${PET_H}px;
      left: 90px;
      top: 90px;
      pointer-events: auto;
      cursor: grab;
      transform-origin: 50% 80%;
      will-change: transform, left, top, clip-path;
    }

    #pet-float.dragging {
      cursor: grabbing;
    }

    #pet-float.face-left {
      transform: scaleX(-1);
    }

    #pet-float .wrap {
      position: absolute;
      inset: 0;
      filter: drop-shadow(0 10px 12px rgba(0,0,0,.18));
      animation: petIdle .8s ease-in-out infinite;
    }

    #pet-float.dragging .wrap {
      animation: none;
    }

    #pet-float.moving .wrap {
      animation: petMove .18s linear infinite;
    }

    #pet-float.hidden-chat .wrap {
      animation: petHide .35s ease-in-out infinite;
    }

    #pet-float .shadow {
      position: absolute;
      left: 50%;
      bottom: 8px;
      width: 56px;
      height: 14px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: rgba(0,0,0,.16);
      filter: blur(3px);
      animation: petShadow .8s ease-in-out infinite;
    }

    #pet-float.dragging .shadow {
      animation: none;
      opacity: .08;
      transform: translateX(-50%) scale(.72);
    }

    #pet-float.moving .shadow {
      animation: petShadowMove .18s linear infinite;
    }

    #pet-float.hidden-chat .shadow {
      animation: petShadowHide .35s ease-in-out infinite;
    }

    #pet-float img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
      -webkit-user-drag: none;
    }

    #pet-float .idle-img { opacity: 1; }
    #pet-float .grab-img { opacity: 0; }

    #pet-float.dragging .idle-img,
    #pet-float.moving .idle-img {
      opacity: 0;
    }

    #pet-float.dragging .grab-img,
    #pet-float.moving .grab-img {
      opacity: 1;
    }

    @keyframes petIdle {
      0%,100% { transform: translateY(0) scaleX(1) scaleY(1); }
      40% { transform: translateY(-10px) scaleX(.98) scaleY(1.02); }
      50% { transform: translateY(-14px) scaleX(.97) scaleY(1.03); }
      70% { transform: translateY(0) scaleX(1.02) scaleY(.98); }
    }

    @keyframes petMove {
      0%,100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-1px) rotate(.7deg); }
    }

    @keyframes petHide {
      0%,100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.03); }
    }

    @keyframes petShadow {
      0%,100% { transform: translateX(-50%) scale(1); opacity: .14; }
      50% { transform: translateX(-50%) scale(.8); opacity: .07; }
    }

    @keyframes petShadowMove {
      0%,100% { transform: translateX(-50%) scale(.95); opacity: .1; }
      50% { transform: translateX(-50%) scale(.82); opacity: .06; }
    }

    @keyframes petShadowHide {
      0%,100% { transform: translateX(-50%) scale(1.2); opacity: .15; }
      50% { transform: translateX(-50%) scale(.9); opacity: .08; }
    }
  `
  document.head.appendChild(style)

  const stage = document.createElement('div')
  stage.id = 'pet-stage'
  stage.innerHTML = `
    <div id="pet-float">
      <div class="shadow"></div>
      <div class="wrap">
        <img class="idle-img" src="https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png">
        <img class="grab-img" src="https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png">
      </div>
    </div>
  `
  document.body.appendChild(stage)

  const pet = stage.querySelector('#pet-float')

  const state = {
    x: 90,
    y: 0,
    vx: 0,
    vy: 0,
    drag: false,
    mode: 'idle',
    facing: 1,
    offsetX: 0,
    offsetY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastMoveTime: 0,
    pointerVX: 0,
    pointerVY: 0,
    targetX: 90,
    targetY: 0,
    chatRect: null,
    typingUntil: 0
  }

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
  const now = () => performance.now()

  const point = e => {
    if (e.touches?.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    if (e.changedTouches?.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    return { x: e.clientX, y: e.clientY }
  }

  const ground = () => Math.max(0, window.innerHeight - PET_H)

  const applyPos = () => {
    pet.style.left = `${state.x}px`
    pet.style.top = `${state.y}px`
    updateClip()
  }

  const face = () => {
    pet.classList.toggle('face-left', state.facing < 0)
  }

  const setMode = mode => {
    state.mode = mode
    pet.classList.toggle('dragging', mode === 'drag')
    pet.classList.toggle('moving', mode === 'move' || mode === 'slide')
    pet.classList.toggle('hidden-chat', mode === 'hide')
  }

  const setClip = value => {
    pet.style.clipPath = value
    pet.style.webkitClipPath = value
  }

  const updateClip = () => {
    const r = state.chatRect
    if (!r || state.mode !== 'hide') {
      setClip('none')
      return
    }

    const chatOnRight = r.left > window.innerWidth * 0.5

    if (chatOnRight) {
      const overlap = state.x + PET_W - r.left
      if (overlap <= 0) {
        setClip('none')
        return
      }
      const hidePct = clamp((overlap / PET_W) * 100, 0, 92)
      const visiblePct = 100 - hidePct
      setClip(`polygon(0% 0%, ${visiblePct}% 0%, ${visiblePct}% 100%, 0% 100%)`)
      return
    }

    const overlap = r.right - state.x
    if (overlap <= 0) {
      setClip('none')
      return
    }
    const hidePct = clamp((overlap / PET_W) * 100, 0, 92)
    setClip(`polygon(${hidePct}% 0%, 100% 0%, 100% 100%, ${hidePct}% 100%)`)
  }

  const isVisible = el => {
    if (!el) return false
    const s = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return r.width > 20 && r.height > 20 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'
  }

  const scorePanel = el => {
    if (!isVisible(el)) return -1
    const r = el.getBoundingClientRect()
    const txt = `${el.id || ''} ${el.className || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`.toLowerCase()

    let score = 0
    if (txt.includes('chat')) score += 80
    if (txt.includes('message')) score += 30
    if (txt.includes('wix')) score += 40
    if (el.tagName === 'IFRAME') score += 30
    if (r.width >= 220) score += 25
    if (r.height >= 220) score += 25
    if (r.right > window.innerWidth * 0.55) score += 20
    if (r.bottom > window.innerHeight * 0.45) score += 20

    return score
  }

  const findChatPanel = () => {
    const selectors = [
      'iframe[title*="chat" i]',
      '[aria-label*="chat" i]',
      '[title*="chat" i]',
      '[id*="chat" i]',
      '[class*="chat" i]',
      'iframe',
      'aside',
      'section',
      'div'
    ]

    let best = null
    let bestScore = -1

    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) {
        const score = scorePanel(el)
        if (score > bestScore) {
          best = el
          bestScore = score
        }
      }
    }

    return bestScore >= 50 ? best : null
  }

  const updateChatRect = () => {
    const el = findChatPanel()
    if (!el) {
      state.chatRect = null
      return null
    }

    const r = el.getBoundingClientRect()
    if (r.width < 60 || r.height < 60) {
      state.chatRect = null
      return null
    }

    state.chatRect = r
    return r
  }

  const findActiveInput = () => {
    const el = document.activeElement
    if (!el) return false
    if (el.matches('textarea, input[type="text"], [contenteditable="true"], [role="textbox"]')) return true
    return false
  }

  const startDrag = e => {
    e.preventDefault()
    const p = point(e)
    const r = pet.getBoundingClientRect()

    state.drag = true
    state.offsetX = p.x - r.left
    state.offsetY = p.y - r.top
    state.lastPointerX = p.x
    state.lastPointerY = p.y
    state.lastMoveTime = now()
    state.pointerVX = 0
    state.pointerVY = 0
    state.vx = 0
    state.vy = 0

    setMode('drag')
  }

  const moveDrag = e => {
    if (!state.drag) return
    e.preventDefault()

    const p = point(e)
    const t = now()
    const dt = Math.max(8, t - state.lastMoveTime)

    state.pointerVX = ((p.x - state.lastPointerX) / dt) * 16
    state.pointerVY = ((p.y - state.lastPointerY) / dt) * 16
    state.lastPointerX = p.x
    state.lastPointerY = p.y
    state.lastMoveTime = t

    state.x = clamp(p.x - state.offsetX, 0, window.innerWidth - PET_W)
    state.y = clamp(p.y - state.offsetY, 0, window.innerHeight - PET_H)

    applyPos()
  }

  const endDrag = () => {
    if (!state.drag) return

    state.drag = false
    state.vx = clamp(state.pointerVX * 1.15, -28, 28)
    state.vy = clamp(state.pointerVY * 1.1, -28, 28)
    state.facing = state.vx < 0 ? -1 : 1
    face()
    setMode('slide')
  }

  const slideStep = () => {
    state.vy += 0.9
    state.vx *= 0.992
    state.vy *= 0.996

    state.x += state.vx
    state.y += state.vy

    if (state.x <= 0 || state.x >= window.innerWidth - PET_W) {
      state.x = clamp(state.x, 0, window.innerWidth - PET_W)
      state.vx *= -0.68
      state.facing = state.vx < 0 ? -1 : 1
      face()
    }

    if (state.y >= ground()) {
      state.y = ground()
      state.vy *= -0.45
      state.vx *= 0.92
    }

    if (Math.abs(state.vx) < 0.35 && Math.abs(state.vy) < 0.6 && state.y >= ground()) {
      state.vx = 0
      state.vy = 0
      state.y = ground()
      setMode('idle')
    }
  }

  const moveTo = (tx, ty, speed = 0.16, maxStep = 18) => {
    const dx = tx - state.x
    const dy = ty - state.y

    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
      state.x = tx
      state.y = ty
      return true
    }

    state.facing = dx < 0 ? -1 : 1
    face()

    state.x += clamp(dx * speed, -maxStep, maxStep)
    state.y += clamp(dy * speed, -12, 12)

    state.x = clamp(state.x, 0, window.innerWidth - PET_W)
    state.y = clamp(state.y, 0, ground())

    return false
  }

  const updateTypingState = () => {
    if (findActiveInput()) {
      state.typingUntil = now() + 1200
    }
  }

  const shouldHideNearChat = () => {
    updateChatRect()
    return !!state.chatRect && now() < state.typingUntil
  }

  const hideStep = () => {
    const r = state.chatRect
    if (!r) {
      setMode('idle')
      return
    }

    const chatOnRight = r.left > window.innerWidth * 0.5
    const tx = chatOnRight
      ? clamp(r.left - PET_W * 0.35, 0, window.innerWidth - PET_W)
      : clamp(r.right - PET_W * 0.65, 0, window.innerWidth - PET_W)
    const ty = clamp(r.bottom - PET_H - 6, 0, ground())

    moveTo(tx, ty, 0.22, 22)
    updateClip()

    if (now() >= state.typingUntil) {
      setClip('none')
      setMode('idle')
    }
  }

  const idleStep = () => {
    state.y = ground()
  }

  const loop = () => {
    if (!state.drag) {
      if (shouldHideNearChat()) {
        setMode('hide')
      }

      if (state.mode === 'slide') slideStep()
      else if (state.mode === 'hide') hideStep()
      else idleStep()
    }

    applyPos()
    requestAnimationFrame(loop)
  }

  const bindInputTracking = () => {
    const onBurst = () => updateTypingState()

    document.addEventListener('focusin', updateTypingState, true)
    document.addEventListener('input', onBurst, true)
    document.addEventListener('keydown', onBurst, true)
    document.addEventListener('click', () => setTimeout(updateChatRect, 120), true)

    new MutationObserver(() => updateChatRect()).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })
  }

  window.addEventListener('resize', () => {
    state.x = clamp(state.x, 0, window.innerWidth - PET_W)
    state.y = clamp(state.y, 0, ground())
    updateChatRect()
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
  updateChatRect()
  bindInputTracking()
  loop()
})()
