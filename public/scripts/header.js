window.addEventListener("load", () => {
    if (
        localStorage.getItem("idUsuario") &&
        document.querySelector("#nome a")
    ) {
        const logo = localStorage.getItem("logoUsuario");
        const nome = localStorage.getItem("nomeUsuario");
        const id = localStorage.getItem("idUsuario");
        document.querySelector("#logo").textContent = logo;
        document.querySelector("#nome a").textContent = nome;
        document
            .querySelector("#nome a")
            .setAttribute("href", `/usuarios/perfil/${id}`);
    }
});

const items_menu = document.querySelectorAll(
    ".menu-navegacao-items-item-titulo"
);
const sub_items_menu = document.querySelectorAll(
    ".sub-menu-navegacao-items-item-titulo"
);

items_menu.forEach((item, i) => {
    item.addEventListener("click", () => {
        if(0 <= i <= 1){
            sub_items_menu[i].classList.toggle('sub-menu-navegacao-items-item-titulo-visival')
            const other = i == 1 ? 0 : 1;
            sub_items_menu[other].classList.remove('sub-menu-navegacao-items-item-titulo-visival')
        }
    });
});

const menu = document.querySelector(".menu");
if (document.querySelector(".menu-hero-btn")) {
    document.querySelector(".menu-hero-btn").addEventListener("click", () => {
        menu.classList.toggle("menu-visivel");
        document
            .querySelector(".main-page")
            .classList.toggle("main-page-inativo");
        document
            .querySelector(".modal-menu")
            .classList.toggle("modal-menu-visivel");
    });
}

if (document.querySelector(".modal-menu")) {
    document.querySelector(".modal-menu").addEventListener("click", (event) => {
        if (menu.classList.contains("menu-visivel")) {
            menu.classList.remove("menu-visivel");
            document
                .querySelector(".main-page")
                .classList.remove("main-page-inativo");
            document
                .querySelector(".modal-menu")
                .classList.remove("modal-menu-visivel");
        }
    });
}
