window.initFloatingPet = function() {
  if (window.__petLoaded) return
  window.__petLoaded = true

  const w = 150, h = 170

  document.head.insertAdjacentHTML('beforeend', `
    <style>
    </style>
  `)

  document.body.insertAdjacentHTML('beforeend', `
    <div id="pet-stage">
      <div id="pet">
        <div class="shadow"></div>
        <div class="wrap">
          <img class="idle" src="TU_IMAGEN_1">
          <img class="grab" src="TU_IMAGEN_2">
        </div>
      </div>
    </div>
  `)

  const pet = document.getElementById('pet')
  const s = { x: 90, y: innerHeight - h, vx: 0, vy: 0, drag: 0, ox: 0, oy: 0, px: 0, py: 0, pt: 0, typing: 0, chat: null }
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
  const time = () => performance.now()
  const ground = () => innerHeight - h
  const point = e => e.touches?.[0] || e.changedTouches?.[0] || e

  function draw() {
    pet.style.left = s.x + 'px'
    pet.style.top = s.y + 'px'
    pet.classList.toggle('left', s.vx < 0)
    clip()
  }

  function mode(name) {
    pet.classList.toggle('drag', name === 'drag')
    pet.classList.toggle('move', name === 'move')
    pet.classList.toggle('hide', name === 'hide')
  }

  function findChat() {
    let best = null, score = 0
    for (const el of document.querySelectorAll('iframe,[id*="chat" i],[class*="chat" i],[aria-label*="chat" i],[title*="chat" i],aside,section,div')) {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      if (r.width < 40 || r.height < 40 || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
      const txt = `${el.id || ''} ${el.className || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`.toLowerCase()
      let n = 0
      if (txt.includes('chat')) n += 80
      if (txt.includes('message')) n += 30
      if (el.tagName === 'IFRAME') n += 20
      if (r.width > 220) n += 20
      if (r.height > 220) n += 20
      if (r.right > innerWidth * 0.55) n += 15
      if (r.bottom > innerHeight * 0.45) n += 15
      if (n > score) score = n, best = r
    }
    s.chat = score >= 50 ? best : null
  }

  function clip() {
    if (!s.chat || !pet.classList.contains('hide')) {
      pet.style.clipPath = 'none'
      pet.style.webkitClipPath = 'none'
      return
    }

    const r = s.chat
    let v = 'none'

    if (r.left > innerWidth * 0.5) {
      const overlap = s.x + w - r.left
      if (overlap > 0) {
        const hide = clamp(overlap / w * 100, 0, 92)
        v = `polygon(0% 0%, ${100 - hide}% 0%, ${100 - hide}% 100%, 0% 100%)`
      }
    } else {
      const overlap = r.right - s.x
      if (overlap > 0) {
        const hide = clamp(overlap / w * 100, 0, 92)
        v = `polygon(${hide}% 0%, 100% 0%, 100% 100%, ${hide}% 100%)`
      }
    }

    pet.style.clipPath = v
    pet.style.webkitClipPath = v
  }

  function start(e) {
    e.preventDefault()
    const m = point(e)
    const r = pet.getBoundingClientRect()
    s.drag = 1
    s.ox = m.clientX - r.left
    s.oy = m.clientY - r.top
    s.px = m.clientX
    s.py = m.clientY
    s.pt = time()
    s.vx = 0
    s.vy = 0
    mode('drag')
  }

  function move(e) {
    if (!s.drag) return
    e.preventDefault()
    const m = point(e)
    const nt = time()
    const dt = Math.max(8, nt - s.pt)
    s.vx = clamp((m.clientX - s.px) / dt * 16, -28, 28)
    s.vy = clamp((m.clientY - s.py) / dt * 16, -28, 28)
    s.px = m.clientX
    s.py = m.clientY
    s.pt = nt
    s.x = clamp(m.clientX - s.ox, 0, innerWidth - w)
    s.y = clamp(m.clientY - s.oy, 0, innerHeight - h)
    draw()
  }

  function end() {
    if (!s.drag) return
    s.drag = 0
    mode('move')
  }

  function physics() {
    s.vy += 0.9
    s.vx *= 0.992
    s.vy *= 0.996
    s.x += s.vx
    s.y += s.vy

    if (s.x <= 0 || s.x >= innerWidth - w) {
      s.x = clamp(s.x, 0, innerWidth - w)
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
      mode('')
    }
  }

  function hide() {
    if (!s.chat) return mode('')
    const r = s.chat
    const x = r.left > innerWidth * 0.5
      ? clamp(r.left - w * 0.35, 0, innerWidth - w)
      : clamp(r.right - w * 0.65, 0, innerWidth - w)
    const y = clamp(r.bottom - h - 6, 0, ground())

    s.x += clamp((x - s.x) * 0.22, -22, 22)
    s.y += clamp((y - s.y) * 0.22, -12, 12)
    s.x = clamp(s.x, 0, innerWidth - w)
    s.y = clamp(s.y, 0, ground())

    if (time() >= s.typing) mode('')
  }

  function trackTyping() {
    const a = document.activeElement
    if (a && a.matches('textarea,input[type="text"],[contenteditable="true"],[role="textbox"]')) {
      s.typing = time() + 1200
    }
  }

  function loop() {
    if (!s.drag) {
      if (time() < s.typing && s.chat) mode('hide')
      if (pet.classList.contains('move')) physics()
      else if (pet.classList.contains('hide')) hide()
      else s.y = ground()
    }
    draw()
    requestAnimationFrame(loop)
  }

  addEventListener('resize', () => {
    s.x = clamp(s.x, 0, innerWidth - w)
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
}
