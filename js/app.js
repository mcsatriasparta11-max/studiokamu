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

            // Simpan template
            selectedTemplate = template;

            // Judul editor
            templateTitle.innerText =
            template.name;

            // Pindah halaman
            homePage.style.display = "none";

            editorPage.style.display = "block";

            // Load editor
            loadEditor(template);

        };

        templateList.appendChild(card);

    });

}

// =====================
// BACK
// =====================

backButton.onclick = ()=>{

    editorPage.style.display = "none";

    homePage.style.display = "block";

};

// =====================
// INIT
// =====================

loadTemplates();