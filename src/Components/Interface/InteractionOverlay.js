import * as THREE from 'three';
import gsap from "gsap"

import GameplayComponent from '../_Component';

// Handles display of interaction content
class InteractionOverlay extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
        this.promptEl = document.querySelector(".prompt")
        this.ui = document.querySelector("#narrative-controller")
        this.textContainer = document.querySelector("#narrative-controller .text-container")
    }

    onSignal(signalName, data={}) {
        switch(signalName) {
          case "player_look":
            this.promptEl.innerText = data.prompt
            const span = document.createElement("span")
            span.innerText = `[${Avern.Inputs.config.interact.name}]`
            this.promptEl.appendChild(span)
            gsap.set(this.promptEl, { opacity: 1, pointerEvents: "auto"})
            break;

          case "player_interaction":
            if (data.first) {
              gsap.set(this.promptEl, { opacity: 0, pointerEvents: "none"})
              Avern.State.worldUpdateLocked = true
              gsap.to(this.ui, {autoAlpha: 1, pointerEvents: "auto"})
            }
            this.textContainer.innerHTML = ''
            const textWrapper = document.createElement("p")
            gsap.set(this.textContainer, { opacity: 0})
            textWrapper.innerHTML = data.text
            this.textContainer.appendChild(textWrapper)
            gsap.to(this.textContainer, {opacity: 1})
            break;

          case "clear_prompt":
            gsap.set(this.promptEl, { opacity: 0, pointerEvents: "none"})
            break;

          case "end_interaction":
            gsap.to(this.ui, {autoAlpha: 0, pointerEvents: "none"})
            Avern.State.worldUpdateLocked = false
            break;
        }
    }
    
    attachObservers(parent) {

    }
}

export default InteractionOverlay