// Base for all components
class GameplayComponent {
    constructor(gameObject) {
      this.gameObject = gameObject;
      this.observers = []
    }
 
    update(delta) {
    }

    save() {
    }

    load() {
    }

    removeParent() {
      this.gameObject.removeFromScene()
      Avern.GameObjects.removeGameObject(this.gameObject())
    }

    onSignal(signalName, data={}, originComponent) {

    }

    emitSignal(signalName, data={}) {
      if ( this.observers.length === 0) return;
      for (const observer of this.observers) {
        observer.onSignal(signalName, data, this)
      }
    }

    addObserver(observer){
      this.observers.push(observer)
    }

    removeObserver(observer){
      this.observers.filter(obs => {
        if (obs !== observer) return obs
      })
    }

    attachObservers(parent) {

    }

  }

export default GameplayComponent