(function () {
  if (window.__petLoaded) return
  window.__petLoaded = true

  function boot() {
    if (document.getElementById('pet-stage')) return

    const style = document.createElement('style')
    style.textContent = `
      #pet-stage,
      #pet-stage *{
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
        width:130px;
        height:150px;
        left:40px;
        top:40px;
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
        animation:petIdle 2.4s ease-in-out infinite;
      }
      #pet-float.dragging .wrap,
      #pet-float.sliding .wrap{
        animation:none;
      }
      #pet-float .shadow{
        position:absolute;
        left:50%;
        bottom:6px;
        width:52px;
        height:12px;
        transform:translateX(-50%);
        border-radius:50%;
        background:rgba(0,0,0,.14);
        filter:blur(3px);
        animation:petShadow 2.4s ease-in-out infinite;
      }
      #pet-float.dragging .shadow,
      #pet-float.sliding .shadow{
        animation:none;
        opacity:.08;
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
      }
      #pet-float .idle-img{opacity:1}
      #pet-float .grab-img{opacity:0}
      #pet-float.dragging .idle-img,
      #pet-float.sliding .idle-img{opacity:0}
      #pet-float.dragging .grab-img,
      #pet-float.sliding .grab-img{opacity:1}
      @keyframes petIdle{
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-6px)}
      }
      @keyframes petShadow{
        0%,100%{transform:translateX(-50%) scale(1);opacity:.13}
        50%{transform:translateX(-50%) scale(.84);opacity:.07}
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
      x: 40,
      y: 0,
      w: 130,
      h: 150,
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
      hiddenBehindChat: false,
      chatRect: null,
      calmRoamAt: performance.now() + 9000,
      targetX: 40
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v))
    }

    function now() {
      return performance.now()
    }

    function point(e) {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
      if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
      return { x: e.clientX, y: e.clientY }
    }

    function ground() {
      return Math.max(0, window.innerHeight - state.h - 6)
    }

    function face() {
      if (state.facing < 0) pet.classList.add('face-left')
      else pet.classList.remove('face-left')
    }

    function applyPos() {
      pet.style.left = state.x + 'px'
      pet.style.top = state.y + 'px'
      refreshPetMask()
    }

    function setMode(mode) {
      state.mode = mode
      pet.classList.remove('dragging', 'sliding')
      if (mode === 'drag') pet.classList.add('dragging')
      if (mode === 'slide') pet.classList.add('sliding')
    }

    function isVisible(el) {
      if (!el) return false
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 20 && r.height > 20 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'
    }

    function scoreChatElement(el) {
      if (!isVisible(el)) return -1
      const r = el.getBoundingClientRect()
      const txt = `${el.id || ''} ${el.className || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.innerText || ''}`.toLowerCase()
      let score = 0
      if (txt.includes('wix chat')) score += 120
      if (txt.includes('chat')) score += 70
      if (txt.includes('message')) score += 20
      if (el.tagName === 'IFRAME') score += 20
      if (r.right > window.innerWidth * 0.55) score += 20
      if (r.bottom > window.innerHeight * 0.55) score += 20
      if (r.width >= 40 && r.width <= 520) score += 10
      if (r.height >= 40 && r.height <= 900) score += 10
      return score
    }

    function findChatElement() {
      const selectors = [
        'iframe[title*="chat" i]',
        'iframe[aria-label*="chat" i]',
        '[aria-label*="wix chat" i]',
        '[aria-label*="chat" i]',
        '[title*="wix chat" i]',
        '[title*="chat" i]',
        '[id*="chat" i]',
        '[class*="chat" i]',
        'button',
        'div',
        'iframe'
      ]

      let best = null
      let bestScore = -1

      for (const selector of selectors) {
        const list = document.querySelectorAll(selector)
        for (const el of list) {
          const score = scoreChatElement(el)
          if (score > bestScore) {
            best = el
            bestScore = score
          }
        }
      }

      return bestScore >= 40 ? best : null
    }

    function updateChatRect() {
      const el = findChatElement()
      if (!el) {
        state.chatRect = null
        return null
      }
      const r = el.getBoundingClientRect()
      if (r.width < 20 || r
