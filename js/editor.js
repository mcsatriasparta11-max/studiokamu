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
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1800;

// =========================================
// FRAME
// =========================================

const FRAMES = [

    {
        x: 35,
        y: 65,
        width: 550,
        height: 790
    },

    {
        x: 35,
        y: 910,
        width: 550,
        height: 790
    }

];

const RIGHT_OFFSET = 600;

// =========================================
// DATA
// =========================================

let overlayImage = new Image();

let photos = [];

// foto yang dipilih ketika memilih gambar
let currentPhotoIndex = null;

// foto yang sedang diedit
let activePhotoIndex = null;

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

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    photos = [];

    activePhotoIndex = null;

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

    for(let i=0;i<FRAMES.length;i++){

        if(isInsideFrame(x,y,FRAMES[i])){

            return i;

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

    photos.forEach((photo,index)=>{

        if(!photo) return;

        const frame = FRAMES[index];

        drawCover(photo,frame);

        drawCover(photo,{
            x:frame.x+RIGHT_OFFSET,
            y:frame.y,
            width:frame.width,
            height:frame.height
        });

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

    dragOffsetX = photos[index].offsetX;
    dragOffsetY = photos[index].offsetY;

    // Simpan jarak awal pinch
    if(pointers.size === 2){

        const list = [...pointers.values()];

        pinchDistance = getDistance(list[0], list[1]);

        pinchScale = photos[index].scale;

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
