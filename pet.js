(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const idleSrc = 'https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png'
    const grabSrc = 'https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png'
    const petWidth = 120

    const stage = document.createElement('div')
    stage.id = 'pet-stage'
    Object.assign(stage.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '999999'
    })

    const pet = document.createElement('img')
    pet.src = idleSrc
    Object.assign(pet.style, {
      position: 'absolute',
      width: petWidth + 'px',
      left: '60px',
      top: '60px',
      cursor: 'grab',
      pointerEvents: 'auto',
      transition: 'transform 0.18s, opacity 0.18s'
    })
    pet.draggable = false

    stage.appendChild(pet)
    document.body.appendChild(stage)

    let drag = false
    let offsetX = 0
    let offsetY = 0
    let vx = 0
    let vy = 0
    let lastX = 0
    let lastY = 0
    let lastTime = 0

    function point(e) {
      return e.touches ? e.touches[0] : e
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v))
    }

    function start(e) {
      const p = point(e)
      const rect = pet.getBoundingClientRect()
      drag = true
      offsetX = p.clientX - rect.left
      offsetY = p.clientY - rect.top
      vx = 0
      vy = 0
      lastX = p.clientX
      lastY = p.clientY
      lastTime = performance.now()
      pet.src = grabSrc
      pet.style.cursor = 'grabbing'
      e.preventDefault()
    }

    function move(e) {
      if (!drag) return
      const p = point(e)
      const now = performance.now()
      const dt = Math.max(8, now - lastTime)

      let x = p.clientX - offsetX
      let y = p.clientY - offsetY

      x = clamp(x, 0, window.innerWidth - petWidth)
      y = clamp(y, 0, window.innerHeight - petWidth)

      pet.style.left = x + 'px'
      pet.style.top = y + 'px'

      const rawVX = ((p.clientX - lastX) / dt) * 16
      const rawVY = ((p.clientY - lastY) / dt) * 16

      vx = rawVX * 0.4875
      vy = rawVY * 0.4875

      lastX = p.clientX
      lastY = p.clientY
      lastTime = now

      e.preventDefault()
    }

    function end() {
      if (!drag) return
      drag = false
      vx *= 1.5
      vy *= 1.5
      pet.src = idleSrc
      pet.style.cursor = 'grab'
    }

    function isVisible(el) {
      if (!el) return false
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return r.width > 20 && r.height > 20 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'
    }

    function getChatRect() {
      const selectors = [
        'iframe[title*="chat" i]',
        '[aria-label*="wix chat" i]',
        '[aria-label*="chat" i]',
        '[id*="wix-chat" i]',
        '[class*="wix-chat" i]'
      ]

      let best = null
      let bestScore = -1

      for (const selector of selectors) {
        const nodes = document.querySelectorAll(selector)
        for (const el of nodes) {
          if (!isVisible(el)) continue
          const r = el.getBoundingClientRect()
          const txt = `${el.id || ''} ${el.className || ''} ${el.getAttribute('title') || ''} ${el.getAttribute('aria-label') || ''}`.toLowerCase()

          let score = 0
          if (txt.includes('wix chat')) score += 120
          if (txt.includes('chat')) score += 60
          if (el.tagName === 'IFRAME') score += 20
          if (r.right > window.innerWidth * 0.55) score += 20

          if (score > bestScore) {
            best = r
            bestScore = score
          }
        }
      }

      return bestScore >= 40 ? best : null
    }

    function overlapsChat(x, y, chat) {
      const w = petWidth
      const h = petWidth
      return (
        x < chat.right &&
        x + w > chat.left &&
        y < chat.bottom &&
        y + h > chat.top
      )
    }

    function loop() {
      if (!drag) {
        vy += 0.18
        vx *= 0.95
    
        let x = pet.offsetLeft + vx
        let y = pet.offsetTop + vy
    
        const maxX = window.innerWidth - petWidth
        const maxY = window.innerHeight - petWidth
    
        if (x < 0) {
          x = 0
          vx *= -0.15
        }
    
        if (x > maxX) {
          x = maxX
          vx *= -0.15
        }
    
        if (y < 0) {
          y = 0
          vy *= -0.2
        }
    
        if (y > maxY) {
          y = maxY
          vy *= -0.12
          vx *= 0.92
        }
    
        pet.style.left = x + 'px'
        pet.style.top = y + 'px'
    
        const chat = getChatRect()
        if (chat && overlapsChat(x, y, chat)) {
          stage.style.zIndex = '1'
          pet.style.transform = 'scale(0.93)'
        } else {
          stage.style.zIndex = '1000'
          pet.style.transform = 'scale(1)'
        }
      }
    
      requestAnimationFrame(loop)
    }

    pet.addEventListener('mousedown', start)
    pet.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('mousemove', move, { passive: false })
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', end)
    window.addEventListener('touchend', end)
    window.addEventListener('touchcancel', end)

    loop()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
