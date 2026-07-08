// =======================================
// STUDIO KAMU
// APP
// =======================================

let selectedTemplate = null;

// =====================
// ELEMENT
// =====================

const homePage = document.getElementById("homePage");
const editorPage = document.getElementById("editorPage");

const templateList = document.getElementById("templateList");

const startButton = document.getElementById("startButton");
const backButton = document.getElementById("backButton");

const templateTitle = document.getElementById("templateTitle");

// =====================
// LOAD TEMPLATE
// =====================

function loadTemplates(){

    templateList.innerHTML="";

    TEMPLATES.forEach(template=>{

        const card=document.createElement("div");

        card.className="template-card";

        card.innerHTML=`

            <img src="${template.preview}">

            <h3>${template.name}</h3>

        `;

        card.onclick=()=>{

            document
            .querySelectorAll(".template-card")
            .forEach(item=>item.classList.remove("active"));

            card.classList.add("active");

            selectedTemplate=template;

        };

        templateList.appendChild(card);

    });

}

// =====================
// START
// =====================

startButton.onclick=()=>{

    if(!selectedTemplate){

        alert("Silakan pilih template.");

        return;

    }

    homePage.style.display="none";

    editorPage.style.display="block";

    templateTitle.innerText=selectedTemplate.name;

    loadEditor(selectedTemplate);

};

// =====================
// BACK
// =====================

backButton.onclick=()=>{

    editorPage.style.display="none";

    homePage.style.display="block";

};

// =====================
// INIT
// =====================

loadTemplates();
