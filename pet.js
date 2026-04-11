(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const idleSrc = 'https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png'
    const grabSrc = 'https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png'

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
      width: '120px',
      left: '60px',
      top: '60px',
      cursor: 'grab',
      pointerEvents: 'auto',
      transition: 'transform 0.2s'
    })
    pet.draggable = false

    stage.appendChild(pet)
    document.body.appendChild(stage)

    let drag = false
    let offsetX = 0
    let offsetY = 0
    let vx = 0
    let vy = 0

    function start(e) {
      const p = e.touches ? e.touches[0] : e
      drag = true
      const rect = pet.getBoundingClientRect()
      offsetX = p.clientX - rect.left
      offsetY = p.clientY - rect.top
      vx = 0
      vy = 0
      pet.src = grabSrc
      pet.style.cursor = 'grabbing'
      e.preventDefault()
    }

    function move(e) {
      if (!drag) return
      const p = e.touches ? e.touches[0] : e

      const x = p.clientX - offsetX
      const y = p.clientY - offsetY

      pet.style.left = x + 'px'
      pet.style.top = y + 'px'

      vx = (e.movementX || 0) * 0.25
      vy = (e.movementY || 0) * 0.25

      e.preventDefault()
    }

    function end() {
      drag = false
      pet.src = idleSrc
      pet.style.cursor = 'grab'
    }

    function getChatRect() {
      const candidates = [...document.querySelectorAll('iframe, [class*="chat"], [id*="chat"]')]
      let best = null
      let bestArea = 0

      for (const el of candidates) {
        const r = el.getBoundingClientRect()
        const area = r.width * r.height
        if (r.width > 40 && r.height > 40 && area > bestArea) {
          best = r
          bestArea = area
        }
      }

      return best
    }

    function loop() {
      if (!drag) {
        vy += 0.15
        vx *= 0.99

        let x = pet.offsetLeft + vx
        let y = pet.offsetTop + vy

        const maxX = window.innerWidth - 120
        const maxY = window.innerHeight - 120

        if (x < 0) {
          x = 0
          vx *= -0.2
        }

        if (x > maxX) {
          x = maxX
          vx *= -0.2
        }

        if (y > maxY) {
          y = maxY
          vy *= -0.15
        }

        pet.style.left = x + 'px'
        pet.style.top = y + 'px'

        const chat = getChatRect()
        if (chat) {
          if (x + 100 > chat.left && y + 100 > chat.top) {
            pet.style.opacity = '0.5'
            pet.style.transform = 'scale(0.92)'
          } else {
            pet.style.opacity = '1'
            pet.style.transform = 'scale(1)'
          }
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

    loop()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
