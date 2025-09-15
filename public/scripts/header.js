window.addEventListener("load", () => {
    if (localStorage.getItem("idUsuario") && document.querySelector("#nome a")) {
        const logo = localStorage.getItem("logoUsuario");
        const nome = localStorage.getItem("nomeUsuario");
        const id = localStorage.getItem("idUsuario");
        document.querySelector("#logo").textContent = logo;
        document.querySelector("#nome a").textContent = nome;
        document.querySelector("#nome a").setAttribute("href", `/usuarios/perfil/${id}`);
    }
});

const item_menuTemp = document.querySelectorAll(".menu-navegacao-items-item");
let item_menu = [];
if (item_menuTemp) {
    item_menuTemp.forEach((item, i) => {
        if (i != 0) {
            item_menu.push(item);
        }
    });
}

const item_menu_titulo = document.querySelectorAll(
    ".menu-navegacao-items-item-titulo"
);
const sub_item_menu = document.querySelectorAll(
    ".menu-navegacao-items-item-sub"
);

if (item_menu) {
    item_menu.forEach((item, i) => {
        item.addEventListener("click", () => {
            sub_item_menu.forEach((sub_item, j) => {
                if (
                    sub_item.classList.contains("menu-navegacao-items-item-sub-visivel")
                ) {
                    if (i != j) {
                        item_menu_titulo[j + 1].classList.remove(
                            "menu-navegacao-items-item-titulo-hover"
                        );
                        sub_item_menu[j].classList.remove(
                            "menu-navegacao-items-item-sub-visivel"
                        );
                    }
                }
            });
            item_menu_titulo[i + 1].classList.toggle(
                "menu-navegacao-items-item-titulo-hover"
            );
            sub_item_menu[i].classList.toggle(
                "menu-navegacao-items-item-sub-visivel"
            );
        });
    });
}

const menu = document.querySelector(".menu");
if (document.querySelector(".menu-hero-btn")) {
    document.querySelector(".menu-hero-btn").addEventListener("click", () => {
        menu.classList.toggle("menu-visivel");
        document.querySelector(".main-page").classList.toggle("main-page-inativo");
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
