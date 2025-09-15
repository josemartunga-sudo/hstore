const formDeleteAgente = document.querySelector(".formDeleteAgente");
if (formDeleteAgente) {
    formDeleteAgente.addEventListener("submit", (event) => {
        event.preventDefault();

        const formDate = new FormData(formDeleteAgente);
        const bodyForm = Object.fromEntries(formDate.entries());
        if (confirm(`Tem a certeza que deseja eliminar o agente? Esta ação não pode ser desfeita!`)) {
            fetchDelete("/agentes/delete", bodyForm, `/agentes`);   
        }
    });
}

const formDeleteUsuario = document.querySelector(".formDeleteUsuario");
if (formDeleteUsuario) {
    formDeleteUsuario.addEventListener("submit", (event) => {
        event.preventDefault();

        const formDate = new FormData(formDeleteUsuario);
        const bodyForm = Object.fromEntries(formDate.entries());
        if (confirm(`Tem a certeza que deseja eliminar o usuario? Esta ação não pode ser desfeita!`)) {
            fetchDelete("/usuarios/delete", bodyForm, `/usuarios`);
        }
    });
}

const formDeleteFacturacao = document.querySelector(".formDeleteFacturacao");
if (formDeleteFacturacao) {
    formDeleteFacturacao.addEventListener("submit", (event) => {
        event.preventDefault();

        const formDate = new FormData(formDeleteFacturacao);
        const bodyForm = Object.fromEntries(formDate.entries());
        
        if (confirm(`Tem a certeza que deseja eliminar a faturação? Esta ação não pode ser desfeita!`)) {
            fetchDelete("/faturacao/delete", bodyForm, `/faturacao`);
        }
    });
}

async function fetchDelete(url, body, newPage) {
    const response = await fetch(url, {
        method: "delete",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const res = await response.json();

    if (response.status == 350) {
        alert(res.msg);
        return (window.location.href = "/");
    }

    if (response.status > 299) {
        return alert(res.msg);
    }

    return (window.location.href = newPage);
}