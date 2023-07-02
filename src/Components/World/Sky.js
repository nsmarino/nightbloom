import * as THREE from 'three';
import GameplayComponent from '../_Component';

class Sky extends GameplayComponent {
    constructor(gameObject) {
        super(gameObject)

        const skyGeo = new THREE.SphereGeometry(1000, 25, 25);
        // const basicSkyMat = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        // const loader  = new THREE.TextureLoader()
        // const texture = loader.load( "/image.jpeg" );
        // const imageSkyMat = new THREE.MeshPhongMaterial({ 
        //   map: texture,
        // });
        const shaderSkyMat = new THREE.ShaderMaterial({
            uniforms: {
            color1: {
                value: new THREE.Color("lightgrey")
            },
            color2: {
                value: new THREE.Color("lightblue")
            }
            },
            vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
            `,
            fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            
            varying vec2 vUv;
            
            void main() {
                
                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
            }
            `,
        });
        const sky = new THREE.Mesh(skyGeo, shaderSkyMat);
        sky.material.side = THREE.BackSide;
        gameObject.transform.parent.add(sky);
        sky.position.y += 200
        gameObject.transform.parent.fog = new THREE.Fog( 0x090c10, 100, 200 );
    }

    update(deltaTime) {

    }

    onSignal(signalName, data={}) {
        switch(signalName) {
          case "example_signal":
            console.log("Example signal", data)
            break;
        }
    }
    
    attachObservers(parent) {
    }
}

export default Sky