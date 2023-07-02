// import { h, Fragment } from 'start-dom-jsx'

// const AvailableEquipment = (equipment) => (
//     <div class="available-equipment" data-id="available-equipment">
//         {equipment.map(equ=>EquipmentBadge(equ))}
//     </div>
// )
// const EquipmentBadge = (equ) => {
//     return (
//     <div class={`equ-badge ${equ.id===Avern.State.equipped.id ? "equipped" : ""}`} data-id={equ.id}>
//         <img src={equ.icon} alt="" />
//     </div>
// )}
// const Equipped = (equipped) => (
//     <div>
//       <h2 class="tool-name"><span>[Left Hand]</span> {equipped.name}</h2>
//     </div>
// )
// const Equipment = () => {
//     return (
//         <div>
//             {AvailableEquipment(Avern.State.equipment)}
//             {Equipped(Avern.State.equipped)}
//         </div>
//     )
// }

// // Inventory
// const Inventory = () => (
//     <div>
//         {Avern.State.inventory.map(item=>Item(item))}
//     </div>
// )

// const Item = (item) => (
//     <div class="gm-item" data-id={item.id}>
//         <img src={item.icon} alt="" />
//         <p>{item.name}</p>
//     </div>
// )

// const ItemModal = (item) => (
//     <div class="item-modal">
//         <div class="modal-bg"></div>
//         <div class="inner-modal">
//             <button class="close-modal">x</button>
//             <h1>{item.name}</h1>
//         </div>
//     </div>
// )

// // Attributes
// const Attributes = () => (
//     <div>
//         <div>
//             <p>Level: {Avern.State.player.level}</p>
//             <p>XP: {Avern.State.player.xp}</p>
//             <p>Req: {Avern.State.player.nextLevel}</p>
//         </div>
//         <div class="attributes-list">
//             {Avern.State.attributes.map(attr=>Attribute(attr))}
//             <button class={(Avern.State.player.xp > Avern.State.player.nextLevel) ? "level-up" : "blocked level-up"}>Level Up</button>
//         </div>
//     </div>
// )
// const Attribute = (attr) => (
//     <div>
//         {attr.name}: {attr.value}
//     </div>
// )

// export { Equipment, Inventory, Attributes, ItemModal }