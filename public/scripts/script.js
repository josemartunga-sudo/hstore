const btnOptions = document.querySelector('.main-page-detalhes-cabecalho-menu .fa-ellipsis-v');
const menuOptions = document.querySelector('.main-page-detalhes-cabecalho-menu ul');

if (btnOptions) {
    btnOptions.addEventListener('click', () => {
        menuOptions.classList.add('main-page-detalhes-cabecalho-menu-visivel');
    });
}

// Fechar se clicar fora
document.addEventListener('click', (e) => {
    if (menuOptions) {
        if (!e.target.closest(".main-page-detalhes-cabecalho-menu")) {
            menuOptions.classList.remove('main-page-detalhes-cabecalho-menu-visivel');
        }
    }
});



// Animação de alertas
document.querySelectorAll(".alert").forEach((alert) => {
  setTimeout(() => {
    alert.style.animation = "slideOut 0.6s ease forwards";
    setTimeout(() => alert.remove(), 600); // remove após animação
  }, 4000); // 4 segundos visível
});


