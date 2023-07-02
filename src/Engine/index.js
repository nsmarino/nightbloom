import Core from "./Core"
import GameObjects from "./GameObjects"
import Inputs from "./Inputs"
import Loader from "./Loader"
import State from "./State"
import Sound from "./Sound"
import Progress from "./Progress"
import Config from "./Config"
import { Pathfinding } from "three-pathfinding"

const Engine = {
    Core: new Core(),    
    GameObjects: new GameObjects(),
    Inputs: new Inputs(),
    Loader: new Loader(),
    Content: {},
    State: new State(),
    Sound: new Sound(),
    Progress: new Progress(),

    // All Caps for external libraries
    PATHFINDING: new Pathfinding(),

    Config,
}

export default Engine