"use strict";
function main() {
  // テクスチャのロード
  const texture = new THREE.TextureLoader().load(
    "./cityTexture.jpg"
  );
  // シーンの準備
  const scene = new THREE.Scene();

  // 街を作成する関数の定義
  function makeCity() {
    const city = new THREE.Group(); // 複数のオブジェクトをまとめるグループを用意
    // 街の配置を定義
    const cityMap = [
      /*
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
      */
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    const width = cityMap[0].length;  // 街の幅
    const halfWidth = width/2; // 幅の半分
    const depth = cityMap.length; // 街の奥行
    const halfDepth = depth/2; // 奥行の半分
    const nImg = 11;
    // 位置(x, y, z) に地面を作る関数の定義
    function makeGround(x, z) {
      // 4つの頂点について位置， 法線の向き， テクスチャの座標を定義
      const vertices = [
        { pos: [ 1, 0, 0], norm: [0, 1, 0], uv: [1.0/nImg, 1.0]},
        { pos: [ 0, 0, 0], norm: [0, 1, 0], uv: [0.0, 1.0]},
        { pos: [ 1, 0, 1], norm: [0, 1, 0], uv: [1.0/nImg, 0.0]},
        { pos: [ 0, 0, 1], norm: [0, 1, 0], uv: [0.0, 0.0]},
      ];
      // それぞれを配列に格納
      const positions = [];
      const normals = [];
      const uvs = [];
      for (const vertex of vertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
      }
      // 地面のジオメトリの定義
      const geometry = new THREE.BufferGeometry();
      // 頂点の位置を登録
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      // 法線の向きを登録
      geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normals, 3)
      );
      // テクスチャの座標を登録
      geometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
      );
      // 頂点の配置順序を指定して面を作る
      geometry.setIndex([ 0, 1, 2, 2, 1, 3]);
      // 地面のマテリアル(素材)の定義
      const material = new THREE.MeshLambertMaterial({map: texture});
      // ジオメトリとマテリアルから地面を構成
      const ground = new THREE.Mesh(geometry, material);
      // 地面の位置を指定
      ground.position.x = x;
      ground.position.z = z;
      return ground;
    }
    // 位置(x, y, z) に地面を作る関数の定義
    function makeBuilding(x, z, type) {
      const buildingHeight = [2, 2, 7, 4, 5];
      const hBldg = buildingHeight[type-1];
      // 20つの頂点について位置， 法線の向き， テクスチャの座標を定義
      const topUvS = (type * 2) / nImg;
      const topUvE = (type * 2 + 1) / nImg;
      const sideUvS = (type * 2 - 1) / nImg;
      const sideUvE = (type * 2) / nImg;
      const vertices = [
        // Top
        { pos: [ 1, hBldg, 0], norm: [0, 1, 0], uv: [topUvE, 1.0]},
        { pos: [ 0, hBldg, 0], norm: [0, 1, 0], uv: [topUvS, 1.0]},
        { pos: [ 1, hBldg, 1], norm: [0, 1, 0], uv: [topUvE, 0.0]},
        { pos: [ 0, hBldg, 1], norm: [0, 1, 0], uv: [topUvS, 0.0]},
        // Front
        { pos: [ 1, hBldg, 1], norm: [0, 0, 1], uv: [sideUvE, 1.0]},
        { pos: [ 0, hBldg, 1], norm: [0, 0, 1], uv: [sideUvS, 1.0]},
        { pos: [ 1, 0, 1], norm: [0, 0, 1], uv: [sideUvE, 0.0]},
        { pos: [ 0, 0, 1], norm: [0, 0, 1], uv: [sideUvS, 0.0]},
        // Back
        { pos: [ 0, hBldg, 0], norm: [0, 1, 0], uv: [sideUvE, 1.0]},
        { pos: [ 1, hBldg, 0], norm: [0, 1, 0], uv: [sideUvS, 1.0]},
        { pos: [ 0, 0, 0], norm: [0, 1, 0], uv: [sideUvE, 0.0]},
        { pos: [ 1, 0, 0], norm: [0, 1, 0], uv: [sideUvS, 0.0]},
        // Left
        { pos: [ 1, hBldg, 0], norm: [0, 1, 0], uv: [sideUvS, 1.0]},
        { pos: [ 1, hBldg, 1], norm: [0, 1, 0], uv: [sideUvE, 1.0]},
        { pos: [ 1, 0, 0], norm: [0, 1, 0], uv: [sideUvS, 0.0]},
        { pos: [ 1, 0, 1], norm: [0, 1, 0], uv: [sideUvE, 0.0]},
        // Right
        { pos: [ 0, hBldg, 1], norm: [0, 1, 0], uv: [sideUvS, 1.0]},
        { pos: [ 0, hBldg, 0], norm: [0, 1, 0], uv: [sideUvE, 1.0]},
        { pos: [ 0, 0, 1], norm: [0, 1, 0], uv: [sideUvS, 0.0]},
        { pos: [ 0, 0, 0], norm: [0, 1, 0], uv: [sideUvE, 0.0]},
      ];
      // それぞれを配列に格納
      const positions = [];
      const normals = [];
      const uvs = [];
      for (const vertex of vertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
      }
      // 地面のジオメトリの定義
      const geometry = new THREE.BufferGeometry();
      // 頂点の位置を登録
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      // 法線の向きを登録
      geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normals, 3)
      );
      // テクスチャの座標を登録
      geometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
      );
      // 頂点の配置順序を指定して面を作る
      geometry.setIndex([
         0, 1, 2, 2, 1, 3,
         4, 5, 6, 6, 5, 7,
         8, 9,10,10, 9,11,
        12,13,14,14,13,15,
        16,17,18,18,17,19
      ]);
      // 地面のマテリアル(素材)の定義
      const material = new THREE.MeshLambertMaterial({map: texture});
      // ジオメトリとマテリアルから地面を構成
      const buildings = new THREE.Mesh(geometry, material);
      // 地面の位置を指定
      buildings.position.x = x;
      buildings.position.z = z;
      return buildings;
    }
    // 街の配置に基いて街を作る
    for (let i = 0; i < width; i++) {
      let x = i - halfWidth;
      for (let j = 0; j < depth; j++) {
        let z = j - halfDepth;
        if (cityMap[j][i] == 0) {
          // 0 が指定されている所には地面を作る
          city.add(makeGround( x, z));
        }
        else {
          let type = Math.floor(Math.random()*5)+1;
          city.add(makeBuilding( x, z, type));
        }
      }
    }
    return city;
  }

  // 動作状況を表示する部分を登録
  const stats = new Stats();
  document.getElementById("Stats-output").appendChild(stats.dom);

  // カメラを作って, 設定を指定
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
  //camera.position.z = 16;
  //camera.position.y = 8;
  camera.position.x = 30;
  camera.position.y = 10;
  //camera.lookAt(-1,1,0);
  camera.lookAt(0,10,20);

  const light = new THREE.SpotLight();
  light.position.set(10,12,10);
  scene.add(light);

  // レンダラ(描画処理)を作って， 設定を指定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x004090 );
  document.getElementById("WebGL-output")
    .appendChild( renderer.domElement );

  // 街を作成する関数の呼び出し
  const city = makeCity();
  scene.add(city);

  // 画面更新の関数の定義
  function update() {
    requestAnimationFrame( update );
    stats.update();
    city.rotation.y -= 0.004;
    renderer.render( scene, camera );
  }
  // 画面更新の開始
  update();
}
window.onload = main;
//function main() {

  /*
  function makeCity() {

    const map = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ];
    const depth = map.length;
    const width = map[0].length;
    const halfDepth = depth/2;
    const halfWidth = width/2;


    /*
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < length; j++) {
        if (map[j][i] == 0) {
          let x = i - halfWidth;
          let z = j - halfDepth;
          makeGround(x, 0, z);
        }
      }
    }
    makeGround(0, 0, 0);
  }

  const scene = new THREE.Scene();
  const texture = new THREE.TextureLoader().load(
    "./cityTexture.jpg"
  );
  const stats = new Stats();
  document.getElementById("Stats-output").appendChild(stats.dom);
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById("WebGL-output").appendChild( renderer.domElement );

  camera.position.z = 5;
  camera.position.y = 5;

  const cgeo = new THREE.BoxGeometry();
  const cmat = new THREE.MeshNormalMaterial();
  const cmes = new THREE.Mesh(cgeo,cmat);
  scene.add(cmes);

  function animate() {
    requestAnimationFrame( animate );
    //city.rotation.y = 0.2;
    stats.update();
    renderer.render( scene, camera );
  }
  //makeCity();
  animate();
//}

//window.onload = main;
*/
