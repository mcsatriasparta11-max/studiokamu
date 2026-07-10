// =======================================
// STUDIO KAMU
// APP
// =======================================

let selectedTemplate = null;

// =====================
// ELEMENT
// =====================

const homePage =
document.getElementById("homePage");

const editorPage =
document.getElementById("editorPage");

const templateList =
document.getElementById("templateList");

const backButton =
document.getElementById("backButton");

const templateTitle =
document.getElementById("templateTitle");

const landingPage =
document.getElementById("landingPage");

const startButton =
document.getElementById("startButton");

// =====================
// LOAD TEMPLATE
// =====================

function loadTemplates(){

    templateList.innerHTML = "";

    TEMPLATES.forEach(template=>{

        const card = document.createElement("div");

        card.className = "template-card";

        card.innerHTML = `

            <img src="${template.preview}">

            <h3>${template.name}</h3>

        `;

       card.onclick = ()=>{

    selectedTemplate = template;

    templateTitle.innerText = template.name;

    history.pushState(
        {page:"editor"},
        "",
        "#editor"
    );

    homePage.style.display = "none";

    editorPage.style.display = "block";

    loadEditor(template);

};

        templateList.appendChild(card);

    });

}


// =====================
// INIT
// =====================

loadTemplates();

homePage.style.display = "none";

startButton.onclick = ()=>{

    landingPage.classList.add("hide");

    setTimeout(()=>{

        landingPage.style.display = "none";

        homePage.style.display = "block";

    },400);

};

const themeButton =
document.querySelector(".theme-toggle");

const savedTheme =
localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark");

    themeButton.innerHTML="☀️";

}

themeButton.onclick=()=>{

    document.body.classList.toggle("dark");

    const dark =
    document.body.classList.contains("dark");

    themeButton.innerHTML =
    dark ? "☀️" : "🌙";

    localStorage.setItem(
        "theme",
        dark ? "dark" : "light"
    );

};

const fullscreenButton =
document.querySelector(".fullscreen-toggle");

fullscreenButton.onclick = async ()=>{

    try{

        if(!document.fullscreenElement){

            await document.documentElement.requestFullscreen();

            fullscreenButton.innerHTML = "🗗";

        }else{

            await document.exitFullscreen();

            fullscreenButton.innerHTML = "⛶";

        }

    }catch(err){

        console.log(err);

    }

};

    // =====================
// TOMBOL KEMBALI
// =====================

backButton.onclick = () => {

    history.back();

};

window.addEventListener("popstate", ()=>{

    if(editorPage.style.display==="block"){

        editorPage.style.display="none";

        homePage.style.display="block";

    }

});
