
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import CSG from "../three-csg.js"
import Environment from "../v2/cool-env.js"
//import "../v2/csg-toy.js"
import UI from "../v2/ui.js"
import app from "../v2/app3.js"
let {renderer,scene,camera,floor} = app;

UI(app);
let tx = app.environment.makeProceduralTexture(256,(u,v)=>{
    let rb = ((Math.random()*128)|0) * (((((u*2)&1)^((v*2)&1))|0)?1:2)
    return (rb*256)|(rb*256*256)|(rb*256*256*256)|0x000000ff
})
tx.repeat.set(2,2);
tx.wrapS = tx.wrapT = THREE.RepeatWrapping

let mkMat=(color) => new THREE.MeshStandardMaterial({color:color,roughness:1,metalness:0.8,map:tx});
let rnd=(rng)=>((Math.random()*2)-1)*(rng||1)

for(let i=0;i<10;i++){
    let box = new THREE.Mesh(new THREE.BoxGeometry(2,2,2),mkMat('grey'))
    box.position.x=getRandomInt(50);
    box.position.z=getRandomInt(50);
    box.position.y=0.5;
    scene.add(box)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//scene.add(box)
//let sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2,8,8),mkMat('grey'))
let cyl = new THREE.Mesh(new THREE.CylinderGeometry(2,2,12),mkMat('grey'))
//scene.add(sphere)
//scene.add(cyl)

function doCSG(a,b,op,mat){
    let bspA = CSG.fromMesh( a );
    let bspB = CSG.fromMesh( b );
    let bspC = bspA[op]( bspB );
    let result = CSG.toMesh( bspC, a.matrix );
    result.material = mat;
    result.castShadow  = result.receiveShadow = true;
    return result;
}

let subMaterial = mkMat('grey')
let intersectMaterial = mkMat('green')
let unionMaterial = mkMat('blue');
let results = []

function recompute(){
    for(let i=0;i<results.length;i++){
        let m = results[i]
        m.parent.remove(m)
        m.geometry.dispose();
    }
    results = [];

    //box.updateMatrix();
    //sphere.updateMatrix();
    cyl.updateMatrix();

    results.push(doCSG(floor,cyl,'subtract',subMaterial))
    //results.push(doCSG(box,sphere,'intersect',intersectMaterial))
    //results.push(doCSG(box,sphere,'union',unionMaterial))

    //results.push(doCSG(sphere,box,'subtract',subMaterial))
    //results.push(doCSG(sphere,box,'intersect',intersectMaterial))
    //results.push(doCSG(sphere,box,'union',unionMaterial))

    for(let i=0;i<results.length;i++){
        let r = results[i];
        r.castShadow = r.receiveShadow = true;
        scene.add(r)

        //r.position.z += -5 + ((i%3)*5)
        //r.position.x += -5 + (((i/3)|0)*10)
    }
}
let dx,sx,up,dw = false
document.addEventListener('keydown',(e) => {
    switch (e.key) {
        case "ArrowLeft":
            sx = true
            break;
        case "ArrowRight":
            dx = true
            break;
        case "ArrowUp":
            up = true
            break;
        case "ArrowDown":
            dw = true
            break;
    }
})
document.addEventListener('keyup',()=>{
    dx = false
    sx = false
    up = false
    dw = false
})
let vel = 0.1
document.addEventListener('afterRender',()=>{
    let time = performance.now()
    if(up){
        cyl.position.x+=vel    
    }
    if(dw){
        cyl.position.x-=vel    
    }
    if(dx){
        cyl.position.z+=vel    
    }
    if(sx){
        cyl.position.z-=vel    
    }
    cyl.position.t=Math.sin(time*-0.0012)*0.5;
    recompute();
})
