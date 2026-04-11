import wixLocation from 'wix-location'

$w.onReady(function () {
    const path = wixLocation.path.join('/').toLowerCase()

    if (
        path.includes('product-page') ||
        path.includes('productos') ||
        path.includes('product')
    ) {
        cleanupFloatingPet()
        return
    }

    setTimeout(() => {
        initFloatingPet()
    }, 300)
})

function initFloatingPet() {
    if (typeof window === 'undefined') return
    if (typeof document === 'undefined') return

    cleanupFloatingPet()

    const pet = document.createElement('img')
    pet.id = 'floating-pet'
    pet.src = 'TU_IMAGEN_1'
    pet.alt = 'pet'
    pet.draggable = false

    Object.assign(pet.style, {
        position: 'fixed',
        left: '24px',
        top: `${Math.max(24, window.innerHeight - 160)}px`,
        width: '110px',
        height: 'auto',
        zIndex: '9999',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        pointerEvents: 'auto'
    })

    document.body.appendChild(pet)

    let drag = false
    let startX = 0
    let startY = 0
    let baseX = 24
    let baseY = Math.max(24, window.innerHeight - 160)

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n))
    }

    function point(e) {
        if (e.touches && e.touches[0]) return e.touches[0]
        if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0]
        return e
    }

    function start(e) {
        const p = point(e)
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

        const p = point(e)
        const r = pet.getBoundingClientRect()

        const x = clamp(baseX + (p.clientX - startX), 0, window.innerWidth - r.width)
        const y = clamp(baseY + (p.clientY - startY), 0, window.innerHeight - r.height)

        pet.style.left = `${x}px`
        pet.style.top = `${y}px`
        e.preventDefault()
    }

    function end() {
        if (!drag) return
        drag = false
        pet.style.cursor = 'grab'
    }

    function onResize() {
        const r = pet.getBoundingClientRect()
        const maxX = Math.max(0, window.innerWidth - r.width)
        const maxY = Math.max(0, window.innerHeight - r.height)

        pet.style.left = `${clamp(r.left, 0, maxX)}px`
        pet.style.top = `${clamp(r.top, 0, maxY)}px`
    }

    pet.addEventListener('mousedown', start)
    pet.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('mousemove', move, { passive: false })
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', end)
    window.addEventListener('touchend', end)
    window.addEventListener('touchcancel', end)
    window.addEventListener('resize', onResize)

    window.__petCleanup = function () {
        pet.removeEventListener('mousedown', start)
        pet.removeEventListener('touchstart', start)
        window.removeEventListener('mousemove', move)
        window.removeEventListener('touchmove', move)
        window.removeEventListener('mouseup', end)
        window.removeEventListener('touchend', end)
        window.removeEventListener('touchcancel', end)
        window.removeEventListener('resize', onResize)

        const currentPet = document.getElementById('floating-pet')
        if (currentPet) currentPet.remove()
    }
}

function cleanupFloatingPet() {
    if (window.__petCleanup) {
        window.__petCleanup()
        window.__petCleanup = null
    }

    const oldPet = document.getElementById('floating-pet')
    if (oldPet) oldPet.remove()
}
