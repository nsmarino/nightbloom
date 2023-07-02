import Targeting from "../Components/Game/Player/Targeting"
import Vitals from "../Components/Game/Player/Vitals"
import Inventory from "../Components/Game/Player/Inventory"
import Interaction from "../Components/Game/Player/Interaction"
import FollowCamera from "../Components/Game/Player/FollowCamera"
import Body from "../Components/Game/Player/Body"
import Actions from "../Components/Game/Player/Actions"

import ActionBar from "../Components/Interface/ActionBar"
import GameMenu from "../Components/Interface/GameMenu"
import InteractionOverlay from "../Components/Interface/InteractionOverlay"

const Config = {
    world: {
        gravity: - 30,
        physicsSteps: 8,
    },
    player: {
        include: true,
        jumpHeight: 16,
        components: [
            Actions,
            Interaction,
            FollowCamera,
            Body,
            Targeting,
            Vitals,
            Inventory,
        ]
    },
    interface: {
        include: true,
        components: [
            ActionBar,
            GameMenu,
            InteractionOverlay
        ]
    },
    blenderImportSettings: {
        geometryCollectionName: "geometry",
        spawnCollectionName: "spawns",
    }
}

export default Config