import styles from "./scss/main.scss"
import gsap from "gsap"
import Engine from "./Engine"
window.Avern = Engine

function startMenu() {
	const startMenu = document.querySelector(".start-menu")
	const rootStart = document.querySelector(".start-menu-root")
	const loadMenu = document.querySelector(".load-menu")
	const optionsMenu = document.querySelector(".options-menu")

	const clearChildren = () => {
		const duration = 0.1
		gsap.to(rootStart, {autoAlpha:"0", pointerEvents: "none", duration})
		gsap.to(loadMenu, {autoAlpha:"0", pointerEvents: "none", duration})
		gsap.to(optionsMenu, {autoAlpha:"0", pointerEvents: "none", duration})
	}

	document.querySelector(".start-btn").addEventListener("click", () => {
		gsap.set(".mask", { opacity: 1})
		gsap.to(".mask", { opacity: 0, duration: 3, delay: 1, ease: "power2.out"})
	
		init()	
		clearChildren()
		gsap.to(document.querySelector(".start-menu"), {autoAlpha:"0", pointerEvents: "none", duration: 0,})	

	})
	document.querySelector(".load-btn").addEventListener("click", () => {
		clearChildren()
		gsap.to(document.querySelector(".load-menu"), {autoAlpha:"1", pointerEvents: "auto", delay: 0.1})
	})
	document.querySelector(".options-btn").addEventListener("click", () => {
		clearChildren()
		gsap.to(document.querySelector(".options-menu"), {autoAlpha:"1", pointerEvents: "auto"})
	})

	document.querySelectorAll(".back-btn").forEach(btn=>btn.addEventListener("click", () => {
		clearChildren()
		gsap.to(document.querySelector(".start-menu-root"), {autoAlpha:"1", pointerEvents: "auto"})
	}))
}

async function init() {
	await Avern.Loader.loadFromCMS() // get content asynchronously.
	await Avern.Loader.initScene() // load layers (1) World (2) Interface (3) Game
	Avern.GameObjects.attachObservers() // Listen for signals from other gameObjects' components.
	render()
}

function render() {
	requestAnimationFrame( render );
	const delta = Math.min( Avern.Core.clock.getDelta(), 0.1 );

	Avern.GameObjects.update(delta)
	Avern.Inputs.update()

	Avern.Core.renderer.render( 
		Avern.State.scene,
		Avern.State.camera
	);
}

startMenu()
