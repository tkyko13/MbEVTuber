let faceapi;
let video;
let detections;

// let fileImg;
const partsNames =
  [
    "輪郭",
    "右目",
    "左目",
    "口",
    "右耳",
    "左耳",
    "髪",
  ];
let partsImgs = [];

let videoBtn;
let isVideoShow = true;

async function setup() {
  // createCanvas(windowWidth, windowHeight);
  createCanvas(640, 480);

  let storage = firebase.storage();
  let storageRef = storage.ref();

  // Create a reference under which you want to list
  var listRef = storageRef.child('form-mdeVTuber/'); //
  var listAll = await listRef.listAll();
  listAll.items.forEach(ref => {
    print(ref.name);
  });

  // print('-------');

  // let fileRef = storageRef.child('form-mdeVTuber/輪郭.png');
  // let fileUrl = await fileRef.getDownloadURL();
  // print(fileUrl);

  // fileImg = await loadImage(fileUrl);

  // 画像読み込み
  partsNames.forEach(async (name, i) => {
    let fileRef = storageRef.child('form-mdeVTuber/' + name + '.png');
    let fileUrl = await fileRef.getDownloadURL();
    partsImgs[i] = await loadImage(fileUrl);
  });

  // カメラ設定
  video = await createCapture(VIDEO);
  // video.size(width, height);
  video.hide();

  // 顔検出
  const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
  }
  faceapi = await ml5.faceApi(video, detection_options);
  faceapi.detect(gotResults);

  // ボタン類
  videoBtn = createButton("カメラ映像切り替え");
  // videoBtn.position(10, 10);
  videoBtn.mousePressed(() => {
    print(videoBtn.label)
    if (isVideoShow) {
      // videoBtn.label = "カメラ映像:ON";
      isVideoShow = false;
    }
    else {
      // videoBtn.label = "カメラ映像:OFF";
      isVideoShow = true;
    }
  });
  const regetBtn = createButton("アバター更新");
  // videoBtn.position(10, 10);
  regetBtn.mousePressed(() => {
    // 画像読み込み
    partsNames.forEach(async (name, i) => {
      let fileRef = storageRef.child('form-mdeVTuber/' + name + '.png');
      let fileUrl = await fileRef.getDownloadURL();
      partsImgs[i] = await loadImage(fileUrl);
    });
  });
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return
  }
  // console.log(result)
  detections = result;

  faceapi.detect(gotResults);
}

async function draw() {
  background(20);

  if (video && isVideoShow) image(video, 0, 0);

  if (detections) {
    // if (fileImg) image(fileImg, 0, 0);
    if (detections.length > 0) {
      // console.log(detections);
      // drawBox(detections);
      // drawLandmarks(detections);

      const face = detections[0];
      const alignedRect = face.alignedRect;
      const box = alignedRect.box;

      // 輪郭描画
      if (partsImgs[0]) image(partsImgs[0], box._x, box._y, box._width, box._height);
      // 目
      // const SCALE = 2;
      if (partsImgs[2]) {
        const reyeBox = getBox(face.parts.rightEye);
        image(partsImgs[2], reyeBox._x - reyeBox._width / 2, reyeBox._y - reyeBox._height / 2, reyeBox._width * 2, reyeBox._height * 2);
      }
      if (partsImgs[1]) {
        const leyeBox = getBox(face.parts.leftEye);
        image(partsImgs[1], leyeBox._x - leyeBox._width / 2, leyeBox._y - leyeBox._height / 2, leyeBox._width * 2, leyeBox._height * 2);
      }
      // 口
      if (partsImgs[3]) {
        const mBox = getBox(face.parts.mouth);
        image(partsImgs[3], mBox._x, mBox._y, mBox._width, mBox._height);
      }
    }
  }
}



function getBox(arr) {
  const ret = {};
  arr.forEach(pt => {
    if (!ret._x || pt._x < ret._x) ret._x = pt._x;
    if (!ret._right || pt._x > ret._right) ret._right = pt._x;
    if (!ret._y || pt._y < ret._y) ret._y = pt._y;
    if (!ret._bottom || pt._y > ret._bottom) ret._bottom = pt._y;
  });
  ret._width = ret._right - ret._x;
  ret._height = ret._bottom - ret._y;
  return ret;
}

