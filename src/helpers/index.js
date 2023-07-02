import * as THREE from 'three';

function removeArrayElement(array, element) {
    const ndx = array.indexOf(element);
    if (ndx >= 0) {
      array.splice(ndx, 1);
    }
  }

class SafeArray {
    constructor() {
        this.array = [];
        this.addQueue = [];
        this.removeQueue = new Set();
    }
    get isEmpty() {
        return this.addQueue.length + this.array.length > 0;
    }
    add(element) {
        this.addQueue.push(element);
    }
    remove(element) {
        this.removeQueue.add(element);
    }
    findByName(name) {
        this._addQueued();
        this._removeQueued();
        return this.array.find(element=>element.name===name);
    }
    forEach(fn) {
        this._addQueued();
        this._removeQueued();
        for (const element of this.array) {
        if (this.removeQueue.has(element)) {
            continue;
        }
        fn(element);
        }
        this._removeQueued();
    }
    _addQueued() {
        if (this.addQueue.length) {
        this.array.splice(this.array.length, 0, ...this.addQueue);
        this.addQueue = [];
        }
    }
    _removeQueued() {
        if (this.removeQueue.size) {
        this.array = this.array.filter(element => !this.removeQueue.has(element));
        this.removeQueue.clear();
        }
    }
}

function getSine(tick, amplitude, offset=0) {
    var x = 1;
    var y = 0;
    var frequency = 0.25
    var height = 1
    var x = 1;
    var y = 0;

    y = height/2 + amplitude * Math.sin((x+tick)/frequency);
    x++;

    return y + offset
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateCapsuleCollider(start, end, radius) {
    start.visible = false
    end.visible = false
    radius.visible = false

    const startWorldPos = new THREE.Vector3()
    const endWorldPos = new THREE.Vector3()

    const capsuleBottom = start
    const capsuleTop = end

    const capsuleHeight = capsuleBottom.position.distanceTo(capsuleTop.position)
    const capsuleRadius = radius.position.distanceTo(capsuleBottom.position)
    const line = new THREE.Line3(capsuleBottom.getWorldPosition(startWorldPos), capsuleTop.getWorldPosition(endWorldPos))

    // Vision helper
    const material = new THREE.LineBasicMaterial({
        color: 0xEE4B2B
    });
    const points = [];
    points.push( capsuleBottom.position );
    points.push( capsuleTop.position);
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const lineMesh = new THREE.Line( geometry, material );

    // body (used for visualizing and click events)
    const color = new THREE.Color( 0x008800 );

    const tubeGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        12,// path segments
        capsuleRadius,// THICKNESS
        8, //Roundness of Tube
        true //closed
      );

    const tubeWireframe = new THREE.Mesh(
        tubeGeometry,
        new THREE.MeshStandardMaterial( { color: color } )
    )
    tubeWireframe.material.wireframe = true
    tubeWireframe.visible = false

    const capsule = {
        radius: capsuleRadius,
        segment: line,
        body: tubeWireframe,
        spine: lineMesh,
        velocity: new THREE.Vector3()
    }
    return capsule
}

function checkCapsuleCollision(capsule1, capsule2) {
    // Get the line segments and radii of the capsules
    const segment1 = capsule1.segment;
    const segment2 = capsule2.segment;
    const radius1 = capsule1.radius;
    const radius2 = capsule2.radius;
  
    // Get the start and end points of the line segments
    const start1 = segment1.start.clone();
    const end1 = segment1.end.clone();
    const start2 = segment2.start.clone();
    const end2 = segment2.end.clone();
  
    // Calculate the vectors representing the line segments
    const dir1 = end1.clone().sub(start1).normalize();
    const dir2 = end2.clone().sub(start2).normalize();
    
    // Calculate the projections of start2 onto the line segment 1
    const projection1Start2 = start2.clone().sub(start1).dot(dir1);
    const projection1End2 = end2.clone().sub(start1).dot(dir1);
    const projection1 = Math.max(Math.min(projection1Start2, projection1End2), 0);
    const closestPoint1 = new THREE.Vector3().copy(dir1).multiplyScalar(projection1).add(start1);
  
    // Calculate the projections of start1 onto the line segment 2
    const projection2Start1 = start1.clone().sub(start2).dot(dir2);
    const projection2End1 = end1.clone().sub(start2).dot(dir2);
    const projection2 = Math.max(Math.min(projection2Start1, projection2End1), 0);
    const closestPoint2 = new THREE.Vector3().copy(dir2).multiplyScalar(projection2).add(start2);
  
    // Check if the closest points are within the line segment bounds
    if (projection1Start2 < 0 || projection1Start2 > segment1.distance()) {
      closestPoint1.copy(projection1Start2 < 0 ? start1 : end1);
    }
  
    if (projection2Start1 < 0 || projection2Start1 > segment2.distance()) {
      closestPoint2.copy(projection2Start1 < 0 ? start2 : end2);
    }
  
    // Calculate the squared distance between the closest points
    const closestDistanceSq = closestPoint1.distanceToSquared(closestPoint2);
  
    // Calculate the sum of the radii
    const sumRadii = radius1 + radius2;
    // Check if the squared distance is smaller than the sum of the radii squared
    if (closestDistanceSq < sumRadii * sumRadii) {
      // Collision detected
      return {isColliding: true, closestPoint1, closestPoint2};
    }
  
    // No collision
    return {isColliding: false};
}

export { 
    generateCapsuleCollider, 
    checkCapsuleCollision, 
    removeArrayElement, 
    getSine, 
    randomIntFromInterval, 
    SafeArray 
}