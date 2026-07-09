// =========================================
// STUDIO KAMU
// EDITOR V2
// =========================================

// Canvas
const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

// Input Foto
const photoInput = document.getElementById("photoInput");

// Ukuran Canon Selphy
const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 3600;

// =========================================
// FRAME
// =========================================

let FRAMES = [

    {
        x: 70,
        y: 130,
        width: 1100,
        height: 1580
    },

    {
        x: 70,
        y: 1820,
        width: 1100,
        height: 1580
    }

];

const RIGHT_OFFSET = 1133;

// =========================================
// DATA
// =========================================

let overlayImage = new Image();

let photos = [];

let PHOTO_COUNT = 0;

// foto yang dipilih ketika memilih gambar
let currentPhotoIndex = null;

// foto yang sedang diedit
let activePhotoIndex = null;

let lastTapTime = 0;
let lastTapIndex = -1;

// =========================================
// DRAG
// =========================================

let isPointerDown = false;

let isDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let dragOffsetX = 0;
let dragOffsetY = 0;

let pinchDistance = 0;
let pinchScale = 1;

const pointers = new Map();

// minimal geser supaya dianggap drag
const DRAG_THRESHOLD = 5;

// =========================================
// LOAD EDITOR
// =========================================

function loadEditor(template){

    // Reset data
    photos = [];
    currentPhotoIndex = null;
    activePhotoIndex = null;

    // Ukuran canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Frame template
    FRAMES = template.frames;

    // Jumlah foto yang dibutuhkan
    PHOTO_COUNT =
        template.type === "single"
            ? 1
            : template.mirror
                ? FRAMES.length
                : FRAMES.length * 2;

    // Load overlay
    overlayImage = new Image();

    overlayImage.onload = render;

    overlayImage.src = template.overlay;

}

// =========================================
// PILIH FOTO
// =========================================

photoInput.onchange = async (e)=>{

    const file = e.target.files[0];

    if(!file) return;

    const img = new Image();

    img.src = URL.createObjectURL(file);

    await img.decode();

    photos[currentPhotoIndex] = {

        img: img,

        offsetX: 0,
        offsetY: 0,

        scale: 1,

        rotation: 0

    };

    activePhotoIndex = currentPhotoIndex;

    render();

    photoInput.value = "";

};

// =========================================
// HELPER
// =========================================

function isInsideFrame(x,y,frame){

    return (

        x >= frame.x &&
        x <= frame.x + frame.width &&

        y >= frame.y &&
        y <= frame.y + frame.height

    );

}

function getCanvasPoint(e){

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;

    const scaleY = canvas.height / rect.height;

    return{

        x:(e.clientX-rect.left)*scaleX,

        y:(e.clientY-rect.top)*scaleY

    };

}

function getFrameIndex(x,y){

    // ==========================
    // SINGLE
    // ==========================
    if(selectedTemplate.type === "single"){

        return isInsideFrame(x,y,FRAMES[0]) ? 0 : -1;

    }

    // ==========================
    // STRIP
    // ==========================
    for(let i=0;i<FRAMES.length;i++){

        // Frame kiri
        if(isInsideFrame(x,y,FRAMES[i])){

            return i;

        }

        // Frame kanan
        const rightFrame={

            x:FRAMES[i].x + RIGHT_OFFSET,
            y:FRAMES[i].y,
            width:FRAMES[i].width,
            height:FRAMES[i].height

        };

        if(isInsideFrame(x,y,rightFrame)){

            return selectedTemplate.mirror
                ? i
                : i + FRAMES.length;

        }

    }

    return -1;

}

function getDistance(p1,p2){

    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;

    return Math.sqrt(dx*dx + dy*dy);

}

// =========================================
// RENDER
// =========================================

function render(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#ffffff";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawPhotos();

    drawOverlay();

}

// =========================================
// DRAW PHOTOS
// =========================================

function drawPhotos(){

    // ===============================
    // TEMPLATE SINGLE
    // ===============================
    if(selectedTemplate.type === "single"){

        const frame = FRAMES[0];

        if(!photos[0]){

            drawPlaceholder(frame);

            return;

        }

        drawCover(photos[0], frame);

        return;

    }

    // ===============================
    // TEMPLATE STRIP
    // ===============================
    FRAMES.forEach((frame,index)=>{

        const rightFrame = {

            x: frame.x + RIGHT_OFFSET,
            y: frame.y,
            width: frame.width,
            height: frame.height

        };

        // ===========================
        // KIRI
        // ===========================
        if(!photos[index]){

            drawPlaceholder(frame);

        }else{

            drawCover(photos[index], frame);

        }

        // ===========================
        // KANAN
        // ===========================
        const rightIndex = selectedTemplate.mirror
            ? index
            : index + FRAMES.length;

        if(!photos[rightIndex]){

            drawPlaceholder(rightFrame);

        }else{

            drawCover(photos[rightIndex], rightFrame);

        }

    });

}

// =========================================
// DRAW OVERLAY
// =========================================

function drawOverlay(){

    if(!overlayImage.complete) return;

    ctx.drawImage(

        overlayImage,

        0,
        0,

        CANVAS_WIDTH,
        CANVAS_HEIGHT

    );

}

// =========================================
// DRAW COVER
// =========================================

function drawPlaceholder(frame){

    // Background
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(frame.x, frame.y, frame.width, frame.height);

    // Border putus-putus
    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 3;
    ctx.setLineDash([12,8]);

    ctx.strokeRect(
        frame.x,
        frame.y,
        frame.width,
        frame.height
    );

    ctx.setLineDash([]);

    // Ikon
    ctx.fillStyle = "#b5b5b5";
    ctx.textAlign = "center";

    ctx.font = "bold 70px Arial";
    ctx.fillText(
        "＋",
        frame.x + frame.width/2,
        frame.y + frame.height/2 - 40
    );

    // Judul
    ctx.fillStyle = "#666";
    ctx.font = "bold 30px Arial";
    ctx.fillText(
        "Tambahkan Foto",
        frame.x + frame.width/2,
        frame.y + frame.height/2 + 20
    );

    // Sub Judul
    ctx.fillStyle = "#999";
    ctx.font = "20px Arial";
    ctx.fillText(
        "Ketuk untuk memilih",
        frame.x + frame.width/2,
        frame.y + frame.height/2 + 60
    );

}

function drawCover(photo,frame){

    const img=photo.img;

   const coverScale = Math.max(
    frame.width / img.width,
    frame.height / img.height
);

const finalScale = coverScale * photo.scale;

const drawWidth = img.width * finalScale;

const drawHeight = img.height * finalScale;

    const centerX=

        frame.x+

        frame.width/2+

        photo.offsetX;

    const centerY=

        frame.y+

        frame.height/2+

        photo.offsetY;

    ctx.save();

    // Crop sesuai frame
    ctx.beginPath();

    ctx.rect(

        frame.x,

        frame.y,

        frame.width,

        frame.height

    );

    ctx.clip();

    // Titik tengah frame
    ctx.translate(

        centerX,

        centerY

    );

    // Rotasi
    ctx.rotate(

        photo.rotation*Math.PI/180

    );

    // Gambar
    ctx.drawImage(

        img,

        -drawWidth/2,

        -drawHeight/2,

        drawWidth,

        drawHeight

    );

    ctx.restore();

    // Border editor (hanya foto aktif)
    if(photo===photos[activePhotoIndex]){

        ctx.save();

        ctx.strokeStyle="#00A8FF";

        ctx.lineWidth=4;

        ctx.strokeRect(

            frame.x,

            frame.y,

            frame.width,

            frame.height

        );

        ctx.restore();

    }

}

// =========================================
// POINTER EVENT
// =========================================

canvas.addEventListener("pointerdown", pointerDown);
canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("wheel", wheelZoom, { passive:false });
canvas.addEventListener("pointerup", pointerUp);
canvas.addEventListener("pointercancel", pointerUp);
canvas.addEventListener("pointerleave", pointerUp);

function pointerDown(e){

    pointers.set(e.pointerId, e);

    const p = getCanvasPoint(e);

    const index = getFrameIndex(p.x, p.y);

    if(index === -1) return;

    activePhotoIndex = index;
    currentPhotoIndex = index;

    const now = Date.now();

if(
    lastTapIndex === index &&
    now - lastTapTime < 300
){

    photoInput.click();

    lastTapTime = 0;
    lastTapIndex = -1;

    return;

}

lastTapTime = now;
lastTapIndex = index;

    // Jika belum ada foto
    if(!photos[index]){

        currentPhotoIndex = index;

        photoInput.click();

        return;

    }

    isPointerDown = true;
    isDragging = false;

    dragStartX = p.x;
    dragStartY = p.y;

    dragOffsetX = photos[activePhotoIndex].offsetX;
    dragOffsetY = photos[activePhotoIndex].offsetY;

    // Simpan jarak awal pinch
    if(pointers.size === 2){

        const list = [...pointers.values()];

        pinchDistance = getDistance(list[0], list[1]);

        pinchScale = photos[activePhotoIndex].scale;

    }

    render();

}

function pointerMove(e){

    pointers.set(e.pointerId, e);

    const photo = photos[activePhotoIndex];

    if(!photo) return;

    // =========================
    // PINCH
    // =========================

    if(pointers.size === 2){

        const list = [...pointers.values()];

        const distance = getDistance(list[0], list[1]);

        photo.scale = pinchScale * (distance / pinchDistance);

        photo.scale = Math.max(0.5, Math.min(5, photo.scale));

        render();

        return;

    }

    // =========================
    // DRAG
    // =========================

    if(!isPointerDown) return;

    const p = getCanvasPoint(e);

    const dx = p.x - dragStartX;
    const dy = p.y - dragStartY;

    if(!isDragging){

        if(Math.abs(dx) < DRAG_THRESHOLD &&
           Math.abs(dy) < DRAG_THRESHOLD){
            return;
        }

        isDragging = true;

    }

    photo.offsetX = dragOffsetX + dx;
    photo.offsetY = dragOffsetY + dy;

    render();

}

function pointerUp(e){

    pointers.delete(e.pointerId);

    if(pointers.size < 2){

        pinchDistance = 0;

    }

    isPointerDown = false;

    isDragging = false;

}

function wheelZoom(e){

    e.preventDefault();

    if(activePhotoIndex === null) return;

    const photo = photos[activePhotoIndex];

    if(!photo) return;

    if(e.deltaY < 0){

        photo.scale += 0.05;

    }else{

        photo.scale -= 0.05;

    }

    // Batas zoom
    photo.scale = Math.max(0.5, Math.min(5, photo.scale));

    render();

}

// =========================================
// EXPORT KE GLOBAL
// =========================================

window.canvas = canvas;
window.render = render;
window.loadEditor = loadEditor;
