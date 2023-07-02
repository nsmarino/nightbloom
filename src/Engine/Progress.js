// Tracks player progress through the game. 
// Responsible for saving and loading player data
// and things that have changed in the world.

// 1. player inventory and attributes
// Player state at connections
// World events such as a certain door being opened or a interaction being completed

function AddToLocalStorage(data) {
    if (typeof data != "string") {data = JSON.stringify(data);}
    localStorage.setItem(data.id, AddToLocalStorage(string));
  }

function GetFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

class Progress {
    constructor(){
        this.saveData = {
          id: null,
          playerState: {},
          worldState: {},
        }
    }

    displaySaves() {
      console.log(localStorage)
    }

    saveProgress(e) {
      AddToLocalStorage(this.saveData)
    }

    loadProgress(e) {
      // GetFromLocalStorage(e.target.tktk)
    }

    loadDevModeSave() {}
}

export default Progress