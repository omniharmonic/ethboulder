examples/webgl_camera.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - cameras</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
		<style>
			b {
				color: lightgreen;
			}
		</style>
	</head>
	<body>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - cameras<br/>
		<b>O</b> orthographic <b>P</b> perspective
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			let SCREEN_WIDTH = window.innerWidth;
			let SCREEN_HEIGHT = window.innerHeight;
			let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

			let container, stats;
			let camera, scene, renderer, mesh;
			let cameraRig, activeCamera, activeHelper;
			let cameraPerspective, cameraOrtho;
			let cameraPerspectiveHelper, cameraOrthoHelper;
			const frustumSize = 600;

			init();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				scene = new THREE.Scene();

				//

				camera = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
				camera.position.z = 2500;

				cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );

				cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
				scene.add( cameraPerspectiveHelper );

				//
				cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );

				cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
				scene.add( cameraOrthoHelper );

				//

				activeCamera = cameraPerspective;
				activeHelper = cameraPerspectiveHelper;


				// counteract different front orientation of cameras vs rig

				cameraOrtho.rotation.y = Math.PI;
				cameraPerspective.rotation.y = Math.PI;

				cameraRig = new THREE.Group();

				cameraRig.add( cameraPerspective );
				cameraRig.add( cameraOrtho );

				scene.add( cameraRig );

				//

				mesh = new THREE.Mesh(
					new THREE.SphereGeometry( 100, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
				);
				scene.add( mesh );

				const mesh2 = new THREE.Mesh(
					new THREE.SphereGeometry( 50, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
				);
				mesh2.position.y = 150;
				mesh.add( mesh2 );

				const mesh3 = new THREE.Mesh(
					new THREE.SphereGeometry( 5, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
				);
				mesh3.position.z = 150;
				cameraRig.add( mesh3 );

				//

				const geometry = new THREE.BufferGeometry();
				const vertices = [];

				for ( let i = 0; i < 10000; i ++ ) {

					vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
					vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
					vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

				const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
				scene.add( particles );

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				renderer.setScissorTest( true );

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				window.addEventListener( 'resize', onWindowResize );
				document.addEventListener( 'keydown', onKeyDown );

			}

			//

			function onKeyDown( event ) {

				switch ( event.keyCode ) {

					case 79: /*O*/

						activeCamera = cameraOrtho;
						activeHelper = cameraOrthoHelper;

						break;

					case 80: /*P*/

						activeCamera = cameraPerspective;
						activeHelper = cameraPerspectiveHelper;

						break;

				}

			}

			//

			function onWindowResize() {

				SCREEN_WIDTH = window.innerWidth;
				SCREEN_HEIGHT = window.innerHeight;
				aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

				renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

				camera.aspect = 0.5 * aspect;
				camera.updateProjectionMatrix();

				cameraPerspective.aspect = 0.5 * aspect;
				cameraPerspective.updateProjectionMatrix();

				cameraOrtho.left = - 0.5 * frustumSize * aspect / 2;
				cameraOrtho.right = 0.5 * frustumSize * aspect / 2;
				cameraOrtho.top = frustumSize / 2;
				cameraOrtho.bottom = - frustumSize / 2;
				cameraOrtho.updateProjectionMatrix();

			}

			//

			function animate() {

				render();
				stats.update();

			}


			function render() {

				const r = Date.now() * 0.0005;

				mesh.position.x = 700 * Math.cos( r );
				mesh.position.z = 700 * Math.sin( r );
				mesh.position.y = 700 * Math.sin( r );

				mesh.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
				mesh.children[ 0 ].position.z = 70 * Math.sin( r );

				if ( activeCamera === cameraPerspective ) {

					cameraPerspective.fov = 35 + 30 * Math.sin( 0.5 * r );
					cameraPerspective.far = mesh.position.length();
					cameraPerspective.updateProjectionMatrix();

					cameraPerspectiveHelper.update();
					cameraPerspectiveHelper.visible = true;

					cameraOrthoHelper.visible = false;

				} else {

					cameraOrtho.far = mesh.position.length();
					cameraOrtho.updateProjectionMatrix();

					cameraOrthoHelper.update();
					cameraOrthoHelper.visible = true;

					cameraPerspectiveHelper.visible = false;

				}

				cameraRig.lookAt( mesh.position );

				//

				activeHelper.visible = false;

				renderer.setClearColor( 0x000000, 1 );
				renderer.setScissor( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
				renderer.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
				renderer.render( scene, activeCamera );

				//

				activeHelper.visible = true;

				renderer.setClearColor( 0x111111, 1 );
				renderer.setScissor( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
				renderer.setViewport( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>

examples/webgl_geometry_terrain.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - geometry - terrain + fog</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
		<style>
			body {
				background-color: #efd1b5;
				color: #61443e;
			}
			a {
				color: #a06851;
			}
		</style>
	</head>
	<body>

		<div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl terrain + fog demo <br />(left click: forward, right click: backward)</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
			import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

			let container, stats;
			let camera, controls, scene, renderer;
			let mesh, texture;

			const worldWidth = 256, worldDepth = 256;
			const clock = new THREE.Clock();

			init();

			function init() {

				container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xefd1b5 );
				scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

				const data = generateHeight( worldWidth, worldDepth );

				camera.position.set( 100, 800, - 800 );
				camera.lookAt( - 100, 810, - 800 );

				const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
				geometry.rotateX( - Math.PI / 2 );

				const vertices = geometry.attributes.position.array;

				for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

					vertices[ j + 1 ] = data[ i ] * 10;

				}

				texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				texture.colorSpace = THREE.SRGBColorSpace;

				mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
				scene.add( mesh );

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				controls = new FirstPersonControls( camera, renderer.domElement );
				controls.movementSpeed = 150;
				controls.lookSpeed = 0.1;

				stats = new Stats();
				container.appendChild( stats.dom );


				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				controls.handleResize();

			}

			function generateHeight( width, height ) {

				let seed = Math.PI / 4;
				window.Math.random = function () {

					const x = Math.sin( seed ++ ) * 10000;
					return x - Math.floor( x );

				};

				const size = width * height, data = new Uint8Array( size );
				const perlin = new ImprovedNoise(), z = Math.random() * 100;

				let quality = 1;

				for ( let j = 0; j < 4; j ++ ) {

					for ( let i = 0; i < size; i ++ ) {

						const x = i % width, y = ~ ~ ( i / width );
						data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

					}

					quality *= 5;

				}

				return data;

			}

			function generateTexture( data, width, height ) {

				let context, image, imageData, shade;

				const vector3 = new THREE.Vector3( 0, 0, 0 );

				const sun = new THREE.Vector3( 1, 1, 1 );
				sun.normalize();

				const canvas = document.createElement( 'canvas' );
				canvas.width = width;
				canvas.height = height;

				context = canvas.getContext( '2d' );
				context.fillStyle = '#000';
				context.fillRect( 0, 0, width, height );

				image = context.getImageData( 0, 0, canvas.width, canvas.height );
				imageData = image.data;

				for ( let i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

					vector3.x = data[ j - 2 ] - data[ j + 2 ];
					vector3.y = 2;
					vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
					vector3.normalize();

					shade = vector3.dot( sun );

					imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
					imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
					imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

				}

				context.putImageData( image, 0, 0 );

				// Scaled 4x

				const canvasScaled = document.createElement( 'canvas' );
				canvasScaled.width = width * 4;
				canvasScaled.height = height * 4;

				context = canvasScaled.getContext( '2d' );
				context.scale( 4, 4 );
				context.drawImage( canvas, 0, 0 );

				image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
				imageData = image.data;

				for ( let i = 0, l = imageData.length; i < l; i += 4 ) {

					const v = ~ ~ ( Math.random() * 5 );

					imageData[ i ] += v;
					imageData[ i + 1 ] += v;
					imageData[ i + 2 ] += v;

				}

				context.putImageData( image, 0, 0 );

				return canvasScaled;

			}

			//

			function animate() {

				render();
				stats.update();

			}


			function render() {

				controls.update( clock.getDelta() );
				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>

examples/webgl_lines_fat_wireframe.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - lines - fat - wireframe</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>

		<div id="container"></div>

		<div id="info"><a href="https://threejs.org" target="_blank">three.js</a> - fat lines</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
			import { Wireframe } from 'three/addons/lines/Wireframe.js';
			import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';

			let wireframe, renderer, scene, camera, camera2, controls;
			let wireframe1;
			let matLine, matLineBasic, matLineDashed;
			let stats;
			let gui;

			// viewport
			let insetWidth;
			let insetHeight;

			init();

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setClearColor( 0x000000, 0.0 );
				renderer.setAnimationLoop( animate );
				document.body.appendChild( renderer.domElement );

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( - 50, 0, 50 );

				camera2 = new THREE.PerspectiveCamera( 40, 1, 1, 1000 );
				camera2.position.copy( camera.position );

				controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 10;
				controls.maxDistance = 500;


				// Wireframe ( WireframeGeometry2, LineMaterial )

				let geo = new THREE.IcosahedronGeometry( 20, 1 );

				const geometry = new WireframeGeometry2( geo );

				matLine = new LineMaterial( {

					color: 0x4080ff,
					linewidth: 5, // in pixels
					dashed: false

				} );

				wireframe = new Wireframe( geometry, matLine );
				wireframe.computeLineDistances();
				wireframe.scale.set( 1, 1, 1 );
				scene.add( wireframe );


				// Line ( THREE.WireframeGeometry, THREE.LineBasicMaterial ) - rendered with gl.LINE

				geo = new THREE.WireframeGeometry( geo );

				matLineBasic = new THREE.LineBasicMaterial( { color: 0x4080ff } );
				matLineDashed = new THREE.LineDashedMaterial( { scale: 2, dashSize: 1, gapSize: 1 } );

				wireframe1 = new THREE.LineSegments( geo, matLineBasic );
				wireframe1.computeLineDistances();
				wireframe1.visible = false;
				scene.add( wireframe1 );

				//

				window.addEventListener( 'resize', onWindowResize );
				onWindowResize();

				stats = new Stats();
				document.body.appendChild( stats.dom );

				initGui();

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				insetWidth = window.innerHeight / 4; // square
				insetHeight = window.innerHeight / 4;

				camera2.aspect = insetWidth / insetHeight;
				camera2.updateProjectionMatrix();

			}

			function animate() {

				// main scene

				renderer.setClearColor( 0x000000, 0 );

				renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );

				renderer.render( scene, camera );

				// inset scene

				renderer.setClearColor( 0x222222, 1 );

				renderer.clearDepth(); // important!

				renderer.setScissorTest( true );

				renderer.setScissor( 20, 20, insetWidth, insetHeight );

				renderer.setViewport( 20, 20, insetWidth, insetHeight );

				camera2.position.copy( camera.position );
				camera2.quaternion.copy( camera.quaternion );

				renderer.render( scene, camera2 );

				renderer.setScissorTest( false );

				stats.update();

			}

			//

			function initGui() {

				gui = new GUI();

				const param = {
					'line type': 0,
					'width (px)': 5,
					'dashed': false,
					'dash scale': 1,
					'dash / gap': 1
				};


				gui.add( param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 } ).onChange( function ( val ) {

					switch ( val ) {

						case 0:
							wireframe.visible = true;

							wireframe1.visible = false;

							break;

						case 1:
							wireframe.visible = false;

							wireframe1.visible = true;

							break;

					}

				} );

				gui.add( param, 'width (px)', 1, 10 ).onChange( function ( val ) {

					matLine.linewidth = val;

				} );

				gui.add( param, 'dashed' ).onChange( function ( val ) {

					matLine.dashed = val;

					// dashed is implemented as a defines -- not as a uniform. this could be changed.
					// ... or THREE.LineDashedMaterial could be implemented as a separate material
					// temporary hack - renderer should do this eventually
					if ( val ) matLine.defines.USE_DASH = ''; else delete matLine.defines.USE_DASH;
					matLine.needsUpdate = true;

					wireframe1.material = val ? matLineDashed : matLineBasic;

				} );

				gui.add( param, 'dash scale', 0.5, 1, 0.1 ).onChange( function ( val ) {

					matLine.dashScale = val;
					matLineDashed.scale = val;

				} );

				gui.add( param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 } ).onChange( function ( val ) {

					switch ( val ) {

						case 0:
							matLine.dashSize = 2;
							matLine.gapSize = 1;

							matLineDashed.dashSize = 2;
							matLineDashed.gapSize = 1;

							break;

						case 1:
							matLine.dashSize = 1;
							matLine.gapSize = 1;

							matLineDashed.dashSize = 1;
							matLineDashed.gapSize = 1;

							break;

						case 2:
							matLine.dashSize = 1;
							matLine.gapSize = 2;

							matLineDashed.dashSize = 1;
							matLineDashed.gapSize = 2;

							break;

					}

				} );

			}

		</script>

	</body>

</html>

examples/webgl_loader_gltf_dispersion.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - GLTFloader + Dispersion</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - GLTFLoader + <a href="https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_dispersion" target="_blank" rel="noopener">KHR_materials_dispersion</a><br />
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
			import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

			let camera, scene, renderer;

			init().then( render );

			async function init() {

				const container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 5 );
				camera.position.set( 0.1, 0.05, 0.15 );

				scene = new THREE.Scene();

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.toneMapping = THREE.NeutralToneMapping;
				renderer.toneMappingExposure = 1;
				container.appendChild( renderer.domElement );

				const environment = new RoomEnvironment();
				const pmremGenerator = new THREE.PMREMGenerator( renderer );

				scene = new THREE.Scene();
				scene.backgroundBlurriness = 0.5;

				const env = pmremGenerator.fromScene( environment ).texture;
				scene.background = env;
				scene.environment = env;
				environment.dispose();

				const loader = new GLTFLoader();
				const gltf = await loader.loadAsync( 'models/gltf/DispersionTest.glb' );

				scene.add( gltf.scene );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render ); // use if there is no animation loop
				controls.minDistance = 0.1;
				controls.maxDistance = 10;
				controls.target.set( 0, 0, 0 );
				controls.update();

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			//

			function render() {

				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>

examples/webgl_loader_pdb.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - molecules</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
		<style>
			.label {
				text-shadow: -1px 1px 1px rgb(0,0,0);
				margin-left: 25px;
				font-size: 20px;
			}
		</style>
	</head>
	<body>
		<div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js webgl</a> - molecules</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
			import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';
			import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			let camera, scene, renderer, labelRenderer;
			let controls;

			let root;

			const MOLECULES = {
				'Ethanol': 'ethanol.pdb',
				'Aspirin': 'aspirin.pdb',
				'Caffeine': 'caffeine.pdb',
				'Nicotine': 'nicotine.pdb',
				'LSD': 'lsd.pdb',
				'Cocaine': 'cocaine.pdb',
				'Cholesterol': 'cholesterol.pdb',
				'Lycopene': 'lycopene.pdb',
				'Glucose': 'glucose.pdb',
				'Aluminium oxide': 'Al2O3.pdb',
				'Cubane': 'cubane.pdb',
				'Copper': 'cu.pdb',
				'Fluorite': 'caf2.pdb',
				'Salt': 'nacl.pdb',
				'YBCO superconductor': 'ybco.pdb',
				'Buckyball': 'buckyball.pdb',
				'Graphite': 'graphite.pdb'
			};

			const params = {
				molecule: 'caffeine.pdb'
			};

			const loader = new PDBLoader();
			const offset = new THREE.Vector3();

			init();

			function init() {

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x050505 );

				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
				camera.position.z = 1000;
				scene.add( camera );

				const light1 = new THREE.DirectionalLight( 0xffffff, 2.5 );
				light1.position.set( 1, 1, 1 );
				scene.add( light1 );

				const light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
				light2.position.set( - 1, - 1, 1 );
				scene.add( light2 );

				root = new THREE.Group();
				scene.add( root );

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				document.getElementById( 'container' ).appendChild( renderer.domElement );

				labelRenderer = new CSS2DRenderer();
				labelRenderer.setSize( window.innerWidth, window.innerHeight );
				labelRenderer.domElement.style.position = 'absolute';
				labelRenderer.domElement.style.top = '0px';
				labelRenderer.domElement.style.pointerEvents = 'none';
				document.getElementById( 'container' ).appendChild( labelRenderer.domElement );

				//

				controls = new TrackballControls( camera, renderer.domElement );
				controls.minDistance = 500;
				controls.maxDistance = 2000;

				//

				loadMolecule( params.molecule );

				//

				window.addEventListener( 'resize', onWindowResize );

				//

				const gui = new GUI();

				gui.add( params, 'molecule', MOLECULES ).onChange( loadMolecule );
				gui.open();

			}

			//

			function loadMolecule( model ) {

				const url = 'models/pdb/' + model;

				while ( root.children.length > 0 ) {

					const object = root.children[ 0 ];
					object.parent.remove( object );

				}

				loader.load( url, function ( pdb ) {

					const geometryAtoms = pdb.geometryAtoms;
					const geometryBonds = pdb.geometryBonds;
					const json = pdb.json;

					const boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );
					const sphereGeometry = new THREE.IcosahedronGeometry( 1, 3 );

					geometryAtoms.computeBoundingBox();
					geometryAtoms.boundingBox.getCenter( offset ).negate();

					geometryAtoms.translate( offset.x, offset.y, offset.z );
					geometryBonds.translate( offset.x, offset.y, offset.z );

					let positions = geometryAtoms.getAttribute( 'position' );
					const colors = geometryAtoms.getAttribute( 'color' );

					const position = new THREE.Vector3();
					const color = new THREE.Color();

					for ( let i = 0; i < positions.count; i ++ ) {

						position.x = positions.getX( i );
						position.y = positions.getY( i );
						position.z = positions.getZ( i );

						color.r = colors.getX( i );
						color.g = colors.getY( i );
						color.b = colors.getZ( i );

						const material = new THREE.MeshPhongMaterial( { color: color } );

						const object = new THREE.Mesh( sphereGeometry, material );
						object.position.copy( position );
						object.position.multiplyScalar( 75 );
						object.scale.multiplyScalar( 25 );
						root.add( object );

						const atom = json.atoms[ i ];

						const text = document.createElement( 'div' );
						text.className = 'label';
						text.style.color = 'rgb(' + atom[ 3 ][ 0 ] + ',' + atom[ 3 ][ 1 ] + ',' + atom[ 3 ][ 2 ] + ')';
						text.textContent = atom[ 4 ];

						const label = new CSS2DObject( text );
						label.position.copy( object.position );
						root.add( label );

					}

					positions = geometryBonds.getAttribute( 'position' );

					const start = new THREE.Vector3();
					const end = new THREE.Vector3();

					for ( let i = 0; i < positions.count; i += 2 ) {

						start.x = positions.getX( i );
						start.y = positions.getY( i );
						start.z = positions.getZ( i );

						end.x = positions.getX( i + 1 );
						end.y = positions.getY( i + 1 );
						end.z = positions.getZ( i + 1 );

						start.multiplyScalar( 75 );
						end.multiplyScalar( 75 );

						const object = new THREE.Mesh( boxGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
						object.position.copy( start );
						object.position.lerp( end, 0.5 );
						object.scale.set( 5, 5, start.distanceTo( end ) );
						object.lookAt( end );
						root.add( object );

					}

				} );

			}

			//

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
				labelRenderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				controls.update();

				const time = Date.now() * 0.0004;

				root.rotation.x = time;
				root.rotation.y = time * 0.7;

				render();

			}

			function render() {

				renderer.render( scene, camera );
				labelRenderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgl_loader_texture_ktx.html
<!DOCTYPE html>
<html lang="en">
<head>
	<title>three.js webgl - materials - compressed textures</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<link type="text/css" rel="stylesheet" href="main.css">
</head>
<body>

<div id="info">
	<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl - compressed KTX textures<br />
	<a href="https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/">Khronos Texture</a> is a lightweight file format for OpenGL
</div>

<script type="importmap">
	{
		"imports": {
			"three": "../build/three.module.js",
			"three/addons/": "./jsm/"
		}
	}
</script>

<script type="module">
	import * as THREE from 'three';

	import { KTXLoader } from 'three/addons/loaders/KTXLoader.js';

	/*
	This is how compressed textures are supposed to be used:

	best for desktop:
	BC1(DXT1) - opaque textures
	BC3(DXT5) - transparent textures with full alpha range

	best for iOS:
	PVR2, PVR4 - opaque textures or alpha

	best for Android:
	ETC1 - opaque textures
	ASTC_4x4, ASTC8x8 - transparent textures with full alpha range
	*/

	let camera, scene, renderer;
	const meshes = [];

	init();

	function init() {

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.setAnimationLoop( animate );
		document.body.appendChild( renderer.domElement );

		const formats = {
			astc: renderer.extensions.has( 'WEBGL_compressed_texture_astc' ),
			etc1: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
			s3tc: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
			pvrtc: renderer.extensions.has( 'WEBGL_compressed_texture_pvrtc' )
		};

		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.z = 1000;

		scene = new THREE.Scene();

		const geometry = new THREE.BoxGeometry( 200, 200, 200 );
		let material1, material2;

		// TODO: add cubemap support
		const loader = new KTXLoader();

		if ( formats.pvrtc ) {

			material1 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/disturb_PVR2bpp.ktx' )
			} );
			material1.map.colorSpace = THREE.SRGBColorSpace;
			material2 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/lensflare_PVR4bpp.ktx' ),
				depthTest: false,
				transparent: true,
				side: THREE.DoubleSide
			} );
			material2.map.colorSpace = THREE.SRGBColorSpace;

			meshes.push( new THREE.Mesh( geometry, material1 ) );
			meshes.push( new THREE.Mesh( geometry, material2 ) );

		}

		if ( formats.s3tc ) {

			material1 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/disturb_BC1.ktx' )
			} );
			material1.map.colorSpace = THREE.SRGBColorSpace;
			material2 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/lensflare_BC3.ktx' ),
				depthTest: false,
				transparent: true,
				side: THREE.DoubleSide
			} );
			material2.map.colorSpace = THREE.SRGBColorSpace;

			meshes.push( new THREE.Mesh( geometry, material1 ) );
			meshes.push( new THREE.Mesh( geometry, material2 ) );

		}

		if ( formats.etc1 ) {

			material1 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/disturb_ETC1.ktx' )
			} );

			meshes.push( new THREE.Mesh( geometry, material1 ) );

		}

		if ( formats.astc ) {

			material1 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/disturb_ASTC4x4.ktx' )
			} );
			material1.map.colorSpace = THREE.SRGBColorSpace;
			material2 = new THREE.MeshBasicMaterial( {
				map: loader.load( 'textures/compressed/lensflare_ASTC8x8.ktx' ),
				depthTest: false,
				transparent: true,
				side: THREE.DoubleSide
			} );
			material2.map.colorSpace = THREE.SRGBColorSpace;

			meshes.push( new THREE.Mesh( geometry, material1 ) );
			meshes.push( new THREE.Mesh( geometry, material2 ) );

		}

		let x = - meshes.length / 2 * 150;
		for ( let i = 0; i < meshes.length; ++ i, x += 300 ) {

			const mesh = meshes[ i ];
			mesh.position.x = x;
			mesh.position.y = 0;
			scene.add( mesh );

		}

		window.addEventListener( 'resize', onWindowResize );

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function animate() {

		const time = Date.now() * 0.001;

		for ( let i = 0; i < meshes.length; i ++ ) {

			const mesh = meshes[ i ];
			mesh.rotation.x = time;
			mesh.rotation.y = time;

		}

		renderer.render( scene, camera );

	}

</script>

</body>
</html>

examples/webgl_materials_wireframe.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - materials - wireframe</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - materials - wireframe
		</div>

		<script type="x-shader/x-vertex" id="vertexShader">

			attribute vec3 center;
			varying vec3 vCenter;

			void main() {

				vCenter = center;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}

		</script>

		<script type="x-shader/x-fragment" id="fragmentShader">

			uniform float thickness;

			varying vec3 vCenter;

			void main() {

				vec3 afwidth = fwidth( vCenter.xyz );

				vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, vCenter.xyz );

				float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );

				gl_FragColor.rgb = gl_FrontFacing ? vec3( 0.9, 0.9, 1.0 ) : vec3( 0.4, 0.4, 0.5 );
				gl_FragColor.a = edge;

			}

		</script>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			const API = {
				thickness: 1
			};

			let renderer, scene, camera, mesh2;

			init();

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 500 );
				camera.position.z = 200;

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render ); // use if there is no animation loop
				controls.enablePan = false;
				controls.enableZoom = false;

				new THREE.BufferGeometryLoader().load( 'models/json/WaltHeadLo_buffergeometry.json', function ( geometry ) {

					geometry.deleteAttribute( 'normal' );
					geometry.deleteAttribute( 'uv' );

					setupAttributes( geometry );

					// left

					const material1 = new THREE.MeshBasicMaterial( {

						color: 0xe0e0ff,
						wireframe: true

					} );

					const mesh1 = new THREE.Mesh( geometry, material1 );
					mesh1.position.set( - 40, 0, 0 );

					scene.add( mesh1 );

					// right

					const material2 = new THREE.ShaderMaterial( {

						uniforms: { 'thickness': { value: API.thickness } },
						vertexShader: document.getElementById( 'vertexShader' ).textContent,
						fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
						side: THREE.DoubleSide,
						alphaToCoverage: true // only works when WebGLRenderer's "antialias" is set to "true"

					} );

					mesh2 = new THREE.Mesh( geometry, material2 );
					mesh2.position.set( 40, 0, 0 );

					scene.add( mesh2 );

					//

					render();

				} );

				//

				const gui = new GUI();

				gui.add( API, 'thickness', 0, 4 ).onChange( function () {

					mesh2.material.uniforms.thickness.value = API.thickness;
					render();

				} );

				gui.open();

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function setupAttributes( geometry ) {

				const vectors = [
					new THREE.Vector3( 1, 0, 0 ),
					new THREE.Vector3( 0, 1, 0 ),
					new THREE.Vector3( 0, 0, 1 )
				];

				const position = geometry.attributes.position;
				const centers = new Float32Array( position.count * 3 );

				for ( let i = 0, l = position.count; i < l; i ++ ) {

					vectors[ i % 3 ].toArray( centers, i * 3 );

				}

				geometry.setAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function render() {

				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>

examples/webgl_morphtargets_sphere.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - morph targets - sphere</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - WebGL morph target example
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
			import { Timer } from 'three/addons/misc/Timer.js';

			let camera, scene, renderer, timer;

			let mesh;

			let sign = 1;
			const speed = 0.5;

			init();

			function init() {

				const container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.2, 100 );
				camera.position.set( 0, 5, 5 );

				scene = new THREE.Scene();

				timer = new Timer();
				timer.connect( document );

				const light1 = new THREE.PointLight( 0xff2200, 50000 );
				light1.position.set( 100, 100, 100 );
				scene.add( light1 );

				const light2 = new THREE.PointLight( 0x22ff00, 10000 );
				light2.position.set( - 100, - 100, - 100 );
				scene.add( light2 );

				scene.add( new THREE.AmbientLight( 0x111111 ) );

				const loader = new GLTFLoader();
				loader.load( 'models/gltf/AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf', function ( gltf ) {

					mesh = gltf.scene.getObjectByName( 'AnimatedMorphSphere' );
					mesh.rotation.z = Math.PI / 2;
					scene.add( mesh );

					//

					const pointsMaterial = new THREE.PointsMaterial( {
						size: 10,
						sizeAttenuation: false,
						map: new THREE.TextureLoader().load( 'textures/sprites/disc.png' ),
						alphaTest: 0.5
					} );

					const points = new THREE.Points( mesh.geometry, pointsMaterial );
					points.morphTargetInfluences = mesh.morphTargetInfluences;
					points.morphTargetDictionary = mesh.morphTargetDictionary;
					mesh.add( points );

				} );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );

				container.appendChild( renderer.domElement );

				//

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 1;
				controls.maxDistance = 20;

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				timer.update();
				render();

			}

			function render() {

				const delta = timer.getDelta();

				if ( mesh !== undefined ) {

					const step = delta * speed;

					mesh.rotation.y += step;

					mesh.morphTargetInfluences[ 1 ] = mesh.morphTargetInfluences[ 1 ] + step * sign;

					if ( mesh.morphTargetInfluences[ 1 ] <= 0 || mesh.morphTargetInfluences[ 1 ] >= 1 ) {

						sign *= - 1;

					}

				}

				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>

examples/webgl_points_dynamic.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - particles - dynamic - postprocessing</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl dynamic particles + postprocessing<br/>
			models by <a href="http://sketchup.google.com/3dwarehouse/details?mid=2c6fd128fca34052adc5f5b98d513da1" target="_blank" rel="noopener">Reallusion</a>
			<a href="http://sketchup.google.com/3dwarehouse/details?mid=f526cc4abf7cb68d76cab47c765b7255" target="_blank" rel="noopener">iClone</a>
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
			import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
			import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
			import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
			import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
			import { FocusShader } from 'three/addons/shaders/FocusShader.js';
			import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
			import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

			let camera, scene, renderer, mesh;

			let parent;

			const meshes = [], clonemeshes = [];

			let composer, effectFocus;

			const clock = new THREE.Clock();

			let stats;

			init();

			function init() {

				const container = document.querySelector( '#container' );

				camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 50000 );
				camera.position.set( 0, 700, 7000 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x000104 );
				scene.fog = new THREE.FogExp2( 0x000104, 0.0000675 );

				camera.lookAt( scene.position );

				const loader = new OBJLoader();

				loader.load( 'models/obj/male02/male02.obj', function ( object ) {

					const positions = combineBuffer( object, 'position' );

					createMesh( positions, scene, 4.05, - 500, - 350, 600, 0xff7744 );
					createMesh( positions, scene, 4.05, 500, - 350, 0, 0xff5522 );
					createMesh( positions, scene, 4.05, - 250, - 350, 1500, 0xff9922 );
					createMesh( positions, scene, 4.05, - 250, - 350, - 1500, 0xff99ff );

				} );

				loader.load( 'models/obj/female02/female02.obj', function ( object ) {

					const positions = combineBuffer( object, 'position' );

					createMesh( positions, scene, 4.05, - 1000, - 350, 0, 0xffdd44 );
					createMesh( positions, scene, 4.05, 0, - 350, 0, 0xffffff );
					createMesh( positions, scene, 4.05, 1000, - 350, 400, 0xff4422 );
					createMesh( positions, scene, 4.05, 250, - 350, 1500, 0xff9955 );
					createMesh( positions, scene, 4.05, 250, - 350, 2500, 0xff77dd );

				} );


				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.autoClear = false;
				container.appendChild( renderer.domElement );

				parent = new THREE.Object3D();
				scene.add( parent );

				const grid = new THREE.Points( new THREE.PlaneGeometry( 15000, 15000, 64, 64 ), new THREE.PointsMaterial( { color: 0xff0000, size: 10 } ) );
				grid.position.y = - 400;
				grid.rotation.x = - Math.PI / 2;
				parent.add( grid );

				// postprocessing

				const renderModel = new RenderPass( scene, camera );
				const effectBloom = new BloomPass( 0.75 );
				const effectFilm = new FilmPass();

				effectFocus = new ShaderPass( FocusShader );

				effectFocus.uniforms[ 'screenWidth' ].value = window.innerWidth * window.devicePixelRatio;
				effectFocus.uniforms[ 'screenHeight' ].value = window.innerHeight * window.devicePixelRatio;

				const outputPass = new OutputPass();

				composer = new EffectComposer( renderer );

				composer.addPass( renderModel );
				composer.addPass( effectBloom );
				composer.addPass( effectFilm );
				composer.addPass( effectFocus );
				composer.addPass( outputPass );

				//stats
				stats = new Stats();
				container.appendChild( stats.dom );

				window.addEventListener( 'resize', onWindowResize );

			}


			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				camera.lookAt( scene.position );

				renderer.setSize( window.innerWidth, window.innerHeight );
				composer.setSize( window.innerWidth, window.innerHeight );

				effectFocus.uniforms[ 'screenWidth' ].value = window.innerWidth * window.devicePixelRatio;
				effectFocus.uniforms[ 'screenHeight' ].value = window.innerHeight * window.devicePixelRatio;

			}

			function combineBuffer( model, bufferName ) {

				let count = 0;

				model.traverse( function ( child ) {

					if ( child.isMesh ) {

						const buffer = child.geometry.attributes[ bufferName ];

						count += buffer.array.length;

					}

				} );

				const combined = new Float32Array( count );

				let offset = 0;

				model.traverse( function ( child ) {

					if ( child.isMesh ) {

						const buffer = child.geometry.attributes[ bufferName ];

						combined.set( buffer.array, offset );
						offset += buffer.array.length;

					}

				} );

				return new THREE.BufferAttribute( combined, 3 );

			}

			function createMesh( positions, scene, scale, x, y, z, color ) {

				const geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', positions.clone() );
				geometry.setAttribute( 'initialPosition', positions.clone() );

				geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

				const clones = [

					[ 6000, 0, - 4000 ],
					[ 5000, 0, 0 ],
					[ 1000, 0, 5000 ],
					[ 1000, 0, - 5000 ],
					[ 4000, 0, 2000 ],
					[ - 4000, 0, 1000 ],
					[ - 5000, 0, - 5000 ],

					[ 0, 0, 0 ]

				];

				for ( let i = 0; i < clones.length; i ++ ) {

					const c = ( i < clones.length - 1 ) ? 0x252525 : color;

					mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 30, color: c } ) );
					mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

					mesh.position.x = x + clones[ i ][ 0 ];
					mesh.position.y = y + clones[ i ][ 1 ];
					mesh.position.z = z + clones[ i ][ 2 ];

					parent.add( mesh );

					clonemeshes.push( { mesh: mesh, speed: 0.5 + Math.random() } );

				}

				meshes.push( {
					mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor( 200 + 200 * Math.random() ),
					start: Math.floor( 100 + 200 * Math.random() ),
				} );

			}

			function animate() {

				render();
				stats.update();

			}

			function render() {

				let delta = 10 * clock.getDelta();

				delta = delta < 2 ? delta : 2;

				parent.rotation.y += - 0.02 * delta;

				for ( let j = 0; j < clonemeshes.length; j ++ ) {

					const cm = clonemeshes[ j ];
					cm.mesh.rotation.y += - 0.1 * delta * cm.speed;

				}

				for ( let j = 0; j < meshes.length; j ++ ) {

					const data = meshes[ j ];
					const positions = data.mesh.geometry.attributes.position;
					const initialPositions = data.mesh.geometry.attributes.initialPosition;

					const count = positions.count;

					if ( data.start > 0 ) {

						data.start -= 1;

					} else {

						if ( data.direction === 0 ) {

							data.direction = - 1;

						}

					}

					for ( let i = 0; i < count; i ++ ) {

						const px = positions.getX( i );
						const py = positions.getY( i );
						const pz = positions.getZ( i );

						// falling down
						if ( data.direction < 0 ) {

							if ( py > 0 ) {

								positions.setXYZ(
									i,
									px + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta,
									py + 3.0 * ( 0.25 - Math.random() ) * data.speed * delta,
									pz + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta
								);

							} else {

								data.verticesDown += 1;

							}

						}

						// rising up
						if ( data.direction > 0 ) {

							const ix = initialPositions.getX( i );
							const iy = initialPositions.getY( i );
							const iz = initialPositions.getZ( i );

							const dx = Math.abs( px - ix );
							const dy = Math.abs( py - iy );
							const dz = Math.abs( pz - iz );

							const d = dx + dy + dx;

							if ( d > 1 ) {

								positions.setXYZ(
									i,
									px - ( px - ix ) / dx * data.speed * delta * ( 0.85 - Math.random() ),
									py - ( py - iy ) / dy * data.speed * delta * ( 1 + Math.random() ),
									pz - ( pz - iz ) / dz * data.speed * delta * ( 0.85 - Math.random() )
								);

							} else {

								data.verticesUp += 1;

							}

						}

					}

					// all vertices down
					if ( data.verticesDown >= count ) {

						if ( data.delay <= 0 ) {

							data.direction = 1;
							data.speed = 5;
							data.verticesDown = 0;
							data.delay = 320;

						} else {

							data.delay -= 1;

						}

					}

					// all vertices up
					if ( data.verticesUp >= count ) {

						if ( data.delay <= 0 ) {

							data.direction = - 1;
							data.speed = 15;
							data.verticesUp = 0;
							data.delay = 120;

						} else {

							data.delay -= 1;

						}

					}

					positions.needsUpdate = true;

				}

				composer.render( 0.01 );

			}

		</script>

	</body>

</html>

examples/webgl_shader.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - shader [Monjori]</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="container"></div>
		<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - shader demo. featuring <a href="http://www.pouet.net/prod.php?which=52761" target="_blank" rel="noopener">Monjori by Mic</a></div>

		<script id="vertexShader" type="x-shader/x-vertex">

			varying vec2 vUv;

			void main()	{

				vUv = uv;

				gl_Position = vec4( position, 1.0 );

			}

		</script>

		<script id="fragmentShader" type="x-shader/x-fragment">

			varying vec2 vUv;

			uniform float time;

			void main()	{

				vec2 p = - 1.0 + 2.0 * vUv;
				float a = time * 40.0;
				float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;

				e = 400.0 * ( p.x * 0.5 + 0.5 );
				f = 400.0 * ( p.y * 0.5 + 0.5 );
				i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
				d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
				r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
				q = f / r;
				e = ( r * cos( q ) ) - a / 2.0;
				f = ( r * sin( q ) ) - a / 2.0;
				d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
				h = ( ( f + d ) + a / 2.0 ) * g;
				i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
				h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
				h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
				i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
				i = mod( i / 5.6, 256.0 ) / 64.0;
				if ( i < 0.0 ) i += 4.0;
				if ( i >= 2.0 ) i = 4.0 - i;
				d = r / 350.0;
				d += sin( d * d * 8.0 ) * 0.52;
				f = ( sin( a * g ) + 1.0 ) / 2.0;
				gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );

			}

		</script>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			let camera, scene, renderer;

			let uniforms;

			init();

			function init() {

				const container = document.getElementById( 'container' );

				camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

				scene = new THREE.Scene();

				const geometry = new THREE.PlaneGeometry( 2, 2 );

				uniforms = {
					time: { value: 1.0 }
				};

				const material = new THREE.ShaderMaterial( {

					uniforms: uniforms,
					vertexShader: document.getElementById( 'vertexShader' ).textContent,
					fragmentShader: document.getElementById( 'fragmentShader' ).textContent

				} );

				const mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			//

			function animate() {

				uniforms[ 'time' ].value = performance.now() / 1000;

				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>

examples/webgl_postprocessing_dof.html

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - postprocessing - depth-of-field</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl depth-of-field with bokeh example<br/>
			shader by <a href="http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html">Martins Upitis</a>
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
			import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
			import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
			import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

			let camera, scene, renderer, stats,
				singleMaterial, zmaterial,
				parameters, nobjects, cubeMaterial;

			let mouseX = 0, mouseY = 0;

			let windowHalfX = window.innerWidth / 2;
			let windowHalfY = window.innerHeight / 2;

			let width = window.innerWidth;
			let height = window.innerHeight;

			const materials = [], objects = [];

			const postprocessing = {};

			init();

			function init() {

				const container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 70, width / height, 1, 3000 );
				camera.position.z = 200;

				scene = new THREE.Scene();

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( width, height );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				const path = 'textures/cube/SwedishRoyalCastle/';
				const format = '.jpg';
				const urls = [
					path + 'px' + format, path + 'nx' + format,
					path + 'py' + format, path + 'ny' + format,
					path + 'pz' + format, path + 'nz' + format
				];

				const textureCube = new THREE.CubeTextureLoader().load( urls );

				parameters = { color: 0xff4900, envMap: textureCube };
				cubeMaterial = new THREE.MeshBasicMaterial( parameters );

				singleMaterial = false;

				if ( singleMaterial ) zmaterial = [ cubeMaterial ];

				const geo = new THREE.SphereGeometry( 1, 20, 10 );

				const xgrid = 14, ygrid = 9, zgrid = 14;

				nobjects = xgrid * ygrid * zgrid;

				const s = 60;
				let count = 0;

				for ( let i = 0; i < xgrid; i ++ ) {

					for ( let j = 0; j < ygrid; j ++ ) {

						for ( let k = 0; k < zgrid; k ++ ) {

							let mesh;

							if ( singleMaterial ) {

								mesh = new THREE.Mesh( geo, zmaterial );

							} else {

								mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial( parameters ) );
								materials[ count ] = mesh.material;

							}

							const x = 200 * ( i - xgrid / 2 );
							const y = 200 * ( j - ygrid / 2 );
							const z = 200 * ( k - zgrid / 2 );

							mesh.position.set( x, y, z );
							mesh.scale.set( s, s, s );

							mesh.matrixAutoUpdate = false;
							mesh.updateMatrix();

							scene.add( mesh );
							objects.push( mesh );

							count ++;

						}

					}

				}

				initPostprocessing();

				renderer.autoClear = false;

				stats = new Stats();
				container.appendChild( stats.dom );

				container.style.touchAction = 'none';
				container.addEventListener( 'pointermove', onPointerMove );

				window.addEventListener( 'resize', onWindowResize );

				const effectController = {

					focus: 500.0,
					aperture: 5,
					maxblur: 0.01

				};

				const matChanger = function ( ) {

					postprocessing.bokeh.uniforms[ 'focus' ].value = effectController.focus;
					postprocessing.bokeh.uniforms[ 'aperture' ].value = effectController.aperture * 0.00001;
					postprocessing.bokeh.uniforms[ 'maxblur' ].value = effectController.maxblur;

				};

				const gui = new GUI();
				gui.add( effectController, 'focus', 10.0, 3000.0, 10 ).onChange( matChanger );
				gui.add( effectController, 'aperture', 0, 10, 0.1 ).onChange( matChanger );
				gui.add( effectController, 'maxblur', 0.0, 0.01, 0.001 ).onChange( matChanger );
				gui.close();

				matChanger();

			}

			function onPointerMove( event ) {

				if ( event.isPrimary === false ) return;

				mouseX = event.clientX - windowHalfX;
				mouseY = event.clientY - windowHalfY;

			}

			function onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				width = window.innerWidth;
				height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );
				postprocessing.composer.setSize( width, height );

			}

			function initPostprocessing() {

				const renderPass = new RenderPass( scene, camera );

				const bokehPass = new BokehPass( scene, camera, {
					focus: 1.0,
					aperture: 0.025,
					maxblur: 0.01
				} );

				const outputPass = new OutputPass();

				const composer = new EffectComposer( renderer );

				composer.addPass( renderPass );
				composer.addPass( bokehPass );
				composer.addPass( outputPass );

				postprocessing.composer = composer;
				postprocessing.bokeh = bokehPass;

			}

			function animate() {

				stats.begin();
				render();
				stats.end();

			}

			function render() {

				const time = Date.now() * 0.00005;

				camera.position.x += ( mouseX - camera.position.x ) * 0.036;
				camera.position.y += ( - ( mouseY ) - camera.position.y ) * 0.036;

				camera.lookAt( scene.position );

				if ( ! singleMaterial ) {

					for ( let i = 0; i < nobjects; i ++ ) {

						const h = ( 360 * ( i / nobjects + time ) % 360 ) / 360;
						materials[ i ].color.setHSL( h, 1, 0.5 );

					}

				}

				postprocessing.composer.render( 0.1 );

			}

		</script>
	</body>
</html>

examples/webgl_postprocessing_godrays.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - postprocessing - godrays</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - webgl god-rays example - tree by <a href="http://www.turbosquid.com/3d-models/free-tree-3d-model/592617" target="_blank" rel="noopener">stanloshka</a>
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from 'three/addons/shaders/GodRaysShader.js';

			let container, stats;
			let camera, scene, renderer, materialDepth;

			let sphereMesh;

			const sunPosition = new THREE.Vector3( 0, 1000, - 1000 );
			const clipPosition = new THREE.Vector4();
			const screenSpacePosition = new THREE.Vector3();

			const postprocessing = { enabled: true };

			const orbitRadius = 200;

			const bgColor = 0x000511;
			const sunColor = 0xffee00;

			// Use a smaller size for some of the god-ray render targets for better performance.
			const godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;

			init();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				//

				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
				camera.position.z = 200;

				scene = new THREE.Scene();

				//

				materialDepth = new THREE.MeshDepthMaterial();

				// tree

				const loader = new OBJLoader();
				loader.load( 'models/obj/tree.obj', function ( object ) {

					object.position.set( 0, - 150, - 150 );
					object.scale.multiplyScalar( 400 );
					scene.add( object );

				} );

				// sphere

				const geo = new THREE.SphereGeometry( 1, 20, 10 );
				sphereMesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
				sphereMesh.scale.multiplyScalar( 20 );
				scene.add( sphereMesh );

				//

				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0xffffff );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				renderer.autoClear = false;

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 50;
				controls.maxDistance = 500;

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				window.addEventListener( 'resize', onWindowResize );

				//

				initPostprocessing( window.innerWidth, window.innerHeight );

			}

			//

			function onWindowResize() {

				const renderTargetWidth = window.innerWidth;
				const renderTargetHeight = window.innerHeight;

				camera.aspect = renderTargetWidth / renderTargetHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( renderTargetWidth, renderTargetHeight );
				postprocessing.rtTextureColors.setSize( renderTargetWidth, renderTargetHeight );
				postprocessing.rtTextureDepth.setSize( renderTargetWidth, renderTargetHeight );
				postprocessing.rtTextureDepthMask.setSize( renderTargetWidth, renderTargetHeight );

				const adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
				const adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;
				postprocessing.rtTextureGodRays1.setSize( adjustedWidth, adjustedHeight );
				postprocessing.rtTextureGodRays2.setSize( adjustedWidth, adjustedHeight );

			}

			function initPostprocessing( renderTargetWidth, renderTargetHeight ) {

				postprocessing.scene = new THREE.Scene();

				postprocessing.camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 );
				postprocessing.camera.position.z = 100;

				postprocessing.scene.add( postprocessing.camera );

				postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, { type: THREE.HalfFloatType } );

				// I would have this quarter size and use it as one of the ping-pong render
				// targets but the aliasing causes some temporal flickering

				postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, { type: THREE.HalfFloatType } );
				postprocessing.rtTextureDepthMask = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, { type: THREE.HalfFloatType } );

				// The ping-pong render targets can use an adjusted resolution to minimize cost

				const adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
				const adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;
				postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight, { type: THREE.HalfFloatType } );
				postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight, { type: THREE.HalfFloatType } );

				// god-ray shaders

				const godraysMaskShader = GodRaysDepthMaskShader;
				postprocessing.godrayMaskUniforms = THREE.UniformsUtils.clone( godraysMaskShader.uniforms );
				postprocessing.materialGodraysDepthMask = new THREE.ShaderMaterial( {

					uniforms: postprocessing.godrayMaskUniforms,
					vertexShader: godraysMaskShader.vertexShader,
					fragmentShader: godraysMaskShader.fragmentShader

				} );

				const godraysGenShader = GodRaysGenerateShader;
				postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
				postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

					uniforms: postprocessing.godrayGenUniforms,
					vertexShader: godraysGenShader.vertexShader,
					fragmentShader: godraysGenShader.fragmentShader

				} );

				const godraysCombineShader = GodRaysCombineShader;
				postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
				postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

					uniforms: postprocessing.godrayCombineUniforms,
					vertexShader: godraysCombineShader.vertexShader,
					fragmentShader: godraysCombineShader.fragmentShader

				} );

				const godraysFakeSunShader = GodRaysFakeSunShader;
				postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
				postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

					uniforms: postprocessing.godraysFakeSunUniforms,
					vertexShader: godraysFakeSunShader.vertexShader,
					fragmentShader: godraysFakeSunShader.fragmentShader

				} );

				postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
				postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

				postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.75;

				postprocessing.quad = new THREE.Mesh(
					new THREE.PlaneGeometry( 1.0, 1.0 ),
					postprocessing.materialGodraysGenerate
				);
				postprocessing.quad.position.z = - 9900;
				postprocessing.scene.add( postprocessing.quad );

			}

			function animate() {

				stats.begin();
				render();
				stats.end();

			}

			function getStepSize( filterLen, tapsPerPass, pass ) {

				return filterLen * Math.pow( tapsPerPass, - pass );

			}

			function filterGodRays( inputTex, renderTarget, stepSize ) {

				postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;

				postprocessing.godrayGenUniforms[ 'fStepSize' ].value = stepSize;
				postprocessing.godrayGenUniforms[ 'tInput' ].value = inputTex;

				renderer.setRenderTarget( renderTarget );
				renderer.render( postprocessing.scene, postprocessing.camera );
				postprocessing.scene.overrideMaterial = null;

			}

			function render() {

				const time = Date.now() / 4000;

				sphereMesh.position.x = orbitRadius * Math.cos( time );
				sphereMesh.position.z = orbitRadius * Math.sin( time ) - 100;

				if ( postprocessing.enabled ) {

					clipPosition.x = sunPosition.x;
					clipPosition.y = sunPosition.y;
					clipPosition.z = sunPosition.z;
					clipPosition.w = 1;

					clipPosition.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

					// perspective divide (produce NDC space)

					clipPosition.x /= clipPosition.w;
					clipPosition.y /= clipPosition.w;

					screenSpacePosition.x = ( clipPosition.x + 1 ) / 2; // transform from [-1,1] to [0,1]
					screenSpacePosition.y = ( clipPosition.y + 1 ) / 2; // transform from [-1,1] to [0,1]
					screenSpacePosition.z = clipPosition.z; // needs to stay in clip space for visibility checks

					// Give it to the god-ray and sun shaders

					postprocessing.godrayGenUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );
					postprocessing.godraysFakeSunUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );

					// -- Draw sky and sun --

					// Clear colors and depths, will clear to sky color

					renderer.setRenderTarget( postprocessing.rtTextureColors );
					renderer.clear( true, true, false );

					// Sun render. Runs a shader that gives a brightness based on the screen
					// space distance to the sun. Not very efficient, so i make a scissor
					// rectangle around the suns position to avoid rendering surrounding pixels.

					const sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
					const sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

					screenSpacePosition.x *= window.innerWidth;
					screenSpacePosition.y *= window.innerHeight;

					renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
					renderer.setScissorTest( true );

					postprocessing.godraysFakeSunUniforms[ 'fAspect' ].value = window.innerWidth / window.innerHeight;

					postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
					renderer.setRenderTarget( postprocessing.rtTextureColors );
					renderer.render( postprocessing.scene, postprocessing.camera );

					renderer.setScissorTest( false );

					// -- Draw scene objects --

					// Colors

					scene.overrideMaterial = null;
					renderer.setRenderTarget( postprocessing.rtTextureColors );
					renderer.render( scene, camera );

					// Depth

					scene.overrideMaterial = materialDepth;
					renderer.setRenderTarget( postprocessing.rtTextureDepth );
					renderer.clear();
					renderer.render( scene, camera );

					//

					postprocessing.godrayMaskUniforms[ 'tInput' ].value = postprocessing.rtTextureDepth.texture;

					postprocessing.scene.overrideMaterial = postprocessing.materialGodraysDepthMask;
					renderer.setRenderTarget( postprocessing.rtTextureDepthMask );
					renderer.render( postprocessing.scene, postprocessing.camera );

					// -- Render god-rays --

					// Maximum length of god-rays (in texture space [0,1]X[0,1])

					const filterLen = 1.0;

					// Samples taken by filter

					const TAPS_PER_PASS = 6.0;

					// Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
					// would start with a small filter support and grow to large. however
					// the large-to-small order produces less objectionable aliasing artifacts that
					// appear as a glimmer along the length of the beams

					// pass 1 - render into first ping-pong target
					filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );

					// pass 2 - render into second ping-pong target
					filterGodRays( postprocessing.rtTextureGodRays2.texture, postprocessing.rtTextureGodRays1, getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );

					// pass 3 - 1st RT
					filterGodRays( postprocessing.rtTextureGodRays1.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );

					// final pass - composite god-rays onto colors

					postprocessing.godrayCombineUniforms[ 'tColors' ].value = postprocessing.rtTextureColors.texture;
					postprocessing.godrayCombineUniforms[ 'tGodRays' ].value = postprocessing.rtTextureGodRays2.texture;

					postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

					renderer.setRenderTarget( null );
					renderer.render( postprocessing.scene, postprocessing.camera );
					postprocessing.scene.overrideMaterial = null;

				} else {

					renderer.setRenderTarget( null );
					renderer.clear();
					renderer.render( scene, camera );

				}

			}

		</script>
	</body>
</html>

examples/webgl_postprocessing_unreal_bloom.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - postprocessing - unreal bloom</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
		<style>
		#info > * {
			max-width: 650px;
			margin-left: auto;
			margin-right: auto;
		}
		</style>
	</head>
	<body>

		<div id="container"></div>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - Bloom pass by <a href="http://eduperiment.com" target="_blank" rel="noopener">Prashant Sharma</a> and <a href="https://clara.io" target="_blank" rel="noopener">Ben Houston</a>
			<br/>
			Model: <a href="https://blog.sketchfab.com/art-spotlight-primary-ion-drive/" target="_blank" rel="noopener">Primary Ion Drive</a> by
			<a href="http://mjmurdock.com/" target="_blank" rel="noopener">Mike Murdock</a>, CC Attribution.
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
			import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
			import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
			import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
			import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

			let camera, stats;
			let composer, renderer, mixer, clock;

			const params = {
				threshold: 0,
				strength: 1,
				radius: 0,
				exposure: 1
			};

			init();

			async function init() {

				const container = document.getElementById( 'container' );

				clock = new THREE.Clock();

				const scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
				camera.position.set( - 5, 2.5, - 3.5 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xcccccc ) );

				const pointLight = new THREE.PointLight( 0xffffff, 100 );
				camera.add( pointLight );

				const loader = new GLTFLoader();
				const gltf = await loader.loadAsync( 'models/gltf/PrimaryIonDrive.glb' );

				const model = gltf.scene;
				scene.add( model );

				mixer = new THREE.AnimationMixer( model );
				const clip = gltf.animations[ 0 ];
				mixer.clipAction( clip.optimize() ).play();

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.toneMapping = THREE.ReinhardToneMapping;
				container.appendChild( renderer.domElement );

				//

				const renderScene = new RenderPass( scene, camera );

				const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.threshold;
				bloomPass.strength = params.strength;
				bloomPass.radius = params.radius;

				const outputPass = new OutputPass();

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );
				composer.addPass( outputPass );

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 0.5;
				controls.minDistance = 3;
				controls.maxDistance = 8;

				//

				const gui = new GUI();

				const bloomFolder = gui.addFolder( 'bloom' );

				bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {

					bloomPass.threshold = Number( value );

				} );

				bloomFolder.add( params, 'strength', 0.0, 3.0 ).onChange( function ( value ) {

					bloomPass.strength = Number( value );

				} );

				gui.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

					bloomPass.radius = Number( value );

				} );

				const toneMappingFolder = gui.addFolder( 'tone mapping' );

				toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

					renderer.toneMappingExposure = Math.pow( value, 4.0 );

				} );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );
				composer.setSize( width, height );

			}

			function animate() {

				const delta = clock.getDelta();

				mixer.update( delta );

				stats.update();

				composer.render();

			}

		</script>

	</body>

</html>

examples/webgl_buffergeometry_drawrange.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - buffergeometry - lines drawrange</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - buffergeometry drawrange<br/>
			by <a href="https://twitter.com/fernandojsg">fernandojsg</a>
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

			let group;
			let container, stats;
			const particlesData = [];
			let camera, scene, renderer;
			let positions, colors;
			let particles;
			let pointCloud;
			let particlePositions;
			let linesMesh;

			const maxParticleCount = 1000;
			let particleCount = 500;
			const r = 800;
			const rHalf = r / 2;

			const effectController = {
				showDots: true,
				showLines: true,
				minDistance: 150,
				limitConnections: false,
				maxConnections: 20,
				particleCount: 500
			};

			init();

			function initGUI() {

				const gui = new GUI();

				gui.add( effectController, 'showDots' ).onChange( function ( value ) {

					pointCloud.visible = value;

				} );
				gui.add( effectController, 'showLines' ).onChange( function ( value ) {

					linesMesh.visible = value;

				} );
				gui.add( effectController, 'minDistance', 10, 300 );
				gui.add( effectController, 'limitConnections' );
				gui.add( effectController, 'maxConnections', 0, 30, 1 );
				gui.add( effectController, 'particleCount', 0, maxParticleCount, 1 ).onChange( function ( value ) {

					particleCount = value;
					particles.setDrawRange( 0, particleCount );

				} );

			}

			function init() {

				initGUI();

				container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
				camera.position.z = 1750;

				const controls = new OrbitControls( camera, container );
				controls.minDistance = 1000;
				controls.maxDistance = 3000;

				scene = new THREE.Scene();


				group = new THREE.Group();
				scene.add( group );

				const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) ) );
				helper.material.color.setHex( 0x474747 );
				helper.material.blending = THREE.AdditiveBlending;
				helper.material.transparent = true;
				group.add( helper );

				const segments = maxParticleCount * maxParticleCount;

				positions = new Float32Array( segments * 3 );
				colors = new Float32Array( segments * 3 );

				const pMaterial = new THREE.PointsMaterial( {
					color: 0xFFFFFF,
					size: 3,
					blending: THREE.AdditiveBlending,
					transparent: true,
					sizeAttenuation: false
				} );

				particles = new THREE.BufferGeometry();
				particlePositions = new Float32Array( maxParticleCount * 3 );

				for ( let i = 0; i < maxParticleCount; i ++ ) {

					const x = Math.random() * r - r / 2;
					const y = Math.random() * r - r / 2;
					const z = Math.random() * r - r / 2;

					particlePositions[ i * 3 ] = x;
					particlePositions[ i * 3 + 1 ] = y;
					particlePositions[ i * 3 + 2 ] = z;

					// add it to the geometry
					particlesData.push( {
						velocity: new THREE.Vector3( - 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2 ),
						numConnections: 0
					} );

				}

				particles.setDrawRange( 0, particleCount );
				particles.setAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

				// create the particle system
				pointCloud = new THREE.Points( particles, pMaterial );
				group.add( pointCloud );

				const geometry = new THREE.BufferGeometry();

				geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
				geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

				geometry.computeBoundingSphere();

				geometry.setDrawRange( 0, 0 );

				const material = new THREE.LineBasicMaterial( {
					vertexColors: true,
					blending: THREE.AdditiveBlending,
					transparent: true
				} );

				linesMesh = new THREE.LineSegments( geometry, material );
				group.add( linesMesh );

				//

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				let vertexpos = 0;
				let colorpos = 0;
				let numConnected = 0;

				for ( let i = 0; i < particleCount; i ++ )
					particlesData[ i ].numConnections = 0;

				for ( let i = 0; i < particleCount; i ++ ) {

					// get the particle
					const particleData = particlesData[ i ];

					particlePositions[ i * 3 ] += particleData.velocity.x;
					particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
					particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

					if ( particlePositions[ i * 3 + 1 ] < - rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
						particleData.velocity.y = - particleData.velocity.y;

					if ( particlePositions[ i * 3 ] < - rHalf || particlePositions[ i * 3 ] > rHalf )
						particleData.velocity.x = - particleData.velocity.x;

					if ( particlePositions[ i * 3 + 2 ] < - rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
						particleData.velocity.z = - particleData.velocity.z;

					if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
						continue;

					// Check collision
					for ( let j = i + 1; j < particleCount; j ++ ) {

						const particleDataB = particlesData[ j ];
						if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
							continue;

						const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
						const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
						const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
						const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

						if ( dist < effectController.minDistance ) {

							particleData.numConnections ++;
							particleDataB.numConnections ++;

							const alpha = 1.0 - dist / effectController.minDistance;

							positions[ vertexpos ++ ] = particlePositions[ i * 3 ];
							positions[ vertexpos ++ ] = particlePositions[ i * 3 + 1 ];
							positions[ vertexpos ++ ] = particlePositions[ i * 3 + 2 ];

							positions[ vertexpos ++ ] = particlePositions[ j * 3 ];
							positions[ vertexpos ++ ] = particlePositions[ j * 3 + 1 ];
							positions[ vertexpos ++ ] = particlePositions[ j * 3 + 2 ];

							colors[ colorpos ++ ] = alpha;
							colors[ colorpos ++ ] = alpha;
							colors[ colorpos ++ ] = alpha;

							colors[ colorpos ++ ] = alpha;
							colors[ colorpos ++ ] = alpha;
							colors[ colorpos ++ ] = alpha;

							numConnected ++;

						}

					}

				}


				linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
				linesMesh.geometry.attributes.position.needsUpdate = true;
				linesMesh.geometry.attributes.color.needsUpdate = true;

				pointCloud.geometry.attributes.position.needsUpdate = true;

				render();

				stats.update();

			}

			function render() {

				const time = Date.now() * 0.001;

				group.rotation.y = time * 0.1;
				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgl_gpgpu_protoplanet.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgl - gpgpu - protoplanet</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - <span id="protoplanets"></span> webgl gpgpu debris
		</div>

		<!-- Fragment shader for protoplanet's position -->
		<script id="computeShaderPosition" type="x-shader/x-fragment">

			#define delta ( 1.0 / 60.0 )

			void main() {

				vec2 uv = gl_FragCoord.xy / resolution.xy;

				vec4 tmpPos = texture2D( texturePosition, uv );
				vec3 pos = tmpPos.xyz;

				vec4 tmpVel = texture2D( textureVelocity, uv );
				vec3 vel = tmpVel.xyz;
				float mass = tmpVel.w;

				if ( mass == 0.0 ) {
					vel = vec3( 0.0 );
				}

				// Dynamics
				pos += vel * delta;

				gl_FragColor = vec4( pos, 1.0 );

			}

		</script>

		<!-- Fragment shader for protoplanet's velocity -->
		<script id="computeShaderVelocity" type="x-shader/x-fragment">

			// For PI declaration:
			#include <common>

			#define delta ( 1.0 / 60.0 )

			uniform float gravityConstant;
			uniform float density;

			const float width = resolution.x;
			const float height = resolution.y;

			float radiusFromMass( float mass ) {
				// Calculate radius of a sphere from mass and density
				return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
			}

			void main()	{

				vec2 uv = gl_FragCoord.xy / resolution.xy;
				float idParticle = uv.y * resolution.x + uv.x;

				vec4 tmpPos = texture2D( texturePosition, uv );
				vec3 pos = tmpPos.xyz;

				vec4 tmpVel = texture2D( textureVelocity, uv );
				vec3 vel = tmpVel.xyz;
				float mass = tmpVel.w;

				if ( mass > 0.0 ) {

					float radius = radiusFromMass( mass );

					vec3 acceleration = vec3( 0.0 );

					// Gravity interaction
					for ( float y = 0.0; y < height; y++ ) {

						for ( float x = 0.0; x < width; x++ ) {

							vec2 secondParticleCoords = vec2( x + 0.5, y + 0.5 ) / resolution.xy;
							vec3 pos2 = texture2D( texturePosition, secondParticleCoords ).xyz;
							vec4 velTemp2 = texture2D( textureVelocity, secondParticleCoords );
							vec3 vel2 = velTemp2.xyz;
							float mass2 = velTemp2.w;

							float idParticle2 = secondParticleCoords.y * resolution.x + secondParticleCoords.x;

							if ( idParticle == idParticle2 ) {
								continue;
							}

							if ( mass2 == 0.0 ) {
								continue;
							}

							vec3 dPos = pos2 - pos;
							float distance = length( dPos );
							float radius2 = radiusFromMass( mass2 );

							if ( distance == 0.0 ) {
								continue;
							}

							// Checks collision

							if ( distance < radius + radius2 ) {

								if ( idParticle < idParticle2 ) {

									// This particle is aggregated by the other
									vel = ( vel * mass + vel2 * mass2 ) / ( mass + mass2 );
									mass += mass2;
									radius = radiusFromMass( mass );

								}
								else {

									// This particle dies
									mass = 0.0;
									radius = 0.0;
									vel = vec3( 0.0 );
									break;

								}

							}

							float distanceSq = distance * distance;

							float gravityField = gravityConstant * mass2 / distanceSq;

							gravityField = min( gravityField, 1000.0 );

							acceleration += gravityField * normalize( dPos );

						}

						if ( mass == 0.0 ) {
							break;
						}
					}

					// Dynamics
					vel += delta * acceleration;

				}

				gl_FragColor = vec4( vel, mass );

			}

		</script>

		<!-- Particles vertex shader -->
		<script type="x-shader/x-vertex" id="particleVertexShader">

			// For PI declaration:
			#include <common>

			uniform sampler2D texturePosition;
			uniform sampler2D textureVelocity;

			uniform float cameraConstant;
			uniform float density;

			varying vec4 vColor;

			float radiusFromMass( float mass ) {
				// Calculate radius of a sphere from mass and density
				return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
			}


			void main() {


				vec4 posTemp = texture2D( texturePosition, uv );
				vec3 pos = posTemp.xyz;

				vec4 velTemp = texture2D( textureVelocity, uv );
				vec3 vel = velTemp.xyz;
				float mass = velTemp.w;

				vColor = vec4( 1.0, mass / 250.0, 0.0, 1.0 );

				vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

				// Calculate radius of a sphere from mass and density
				//float radius = pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
				float radius = radiusFromMass( mass );

				// Apparent size in pixels
				if ( mass == 0.0 ) {
					gl_PointSize = 0.0;
				}
				else {
					gl_PointSize = radius * cameraConstant / ( - mvPosition.z );
				}

				gl_Position = projectionMatrix * mvPosition;

			}

		</script>

		<!-- Particles fragment shader -->
		<script type="x-shader/x-fragment" id="particleFragmentShader">

			varying vec4 vColor;

			void main() {

				if ( vColor.y == 0.0 ) discard;

				float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
				if ( f > 0.5 ) {
					discard;
				}
				gl_FragColor = vColor;

			}

		</script>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.module.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

			// Texture width for simulation (each texel is a debris particle)
			const WIDTH = 64;

			let container, stats;
			let camera, scene, renderer, geometry;

			const PARTICLES = WIDTH * WIDTH;

			let gpuCompute;
			let velocityVariable;
			let positionVariable;
			let velocityUniforms;
			let particleUniforms;
			let effectController;

			init();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 5, 15000 );
				camera.position.y = 120;
				camera.position.z = 400;

				scene = new THREE.Scene();

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				container.appendChild( renderer.domElement );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 100;
				controls.maxDistance = 1000;

				effectController = {
					// Can be changed dynamically
					gravityConstant: 100.0,
					density: 0.45,

					// Must restart simulation
					radius: 300,
					height: 8,
					exponent: 0.4,
					maxMass: 15.0,
					velocity: 70,
					velocityExponent: 0.2,
					randVelocity: 0.001
				};

				initComputeRenderer();

				stats = new Stats();
				container.appendChild( stats.dom );

				window.addEventListener( 'resize', onWindowResize );

				initGUI();

				initProtoplanets();

				dynamicValuesChanger();

			}

			function initComputeRenderer() {

				gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

				const dtPosition = gpuCompute.createTexture();
				const dtVelocity = gpuCompute.createTexture();

				fillTextures( dtPosition, dtVelocity );

				velocityVariable = gpuCompute.addVariable( 'textureVelocity', document.getElementById( 'computeShaderVelocity' ).textContent, dtVelocity );
				positionVariable = gpuCompute.addVariable( 'texturePosition', document.getElementById( 'computeShaderPosition' ).textContent, dtPosition );

				gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
				gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

				velocityUniforms = velocityVariable.material.uniforms;

				velocityUniforms[ 'gravityConstant' ] = { value: 0.0 };
				velocityUniforms[ 'density' ] = { value: 0.0 };

				const error = gpuCompute.init();

				if ( error !== null ) {

					console.error( error );

				}

			}

			function restartSimulation() {

				const dtPosition = gpuCompute.createTexture();
				const dtVelocity = gpuCompute.createTexture();

				fillTextures( dtPosition, dtVelocity );

				gpuCompute.renderTexture( dtPosition, positionVariable.renderTargets[ 0 ] );
				gpuCompute.renderTexture( dtPosition, positionVariable.renderTargets[ 1 ] );
				gpuCompute.renderTexture( dtVelocity, velocityVariable.renderTargets[ 0 ] );
				gpuCompute.renderTexture( dtVelocity, velocityVariable.renderTargets[ 1 ] );

			}

			function initProtoplanets() {

				geometry = new THREE.BufferGeometry();

				const positions = new Float32Array( PARTICLES * 3 );
				let p = 0;

				for ( let i = 0; i < PARTICLES; i ++ ) {

					positions[ p ++ ] = ( Math.random() * 2 - 1 ) * effectController.radius;
					positions[ p ++ ] = 0; //( Math.random() * 2 - 1 ) * effectController.radius;
					positions[ p ++ ] = ( Math.random() * 2 - 1 ) * effectController.radius;

				}

				const uvs = new Float32Array( PARTICLES * 2 );
				p = 0;

				for ( let j = 0; j < WIDTH; j ++ ) {

					for ( let i = 0; i < WIDTH; i ++ ) {

						uvs[ p ++ ] = i / ( WIDTH - 1 );
						uvs[ p ++ ] = j / ( WIDTH - 1 );

					}

				}

				geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
				geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

				particleUniforms = {
					'texturePosition': { value: null },
					'textureVelocity': { value: null },
					'cameraConstant': { value: getCameraConstant( camera ) },
					'density': { value: 0.0 }
				};

				// THREE.ShaderMaterial
				const material = new THREE.ShaderMaterial( {
					uniforms: particleUniforms,
					vertexShader: document.getElementById( 'particleVertexShader' ).textContent,
					fragmentShader: document.getElementById( 'particleFragmentShader' ).textContent
				} );

				const particles = new THREE.Points( geometry, material );
				particles.matrixAutoUpdate = false;
				particles.updateMatrix();

				scene.add( particles );

			}

			function fillTextures( texturePosition, textureVelocity ) {

				const posArray = texturePosition.image.data;
				const velArray = textureVelocity.image.data;

				const radius = effectController.radius;
				const height = effectController.height;
				const exponent = effectController.exponent;
				const maxMass = effectController.maxMass * 1024 / PARTICLES;
				const maxVel = effectController.velocity;
				const velExponent = effectController.velocityExponent;
				const randVel = effectController.randVelocity;

				for ( let k = 0, kl = posArray.length; k < kl; k += 4 ) {

					// Position
					let x, z, rr;

					do {

						x = ( Math.random() * 2 - 1 );
						z = ( Math.random() * 2 - 1 );
						rr = x * x + z * z;

					} while ( rr > 1 );

					rr = Math.sqrt( rr );

					const rExp = radius * Math.pow( rr, exponent );

					// Velocity
					const vel = maxVel * Math.pow( rr, velExponent );

					const vx = vel * z + ( Math.random() * 2 - 1 ) * randVel;
					const vy = ( Math.random() * 2 - 1 ) * randVel * 0.05;
					const vz = - vel * x + ( Math.random() * 2 - 1 ) * randVel;

					x *= rExp;
					z *= rExp;
					const y = ( Math.random() * 2 - 1 ) * height;

					const mass = Math.random() * maxMass + 1;

					// Fill in texture values
					posArray[ k + 0 ] = x;
					posArray[ k + 1 ] = y;
					posArray[ k + 2 ] = z;
					posArray[ k + 3 ] = 1;

					velArray[ k + 0 ] = vx;
					velArray[ k + 1 ] = vy;
					velArray[ k + 2 ] = vz;
					velArray[ k + 3 ] = mass;

				}

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				particleUniforms[ 'cameraConstant' ].value = getCameraConstant( camera );

			}

			function dynamicValuesChanger() {

				velocityUniforms[ 'gravityConstant' ].value = effectController.gravityConstant;
				velocityUniforms[ 'density' ].value = effectController.density;
				particleUniforms[ 'density' ].value = effectController.density;

			}

			function initGUI() {

				const gui = new GUI( { width: 280 } );

				const folder1 = gui.addFolder( 'Dynamic parameters' );

				folder1.add( effectController, 'gravityConstant', 0.0, 1000.0, 0.05 ).onChange( dynamicValuesChanger );
				folder1.add( effectController, 'density', 0.0, 10.0, 0.001 ).onChange( dynamicValuesChanger );

				const folder2 = gui.addFolder( 'Static parameters' );

				folder2.add( effectController, 'radius', 10.0, 1000.0, 1.0 );
				folder2.add( effectController, 'height', 0.0, 50.0, 0.01 );
				folder2.add( effectController, 'exponent', 0.0, 2.0, 0.001 );
				folder2.add( effectController, 'maxMass', 1.0, 50.0, 0.1 );
				folder2.add( effectController, 'velocity', 0.0, 150.0, 0.1 );
				folder2.add( effectController, 'velocityExponent', 0.0, 1.0, 0.01 );
				folder2.add( effectController, 'randVelocity', 0.0, 50.0, 0.1 );

				const buttonRestart = {
					restartSimulation: function () {

						restartSimulation();

					}
				};

				folder2.add( buttonRestart, 'restartSimulation' );

				folder1.open();
				folder2.open();

			}

			function getCameraConstant( camera ) {

				return window.innerHeight / ( Math.tan( THREE.MathUtils.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );

			}


			function animate() {

				render();
				stats.update();

			}

			function render() {

				gpuCompute.compute();

				particleUniforms[ 'texturePosition' ].value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
				particleUniforms[ 'textureVelocity' ].value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgpu_tsl_vfx_linkedparticles.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgpu - VFX Linked particles</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js webgpu</a> - VFX Linked particles
			<br>
			Based on <a href="https://github.com/ULuIQ12/webgpu-tsl-linkedparticles" target="_blank" rel="noopener">this experiment</a> by Christophe Choffel
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.webgpu.js",
					"three/webgpu": "../build/three.webgpu.js",
					"three/tsl": "../build/three.tsl.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';
			import { atan, cos, float, max, min, mix, PI, PI2, sin, vec2, vec3, color, Fn, hash, hue, If, instanceIndex, Loop, mx_fractal_noise_float, mx_fractal_noise_vec3, pass, pcurve, storage, deltaTime, time, uv, uniform, step } from 'three/tsl';
			import { bloom } from 'three/addons/tsl/display/BloomNode.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { Timer } from 'three/addons/misc/Timer.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import WebGPU from 'three/addons/capabilities/WebGPU.js';

			let camera, scene, renderer, postProcessing, controls, timer, light;

			let updateParticles, spawnParticles; // TSL compute nodes
			let getInstanceColor; // TSL function

			const screenPointer = new THREE.Vector2();
			const scenePointer = new THREE.Vector3();
			const raycastPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 );
			const raycaster = new THREE.Raycaster();

			const nbParticles = Math.pow( 2, 13 );

			const timeScale = uniform( 1.0 );
			const particleLifetime = uniform( 0.5 );
			const particleSize = uniform( 1.0 );
			const linksWidth = uniform( 0.005 );

			const colorOffset = uniform( 0.0 );
			const colorVariance = uniform( 2.0 );
			const colorRotationSpeed = uniform( 1.0 );

			const spawnIndex = uniform( 0 );
			const nbToSpawn = uniform( 5 );
			const spawnPosition = uniform( vec3( 0.0 ) );
			const previousSpawnPosition = uniform( vec3( 0.0 ) );

			const turbFrequency = uniform( 0.5 );
			const turbAmplitude = uniform( 0.5 );
			const turbOctaves = uniform( 2 );
			const turbLacunarity = uniform( 2.0 );
			const turbGain = uniform( 0.5 );
			const turbFriction = uniform( 0.01 );

			init();

			function init() {

				if ( WebGPU.isAvailable() === false ) {

					document.body.appendChild( WebGPU.getErrorMessage() );

					throw new Error( 'No WebGPU support' );

				}

				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 200 );
				camera.position.set( 0, 0, 10 );

				scene = new THREE.Scene();

				timer = new Timer();
				timer.connect( document );

				// renderer

				renderer = new THREE.WebGPURenderer( { antialias: true } );
				renderer.setClearColor( 0x14171a );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				document.body.appendChild( renderer.domElement );

				// TSL function
				// current color from index
				getInstanceColor = /*#__PURE__*/ Fn( ( [ i ] ) => {

					return hue( color( 0x0000ff ), colorOffset.add( mx_fractal_noise_float( i.toFloat().mul( .1 ), 2, 2.0, 0.5, colorVariance ) ) );

				} );

				// Particles
				// storage buffers
				const particlePositions = storage( new THREE.StorageInstancedBufferAttribute( nbParticles, 4 ), 'vec4', nbParticles );
				const particleVelocities = storage( new THREE.StorageInstancedBufferAttribute( nbParticles, 4 ), 'vec4', nbParticles );

				// init particles buffers
				renderer.computeAsync( /*#__PURE__*/ Fn( () => {

					particlePositions.element( instanceIndex ).xyz.assign( vec3( 10000.0 ) );
					particlePositions.element( instanceIndex ).w.assign( vec3( - 1.0 ) ); // life is stored in w component; x<0 means dead

				} )().compute( nbParticles ) );

				// particles output
				const particleQuadSize = 0.05;
				const particleGeom = new THREE.PlaneGeometry( particleQuadSize, particleQuadSize );

				const particleMaterial = new THREE.SpriteNodeMaterial();
				particleMaterial.blending = THREE.AdditiveBlending;
				particleMaterial.depthWrite = false;
				particleMaterial.positionNode = particlePositions.toAttribute();
				particleMaterial.scaleNode = vec2( particleSize );
				particleMaterial.rotationNode = atan( particleVelocities.toAttribute().y, particleVelocities.toAttribute().x );

				particleMaterial.colorNode = /*#__PURE__*/ Fn( () => {

					const life = particlePositions.toAttribute().w;
					const modLife = pcurve( life.oneMinus(), 8.0, 1.0 );
					const pulse = pcurve(
						sin( hash( instanceIndex ).mul( PI2 ).add( time.mul( 0.5 ).mul( PI2 ) ) ).mul( 0.5 ).add( 0.5 ),
						0.25,
						0.25
					).mul( 10.0 ).add( 1.0 );

					return getInstanceColor( instanceIndex ).mul( pulse.mul( modLife ) );

				} )();

				particleMaterial.opacityNode = /*#__PURE__*/ Fn( () => {

					const circle = step( uv().xy.sub( 0.5 ).length(), 0.5 );
					const life = particlePositions.toAttribute().w;

					return circle.mul( life );

				} )();

				const particleMesh = new THREE.InstancedMesh( particleGeom, particleMaterial, nbParticles );
				particleMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
				particleMesh.frustumCulled = false;

				scene.add( particleMesh );

				// Links between particles
				// first, we define the indices for the links, 2 quads per particle, the indexation is fixed
				const linksIndices = [];
				for ( let i = 0; i < nbParticles; i ++ ) {

					const baseIndex = i * 8;
					for ( let j = 0; j < 2; j ++ ) {

						const offset = baseIndex + j * 4;
						linksIndices.push( offset, offset + 1, offset + 2, offset, offset + 2, offset + 3 );

					}

				}

				// storage buffers attributes for the links
				const nbVertices = nbParticles * 8;
				const linksVerticesSBA = new THREE.StorageBufferAttribute( nbVertices, 4 );
				const linksColorsSBA = new THREE.StorageBufferAttribute( nbVertices, 4 );

				// links output
				const linksGeom = new THREE.BufferGeometry();
				linksGeom.setAttribute( 'position', linksVerticesSBA );
				linksGeom.setAttribute( 'color', linksColorsSBA );
				linksGeom.setIndex( linksIndices );

				const linksMaterial = new THREE.MeshBasicNodeMaterial();
				linksMaterial.vertexColors = true;
				linksMaterial.side = THREE.DoubleSide;
				linksMaterial.transparent = true;
				linksMaterial.depthWrite = false;
				linksMaterial.depthTest = false;
				linksMaterial.blending = THREE.AdditiveBlending;
				linksMaterial.opacityNode = storage( linksColorsSBA, 'vec4', linksColorsSBA.count ).toAttribute().w;

				const linksMesh = new THREE.Mesh( linksGeom, linksMaterial );
				linksMesh.frustumCulled = false;
				scene.add( linksMesh );

				// compute nodes
				updateParticles = /*#__PURE__*/ Fn( () => {

					const position = particlePositions.element( instanceIndex ).xyz;
					const life = particlePositions.element( instanceIndex ).w;
					const velocity = particleVelocities.element( instanceIndex ).xyz;
					const dt = deltaTime.mul( 0.1 ).mul( timeScale );

					If( life.greaterThan( 0.0 ), () => {

						// first we update the particles positions and velocities
						// velocity comes from a turbulence field, and is multiplied by the particle lifetime so that it slows down over time
						const localVel = mx_fractal_noise_vec3( position.mul( turbFrequency ), turbOctaves, turbLacunarity, turbGain, turbAmplitude ).mul( life.add( .01 ) );
						velocity.addAssign( localVel );
						velocity.mulAssign( turbFriction.oneMinus() );
						position.addAssign( velocity.mul( dt ) );

						// then we decrease the lifetime
						life.subAssign( dt.mul( particleLifetime.reciprocal() ) );

						// then we find the two closest particles and set a quad to each of them
						const closestDist1 = float( 10000.0 ).toVar();
						const closestPos1 = vec3( 0.0 ).toVar();
						const closestLife1 = float( 0.0 ).toVar();
						const closestDist2 = float( 10000.0 ).toVar();
						const closestPos2 = vec3( 0.0 ).toVar();
						const closestLife2 = float( 0.0 ).toVar();

						Loop( nbParticles, ( { i } ) => {

							const otherPart = particlePositions.element( i );

							If( i.notEqual( instanceIndex ).and( otherPart.w.greaterThan( 0.0 ) ), () => { // if not self and other particle is alive

								const otherPosition = otherPart.xyz;
								const dist = position.sub( otherPosition ).lengthSq();
								const moreThanZero = dist.greaterThan( 0.0 );

								If( dist.lessThan( closestDist1 ).and( moreThanZero ), () => {

									closestDist1.assign( dist );
									closestPos1.assign( otherPosition.xyz );
									closestLife1.assign( otherPart.w );

								} ).ElseIf( dist.lessThan( closestDist2 ).and( moreThanZero ), () => {

									closestDist2.assign( dist );
									closestPos2.assign( otherPosition.xyz );
									closestLife2.assign( otherPart.w );

								} );

							} );

						} );

						// then we update the links correspondingly
						const linksPositions = storage( linksVerticesSBA, 'vec4', linksVerticesSBA.count );
						const linksColors = storage( linksColorsSBA, 'vec4', linksColorsSBA.count );
						const firstLinkIndex = instanceIndex.mul( 8 );
						const secondLinkIndex = firstLinkIndex.add( 4 );

						// positions link 1
						linksPositions.element( firstLinkIndex ).xyz.assign( position );
						linksPositions.element( firstLinkIndex ).y.addAssign( linksWidth );
						linksPositions.element( firstLinkIndex.add( 1 ) ).xyz.assign( position );
						linksPositions.element( firstLinkIndex.add( 1 ) ).y.addAssign( linksWidth.negate() );
						linksPositions.element( firstLinkIndex.add( 2 ) ).xyz.assign( closestPos1 );
						linksPositions.element( firstLinkIndex.add( 2 ) ).y.addAssign( linksWidth.negate() );
						linksPositions.element( firstLinkIndex.add( 3 ) ).xyz.assign( closestPos1 );
						linksPositions.element( firstLinkIndex.add( 3 ) ).y.addAssign( linksWidth );

						// positions link 2
						linksPositions.element( secondLinkIndex ).xyz.assign( position );
						linksPositions.element( secondLinkIndex ).y.addAssign( linksWidth );
						linksPositions.element( secondLinkIndex.add( 1 ) ).xyz.assign( position );
						linksPositions.element( secondLinkIndex.add( 1 ) ).y.addAssign( linksWidth.negate() );
						linksPositions.element( secondLinkIndex.add( 2 ) ).xyz.assign( closestPos2 );
						linksPositions.element( secondLinkIndex.add( 2 ) ).y.addAssign( linksWidth.negate() );
						linksPositions.element( secondLinkIndex.add( 3 ) ).xyz.assign( closestPos2 );
						linksPositions.element( secondLinkIndex.add( 3 ) ).y.addAssign( linksWidth );

						// colors are the same for all vertices of both quads
						const linkColor = getInstanceColor( instanceIndex );

						// store the minimum lifetime of the closest particles in the w component of colors
						const l1 = max( 0.0, min( closestLife1, life ) ).pow( 0.8 ); // pow is here to apply a slight curve to the opacity
						const l2 = max( 0.0, min( closestLife2, life ) ).pow( 0.8 );

						Loop( 4, ( { i } ) => {

							linksColors.element( firstLinkIndex.add( i ) ).xyz.assign( linkColor );
							linksColors.element( firstLinkIndex.add( i ) ).w.assign( l1 );
							linksColors.element( secondLinkIndex.add( i ) ).xyz.assign( linkColor );
							linksColors.element( secondLinkIndex.add( i ) ).w.assign( l2 );

						} );

					} );

				} )().compute( nbParticles );

				spawnParticles = /*#__PURE__*/ Fn( () => {

					const particleIndex = spawnIndex.add( instanceIndex ).mod( nbParticles ).toInt();
					const position = particlePositions.element( particleIndex ).xyz;
					const life = particlePositions.element( particleIndex ).w;
					const velocity = particleVelocities.element( particleIndex ).xyz;

					life.assign( 1.0 ); // sets it alive

					// random spherical direction
					const rRange = float( 0.01 );
					const rTheta = hash( particleIndex ).mul( PI2 );
					const rPhi = hash( particleIndex.add( 1 ) ).mul( PI );
					const rx = sin( rTheta ).mul( cos( rPhi ) );
					const ry = sin( rTheta ).mul( sin( rPhi ) );
					const rz = cos( rTheta );
					const rDir = vec3( rx, ry, rz );

					// position is interpolated between the previous cursor position and the current one over the number of particles spawned
					const pos = mix( previousSpawnPosition, spawnPosition, instanceIndex.toFloat().div( nbToSpawn.sub( 1 ).toFloat() ).clamp() );
					position.assign( pos.add( rDir.mul( rRange ) ) );

					// start in that direction
					velocity.assign( rDir.mul( 5.0 ) );

				} )().compute( nbToSpawn.value );


				// background , an inverted icosahedron
				const backgroundGeom = new THREE.IcosahedronGeometry( 100, 5 ).applyMatrix4( new THREE.Matrix4().makeScale( - 1, 1, 1 ) );
				const backgroundMaterial = new THREE.MeshStandardNodeMaterial();
				backgroundMaterial.roughness = 0.4;
				backgroundMaterial.metalness = 0.9;
				backgroundMaterial.flatShading = true;
				backgroundMaterial.colorNode = color( 0x0 );

				const backgroundMesh = new THREE.Mesh( backgroundGeom, backgroundMaterial );
				scene.add( backgroundMesh );

				// light for the background
				light = new THREE.PointLight( 0xffffff, 3000 );
				scene.add( light );

				// post processing

				postProcessing = new THREE.PostProcessing( renderer );

				const scenePass = pass( scene, camera );
				const scenePassColor = scenePass.getTextureNode( 'output' );

				const bloomPass = bloom( scenePassColor, 0.75, 0.1, 0.5 );

				postProcessing.outputNode = scenePassColor.add( bloomPass );

				// controls

				controls = new OrbitControls( camera, renderer.domElement );
				controls.enableDamping = true;
				controls.autoRotate = true;
				controls.maxDistance = 75;
				window.addEventListener( 'resize', onWindowResize );

				// pointer handling

				window.addEventListener( 'pointermove', onPointerMove );

				// GUI

				const gui = new GUI();

				gui.add( controls, 'autoRotate' ).name( 'Auto Rotate' );
				gui.add( controls, 'autoRotateSpeed', - 10.0, 10.0, 0.01 ).name( 'Auto Rotate Speed' );

				const partFolder = gui.addFolder( 'Particles' );
				partFolder.add( timeScale, 'value', 0.0, 4.0, 0.01 ).name( 'timeScale' );
				partFolder.add( nbToSpawn, 'value', 1, 100, 1 ).name( 'Spawn rate' );
				partFolder.add( particleSize, 'value', 0.01, 3.0, 0.01 ).name( 'Size' );
				partFolder.add( particleLifetime, 'value', 0.01, 2.0, 0.01 ).name( 'Lifetime' );
				partFolder.add( linksWidth, 'value', 0.001, 0.1, 0.001 ).name( 'Links width' );
				partFolder.add( colorVariance, 'value', 0.0, 10.0, 0.01 ).name( 'Color variance' );
				partFolder.add( colorRotationSpeed, 'value', 0.0, 5.0, 0.01 ).name( 'Color rotation speed' );

				const turbFolder = gui.addFolder( 'Turbulence' );
				turbFolder.add( turbFriction, 'value', 0.0, 0.3, 0.01 ).name( 'Friction' );
				turbFolder.add( turbFrequency, 'value', 0.0, 1.0, 0.01 ).name( 'Frequency' );
				turbFolder.add( turbAmplitude, 'value', 0.0, 10.0, 0.01 ).name( 'Amplitude' );
				turbFolder.add( turbOctaves, 'value', 1, 9, 1 ).name( 'Octaves' );
				turbFolder.add( turbLacunarity, 'value', 1.0, 5.0, 0.01 ).name( 'Lacunarity' );
				turbFolder.add( turbGain, 'value', 0.0, 1.0, 0.01 ).name( 'Gain' );

				const bloomFolder = gui.addFolder( 'bloom' );
				bloomFolder.add( bloomPass.threshold, 'value', 0, 2.0, 0.01 ).name( 'Threshold' );
				bloomFolder.add( bloomPass.strength, 'value', 0, 10, 0.01 ).name( 'Strength' );
				bloomFolder.add( bloomPass.radius, 'value', 0, 1, 0.01 ).name( 'Radius' );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onPointerMove( e ) {

				screenPointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
				screenPointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			}

			function updatePointer() {

				raycaster.setFromCamera( screenPointer, camera );
				raycaster.ray.intersectPlane( raycastPlane, scenePointer );

			}

			function animate() {

				timer.update();

				// compute particles
				renderer.compute( updateParticles );
				renderer.compute( spawnParticles );

				// update particle index for next spawn
				spawnIndex.value = ( spawnIndex.value + nbToSpawn.value ) % nbParticles;

				// update raycast plane to face camera
				raycastPlane.normal.applyEuler( camera.rotation );
				updatePointer();

				// lerping spawn position
				previousSpawnPosition.value.copy( spawnPosition.value );
				spawnPosition.value.lerp( scenePointer, 0.1 );

				// rotating colors
				colorOffset.value += timer.getDelta() * colorRotationSpeed.value * timeScale.value;

				const elapsedTime = timer.getElapsed();
				light.position.set(
					Math.sin( elapsedTime * 0.5 ) * 30,
					Math.cos( elapsedTime * 0.3 ) * 30,
					Math.sin( elapsedTime * 0.2 ) * 30,
				);

				controls.update();

				postProcessing.render();

			}

		</script>
	</body>
</html>

examples/webgpu_tsl_raging_sea.html

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgpu - raging sea</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js webgpu</a> - raging sea
			<br>
			Based on <a href="https://threejs-journey.com/lessons/raging-sea" target="_blank" rel="noopener">Three.js Journey</a> lesson
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.webgpu.js",
					"three/webgpu": "../build/three.webgpu.js",
					"three/tsl": "../build/three.tsl.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';
			import { float, mx_noise_float, Loop, color, positionLocal, sin, vec2, vec3, mul, time, uniform, Fn, transformNormalToView } from 'three/tsl';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			let camera, scene, renderer, controls;

			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
				camera.position.set( 1.25, 1.25, 1.25 );

				scene = new THREE.Scene();

				// lights
			
				const directionalLight = new THREE.DirectionalLight( '#ffffff', 3 );
				directionalLight.position.set( - 4, 2, 0 );
				scene.add( directionalLight );

				// material

				const material = new THREE.MeshStandardNodeMaterial( { color: '#271442', roughness: 0.15 } );

				const emissiveColor = uniform( color( '#ff0a81' ) );
				const emissiveLow = uniform( - 0.25 );
				const emissiveHigh = uniform( 0.2 );
				const emissivePower = uniform( 7 );
				const largeWavesFrequency = uniform( vec2( 3, 1 ) );
				const largeWavesSpeed = uniform( 1.25 );
				const largeWavesMultiplier = uniform( 0.15 );
				const smallWavesIterations = uniform( 3 );
				const smallWavesFrequency = uniform( 2 );
				const smallWavesSpeed = uniform( 0.3 );
				const smallWavesMultiplier = uniform( 0.18 );
				const normalComputeShift = uniform( 0.01 );

				// TSL functions

				const wavesElevation = Fn( ( [ position ] ) => {

					// large waves

					const elevation = mul(
						sin( position.x.mul( largeWavesFrequency.x ).add( time.mul( largeWavesSpeed ) ) ),
						sin( position.z.mul( largeWavesFrequency.y ).add( time.mul( largeWavesSpeed ) ) ),
						largeWavesMultiplier
					).toVar();

					Loop( { start: float( 1 ), end: smallWavesIterations.add( 1 ) }, ( { i } ) => {

						const noiseInput = vec3(
							position.xz
								.add( 2 ) // avoids a-hole pattern
								.mul( smallWavesFrequency )
								.mul( i ),
							time.mul( smallWavesSpeed )
						);

						const wave = mx_noise_float( noiseInput, 1, 0 )
							.mul( smallWavesMultiplier )
							.div( i )
							.abs();

						elevation.subAssign( wave );

					} );

					return elevation;

				} );

				// position

				const elevation = wavesElevation( positionLocal );
				const position = positionLocal.add( vec3( 0, elevation, 0 ) );

				material.positionNode = position;

				// normals

				let positionA = positionLocal.add( vec3( normalComputeShift, 0, 0 ) );
				let positionB = positionLocal.add( vec3( 0, 0, normalComputeShift.negate() ) );

				positionA = positionA.add( vec3( 0, wavesElevation( positionA ), 0 ) );
				positionB = positionB.add( vec3( 0, wavesElevation( positionB ), 0 ) );

				const toA = positionA.sub( position ).normalize();
				const toB = positionB.sub( position ).normalize();
				const normal = toA.cross( toB );

				material.normalNode = transformNormalToView( normal );

				// emissive

				const emissive = elevation.remap( emissiveHigh, emissiveLow ).pow( emissivePower );
				material.emissiveNode = emissiveColor.mul( emissive );

				// mesh

				const geometry = new THREE.PlaneGeometry( 2, 2, 256, 256 );
				geometry.rotateX( - Math.PI * 0.5 );
				const mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				// debug

				const gui = new GUI();

				gui.addColor( { color: material.color.getHex( THREE.SRGBColorSpace ) }, 'color' ).name( 'color' ).onChange( value => material.color.set( value ) );
				gui.add( material, 'roughness', 0, 1, 0.001 );

				const colorGui = gui.addFolder( 'emissive' );
				colorGui.addColor( { color: emissiveColor.value.getHex( THREE.SRGBColorSpace ) }, 'color' ).name( 'color' ).onChange( value => emissiveColor.value.set( value ) );
				colorGui.add( emissiveLow, 'value', - 1, 0, 0.001 ).name( 'low' );
				colorGui.add( emissiveHigh, 'value', 0, 1, 0.001 ).name( 'high' );
				colorGui.add( emissivePower, 'value', 1, 10, 1 ).name( 'power' );

				const wavesGui = gui.addFolder( 'waves' );
				wavesGui.add( largeWavesSpeed, 'value', 0, 5 ).name( 'largeSpeed' );
				wavesGui.add( largeWavesMultiplier, 'value', 0, 1 ).name( 'largeMultiplier' );
				wavesGui.add( largeWavesFrequency.value, 'x', 0, 10 ).name( 'largeFrequencyX' );
				wavesGui.add( largeWavesFrequency.value, 'y', 0, 10 ).name( 'largeFrequencyY' );
				wavesGui.add( smallWavesIterations, 'value', 0, 5, 1 ).name( 'smallIterations' );
				wavesGui.add( smallWavesFrequency, 'value', 0, 10 ).name( 'smallFrequency' );
				wavesGui.add( smallWavesSpeed, 'value', 0, 1 ).name( 'smallSpeed' );
				wavesGui.add( smallWavesMultiplier, 'value', 0, 1 ).name( 'smallMultiplier' );
				wavesGui.add( normalComputeShift, 'value', 0, 0.1, 0.0001 ).name( 'normalComputeShift' );

				// renderer

				renderer = new THREE.WebGPURenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				document.body.appendChild( renderer.domElement );

				// controls

				controls = new OrbitControls( camera, renderer.domElement );
				controls.target.y = - 0.25;
				controls.enableDamping = true;
				controls.minDistance = 0.1;
				controls.maxDistance = 50;

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			async function animate() {
			
				controls.update();

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgpu_tsl_procedural_terrain.html

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgpu - procedural terrain</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js webgpu</a> - procedural terrain
			<br>
			Based on <a href="https://threejs-journey.com/lessons/procedural-terrain-shader" target="_blank" rel="noopener">Three.js Journey</a> lessons
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.webgpu.js",
					"three/webgpu": "../build/three.webgpu.js",
					"three/tsl": "../build/three.tsl.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';
			import { mx_noise_float, color, cross, dot, float, transformNormalToView, positionLocal, sign, step, Fn, uniform, varying, vec2, vec3, Loop } from 'three/tsl';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

			let camera, scene, renderer, controls, drag;

			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.set( - 10, 8, - 2.2 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x201919 );

				const gui = new GUI();

				// environment

				const rgbeLoader = new RGBELoader();
				rgbeLoader.load( './textures/equirectangular/pedestrian_overpass_1k.hdr', ( environmentMap ) => {

					environmentMap.mapping = THREE.EquirectangularReflectionMapping;

					scene.background = environmentMap;
					scene.backgroundBlurriness = 0.5;
					scene.environment = environmentMap;
			
				} );

				// lights
			
				const directionalLight = new THREE.DirectionalLight( '#ffffff', 2 );
				directionalLight.position.set( 6.25, 3, 4 );
				directionalLight.castShadow = true;
				directionalLight.shadow.mapSize.set( 1024, 1024 );
				directionalLight.shadow.camera.near = 0.1;
				directionalLight.shadow.camera.far = 30;
				directionalLight.shadow.camera.top = 8;
				directionalLight.shadow.camera.right = 8;
				directionalLight.shadow.camera.bottom = - 8;
				directionalLight.shadow.camera.left = - 8;
				directionalLight.shadow.normalBias = 0.05;
				directionalLight.shadow.bias = 0;
				scene.add( directionalLight );

				// terrain

				const material = new THREE.MeshStandardNodeMaterial( {
					metalness: 0,
					roughness: 0.5,
					color: '#85d534'
				} );

				const noiseIterations = uniform( 3 );
				const positionFrequency = uniform( 0.175 );
				const warpFrequency = uniform( 6 );
				const warpStrength = uniform( 1 );
				const strength = uniform( 10 );
				const offset = uniform( vec2( 0, 0 ) );
				const normalLookUpShift = uniform( 0.01 );
				const colorSand = uniform( color( '#ffe894' ) );
				const colorGrass = uniform( color( '#85d534' ) );
				const colorSnow = uniform( color( '#ffffff' ) );
				const colorRock = uniform( color( '#bfbd8d' ) );

				const vNormal = varying( vec3() );
				const vPosition = varying( vec3() );

				const terrainElevation = Fn( ( [ position ] ) => {

					const warpedPosition = position.add( offset ).toVar();
					warpedPosition.addAssign( mx_noise_float( warpedPosition.mul( positionFrequency ).mul( warpFrequency ), 1, 0 ).mul( warpStrength ) );
			
					const elevation = float( 0 ).toVar();
					Loop( { type: 'float', start: float( 1 ), end: noiseIterations.toFloat(), condition: '<=' }, ( { i } ) => {

						const noiseInput = warpedPosition.mul( positionFrequency ).mul( i.mul( 2 ) ).add( i.mul( 987 ) );
						const noise = mx_noise_float( noiseInput, 1, 0 ).div( i.add( 1 ).mul( 2 ) );
						elevation.addAssign( noise );
			
					} );

					const elevationSign = sign( elevation );
					elevation.assign( elevation.abs().pow( 2 ).mul( elevationSign ).mul( strength ) );

					return elevation;
			
				} );

				material.positionNode = Fn( () => {

					// neighbours positions

					const neighbourA = positionLocal.xyz.add( vec3( normalLookUpShift, 0.0, 0.0 ) ).toVar();
					const neighbourB = positionLocal.xyz.add( vec3( 0.0, 0.0, normalLookUpShift.negate() ) ).toVar();

					// elevations

					const position = positionLocal.xyz.toVar();
					const elevation = terrainElevation( positionLocal.xz );
					position.y.addAssign( elevation );
			
					neighbourA.y.addAssign( terrainElevation( neighbourA.xz ) );
					neighbourB.y.addAssign( terrainElevation( neighbourB.xz ) );

					// compute normal

					const toA = neighbourA.sub( position ).normalize();
					const toB = neighbourB.sub( position ).normalize();
					vNormal.assign( cross( toA, toB ) );

					// varyings

					vPosition.assign( position.add( vec3( offset.x, 0, offset.y ) ) );

					return position;
			
				} )();

				material.normalNode = transformNormalToView( vNormal );

				material.colorNode = Fn( () => {

					const finalColor = colorSand.toVar();

					// grass

					const grassMix = step( - 0.06, vPosition.y );
					finalColor.assign( grassMix.mix( finalColor, colorGrass ) );

					// rock

					const rockMix = step( 0.5, dot( vNormal, vec3( 0, 1, 0 ) ) ).oneMinus().mul( step( - 0.06, vPosition.y ) );
					finalColor.assign( rockMix.mix( finalColor, colorRock ) );

					// snow

					const snowThreshold = mx_noise_float( vPosition.xz.mul( 25 ), 1, 0 ).mul( 0.1 ).add( 0.45 );
					const snowMix = step( snowThreshold, vPosition.y );
					finalColor.assign( snowMix.mix( finalColor, colorSnow ) );

					return finalColor;
			
				} )();

				const geometry = new THREE.PlaneGeometry( 10, 10, 500, 500 );
				geometry.deleteAttribute( 'uv' );
				geometry.deleteAttribute( 'normal' );
				geometry.rotateX( - Math.PI * 0.5 );

				const terrain = new THREE.Mesh( geometry, material );
				terrain.receiveShadow = true;
				terrain.castShadow = true;
				scene.add( terrain );

				// debug

				const terrainGui = gui.addFolder( '🏔️ terrain' );

				terrainGui.add( noiseIterations, 'value', 0, 10, 1 ).name( 'noiseIterations' );
				terrainGui.add( positionFrequency, 'value', 0, 1, 0.001 ).name( 'positionFrequency' );
				terrainGui.add( strength, 'value', 0, 20, 0.001 ).name( 'strength' );
				terrainGui.add( warpFrequency, 'value', 0, 20, 0.001 ).name( 'warpFrequency' );
				terrainGui.add( warpStrength, 'value', 0, 2, 0.001 ).name( 'warpStrength' );

				terrainGui.addColor( { color: colorSand.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorSand' ).onChange( value => colorSand.value.set( value ) );
				terrainGui.addColor( { color: colorGrass.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorGrass' ).onChange( value => colorGrass.value.set( value ) );
				terrainGui.addColor( { color: colorSnow.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorSnow' ).onChange( value => colorSnow.value.set( value ) );
				terrainGui.addColor( { color: colorRock.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorRock' ).onChange( value => colorRock.value.set( value ) );

				// water
			
				const water = new THREE.Mesh(
					new THREE.PlaneGeometry( 10, 10, 1, 1 ),
					new THREE.MeshPhysicalMaterial( {
						transmission: 1,
						roughness: 0.5,
						ior: 1.333,
						color: '#4db2ff'
					} )
				);
				water.rotation.x = - Math.PI * 0.5;
				water.position.y = - 0.1;
				scene.add( water );

				const waterGui = gui.addFolder( '💧 water' );

				waterGui.add( water.material, 'roughness', 0, 1, 0.01 );
				waterGui.add( water.material, 'ior' ).min( 1 ).max( 2 ).step( 0.001 );
				waterGui.addColor( { color: water.material.color.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'color' ).onChange( value => water.material.color.set( value ) );

				// renderer

				renderer = new THREE.WebGPURenderer( { antialias: true } );
				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.shadowMap.enabled = true;
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				document.body.appendChild( renderer.domElement );

				// controls

				controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 0.45;
				controls.target.y = - 0.5;
				controls.enableDamping = true;
				controls.minDistance = 0.1;
				controls.maxDistance = 50;

				// drag

				drag = {};
				drag.screenCoords = new THREE.Vector2();
				drag.prevWorldCoords = new THREE.Vector3();
				drag.worldCoords = new THREE.Vector3();
				drag.raycaster = new THREE.Raycaster();
				drag.down = false;
				drag.hover = false;

				drag.object = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10, 1, 1 ), new THREE.MeshBasicMaterial() );
				drag.object.rotation.x = - Math.PI * 0.5;
				drag.object.visible = false;
				scene.add( drag.object );

				drag.getIntersect = () => {

					drag.raycaster.setFromCamera( drag.screenCoords, camera );
					const intersects = drag.raycaster.intersectObject( drag.object );
					if ( intersects.length )
						return intersects[ 0 ];

					return null;

				};

				drag.update = () => {

					const intersect = drag.getIntersect();

					if ( intersect ) {

						drag.hover = true;

						if ( ! drag.down )
							renderer.domElement.style.cursor = 'grab';

					} else {

						drag.hover = false;
						renderer.domElement.style.cursor = 'default';

					}

					if ( drag.hover && drag.down ) {

						drag.worldCoords.copy( intersect.point );
						const delta = drag.prevWorldCoords.sub( drag.worldCoords );

						offset.value.x += delta.x;
						offset.value.y += delta.z;

					}

					drag.prevWorldCoords.copy( drag.worldCoords );

				};

				window.addEventListener( 'pointermove', ( event ) => {

					drag.screenCoords.x = ( event.clientX / window.innerWidth - 0.5 ) * 2;
					drag.screenCoords.y = - ( event.clientY / window.innerHeight - 0.5 ) * 2;

				} );

				window.addEventListener( 'pointerdown', () => {

					if ( drag.hover ) {

						renderer.domElement.style.cursor = 'grabbing';
						controls.enabled = false;
						drag.down = true;
						drag.object.scale.setScalar( 10 );

						const intersect = drag.getIntersect();
						drag.prevWorldCoords.copy( intersect.point );
						drag.worldCoords.copy( intersect.point );
			
					}

				} );

				window.addEventListener( 'pointerup', () => {

					drag.down = false;
					controls.enabled = true;
					drag.object.scale.setScalar( 1 );
			
				} );

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			async function animate() {

				controls.update();

				drag.update();

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgpu_tsl_galaxy.html

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgpu - galaxy</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js webgpu</a> - galaxy
			<br>
			Based on <a href="https://threejs-journey.com/lessons/animated-galaxy" target="_blank" rel="noopener">Three.js Journey</a> lessons
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.webgpu.js",
					"three/webgpu": "../build/three.webgpu.js",
					"three/tsl": "../build/three.tsl.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';
			import { color, cos, float, mix, range, sin, time, uniform, uv, vec3, vec4, PI2 } from 'three/tsl';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

			let camera, scene, renderer, controls;

			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.set( 4, 2, 5 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x201919 );

				// galaxy

				const material = new THREE.SpriteNodeMaterial( {
					depthWrite: false,
					blending: THREE.AdditiveBlending
				} );

				const size = uniform( 0.08 );
				material.scaleNode = range( 0, 1 ).mul( size );

				const radiusRatio = range( 0, 1 );
				const radius = radiusRatio.pow( 1.5 ).mul( 5 ).toVar();

				const branches = 3;
				const branchAngle = range( 0, branches ).floor().mul( PI2.div( branches ) );
				const angle = branchAngle.add( time.mul( radiusRatio.oneMinus() ) );

				const position = vec3(
					cos( angle ),
					0,
					sin( angle )
				).mul( radius );

				const randomOffset = range( vec3( - 1 ), vec3( 1 ) ).pow( 3 ).mul( radiusRatio ).add( 0.2 );

				material.positionNode = position.add( randomOffset );

				const colorInside = uniform( color( '#ffa575' ) );
				const colorOutside = uniform( color( '#311599' ) );
				const colorFinal = mix( colorInside, colorOutside, radiusRatio.oneMinus().pow( 2 ).oneMinus() );
				const alpha = float( 0.1 ).div( uv().sub( 0.5 ).length() ).sub( 0.2 );
				material.colorNode = vec4( colorFinal, alpha );

				const mesh = new THREE.InstancedMesh( new THREE.PlaneGeometry( 1, 1 ), material, 20000 );
				scene.add( mesh );

				// debug

				const gui = new GUI();

				gui.add( size, 'value', 0, 1, 0.001 ).name( 'size' );

				gui.addColor( { color: colorInside.value.getHex( THREE.SRGBColorSpace ) }, 'color' )
					.name( 'colorInside' )
					.onChange( function ( value ) {

						colorInside.value.set( value );

					} );

				gui.addColor( { color: colorOutside.value.getHex( THREE.SRGBColorSpace ) }, 'color' )
					.name( 'colorOutside' )
					.onChange( function ( value ) {

						colorOutside.value.set( value );

					} );

				// renderer

				renderer = new THREE.WebGPURenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				document.body.appendChild( renderer.domElement );

				controls = new OrbitControls( camera, renderer.domElement );
				controls.enableDamping = true;
				controls.minDistance = 0.1;
				controls.maxDistance = 50;

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				controls.update();

				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgpu_tsl_compute_attractors_particles.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgpu - attractors particles</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>
	<body>

		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> WebGPU - Compute Attractors Particles
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.webgpu.js",
					"three/webgpu": "../build/three.webgpu.js",
					"three/tsl": "../build/three.tsl.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';
			import { float, If, PI, color, cos, instanceIndex, Loop, mix, mod, sin, instancedArray, Fn, uint, uniform, uniformArray, hash, vec3, vec4 } from 'three/tsl';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { TransformControls } from 'three/addons/controls/TransformControls.js';

			let camera, scene, renderer, controls, updateCompute;

			init();

			function init() {

				camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
				camera.position.set( 3, 5, 8 );

				scene = new THREE.Scene();

				// ambient light

				const ambientLight = new THREE.AmbientLight( '#ffffff', 0.5 );
				scene.add( ambientLight );

				// directional light

				const directionalLight = new THREE.DirectionalLight( '#ffffff', 1.5 );
				directionalLight.position.set( 4, 2, 0 );
				scene.add( directionalLight );

				// renderer

				renderer = new THREE.WebGPURenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( animate );
				renderer.setClearColor( '#000000' );
				document.body.appendChild( renderer.domElement );

				controls = new OrbitControls( camera, renderer.domElement );
				controls.enableDamping = true;
				controls.minDistance = 0.1;
				controls.maxDistance = 50;

				window.addEventListener( 'resize', onWindowResize );

				// attractors

				const attractorsPositions = uniformArray( [
					new THREE.Vector3( - 1, 0, 0 ),
					new THREE.Vector3( 1, 0, - 0.5 ),
					new THREE.Vector3( 0, 0.5, 1 )
				] );
				const attractorsRotationAxes = uniformArray( [
					new THREE.Vector3( 0, 1, 0 ),
					new THREE.Vector3( 0, 1, 0 ),
					new THREE.Vector3( 1, 0, - 0.5 ).normalize()
				] );
				const attractorsLength = uniform( attractorsPositions.array.length, 'uint' );
				const attractors = [];
				const helpersRingGeometry = new THREE.RingGeometry( 1, 1.02, 32, 1, 0, Math.PI * 1.5 );
				const helpersArrowGeometry = new THREE.ConeGeometry( 0.1, 0.4, 12, 1, false );
				const helpersMaterial = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );

				for ( let i = 0; i < attractorsPositions.array.length; i ++ ) {

					const attractor = {};

					attractor.position = attractorsPositions.array[ i ];
					attractor.orientation = attractorsRotationAxes.array[ i ];
					attractor.reference = new THREE.Object3D();
					attractor.reference.position.copy( attractor.position );
					attractor.reference.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), attractor.orientation );
					scene.add( attractor.reference );

					attractor.helper = new THREE.Group();
					attractor.helper.scale.setScalar( 0.325 );
					attractor.reference.add( attractor.helper );

					attractor.ring = new THREE.Mesh( helpersRingGeometry, helpersMaterial );
					attractor.ring.rotation.x = - Math.PI * 0.5;
					attractor.helper.add( attractor.ring );

					attractor.arrow = new THREE.Mesh( helpersArrowGeometry, helpersMaterial );
					attractor.arrow.position.x = 1;
					attractor.arrow.position.z = 0.2;
					attractor.arrow.rotation.x = Math.PI * 0.5;
					attractor.helper.add( attractor.arrow );

					attractor.controls = new TransformControls( camera, renderer.domElement );
					attractor.controls.mode = 'rotate';
					attractor.controls.size = 0.5;
					attractor.controls.attach( attractor.reference );
					attractor.controls.visible = true;
					attractor.controls.enabled = attractor.controls.visible;
					scene.add( attractor.controls.getHelper() );

					attractor.controls.addEventListener( 'dragging-changed', ( event ) => {

						controls.enabled = ! event.value;

					} );

					attractor.controls.addEventListener( 'change', () => {

						attractor.position.copy( attractor.reference.position );
						attractor.orientation.copy( new THREE.Vector3( 0, 1, 0 ).applyQuaternion( attractor.reference.quaternion ) );

					} );

					attractors.push( attractor );

				}

				// particles

				const count = Math.pow( 2, 18 );
				const material = new THREE.SpriteNodeMaterial( { blending: THREE.AdditiveBlending, depthWrite: false } );

				const attractorMass = uniform( Number( `1e${7}` ) );
				const particleGlobalMass = uniform( Number( `1e${4}` ) );
				const timeScale = uniform( 1 );
				const spinningStrength = uniform( 2.75 );
				const maxSpeed = uniform( 8 );
				const gravityConstant = 6.67e-11;
				const velocityDamping = uniform( 0.1 );
				const scale = uniform( 0.008 );
				const boundHalfExtent = uniform( 8 );
				const colorA = uniform( color( '#5900ff' ) );
				const colorB = uniform( color( '#ffa575' ) );

				const positionBuffer = instancedArray( count, 'vec3' );
				const velocityBuffer = instancedArray( count, 'vec3' );

				const sphericalToVec3 = Fn( ( [ phi, theta ] ) => {

					const sinPhiRadius = sin( phi );

					return vec3(
						sinPhiRadius.mul( sin( theta ) ),
						cos( phi ),
						sinPhiRadius.mul( cos( theta ) )
					);

				} );

				// init compute

				const init = Fn( () => {

					const position = positionBuffer.element( instanceIndex );
					const velocity = velocityBuffer.element( instanceIndex );

					const basePosition = vec3(
						hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
						hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
						hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) )
					).sub( 0.5 ).mul( vec3( 5, 0.2, 5 ) );
					position.assign( basePosition );

					const phi = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI ).mul( 2 );
					const theta = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI );
					const baseVelocity = sphericalToVec3( phi, theta ).mul( 0.05 );
					velocity.assign( baseVelocity );

				} );

				const initCompute = init().compute( count );

				const reset = () => {

					renderer.computeAsync( initCompute );

				};

				reset();

				// update compute

				const particleMassMultiplier = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).remap( 0.25, 1 ).toVar();
				const particleMass = particleMassMultiplier.mul( particleGlobalMass ).toVar();

				const update = Fn( () => {

					// const delta = timerDelta().mul( timeScale ).min( 1 / 30 ).toVar();
					const delta = float( 1 / 60 ).mul( timeScale ).toVar(); // uses fixed delta to consistent result
					const position = positionBuffer.element( instanceIndex );
					const velocity = velocityBuffer.element( instanceIndex );

					// force

					const force = vec3( 0 ).toVar();

					Loop( attractorsLength, ( { i } ) => {

						const attractorPosition = attractorsPositions.element( i );
						const attractorRotationAxis = attractorsRotationAxes.element( i );
						const toAttractor = attractorPosition.sub( position );
						const distance = toAttractor.length();
						const direction = toAttractor.normalize();

						// gravity
						const gravityStrength = attractorMass.mul( particleMass ).mul( gravityConstant ).div( distance.pow( 2 ) ).toVar();
						const gravityForce = direction.mul( gravityStrength );
						force.addAssign( gravityForce );

						// spinning
						const spinningForce = attractorRotationAxis.mul( gravityStrength ).mul( spinningStrength );
						const spinningVelocity = spinningForce.cross( toAttractor );
						force.addAssign( spinningVelocity );

					} );

					// velocity

					velocity.addAssign( force.mul( delta ) );
					const speed = velocity.length();
					If( speed.greaterThan( maxSpeed ), () => {

						velocity.assign( velocity.normalize().mul( maxSpeed ) );

					} );
					velocity.mulAssign( velocityDamping.oneMinus() );

					// position

					position.addAssign( velocity.mul( delta ) );

					// box loop

					const halfHalfExtent = boundHalfExtent.div( 2 ).toVar();
					position.assign( mod( position.add( halfHalfExtent ), boundHalfExtent ).sub( halfHalfExtent ) );

				} );
				updateCompute = update().compute( count );

				// nodes

				material.positionNode = positionBuffer.toAttribute();

				material.colorNode = Fn( () => {

					const velocity = velocityBuffer.toAttribute();
					const speed = velocity.length();
					const colorMix = speed.div( maxSpeed ).smoothstep( 0, 0.5 );
					const finalColor = mix( colorA, colorB, colorMix );

					return vec4( finalColor, 1 );

				} )();

				material.scaleNode = particleMassMultiplier.mul( scale );

				// mesh

				const geometry = new THREE.PlaneGeometry( 1, 1 );
				const mesh = new THREE.InstancedMesh( geometry, material, count );
				scene.add( mesh );

				// debug

				const gui = new GUI();

				gui.add( { attractorMassExponent: attractorMass.value.toString().length - 1 }, 'attractorMassExponent', 1, 10, 1 ).onChange( value => attractorMass.value = Number( `1e${value}` ) );
				gui.add( { particleGlobalMassExponent: particleGlobalMass.value.toString().length - 1 }, 'particleGlobalMassExponent', 1, 10, 1 ).onChange( value => particleGlobalMass.value = Number( `1e${value}` ) );
				gui.add( maxSpeed, 'value', 0, 10, 0.01 ).name( 'maxSpeed' );
				gui.add( velocityDamping, 'value', 0, 0.1, 0.001 ).name( 'velocityDamping' );
				gui.add( spinningStrength, 'value', 0, 10, 0.01 ).name( 'spinningStrength' );
				gui.add( scale, 'value', 0, 0.1, 0.001 ).name( 'scale' );
				gui.add( boundHalfExtent, 'value', 0, 20, 0.01 ).name( 'boundHalfExtent' );
				gui.addColor( { color: colorA.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorA' ).onChange( value => colorA.value.set( value ) );
				gui.addColor( { color: colorB.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorB' ).onChange( value => colorB.value.set( value ) );
				gui
					.add( { controlsMode: attractors[ 0 ].controls.mode }, 'controlsMode' )
					.options( [ 'translate', 'rotate', 'none' ] )
					.onChange( value => {

						for ( const attractor of attractors ) {

							if ( value === 'none' ) {

								attractor.controls.visible = false;
								attractor.controls.enabled = false;

							} else {

								attractor.controls.visible = true;
								attractor.controls.enabled = true;
								attractor.controls.mode = value;

							}

						}

					} );

				gui
					.add( { helperVisible: attractors[ 0 ].helper.visible }, 'helperVisible' )
					.onChange( value => {

						for ( const attractor of attractors )
							attractor.helper.visible = value;

					} );

				gui.add( { reset }, 'reset' );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			async function animate() {

				controls.update();

    			renderer.compute( updateCompute );
				renderer.render( scene, camera );

			}

		</script>
	</body>
</html>

examples/webgpu_morphtargets.html

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js webgpu - morph targets</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<link type="text/css" rel="stylesheet" href="main.css">
	</head>

	<body>
		<div id="container"></div>
		<div id="info">
			<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgpu - morph targets<br/>
			by <a href="https://discoverthreejs.com/" target="_blank" rel="noopener">Discover three.js</a>
		</div>

		<script type="importmap">
			{
				"imports": {
					"three": "../build/three.webgpu.js",
					"three/webgpu": "../build/three.webgpu.js",
					"three/tsl": "../build/three.tsl.js",
					"three/addons/": "./jsm/"
				}
			}
		</script>

		<script type="module">

			import * as THREE from 'three';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

			let container, camera, scene, renderer, mesh;

			init();

			function init() {

				container = document.getElementById( 'container' );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x8FBCD4 );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 20 );
				camera.position.z = 10;
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0x8FBCD4, 1.5 ) );

				const pointLight = new THREE.PointLight( 0xffffff, 200 );
				camera.add( pointLight );

				const geometry = createGeometry();

				const material = new THREE.MeshPhongMaterial( {
					color: 0xff0000,
					flatShading: true
				} );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				initGUI();

				renderer = new THREE.WebGPURenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.setAnimationLoop( function () {

					renderer.render( scene, camera );

				} );
				container.appendChild( renderer.domElement );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.enableZoom = false;

				window.addEventListener( 'resize', onWindowResize );

			}

			function createGeometry() {

				const geometry = new THREE.BoxGeometry( 2, 2, 2, 32, 32, 32 );

				// create an empty array to hold targets for the attribute we want to morph
				// morphing positions and normals is supported
				geometry.morphAttributes.position = [];

				// the original positions of the cube's vertices
				const positionAttribute = geometry.attributes.position;

				// for the first morph target we'll move the cube's vertices onto the surface of a sphere
				const spherePositions = [];

				// for the second morph target, we'll twist the cubes vertices
				const twistPositions = [];
				const direction = new THREE.Vector3( 1, 0, 0 );
				const vertex = new THREE.Vector3();

				for ( let i = 0; i < positionAttribute.count; i ++ ) {

					const x = positionAttribute.getX( i );
					const y = positionAttribute.getY( i );
					const z = positionAttribute.getZ( i );

					spherePositions.push(

						x * Math.sqrt( 1 - ( y * y / 2 ) - ( z * z / 2 ) + ( y * y * z * z / 3 ) ),
						y * Math.sqrt( 1 - ( z * z / 2 ) - ( x * x / 2 ) + ( z * z * x * x / 3 ) ),
						z * Math.sqrt( 1 - ( x * x / 2 ) - ( y * y / 2 ) + ( x * x * y * y / 3 ) )

					);

					// stretch along the x-axis so we can see the twist better
					vertex.set( x * 2, y, z );

					vertex.applyAxisAngle( direction, Math.PI * x / 2 ).toArray( twistPositions, twistPositions.length );

				}

				// add the spherical positions as the first morph target
				geometry.morphAttributes.position[ 0 ] = new THREE.Float32BufferAttribute( spherePositions, 3 );

				// add the twisted positions as the second morph target
				geometry.morphAttributes.position[ 1 ] = new THREE.Float32BufferAttribute( twistPositions, 3 );

				return geometry;

			}

			function initGUI() {

				// Set up dat.GUI to control targets
				const params = {
					Spherify: 0,
					Twist: 0,
				};
				const gui = new GUI( { title: 'Morph Targets' } );

				gui.add( params, 'Spherify', 0, 1 ).step( 0.01 ).onChange( function ( value ) {

					mesh.morphTargetInfluences[ 0 ] = value;

				} );
				gui.add( params, 'Twist', 0, 1 ).step( 0.01 ).onChange( function ( value ) {

					mesh.morphTargetInfluences[ 1 ] = value;

				} );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

		</script>

	</body>
</html>

