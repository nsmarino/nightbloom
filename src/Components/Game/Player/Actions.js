import GameplayComponent from '../../_Component';
import Enemy from "../NonPlayer/Enemy"
import Body from "./Body"
import ActionBar from "../../Interface/ActionBar"

// CONTENT FOR PROTOTYPING:
const actionData = {
    name: "Caretaker's Device",
    icon: "/assets/ui/icon1.png",
    governingAttr: "Vow",
    id: "e-1",
    actions: {
        action1: {
            intent: "harm",
            target: true, // requires target
            direction: true, // target needs to be in front of player
            name: "Nuzzle with flame",
            description: "A slow tongue of flame unfurls from the device and ensnares the target.",
            castTime: 1,
            cooldown: 2,
            range: 40,
            animation: "red", // dummy anim state
            rank: 0,
            locked: false,
            powerMin: 20,
            powerMax: 30,
            cost: 10,
            icon: "/assets/ui/icon2.png",
        },
        action2: {
            intent: "harm",
            target: true, // requires target
            direction: true, // target needs to be in front of player
            name: "Boil alive",
            description: "A terrifying inferno pours from the device, liquifying flesh.",
            castTime: 2,
            cooldown: 2,
            range: 40,
            animation: "red", // dummy anim state
            rank: 1,
            locked: false,
            powerMin: 40,
            powerMax: 45,
            cost: 20,
            icon: "/assets/ui/icon3.png",
        },
        action3: {
            intent: "fortify",
            target: false, // requires target
            direction: true, // target needs to be in front of player
            name: "Bathe",
            description: "Healing steam. The Ward feels soothed and rejuvenated.",
            castTime: 2,
            cooldown: 2,
            range: 0,
            animation: "blue", // dummy anim state
            rank: 1,
            locked: true,
            powerMin: 40,
            powerMax: 45,
            cost: 20,
            icon: "/assets/ui/icon1.png",
        },
        action4: {
            intent: "harm",
            target: true, // requires target
            direction: "front", // target needs to be in front of player
            name: "Spurt of vitriol",
            description: "An acidic sputter of half-kindled flame.",
            castTime: 0,
            cooldown: 4,
            range: 30,
            animation: "red", // dummy anim state
            rank: 1,
            locked: true,
            powerMin: 40,
            powerMax: 45,
            cost: 40,
            icon: "/assets/ui/icon4.png",
        },
    }
}

class Actions extends GameplayComponent {
    constructor(gameObject) {
        super(gameObject)

        this.casting = false
        this.castingProgress = 0
        this.castingThreshold = 2
    }

    handleInputs() {
        const inputs = Avern.Inputs.getInputs()
        
        if (inputs.forward || inputs.back) return;

        if ( inputs.action1 ) {
            this.handleAction(actionData.actions["action1"])
        }
        if ( inputs.action2 ) {
            this.handleAction(actionData.actions["action2"])
        }
        if ( inputs.action3 ) {
            this.handleAction(actionData.actions["action3"])
        }
        if ( inputs.action4 ) {
            this.handleAction(actionData.actions["action4"])
        }
    }

    handleAction(action) {
        if (action.locked) return;

        if (this.casting) {
            this.interruptCast()
        } else {
            this.startCast()
        }

    }

    startCast() {
        this.casting = true
        this.emitSignal("casting_start")
        Avern.Sound.reloadHandler.currentTime = 0
        Avern.Sound.reloadHandler.play()

    }

    interruptCast() {
        this.casting = false
        this.castingProgress = 0
        this.emitSignal("casting_interrupt")
    }
    reduceCast(percentage) {
        this.castingProgress = this.castingProgress * percentage
        this.emitSignal("casting_reduce", { 
            progress: this.castingProgress, 
            threshold: this.castingThreshold 
        })
    }

    progressCast(delta) {
        this.castingProgress += delta
        this.emitSignal("casting_progress", { 
            progress: this.castingProgress, 
            threshold: this.castingThreshold 
        })
    }

    finishCast() {
        this.casting = false
        this.castingProgress = 0
        this.emitSignal("casting_finish")
        Avern.Sound.reloadHandler.pause()
        Avern.Sound.gunshotHandler.currentTime = 0
        Avern.Sound.gunshotHandler.play()
    }

    update = (delta) => {
        if (!Avern.State.worldUpdateLocked) {
            this.handleInputs()
        }

        if (this.casting === true) {
            if (this.castingProgress < this.castingThreshold) {
            this.progressCast(delta)
            } else {
                this.finishCast()
            }
        }
    }

    onSignal(signalName, data) {
        switch(signalName) {
          case "walk_start":
            this.interruptCast()
            break;
          case "monster_casting_finish":
            this.reduceCast(data.percentage)
            break;
        }
    }
    attachObservers(parent) {
        this.addObserver(Avern.Interface.getComponent(ActionBar))
        this.addObserver(parent.getComponent(Body))
        for (const enemy of Avern.State.Enemies) {
            this.addObserver(enemy.getComponent(Enemy))
        }
    }
}

export default Actions