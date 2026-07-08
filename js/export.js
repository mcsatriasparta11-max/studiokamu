// =========================================
// STUDIO KAMU
// EXPORT
// =========================================

const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbxtZFl6LrygPpUQwgRvlCvAUVJ6XRktmK3kyArVx9nUV7_dxBa76IZAqCxxxOYGH5QINA/exec";

document
    .getElementById("saveButton")
    .addEventListener("click", saveImage);

function saveImage(){

    // Render ulang
    window.render();

    const filename =
        "StudioKamu_" +
        Date.now() +
        ".jpg";

    window.canvas.toBlob(async function(blob){

        // ======================
        // Download ke HP
        // ======================

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = filename;

        link.click();

        URL.revokeObjectURL(link.href);

        // ======================
        // Upload ke Google Drive
        // ======================

        const reader = new FileReader();

        reader.onloadend = async ()=>{

            const base64 =
                reader.result.split(",")[1];

            try{

                const res =
                await fetch(SCRIPT_URL,{

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        filename:filename,

                        image:base64

                    })

                });

                const result =
                await res.json();

                console.log(result);

                alert("✅ Foto berhasil diupload ke Google Drive");

            }

            catch(err){

                console.error(err);

                alert("❌ Upload ke Google Drive gagal");

            }

        };

        reader.readAsDataURL(blob);

    },"image/jpeg",1);

}