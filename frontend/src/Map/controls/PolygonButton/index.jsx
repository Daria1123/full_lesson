import Control from 'ol/control/Control'

export class PolygonBarButton extends Control {

    constructor(opt_options) {

        const options = opt_options || {}
        super({
            element: document.getElementById('draw-box'),
            target: options.target,
        })

        const child_element = document.createElement('div')
        const cssClasses = 'polygon-bar'
        const element = this.element
        child_element.className = cssClasses
        const elementa = document.createElement('a')
        elementa.setAttribute('data-toggle', 'tooltip')
        elementa.setAttribute('data-placement', 'right')
        elementa.setAttribute('title', 'Талбай зурах')
        elementa.setAttribute('href', '#')
        child_element.setAttribute('id', 'polygon-bar-id')

        const elementi = document.createElement('i')
        elementi.setAttribute('aria-hidden', 'true')
        elementi.className = 'far fa-cube text-white text-center'
        elementa.appendChild(elementi)

        child_element.addEventListener('click', (event) => {
            event.preventDefault()
            options.PolygonButton()
        })

        child_element.appendChild(elementa)
        element.appendChild(child_element)

    }
}