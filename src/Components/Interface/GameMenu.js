import gsap from "gsap"
import GameplayComponent from '../_Component';

class GameMenu extends GameplayComponent {
    constructor(gameObject) {
        super(gameObject)
        this.gm = document.querySelector("#game-menu")
        this.active = false
    }

    update() {
        const inputs = Avern.Inputs.getInputs()
        if ( inputs.characterMenu ) {
            if (!this.active) {
                this.openGameMenu()
            }
            else {
                this.closeGameMenu()
            }
        }    
    }

    openGameMenu(){
        Avern.State.worldUpdateLocked = true
        this.active = true
        gsap.set(this.gm, {opacity: 1, pointerEvents: "auto"})
    }

    closeGameMenu(){
        this.active = false
        gsap.set(this.gm, {opacity: 0, pointerEvents: "none"})
        Avern.State.worldUpdateLocked = false
    }
}

export default GameMenu