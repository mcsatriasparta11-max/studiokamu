// =========================================
// STUDIO KAMU
// EXPORT
// =========================================

document
    .getElementById("saveButton")
    .addEventListener("click", saveImage);

function saveImage(){

    // Render ulang agar hasil terbaru tersimpan
    window.render();

    // Buat link download
    const link = document.createElement("a");

    link.download =
        "StudioKamu_" +
        Date.now() +
        ".jpg";

    link.href =
        window.canvas.toDataURL(
            "image/jpeg",
            1
        );

    link.click();

}