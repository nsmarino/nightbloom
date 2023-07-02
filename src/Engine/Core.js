import * as THREE from 'three';

class Core {
    constructor() {
        this.clock = new THREE.Clock();

        const bgColor = 0x263238 / 2;

        // Set antialias to false and change pixel ratio to ~0.5 for nintendo64 feel
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        // this.renderer.setPixelRatio( 0.8 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        // this.renderer.setClearColor( bgColor, 1 );
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.outputEncoding = THREE.sRGBEncoding;
        // this.renderer.gammaInput = true;
        // this.renderer.gammaOutput = true;
        document.body.appendChild( this.renderer.domElement );

        window.addEventListener( 'resize', function () {
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }.bind(this), false );

    }
}

export default Core