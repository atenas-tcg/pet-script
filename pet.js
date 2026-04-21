(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const config = {
      width: 120,
      zIndex: 999999,
      gravity: 0.19,
      frictionX: 0.975,
      bounceX: -0.24,
      bounceTop: -0.22,
      bounceBottom: -0.18,
      throwBoost: 1.4,
      movingThreshold: 2.2,
      states: {
        idle: 'https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png',
        grab: 'https://static.wixstatic.com/media/459a71_7a648ae60bc14222b55c0616e24c9044~mv2.png',
        talk: 'https://static.wixstatic.com/media/459a71_a633483b6b4c4f5fbc1d70c9e84b11eb~mv2.png'
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
      transition: 'transform 0.18s, opacity 0.18s'
    })
    pet.draggable = false

    const bubble = document.createElement('div')
    bubble.id = 'pet-bubble'
    bubble.innerText = ''
    Object.assign(bubble.style, {
      position: 'absolute',
      maxWidth: '180px',
      padding: '10px 12px',
      background: 'linear-gradient(135deg,#6a00ff,#9d4edd)',
      color: '#fff',
      fontSize: '13px',
      lineHeight: '1.35',
      borderRadius: '12px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      pointerEvents: 'none',
      opacity: '0',
      transform: 'translateY(6px)',
      transition: 'opacity 0.2s, transform 0.2s',
      whiteSpace: 'normal'
    })

    stage.appendChild(pet)
    stage.appendChild(bubble)
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

    function point(e) {
      return e.touches ? e.touches[0] : e
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v))
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
      bubble.style.transform = 'translateY(6px)'
    }

    function showBubble(text, duration = 2000) {
      bubble.innerText = text
      bubble.style.opacity = '1'
      bubble.style.transform = 'translateY(0)'

      if (bubbleTimeout) clearTimeout(bubbleTimeout)
      bubbleTimeout = setTimeout(() => {
        hideBubble()
      }, duration)
    }

    function updateBubblePosition() {
      const x = pet.offsetLeft
      const y = pet.offsetTop
      const bubbleWidth = bubble.offsetWidth || 180
      const margin = 10

      let left = x + config.width + margin
      let top = y - 10

      if (left + bubbleWidth > window.innerWidth - 10) {
        left = x - bubbleWidth - margin
      }

      if (left < 10) {
        left = 10
      }

      if (top < 10) {
        top = 10
      }

      bubble.style.left = left + 'px'
      bubble.style.top = top + 'px'
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
    }

    function loop() {
      const now = performance.now()

      if (!drag) {
        vy += config.gravity
        vx *= config.frictionX

        let x = pet.offsetLeft + vx
        let y = pet.offsetTop + vy

        const maxX = window.innerWidth - config.width
        const maxY = window.innerHeight - config.width

        if (x < 0) {
          x = 0
          vx *= config.bounceX
        }

        if (x > maxX) {
          x = maxX
          vx *= config.bounceX
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

        const chat = getChatRect()
        if (chat && overlapsChat(x, y, chat)) {
          stage.style.zIndex = '1'
          pet.style.transform = 'scale(0.93)'
        } else {
          stage.style.zIndex = '1000'
          pet.style.transform = 'scale(1)'
        }
      } else {
        setState('grab')
      }

      updateBubblePosition()
      requestAnimationFrame(loop)
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
      const w = config.width
      const h = config.width
      return (
        x < chat.right &&
        x + w > chat.left &&
        y < chat.bottom &&
        y + h > chat.top
      )
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

    document.addEventListener('medusa:say', (event) => {
      const detail = event.detail || {}
      const text = detail.text || 'Hola'
      const duration = detail.duration || 2000
      showBubble(text, duration)
      forceState('talk', duration)
    })

    document.addEventListener('medusa:state', (event) => {
      const detail = event.detail || {}
      const state = detail.state || 'idle'
      const duration = detail.duration || 0

      if (duration > 0) {
        forceState(state, duration)
      } else {
        clearForcedState()
        setState(state)
      }
    })

    document.addEventListener('medusa:hide', () => {
      hideBubble()
      clearForcedState()
      setState('idle')
    })

    let lastCommandId = ''

    function readCommand() {
      try {
        const raw = localStorage.getItem('medusaCommand')
        if (!raw) return

        const command = JSON.parse(raw)
        if (!command || !command.id) return
        if (command.id === lastCommandId) return

        lastCommandId = command.id

        if (command.type === 'say') {
          showBubble(command.text || 'Hola', command.duration || 2000)
          forceState('talk', command.duration || 2000)
        }

        if (command.type === 'state') {
          if ((command.duration || 0) > 0) {
            forceState(command.state || 'idle', command.duration || 0)
          } else {
            clearForcedState()
            setState(command.state || 'idle')
          }
        }

        if (command.type === 'hide') {
          hideBubble()
          clearForcedState()
          setState('idle')
        }
      } catch (error) {
        console.log('medusa command error', error)
      }
    }

    setInterval(readCommand, 250)
    loop()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
