$w.onReady(function () {
    initFloatingPet()
})

function initFloatingPet() {
    if (typeof window === 'undefined') return
    if (window.__petLoaded) return
    window.__petLoaded = true

    const pet = document.createElement('img')
    pet.id = 'floating-pet'
    pet.src = 'TU_IMAGEN_1'
    pet.draggable = false

    Object.assign(pet.style, {
        position: 'fixed',
        left: '24px',
        bottom: '24px',
        width: '110px',
        zIndex: '9999',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
    })

    document.body.appendChild(pet)

    let drag = false
    let startX = 0
    let startY = 0
    let baseX = 24
    let baseY = window.innerHeight - 150

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n))
    }

    function getPoint(e) {
        return e.touches?.[0] || e
    }

    pet.addEventListener('mousedown', start)
    pet.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('mousemove', move, { passive: false })
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', end)
    window.addEventListener('touchend', end)

    function start(e) {
        const p = getPoint(e)
        const r = pet.getBoundingClientRect()

        drag = true
        startX = p.clientX
        startY = p.clientY
        baseX = r.left
        baseY = r.top
        pet.style.cursor = 'grabbing'

        e.preventDefault()
    }

    function move(e) {
        if (!drag) return

        const p = getPoint(e)
        const r = pet.getBoundingClientRect()

        const x = clamp(baseX + (p.clientX - startX), 0, window.innerWidth - r.width)
        const y = clamp(baseY + (p.clientY - startY), 0, window.innerHeight - r.height)

        pet.style.left = x + 'px'
        pet.style.top = y + 'px'
        pet.style.bottom = 'auto'

        e.preventDefault()
    }

    function end() {
        drag = false
        pet.style.cursor = 'grab'
    }
}
