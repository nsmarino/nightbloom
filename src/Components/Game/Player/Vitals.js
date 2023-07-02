import * as THREE from 'three';
import gsap from "gsap"
import GameplayComponent from '../../_Component';
import Enemy from '../NonPlayer/Enemy';
import Body from './Body';

class Vitals extends GameplayComponent {
    constructor(gameObject, entity) {
        super(gameObject)
        this.gameObject = gameObject
        this.hp = 100
    }
    
    update(delta) {
      if (!Avern.State.worldUpdateLocked) {
        const inputs = Avern.Inputs.getInputs()
        if (inputs.reset) {
          this.emitSignal("player_death")
          this.hp = 100
          document.documentElement.style.setProperty("--player-vitality-width", `${this.hp}%`);
        }
    }
    }
    onSignal(signalName, data) {
      switch(signalName) {
        case "casting_start":
          // console.log("Received casting_start from enemy", )
          break;
        case "casting_progress":
          // console.log("Received casting_progress from enemy", )
          break;
        case "casting_interrupt":
          // console.log("Received casting_interrupt from enemy", )
          break;
        case "monster_casting_finish":
          this.hp -= 20
          document.documentElement.style.setProperty("--player-vitality-width", `${this.hp}%`);
          if (this.hp <= 0) {
              this.emitSignal("player_death")
              this.hp = 100
              document.documentElement.style.setProperty("--player-vitality-width", `${this.hp}%`);
          }
          break;
      }
    }

    attachObservers(parent) {
      this.addObserver(parent.getComponent(Body))
      for (const enemy of Avern.State.Enemies) {
          this.addObserver(enemy.getComponent(Enemy))
      }
    }
}

export default Vitals