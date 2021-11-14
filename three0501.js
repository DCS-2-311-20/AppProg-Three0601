//
// 応用プログラミング 課題8 G084002020 拓殖太郎
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
  camera.position.set(100, 20, 75);
  camera.lookAt(new THREE.Vector3(0, 0.8, 0));

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x2040A0);
  renderer.shadowMap.enabled = true;
  document.getElementById("WebGL-output")
    .appendChild(renderer.domElement);

  // カメラの制御を入れる
  const cameraControl = new THREE.TrackballControls(
    camera,
    document.getElementById("WebGL-output")
  );

  // 平面の作成
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("png/roadmap.png");
  const roadmap = new THREE.Mesh(
    new THREE.PlaneGeometry(100,75),
    new THREE.MeshLambertMaterial({map: texture})
  )
  roadmap.translateX(50);
  roadmap.translateZ(37.5);
  roadmap.rotation.x = -Math.PI/2;
  roadmap.receiveShadow = true;
  scene.add(roadmap);
  // 平面の拡張
  const roadmap2 = roadmap.clone();
  roadmap2.position.set(-50,0,37.5);
  scene.add(roadmap2);
  const roadmap3 = roadmap.clone();
  roadmap3.position.set(50,0,-37.5);
  scene.add(roadmap3);
  const roadmap4 = roadmap.clone();
  roadmap4.position.set(-50,0,-37.5);
  scene.add(roadmap4);

  // 光源の設定
  { // ディレクショナルライト
    const light = new THREE.DirectionalLight();
    light.castShadow = true;
    light.position.set(100, 80, 10);
    // 影の計算のための設定
    light.shadow.camera.near = .1;
    light.shadow.camera.far = 3000;
    light.shadow.camera.right = 100;
    light.shadow.camera.left = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024
    scene.add(light);
  }
  { //アンビエントライト
    const light = new THREE.AmbientLight(0x404050);
    scene.add(light);
  }

  // 座標軸の表示
  const axis = new THREE.AxesHelper(10);
  scene.add(axis);
  axis.visible = false;

  // GUIコントローラ
  const gui = new dat.GUI();

  // 3Dモデル(GLTF形式)の読み込み
  const SCALE = 0.01;
  const PREFIX = "SHTV_Prefab_Car_";
  const cars = []; // 車のオブジェクトのリスト
  const carNames = []; // 車の名前のリスト
  const loader = new THREE.GLTFLoader();
  loader.load("glTF/scene.gltf", model => {
    console.log(model);
    // 名前の前半が一致するオブジェクトを探す
    model.scene.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
      }
      if (obj.name.indexOf(PREFIX) == 0) {
        //名前の後半を取り出し
        const name = obj.name.substring(PREFIX.length);
        carNames.push(name); // 名前のリストに追加
        obj.position.set(0, 0, 0);
        obj.scale.set(SCALE, SCALE, SCALE);
        obj.rotation.y = 0;
        obj.visible = true; // was false;
        cars[name] = obj; // 車のリストに追加
      }
    });
    // 全ての車をシーンに追加
    carNames.map ( name => {
        scene.add(cars[name]);
    });
    // GUIで表示する車を選択できるようにする
    controls["car"] = carNames[0];
    cars[carNames[0]].visible = true;
    gui.add(controls, "car", carNames);
    // 車を追加するボタンをつくる
    controls["Add a car"] = (() => {
      const nCars = Object.keys(cars).length;
      const name = controls.car + nCars;
      cars[name] = cars[controls.car].clone();
      cars[name].visible = true;
      scene.add(cars[name]);
    });
    gui.add(controls, "Add a car");
    // 手動運転のスイッチをGUIコントローラに追加する
    controls["Self driving"] = false;
    gui.add(controls, "Self driving");
    gui.close();gui.open();

    requestAnimationFrame(update);
  });

  // 自動操縦コースの設定
  let course;
  let courseObj;
  {
    // 制御点
    const controlPoints = [
      [80, 0, 60],
      [20, 0, 60],
      [20, 0, 25],
      [-20, 0, 25],
      [-20, 0, 60],
      [-80, 0, 60],
      [-80, 0, -15],
      [-20, 0, -15],
      [-20, 0, -55],
      [80, 0, -55],
      [80, 0, -35],
      [40, 0, -35],
      [40, 0, -15],
      [25, 0, -15],
      [25, 0, 20],
      [80, 0, 20],
    ];
    // スプライン補間
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    course = new THREE.CatmullRomCurve3(
      controlPoints.map( (p, i) => {
        p0.set(...p);
        p1.set(...controlPoints[(i+1)%controlPoints.length]);
        return [
          (new THREE.Vector3()).copy(p0),
          (new THREE.Vector3()).lerpVectors(p0, p1, 0.1),
          (new THREE.Vector3()).lerpVectors(p0, p1, 0.9),
        ];
      }).flat(), true
    );
    // コースの描画
    const points = course.getPoints(250);
    console.log(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: "red"});
    courseObj = new THREE.Line(geometry, material);
    courseObj.visible = false;
    material.depthTest = false;
    courseObj.renderOrder = 1;
    scene.add(courseObj);
  }
  // 描画処理
  const carPosition = new THREE.Vector3();
  const carTarget = new THREE.Vector3();
  function update(time) {
    // time に経過時間が入っているので
    time /= 1000; // timeを秒単位に直す
    const pathTime = time / 50; // 50秒で1周するときの周回数
    //周回数の小数部(コースを進んでいる割合)の座標を取り出し
    //carPositionにセットする
    // コースをn分割する位置にn台の車を表示する
    const nCars = Object.keys(cars).length;
    let i = 0;
    for (let cname in cars) {
      course.getPointAt((pathTime + i/nCars) % 1, carPosition);
      cars[cname].position.copy(carPosition);
      //車が向くべき目標点を作り，そちらを向かせる
      course.getPointAt((pathTime + i/nCars + 0.01) % 1, carTarget);
      cars[cname].lookAt(carTarget);
      i++;
    }
    cameraControl.update();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
}

document.onload = init();
