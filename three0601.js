//
// 応用プログラミング 課題7 (
// $Id$
//
"use strict"; // 厳格モード

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const controls = {
  };

  // シーン作成
  const scene = new THREE.Scene();

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth/window.innerHeight, 0.01, 1000);
  camera.position.set(0, 100, 0);
  camera.lookAt(new THREE.Vector3(0, 0.8, 0));

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x2040A0);
  //renderer.shadowMap.enabled = true;
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // カメラの制御を入れる
  const cameraControl = new THREE.TrackballControls(
    camera,
    document.getElementById("WebGL-output")
  );

  // 平面の作成

  // 光源の設定
  { // ディレクショナルライト
    const light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.position.set(200, 160, 20);
    scene.add(light);
  }
  { //アンビエントライト
    const light = new THREE.AmbientLight(0x404050);
    scene.add(light);
  }

  // 座標軸の表示
  const axis = new THREE.AxesHelper(100);
  scene.add(axis);
  axis.visible = true;

  // GUIコントローラ
  const gui = new dat.GUI();

  // 3Dモデル(GLTF形式)の読み込み
  const SCALE = 0.05;
  const loader = new THREE.GLTFLoader();
  loader.load("glTF/scene.gltf", model => {
    model.scene.traverse( obj => {
      if (obj.name != null && obj.name == "ROAD") {
        console.log(obj);
        scene.add(obj.children[4]);
      }
    });
    model.scene.scale.set(SCALE, SCALE, SCALE);
    //scene.add(model.scene);
    requestAnimationFrame(update);
  });

  // 自動操縦コースの設定

  // 描画処理
  function update(time) {
    cameraControl.update();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
}

document.onload = init();
