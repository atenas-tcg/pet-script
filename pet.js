;(() => {
  if (window.__petLoaded) return
  window.__petLoaded = true

  const W = 150
  const H = 170

  document.head.insertAdjacentHTML('beforeend', `
    <style>
      #pet-stage,#pet-stage *{box-sizing:border-box;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
      #pet-stage{position:fixed;inset:0;pointer-events:none;z-index:2147483646;overflow:hidden}
      #pet{position:absolute;width:${W}px;height:${H}px;left:90px;top:90px;pointer-events:auto;cursor:grab;transform-origin:50% 80%}
      #pet.drag{cursor:grabbing}
      #pet.left{transform:scaleX(-1)}
      #pet .wrap{position:absolute;inset:0;filter:drop-shadow(0 10px 12px rgba(0,0,0,.18));animation:idle .8s ease-in-out infinite}
      #pet.drag .wrap{animation:none}
      #pet.move .wrap{animation:move .18s linear infinite}
      #pet.hide .wrap{animation:hide .35s ease-in-out infinite}
      #pet .shadow{position:absolute;left:50%;bottom:8px;width:56px;height:14px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,.16);filter:blur(3px);animation:shadow .8s ease-in-out infinite}
      #pet.drag .shadow{animation:none;opacity:.08;transform:translateX(-50%) scale(.72)}
      #pet.move .shadow{animation:shadowMove .18s linear infinite}
      #pet.hide .shadow{animation:shadowHide .35s ease-in-out infinite}
      #pet img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none}
      #pet .grab{opacity:0}
      #pet.drag .idle,#pet.move .idle{opacity:0}
      #pet.drag .grab,#pet.move .grab{opacity:1}
      @keyframes idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes move{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px) rotate(.7deg)}}
      @keyframes hide{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px) scale(1.03)}}
      @keyframes shadow{0%,100%{transform:translateX(-50%) scale(1);opacity:.14}50%{transform:translateX(-50%) scale(.8);opacity:.07}}
      @keyframes shadowMove{0%,100%{transform:translateX(-50%) scale(.95);opacity:.1}50%{transform:translateX(-50%) scale(.82);opacity:.06}}
      @keyframes shadowHide{0%,100%{transform:translateX(-50%) scale(1.2);opacity:.15}50%{transform:translateX(-50%) scale(.9);opacity:.08}}
    </style>
  `)

  document.body.insertAdjacentHTML('beforeend', `
    <div id="pet-stage">
      <div id="pet">
        <div class="shadow"></div>
        <div class="wrap">
          <img class="idle" src="https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png">
          <img class="grab" src="https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png">
        </div>
      </div>
    </div>
  `)

  const pet = document.getElementById('pet')
  const s = { x: 90, y: innerHeight - H, vx: 0, vy: 0, drag: 0, ox: 0, oy: 0, px: 0, py: 0, pt: 0, typingUntil: 0, chat: null }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const t = () => performance.now()
  const ground = () => innerHeight - H
  const p = e => e.touches?.[0] || e.changedTouches?.[0] || e

  const draw = () => {
    pet.style.left = s.x + 'px'
    pet.style.top = s.y + 'px'
    pet.classList.toggle('left', s.vx < 0)
    updateClip()
  }

  const setMode = m => {
    pet.classList.toggle('drag', m === 'drag')
    pet.classList.toggle('move', m === 'move')
    pet.classList.toggle('hide', m === 'hide')
  }

  const visible = el => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 40 && r.height > 40 && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0'
  }

  const findChat = () => {
    let best = null
    let score = 0
    for (const el of document.querySelectorAll('iframe,[id*="chat" i],[class*="chat" i],[aria-label*="chat" i],[title*="chat" i],aside,section,div')) {
      if (!visible(el)) continue
      const r = el.getBoundingClientRect()
      const txt = `${el.id || ''} ${el.className || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`.toLowerCase()
      let n = 0
      if (txt.includes('chat')) n += 80
      if (txt.includes('message')) n += 30
      if (el.tagName === 'IFRAME') n += 20
      if (r.width > 220) n += 20
      if (r.height > 220) n += 20
      if (r.right > innerWidth * 0.55) n += 15
      if (r.bottom > innerHeight * 0.45) n += 15
      if (n > score) score = n, best = el
    }
    s.chat = score >= 50 ? best.getBoundingClientRect() : null
  }

  const updateClip = () => {
    if (!s.chat || !pet.classList.contains('hide')) {
      pet.style.clipPath = 'none'
      pet.style.webkitClipPath = 'none'
      return
    }

    const r = s.chat
    if (r.left > innerWidth * 0.5) {
      const overlap = s.x + W - r.left
      if (overlap <= 0) return pet.style.clipPath = pet.style.webkitClipPath = 'none'
      const hide = clamp(overlap / W * 100, 0, 92)
      const show = 100 - hide
      const v = `polygon(0% 0%, ${show}% 0%, ${show}% 100%, 0% 100%)`
      pet.style.clipPath = pet.style.webkitClipPath = v
    } else {
      const overlap = r.right - s.x
      if (overlap <= 0) return pet.style.clipPath = pet.style.webkitClipPath = 'none'
      const hide = clamp(overlap / W * 100, 0, 92)
      const v = `polygon(${hide}% 0%, 100% 0%, 100% 100%, ${hide}% 100%)`
      pet.style.clipPath = pet.style.webkitClipPath = v
    }
  }

  const trackTyping = () => {
    const a = document.activeElement
    if (a && a.matches('textarea,input[type="text"],[contenteditable="true"],[role="textbox"]')) s.typingUntil = t() + 1200
  }

  const start = e => {
    e.preventDefault()
    const m = p(e)
    const r = pet.getBoundingClientRect()
    s.drag = 1
    s.ox = m.clientX - r.left
    s.oy = m.clientY - r.top
    s.px = m.clientX
    s.py = m.clientY
    s.pt = t()
    s.vx = 0
    s.vy = 0
    setMode('drag')
  }

  const move = e => {
    if (!s.drag) return
    e.preventDefault()
    const m = p(e)
    const nt = t()
    const dt = Math.max(8, nt - s.pt)
    s.vx = clamp((m.clientX - s.px) / dt * 16, -28, 28)
    s.vy = clamp((m.clientY - s.py) / dt * 16, -28, 28)
    s.px = m.clientX
    s.py = m.clientY
    s.pt = nt
    s.x = clamp(m.clientX - s.ox, 0, innerWidth - W)
    s.y = clamp(m.clientY - s.oy, 0, innerHeight - H)
    draw()
  }

  const end = () => {
    if (!s.drag) return
    s.drag = 0
    setMode('move')
  }

  const slide = () => {
    s.vy += 0.9
    s.vx *= 0.992
    s.vy *= 0.996
    s.x += s.vx
    s.y += s.vy

    if (s.x <= 0 || s.x >= innerWidth - W) {
      s.x = clamp(s.x, 0, innerWidth - W)
      s.vx *= -0.68
    }

    if (s.y >= ground()) {
      s.y = ground()
      s.vy *= -0.45
      s.vx *= 0.92
    }

    if (Math.abs(s.vx) < 0.35 && Math.abs(s.vy) < 0.6 && s.y >= ground()) {
      s.vx = 0
      s.vy = 0
      s.y = ground()
      setMode('idle')
    }
  }

  const hide = () => {
    if (!s.chat) return setMode('idle')
    const r = s.chat
    const right = r.left > innerWidth * 0.5
    const tx = right ? clamp(r.left - W * 0.35, 0, innerWidth - W) : clamp(r.right - W * 0.65, 0, innerWidth - W)
    const ty = clamp(r.bottom - H - 6, 0, ground())
    const dx = tx - s.x
    const dy = ty - s.y
    s.vx = dx * 0.22
    s.x += clamp(s.vx, -22, 22)
    s.y += clamp(dy * 0.22, -12, 12)
    s.x = clamp(s.x, 0, innerWidth - W)
    s.y = clamp(s.y, 0, ground())
    if (t() >= s.typingUntil) setMode('idle')
  }

  const loop = () => {
    if (!s.drag) {
      if (t() < s.typingUntil && s.chat) setMode('hide')
      if (pet.classList.contains('move')) slide()
      else if (pet.classList.contains('hide')) hide()
      else s.y = ground()
    }
    draw()
    requestAnimationFrame(loop)
  }

  addEventListener('resize', () => {
    s.x = clamp(s.x, 0, innerWidth - W)
    s.y = clamp(s.y, 0, ground())
    findChat()
    draw()
  })

  document.addEventListener('focusin', trackTyping, true)
  document.addEventListener('input', trackTyping, true)
  document.addEventListener('keydown', trackTyping, true)
  document.addEventListener('click', () => setTimeout(findChat, 120), true)
  new MutationObserver(findChat).observe(document.body, { childList: true, subtree: true, attributes: true })

  pet.addEventListener('mousedown', start)
  pet.addEventListener('touchstart', start, { passive: false })
  addEventListener('mousemove', move, { passive: false })
  addEventListener('touchmove', move, { passive: false })
  addEventListener('mouseup', end)
  addEventListener('touchend', end)
  addEventListener('touchcancel', end)

  findChat()
  draw()
  loop()
})()
