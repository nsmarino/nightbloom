import exploration from '../../assets/audio/exploration2.mp3'
import testRun from '../../assets/audio/test-run.mp3'
import gunshot from '../../assets/audio/pistol.mp3'
import loadingsound from '../../assets/audio/reload-sound.mp3'

class Sound {
    constructor() {
        this.musicHandler = document.createElement("audio")
        this.musicHandler.src = exploration
        this.musicHandler.loop = true
        this.musicHandler.volume = 0.1
        
        this.fxHandler = document.createElement("audio") // button fx for main menu
        this.fxHandler.id = "fx"
        this.fxHandler.src = testRun
        this.fxHandler.loop = true

        this.reloadHandler = document.createElement("audio") // button fx for main menu
        this.reloadHandler.id = "gun-load-fx"
        this.reloadHandler.src = loadingsound
        this.reloadHandler.volume = 0.1

        this.gunshotHandler = document.createElement("audio") // button fx for main menu
        this.gunshotHandler.id = "gunshot-fx"
        this.gunshotHandler.src = gunshot
        this.gunshotHandler.volume = 0.1

        document.addEventListener("click", () => {
            this.musicHandler.play()
        })
    }

    init() {

    }
}

export default Sound