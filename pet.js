(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const stage = document.createElement('div')
    stage.id = 'pet-stage'
    stage.style.position = 'fixed'
    stage.style.inset = '0'
    stage.style.pointerEvents = 'none'
    stage.style.zIndex = '999999'

    const pet = document.createElement('img')
    pet.src = 'https://i.imgur.com/4AiXzf8.png'
    pet.style.position = 'absolute'
    pet.style.width = '120px'
    pet.style.left = '50px'
    pet.style.top = '50px'
    pet.style.cursor = 'grab'
    pet.style.pointerEvents = 'auto'
    pet.draggable = false

    stage.appendChild(pet)
    document.body.appendChild(stage)

    let drag = false
    let offsetX = 0
    let offsetY = 0

    function start(e) {
      const p = e.touches ? e.touches[0] : e
      drag = true
      const rect = pet.getBoundingClientRect()
      offsetX = p.clientX - rect.left
      offsetY = p.clientY - rect.top
      pet.style.cursor = 'grabbing'
      e.preventDefault()
    }

    function move(e) {
      if (!drag) return
      const p = e.touches ? e.touches[0] : e

      let x = p.clientX - offsetX
      let y = p.clientY - offsetY

      x = Math.max(0, Math.min(window.innerWidth - 120, x))
      y = Math.max(0, Math.min(window.innerHeight - 120, y))

      pet.style.left = x + 'px'
      pet.style.top = y + 'px'

      e.preventDefault()
    }

    function end() {
      drag = false
      pet.style.cursor = 'grab'
    }

    pet.addEventListener('mousedown', start)
    pet.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('mousemove', move, { passive: false })
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', end)
    window.addEventListener('touchend', end)

    function floatLoop() {
      const rect = pet.getBoundingClientRect()
      const baseY = parseFloat(pet.style.top)
      pet.style.top = baseY + Math.sin(Date.now() * 0.003) * 0.5 + 'px'
      requestAnimationFrame(floatLoop)
    }

    floatLoop()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
