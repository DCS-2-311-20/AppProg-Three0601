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
    60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(7, 4, 6);
  camera.lookAt(new THREE.Vector3(0, 0.8, 0));

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x2040A0);
  renderer.shadowMap.enabled = true;
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // カメラの制御を入れる

  // 平面の作成

  // 光源の設定
  { // ディレクショナルライト
    const light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.position.set(100, 80, 10);
    scene.add(light);
  }
  { //アンビエントライト
    const light = new THREE.AmbientLight(0x404050);
    scene.add(light);
  }

  // 座標軸の表示
  const axis = new THREE.AxesHelper(10);
  scene.add(axis);
  axis.visible = true;

  // GUIコントローラ
  const gui = new dat.GUI();

  // 3Dモデル(GLTF形式)の読み込み
  requestAnimationFrame(update);

  // 自動操縦コースの設定

  // 描画処理
  function update(time) {
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
}

document.onload = init();
