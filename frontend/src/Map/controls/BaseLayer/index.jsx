import Control from 'ol/control/Control'
import { CLASS_CONTROL } from 'ol/css.js'
import { CLASS_UNSELECTABLE } from 'ol/css.js'

export const CLASS_ACTIVE = 'active'

class BaseLayer extends Control {
    constructor(opt_options) {
        const options = opt_options || {}

        super({
            element: document.createElement('div'),
            target: options.target,
        })

        this.last_active = null
        this.initLayer = this.initLayer.bind(this)
        this.toggleLayer = this.toggleLayer.bind(this)
        this.handleClick = this.handleClick.bind(this)

        const base_layers = options.layers.map(this.initLayer)

        const cssClasses = `base_layer ${CLASS_UNSELECTABLE} ${CLASS_CONTROL}`

        const element = this.element
        element.className = cssClasses
        base_layers.forEach((l) => element.appendChild(l))

    }

    initLayer({title, layer, is_active}) {
        var img_path = ''

        const el = document.createElement('a')

        el.setAttribute('href', '#')
        el.className = 'base_layer border border-2 border-primary'  + (is_active ? ' ' + CLASS_ACTIVE : '')

        const img = document.createElement('img')
        if (title === 'Google') {
            img_path = process.env.PUBLIC_URL + '/images/google.png'
        }
        else if (title === 'Arc') {
            img_path = process.env.PUBLIC_URL + '/images/arc.png'
        }
        else {
            img_path = process.env.PUBLIC_URL + '/images/openstreetmap.png'
        }

        img.src = img_path
        img.sizes = "(max-width: 80px)"
        el.appendChild(img)

        el.addEventListener('click', (event) => {
            event.preventDefault()
            this.handleClick(el, layer)
        })

        this.toggleLayer(is_active === true, el, layer)

        return el

    }

    toggleLayer(is_active, el, layer) {

        if (this.last_active && is_active) {
            this.last_active.layer.setVisible(false)
            this.last_active.el.classList.toggle(CLASS_ACTIVE, false)
        }

        layer.setVisible(is_active)
        el.classList.toggle(CLASS_ACTIVE, is_active)

        if (is_active)
            this.last_active = {el, layer}
    }

    handleClick(el, layer) {
        if (this.last_active && this.last_active.el === el)
            return

        this.toggleLayer(true, el, layer)
    }
}

export default BaseLayer