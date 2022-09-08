import * as THREE from 'three';
import { DoubleSide, ShaderMaterial, WireframeGeometry } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import{RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js'
const hdrTextureURL = new URL('../img/Arches_E_PineTree_3k.hdr', import.meta.url)

const _VS = `


uniform  vec3 normalCustom;
varying vec3 v_Normal;

void main(){
    //vec3 scale = vec3(4.0,1.0,1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;

}`;

const _FS = `

uniform vec3 sphereColour;


varying vec3 v_Normal;

void main(){  

   //gl_FragColor = vec4(v_Normal,1.0);
   gl_FragColor = vec4(sphereColour, 1.0);
    
}`

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;

renderer.setClearColor(0x282828)

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;



const loader = new RGBELoader();
function setHDROn(bool)
{
    if(bool == true)
    {
        loader.load(hdrTextureURL, function(texture){
            const pmremGenerator = new THREE.PMREMGenerator(renderer)
            texture.mapping = THREE.EquirectangularReflectionMapping
            var envMap = pmremGenerator.fromEquirectangular(texture).texture
            scene.environment = envMap
            scene.background = envMap
        
            texture.dispose();
            pmremGenerator.dispose();
        })
    }
    if(bool == false)
    {
        scene.environment = null
        scene.background = null
    }
}

setHDROn(true)

//const textureManager = new THREE.textureManager();
const textureLoader = new THREE.TextureLoader();


const firstTexture = textureLoader.load('/textures/First.jpg')
const firstTextureNormalMap = textureLoader.load('/textures/FirstNormal.jpg')
const secondTexture = textureLoader.load('/textures/Second.jpg')
const secondTextureNormalMap = textureLoader.load('/textures/SecondNormal.jpg')



renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45,
    window.innerWidth/window.innerHeight,
    1,
    10000
    );



const orbit = new OrbitControls(camera, renderer.domElement);

//const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

//camera.position.z = 5;
//camera.position.y = 0;
camera.position.set(-10, 30, 30)
orbit.update();

/*
const sphereGeometry = new THREE.SphereBufferGeometry(4);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x00FF00,
    wireframe: false
})
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphereMesh);
sphereMesh.position.set(3,10,3)
sphereMesh.castShadow = true;

*/


const vertices= new Float32Array([
    -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
    -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
]);



const indices = [
    2,1,0,  0,3,2,
    0,4,7,    7,3,0,
    0,1,5,    5,4,0,
    1,2,6,    6,5,1,
    2,3,7,    7,6,2,
    4,5,6,    6,7,4
];


let detailC = 4
let domeGeom = new THREE.PolyhedronBufferGeometry(vertices,indices, 5, detailC);

let domeMaterial = new THREE.MeshStandardMaterial({
    side: DoubleSide,
    metalness: 0.3,
    roughness: 0.8,
    //normalMap: secondTextureNormalMap,
    

})
domeGeom.computeVertexNormals()

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms:{

        normalCustom:{
            
        },
        sphereColour: {
            value: new THREE.Vector3(0, 0, 1)
        }
    },
    vertexShader: _VS,
    fragmentShader:_FS,
    map: secondTexture
    

});

let domeMesh = new THREE.Mesh(domeGeom,domeMaterial)
domeMesh.castShadow = true
//domeMesh.geometry.attributes.detail.needsUpdate = true;
scene.add(domeMesh)


function createBufferGeometry(detail)
{
    domeGeom.dispose()
    domeGeom = new THREE.PolyhedronBufferGeometry(vertices,indices, 5, detail)
   /*  const shaderMaterial = new THREE.ShaderMaterial({
        uniforms:{
    
            normalCustom:{
                
            },
            sphereColour: {
                value: new THREE.Vector3(0, 0, 1)
            }
        },
        vertexShader: _VS,
        fragmentShader:_FS
        
    
    }); */
    
    domeMesh = new THREE.Mesh(domeGeom,domeMaterial)
    //domeMesh.geometry.attributes.detail.needsUpdate = true;
    scene.add(domeMesh)
    
}

function createBufferGeometryShader(detail, material)
{
    domeGeom.dispose()

    //domeGeom = new THREE.BoxGeometry(5,5,5)
    domeGeom = new THREE.PolyhedronBufferGeometry(vertices,indices, 5, detail)
   /*  const shaderMaterial = new THREE.ShaderMaterial({
        uniforms:{
    
            normalCustom:{
                
            },
            sphereColour: {
                value: new THREE.Vector3(0, 0, 1)
            }
        },
        vertexShader: _VS,
        fragmentShader:_FS
        
    
    }); */
    
    domeMesh = new THREE.Mesh(domeGeom,material)
    //domeMesh.geometry.attributes.detail.needsUpdate = true;
    scene.add(domeMesh)
    
}


/*const planeGeometry = new THREE.PlaneGeometry(30,30);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF})
const plane = new THREE.Mesh(planeGeometry,planeMaterial)
scene.add(plane)
plane.rotateX(-.5*Math.PI)
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper)

*/



//Lightinng


const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.8);
scene.add(directionalLight);
directionalLight.position.set(10,40,10)
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -12;
directionalLight.shadow.camera.top = 12;
directionalLight.shadow.camera.right = 12
directionalLight.shadow.camera.left = -12

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight,5);
scene.add(dLightHelper)

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);



//GUI





const gui = new dat.GUI()


const options = {
    domeMeshColor: '#ff0000',
    detail: 4,
    wireframe: domeMesh.material.wireframe,
    dLightColor: 0xFFFFFF,
    aLightColor: 0x333333,
    backgroundColor: 0x282828,
    environmentMap: true,
    texture: "none",
    shaderOn: false,
    textures: "first"
}

const meshProperties  = gui.addFolder('Mesh Properties')
let materialFlag = false


function hexToRGB(str){
    str = str.replace('#', '');
    return str.split('').reduce(function(result, char, index, array){
      var j = parseInt(index * 3/array.length);
      var number = parseInt(char, 16);
      result[j] = (array.length == 3? number :  result[j]) * 16 + number;
      return result;
    },[0,0,0]);
  }

  function normalizeRGB(rgb)
  {
    //console.log(hexToRGB(rgb))
    return new THREE.Vector3(hexToRGB(rgb)[0]/255, hexToRGB(rgb)[1]/255, hexToRGB(rgb)[2]/255)
  }
meshProperties.addColor(options, "domeMeshColor").onChange(function(e)
{
    if(materialFlag == false)
        domeMesh.material.color.set(e)
    else
    {
        console.log(normalizeRGB(e))
        domeMesh.material.uniforms.sphereColour.value = normalizeRGB(e)
    }
       
})

meshProperties.add(options, 'wireframe').onChange(function(e){
    domeMesh.material.wireframe = e;
})

meshProperties.add(options, "detail", 0,10).step(1).onChange(function(e){
    
    let mat = domeMesh.material.wireframe
    let col = domeMesh.material.color
    
    
    scene.remove(domeMesh)
    //domeMesh.dispose()
    if(materialFlag == false)
    {
        createBufferGeometry(e)
        domeMesh.material.color.set(col)
        console.log("false")
    }
        
    if(materialFlag == true)
    {
        createBufferGeometryShader(e,shaderMaterial)
        console.log("true")
    }
        

    domeMesh.material.wireframe = mat
   
    
    
})

meshProperties.add(options,"shaderOn").onChange(function(e)
{
    let mat = domeMesh.material.wireframe
    let col = domeMesh.material.color
    let det = options.detail
    scene.remove(domeMesh)

    materialFlag = e;
    if(materialFlag == false)
    {
        createBufferGeometry(det)
        domeMesh.material.color.set(col)
        console.log("false")
    }
        
    if(materialFlag == true)
    {
        createBufferGeometryShader(det,shaderMaterial)
        console.log("true")
    }
    domeMesh.material.wireframe = mat
})

meshProperties.add(options, "textures", ["first", "second"]).onChange(function(e)
{
    if(e == "first")
    {
        console.log("first texture")
    }

    else if(e == "second")
    {
        console.log("second texture")
    }
})


const lightFolder = gui.addFolder('Lights color')

lightFolder.addColor(options, "dLightColor").onChange(function(e)
{
    directionalLight.color.set(e)
})

lightFolder.addColor(options, "aLightColor").onChange(function(e)
{
    ambientLight.color.set(e)
})

const backgroundFolder = gui.addFolder('Background')

backgroundFolder.addColor(options,"backgroundColor").onChange(function(e){
    renderer.setClearColor(e)
})

backgroundFolder.add(options,'environmentMap').onChange(function(e){
    setHDROn(e)
})


const windowX = window.innerWidth/2;
const windowY = window.innerHeight/2;

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) =>

{
    mouseX = (event.clientX - windowX)
    mouseY = (event.clientY - windowY)
})

//gui.add(targetX, "value").min(0.01).max(1).step(.05)
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const clock = new THREE.Clock()
var totalTime = 0.0
var c1 = new THREE.Vector3(1,0,0)
var c2 = new THREE.Vector3(1,0,1)
function v(camD, normD)
{
    
}

const tick = () =>
{

    targetX = mouseX * .001
    targetY = mouseY * .001

    const elapsedTime = clock.getElapsedTime()

    totalTime += clock.elapsedTime
    const sphereColour = c1.lerp(c2,v)

    domeMesh.rotation.y += .05 * targetX

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
