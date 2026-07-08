// =========================================
// STUDIO KAMU
// EDITOR V3 (ANDROID OPTIMIZED)
// =========================================

// =========================================
// CANVAS
// =========================================

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
});

canvas.style.touchAction = "none";

// =========================================
// INPUT
// =========================================

const photoInput = document.getElementById("photoInput");

// =========================================
// CANVAS SIZE
// =========================================

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

let currentPhotoIndex = null;
let activePhotoIndex = null;

// =========================================
// POINTER
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

const DRAG_THRESHOLD = 5;

// =========================================
// RENDER SCHEDULER
// =========================================

let renderPending = false;
let needsRender = true;

function scheduleRender() {

    needsRender = true;

    if (renderPending) return;

    renderPending = true;

    requestAnimationFrame(renderLoop);

}

function renderLoop() {

    if (needsRender) {

        render();

        needsRender = false;

    }

    renderPending = false;

}

// =========================================
// LOAD EDITOR
// =========================================

function loadEditor(template){

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    photos = [];

    activePhotoIndex = null;

    overlayImage = new Image();

    overlayImage.onload = scheduleRender;

    overlayImage.src = template.overlay;

}

// =========================================
// PHOTO INPUT
// =========================================

photoInput.onchange = async (e)=>{

    const file = e.target.files[0];

    if(!file) return;

    const img = new Image();

    img.src = URL.createObjectURL(file);

    await img.decode();

    photos[currentPhotoIndex] = {

        img,

        offsetX:0,
        offsetY:0,

        scale:1,

        rotation:0

    };

    activePhotoIndex = currentPhotoIndex;

    scheduleRender();

    photoInput.value="";

};

// =========================================
// HELPER
// =========================================

function isInsideFrame(x,y,frame){

    return (

        x>=frame.x &&
        x<=frame.x+frame.width &&

        y>=frame.y &&
        y<=frame.y+frame.height

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

    const dx = p1.clientX-p2.clientX;
    const dy = p1.clientY-p2.clientY;

    return Math.sqrt(dx*dx+dy*dy);

}

// =========================================
// RENDER
// =========================================

function render(){

    ctx.setTransform(1,0,0,1,0,0);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#FFFFFF";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawPhotos();

    drawOverlay();

}

// =========================================
// DRAW PHOTOS
// =========================================

function drawPhotos(){

    const total = photos.length;

    for(let i=0;i<total;i++){

        const photo = photos[i];

        if(!photo) continue;

        const frame = FRAMES[i];

        drawCover(photo,frame);

        drawCover(photo,{

            x:frame.x+RIGHT_OFFSET,

            y:frame.y,

            width:frame.width,

            height:frame.height

        });

    }

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

    const img = photo.img;

    if(!img) return;

    const coverScale = Math.max(

        frame.width / img.width,

        frame.height / img.height

    );

    const finalScale = coverScale * photo.scale;

    const drawWidth = img.width * finalScale;

    const drawHeight = img.height * finalScale;

    const centerX =

        frame.x +

        frame.width/2 +

        photo.offsetX;

    const centerY =

        frame.y +

        frame.height/2 +

        photo.offsetY;

    ctx.save();

    ctx.beginPath();

    ctx.rect(

        frame.x,

        frame.y,

        frame.width,

        frame.height

    );

    ctx.clip();

    ctx.translate(

        centerX,

        centerY

    );

    if(photo.rotation!==0){

        ctx.rotate(

            photo.rotation *

            Math.PI /

            180

        );

    }

    ctx.drawImage(

        img,

        -drawWidth/2,

        -drawHeight/2,

        drawWidth,

        drawHeight

    );

    ctx.restore();

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
canvas.addEventListener("pointerup", pointerUp);
canvas.addEventListener("pointercancel", pointerUp);
canvas.addEventListener("pointerleave", pointerUp);

canvas.addEventListener("wheel", wheelZoom, {
    passive:false
});

function pointerDown(e){

    canvas.setPointerCapture(e.pointerId);

    pointers.set(e.pointerId,e);

    const p = getCanvasPoint(e);

    const index = getFrameIndex(p.x,p.y);

    if(index===-1) return;

    activePhotoIndex = index;

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

    if(pointers.size===2){

        const list=[...pointers.values()];

        pinchDistance = getDistance(
            list[0],
            list[1]
        );

        pinchScale = photos[index].scale;

    }

    scheduleRender();

}

function pointerMove(e){

    if(!pointers.has(e.pointerId)) return;

    pointers.set(e.pointerId,e);

    const photo = photos[activePhotoIndex];

    if(!photo) return;

    // =====================
    // PINCH
    // =====================

    if(pointers.size===2){

        const list=[...pointers.values()];

        const distance=getDistance(

            list[0],
            list[1]

        );

        if(pinchDistance>0){

            const scale =

                pinchScale *

                (distance/pinchDistance);

            photo.scale=Math.max(

                0.5,

                Math.min(5,scale)

            );

            scheduleRender();

        }

        return;

    }

    if(!isPointerDown) return;

    const p=getCanvasPoint(e);

    const dx=p.x-dragStartX;
    const dy=p.y-dragStartY;

    if(

        !isDragging &&

        Math.abs(dx)<DRAG_THRESHOLD &&

        Math.abs(dy)<DRAG_THRESHOLD

    ){

        return;

    }

    isDragging=true;

    const newX=dragOffsetX+dx;
    const newY=dragOffsetY+dy;

    // Hindari render jika posisi tidak berubah

    if(

        newX===photo.offsetX &&

        newY===photo.offsetY

    ){

        return;

    }

    photo.offsetX=newX;
    photo.offsetY=newY;

    scheduleRender();

}

function pointerUp(e){

    if(canvas.hasPointerCapture(e.pointerId)){

        canvas.releasePointerCapture(

            e.pointerId

        );

    }

    pointers.delete(e.pointerId);

    if(pointers.size<2){

        pinchDistance=0;

    }

    isPointerDown=false;
    isDragging=false;

}

function wheelZoom(e){

    e.preventDefault();

    if(activePhotoIndex===null) return;

    const photo=photos[activePhotoIndex];

    if(!photo) return;

    const delta=e.deltaY<0 ? 0.05 : -0.05;

    photo.scale=Math.max(

        0.5,

        Math.min(

            5,

            photo.scale+delta

        )

    );

    scheduleRender();

}

// =========================================
// DRAW COVER (OPTIMIZED)
// =========================================

function drawCover(photo, frame){

    const img = photo.img;

    if(!img || !img.complete) return;

    // Hitung skala cover hanya sekali
    const coverScale = Math.max(
        frame.width / img.width,
        frame.height / img.height
    );

    const scale = coverScale * photo.scale;

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const centerX =
        frame.x +
        frame.width / 2 +
        photo.offsetX;

    const centerY =
        frame.y +
        frame.height / 2 +
        photo.offsetY;

    ctx.save();

    ctx.beginPath();
    ctx.rect(
        frame.x,
        frame.y,
        frame.width,
        frame.height
    );
    ctx.clip();

    ctx.translate(centerX, centerY);

    // Rotate hanya jika diperlukan
    if(photo.rotation !== 0){
        ctx.rotate(photo.rotation * Math.PI / 180);
    }

    // Image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
    );

    ctx.restore();

    // Border editor
    if(photo === photos[activePhotoIndex]){

        ctx.save();

        ctx.strokeStyle = "#00A8FF";
        ctx.lineWidth = 4;

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
// RESIZE
// =========================================

window.addEventListener("resize", () => {

    scheduleRender();

});

// =========================================
// VISIBILITY
// =========================================

document.addEventListener("visibilitychange", () => {

    if(!document.hidden){

        scheduleRender();

    }

});

// =========================================
// EXPORT
// =========================================

window.canvas = canvas;
window.render = render;
window.scheduleRender = scheduleRender;
window.loadEditor = loadEditor;