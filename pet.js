(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const config = {
      width: 173,
      zIndex: 999999,
      gravity: 0.19,
      frictionX: 0.975,
      bounceX: -0.24,
      bounceTop: -0.22,
      bounceBottom: -0.18,
      throwBoost: 1.4,
      movingThreshold: 2.2,
      idleJumpIntervalMin: 900,
      idleJumpIntervalMax: 1600,
      idleJumpForceY: -7.2,
      idleJumpForceX: 3.2,
      states: {
        idle: 'https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png',
        grab: 'https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png',
        talk: 'https://static.wixstatic.com/media/459a71_857af6dc0e394fcfb4aa1279536e2a69~mv2.png'
      }
    }

    const stage = document.createElement('div')
    stage.id = 'pet-stage'
    Object.assign(stage.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: String(config.zIndex)
    })

    const pet = document.createElement('img')
    pet.id = 'pet-character'
    pet.src = config.states.idle
    Object.assign(pet.style, {
      position: 'absolute',
      width: config.width + 'px',
      left: '60px',
      top: '60px',
      cursor: 'grab',
      pointerEvents: 'auto',
      transition: 'opacity 0.18s'
    })
    pet.draggable = false

    const bubble = document.createElement('div')
    bubble.id = 'pet-bubble'
    bubble.innerText = ''
    Object.assign(bubble.style, {
      position: 'absolute',
      maxWidth: '640px',
      minWidth: '320px',
      padding: '18px 22px',
      background: 'linear-gradient(135deg,#6a00ff,#9d4edd)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.45',
      borderRadius: '16px',
      boxShadow: '0 10px 24px rgba(0,0,0,0.28)',
      pointerEvents: 'none',
      opacity: '0',
      transform: 'translateY(8px)',
      transition: 'opacity 0.2s, transform 0.2s',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'break-word'
    })

    const tail = document.createElement('div')
    tail.id = 'pet-bubble-tail'
    Object.assign(tail.style, {
      position: 'absolute',
      width: '22px',
      height: '22px',
      background: '#7f21ff',
      transform: 'rotate(45deg)',
      opacity: '0',
      transition: 'opacity 0.2s'
    })

    stage.appendChild(pet)
    stage.appendChild(bubble)
    stage.appendChild(tail)
    document.body.appendChild(stage)

    let drag = false
    let offsetX = 0
    let offsetY = 0
    let vx = 0
    let vy = 0
    let lastX = 0
    let lastY = 0
    let lastTime = 0
    let forcedState = null
    let forcedUntil = 0
    let bubbleTimeout = null
    let idleDirection = 1
    let nextIdleJumpAt = performance.now() + 1200

    function point(e) {
      return e.touches ? e.touches[0] : e
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v))
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min
    }

    function scheduleNextIdleJump(now) {
      nextIdleJumpAt = now + rand(config.idleJumpIntervalMin, config.idleJumpIntervalMax)
    }

    function setState(name) {
      const src = config.states[name]
      if (!src) return
      if (pet.dataset.state === name) return
      pet.dataset.state = name
      pet.src = src
    }

    function forceState(name, duration) {
      forcedState = name
      forcedUntil = performance.now() + duration
      setState(name)
    }

    function clearForcedState() {
      forcedState = null
      forcedUntil = 0
    }

    function hideBubble() {
      bubble.style.opacity = '0'
      bubble.style.transform = 'translateY(8px)'
      tail.style.opacity = '0'
    }

    function showBubble(text, duration = 2000) {
      bubble.innerText = text
      bubble.style.opacity = '1'
      bubble.style.transform = 'translateY(0)'
      tail.style.opacity = '1'

      if (bubbleTimeout) clearTimeout(bubbleTimeout)
      bubbleTimeout = setTimeout(() => {
        hideBubble()
      }, duration)
    }

    function updateBubblePosition() {
      const x = pet.offsetLeft
      const y = pet.offsetTop
      const bubbleWidth = bubble.offsetWidth || 640
      const bubbleHeight = bubble.offsetHeight || 120
      const margin = 16
    
      const mouthX = x + config.width * 0.78
      const mouthY = y + config.width * 0.42
    
      let left = mouthX + margin
      let top = mouthY - bubbleHeight + 18
      let tailLeft = mouthX + 2
      let tailTop = mouthY + 2
    
      if (left + bubbleWidth > window.innerWidth - 12) {
        left = x - bubbleWidth - margin
        tailLeft = left + bubbleWidth - 10
      }
    
      if (left < 12) left = 12
      if (top < 12) top = 12
    
      bubble.style.left = left + 'px'
      bubble.style.top = top + 'px'
      tail.style.left = tailLeft + 'px'
      tail.style.top = tailTop + 'px'
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
      clearForcedState()
      setState('grab')
      pet.style.cursor = 'grabbing'
      pet.style.transform = 'translate3d(0,0,0) scale(1)'
      e.preventDefault()
    }

    function move(e) {
      if (!drag) return
      const p = point(e)
      const now = performance.now()
      const dt = Math.max(8, now - lastTime)

      let x = p.clientX - offsetX
      let y = p.clientY - offsetY

      x = clamp(x, 0, window.innerWidth - config.width)
      y = clamp(y, 0, window.innerHeight - config.width)

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
      vx *= config.throwBoost
      vy *= config.throwBoost
      pet.style.cursor = 'grab'
      scheduleNextIdleJump(performance.now())
    }

    function maybeDoIdleJump(now) {
      if (drag) return
      if (forcedState === 'talk') return

      const speed = Math.abs(vx) + Math.abs(vy)
      const onGround = pet.offsetTop >= window.innerHeight - config.width - 1

      if (!onGround) return
      if (speed > 0.35) return
      if (now < nextIdleJumpAt) return

      const x = pet.offsetLeft
      const maxX = window.innerWidth - config.width

      if (x <= 8) idleDirection = 1
      if (x >= maxX - 8) idleDirection = -1

      if (Math.random() < 0.18) idleDirection *= -1

      vx = idleDirection * rand(config.idleJumpForceX * 0.75, config.idleJumpForceX * 1.2)
      vy = config.idleJumpForceY * rand(0.92, 1.08)

      scheduleNextIdleJump(now)
    }

    function loop() {
      const now = performance.now()

      if (!drag) {
        maybeDoIdleJump(now)

        vy += config.gravity
        vx *= config.frictionX

        let x = pet.offsetLeft + vx
        let y = pet.offsetTop + vy

        const maxX = window.innerWidth - config.width
        const maxY = window.innerHeight - config.width

        if (x < 0) {
          x = 0
          vx *= config.bounceX
          idleDirection = 1
        }

        if (x > maxX) {
          x = maxX
          vx *= config.bounceX
          idleDirection = -1
        }

        if (y < 0) {
          y = 0
          vy *= config.bounceTop
        }

        if (y > maxY) {
          y = maxY
          vy *= config.bounceBottom
        }

        pet.style.left = x + 'px'
        pet.style.top = y + 'px'

        const speed = Math.abs(vx) + Math.abs(vy)

        if (forcedState && now < forcedUntil) {
          setState(forcedState)
        } else {
          clearForcedState()
          if (speed > config.movingThreshold) {
            setState('grab')
          } else {
            setState('idle')
          }
        }

        pet.style.transform = 'translate3d(0,0,0) scale(1)'
        stage.style.zIndex = String(config.zIndex)
      } else {
        setState('grab')
        pet.style.transform = 'translate3d(0,0,0) scale(1)'
      }

      updateBubblePosition()
      requestAnimationFrame(loop)
    }

    pet.addEventListener('mousedown', start)
    pet.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('mousemove', move, { passive: false })
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', end)
    window.addEventListener('touchend', end)
    window.addEventListener('touchcancel', end)

    window.medusaPet = {
      talk(text = 'Hola', duration = 2000) {
        showBubble(text, duration)
        forceState('talk', duration)
      },
      say(text = 'Hola', duration = 2000) {
        showBubble(text, duration)
        forceState('talk', duration)
      },
      idle() {
        clearForcedState()
        setState('idle')
        hideBubble()
      },
      setState(name, duration = 0) {
        if (!config.states[name]) return
        if (duration > 0) {
          forceState(name, duration)
        } else {
          clearForcedState()
          setState(name)
        }
      },
      setImages(states = {}) {
        config.states = {
          ...config.states,
          ...states
        }
        if (pet.dataset.state && config.states[pet.dataset.state]) {
          pet.src = config.states[pet.dataset.state]
        }
      },
      hideBubble() {
        hideBubble()
      },
      showBubble(text = 'Hola', duration = 2000) {
        showBubble(text, duration)
      },
      getState() {
        return pet.dataset.state || 'idle'
      }
    }

    window.addEventListener('message', (event) => {
      const data = event.data || {}

      if (data.type === 'medusa-say') {
        showBubble(data.text || 'Hola', data.duration || 2000)
        forceState('talk', data.duration || 2000)
      }

      if (data.type === 'medusa-state') {
        if ((data.duration || 0) > 0) {
          forceState(data.state || 'idle', data.duration || 0)
        } else {
          clearForcedState()
          setState(data.state || 'idle')
        }
      }

      if (data.type === 'medusa-hide') {
        hideBubble()
        clearForcedState()
        setState('idle')
      }
    })

    loop()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
