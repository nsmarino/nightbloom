class Inputs {
    constructor() {
        this.config = {
            forward: {
                code: "KeyI",
                name: "I",
                pressed: false,

                onlyOnce: false,
                trackWasPressed: true,
                trackUp: true,
            },
            back: {
                code:"KeyK",
                name: "K",
                pressed: false,

                onlyOnce: false,
                trackWasPressed: true,
                trackUp: true,

            },
            left: {
                code:"KeyJ",
                name: "J",
                pressed: false,

                onlyOnce: false,
                trackWasPressed: false,
                trackUp: false,

            },
            right: {
                code:"KeyL",
                name: "L",
                pressed: false,

                onlyOnce: false,
                trackWasPressed: false,
                trackUp: false,

            },
        
            interact: {
                code:"KeyH",
                name: "H",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
            jump: {
                code:"Space",
                name: "Space",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: true,
                trackUp: false,
            },
        
            characterMenu: {
                code:"KeyU",
                name: "U",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
            setTarget: {
                code:"KeyG",
                name: "G",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,
            },
        
            action1: {
                code:"KeyF",
                name: "F",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
            action2: {
                code:"KeyD",
                name: "D",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
            action3: {
                code:"KeyS",
                name: "S",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
            action4: {
                code:"KeyA",
                name: "A",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
        
            reset: {
                code: "KeyR",
                name: "R",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
        
            flask: {
                code: "KeyE",
                name: "E",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: false,

            },
        
            freeCam: {
                code: "Semicolon",
                name: ";",
                pressed: false,

                onlyOnce: true,
                trackWasPressed: false,
                trackUp: true,
            },
        }
        
        this.inputs = {
            primaryClick:false,
            secondaryClick: false,

            forward:false,
            back:false,
            left:false,
            right:false,

            forwardWasPressed:false,
            forwardWasLifted:false,

            backWasPressed:false,
            backWasLifted:false,

            interact:false,
            jump:false,

            characterMenu:false,
            setTarget:false,

            action1:false,
            action2:false,
            action3:false,
            action4:false,

            reset: false,
            flask: false,

            freeCam: false,
            freeCamWasLifted:false,
        }
        
        window.addEventListener( 'keydown', function(e) {
            this.handleDown(e.code)
        }.bind(this));
    
        window.addEventListener( 'keyup', function ( e ) {
            this.handleUp(e.code)
        }.bind(this));

        document.querySelector("canvas").addEventListener( 'mousedown', function( e ) {
            e.preventDefault();
            if (e.button === 0) {
                this.inputs.primaryClick = e
            } else if (e.button === 2) {
                this.inputs.secondaryClick = e
                return false;
            }
        }.bind(this))

        // Disable context menu on canvas
        document.querySelector("canvas").addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        }.bind(this), false);

    }

    getInputs() {
        return this.inputs
    }
    update() {
        for (const property in this.config) {
            if (this.config[property].pressed && this.config[property].onlyOnce) this.inputs[property] = false
            if (this.config[property].pressed && this.config[property].trackWasPressed) this.inputs[`${property}WasPressed`] = false
            if (this.config[property].trackUp && this.inputs[`${property}WasLifted`]) this.inputs[`${property}WasLifted`] = false
        }
    }

    handleDown(code) {
        if (document.querySelector(`#${code}`)) {
            document.querySelector(`#${code}`).classList.add("active")
        }

        for (const property in this.config) {
            if (this.config[property].code === code) {
                if (!this.config[property].onlyOnce) this.inputs[property] = true
                if (!this.config[property].pressed) {
                    if (this.config[property].onlyOnce) this.inputs[property] = true
                    this.config[property].pressed = true
                    if (this.config[property].trackWasPressed) this.inputs[`${property}WasPressed`] = true
                }
            }
        }
    }

    handleUp(code) {
        if (document.querySelector(`#${code}`)) {
            document.querySelector(`#${code}`).classList.remove("active")
        }
        for (const property in this.config) {
            if (this.config[property].code === code) {
                    if (!this.config[property].onlyOnce) this.inputs[property] = false
                    this.config[property].pressed = false
                    if (this.config[property].trackUp) this.inputs[`${property}WasLifted`] = true
            }
        }
    }
}

export default Inputs