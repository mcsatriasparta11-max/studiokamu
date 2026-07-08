// =========================================
// STUDIO KAMU
// EXPORT
// =========================================

document
    .getElementById("saveButton")
    .addEventListener("click", saveImage);

function saveImage() {

    // Render ulang agar hasil terbaru
    window.render();

    // Export JPG kualitas maksimum
    window.canvas.toBlob(function(blob){

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = "StudioKamu_" + Date.now() + ".jpg";

        link.click();

        URL.revokeObjectURL(link.href);

    }, "image/jpeg", 1.0);

}