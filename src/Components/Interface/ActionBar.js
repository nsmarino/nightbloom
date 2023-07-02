import * as THREE from 'three';
import gsap from "gsap"

import GameplayComponent from '../_Component';

class ActionBar extends GameplayComponent {
    constructor(gameObject, ) {
        super(gameObject)
        this.bar = document.querySelector("#casting-bar")
    }

    onSignal(signalName, data) {
      switch(signalName) {
        case "casting_start":
          console.log("Show casting bar", )
          gsap.set(this.bar, { opacity: 1 })
          break;

        case "casting_progress":
          document.documentElement.style.setProperty("--player-casting-width", `${(data.progress / data.threshold) * 100 }%`);
          break;

        case "casting_interrupt":
          gsap.set(this.bar, { opacity: 0 })
          break;

        case "casting_reduce":
          console.log("Reduce bar")
          document.documentElement.style.setProperty("--player-casting-width", `${(data.progress / data.threshold) * 100 }%`);
          break;

        case "casting_finish":
          gsap.set(this.bar, { opacity: 0 })
          break;
      }
    }
}

export default ActionBar