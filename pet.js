(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const stage = document.createElement('div')
    stage.id = 'pet-stage'
    Object.assign(stage.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '999999'
    })

    const pet = document.createElement('img')
    pet.src = 'https://i.imgur.com/4AiXzf8.png'
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

      vx = (e.movementX || 0) * 0.5
      vy = (e.movementY || 0) * 0.5

      e.preventDefault()
    }

    function end() {
      drag = false
      pet.style.cursor = 'grab'
    }

    function getChatRect() {
      const el = document.querySelector('[class*="chat"], iframe')
      if (!el) return null
      return el.getBoundingClientRect()
    }

    function loop() {
      if (!drag) {
        vy += 0.3 // gravedad más lenta
        vx *= 0.98 // menos movimiento brusco

        let x = pet.offsetLeft + vx
        let y = pet.offsetTop + vy

        const maxX = window.innerWidth - 120
        const maxY = window.innerHeight - 120

        if (x < 0) { x = 0; vx *= -0.4 }
        if (x > maxX) { x = maxX; vx *= -0.4 }

        if (y > maxY) {
          y = maxY
          vy *= -0.3
        }

        pet.style.left = x + 'px'
        pet.style.top = y + 'px'

        // esconderse detrás del chat
        const chat = getChatRect()
        if (chat) {
          if (
            x + 100 > chat.left &&
            y + 100 > chat.top
          ) {
            pet.style.opacity = '0.4'
            pet.style.transform = 'scale(0.9)'
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
