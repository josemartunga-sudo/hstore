const loaderContainer = document.getElementById("loaderContainer");

const formLogin = document.querySelector(".main-page-form-login-usuario");
if (formLogin) {
	formLogin.addEventListener("submit", (event) => {
		event.preventDefault();
		if (loaderContainer) {
			loaderContainer.style.display = "flex"; // Exibe o loader
		}

		const formDate = new FormData(formLogin);
		const bodyForm = Object.fromEntries(formDate.entries());
		fetchPost("/usuarios/login", bodyForm, "/").then(() => {
			if (loaderContainer) {
				loaderContainer.style.display = "none"; // Esconde o loader após a resposta
			}
		});
	});
}

const formCadastroUsuario = document.querySelector(
	".main-page-form-cadastro-usuario"
);
if (formCadastroUsuario) {
	formCadastroUsuario.addEventListener("submit", (event) => {
		event.preventDefault();
		if (loaderContainer) {
			loaderContainer.style.display = "flex"; // Exibe o loader
		}

		const formDate = new FormData(formCadastroUsuario);
		const bodyForm = Object.fromEntries(formDate.entries());
		fetchPost("/usuarios/cadastrar", bodyForm, "/usuarios").then(() => {
			if (loaderContainer) {
				loaderContainer.style.display = "none"; // Esconde o loader após a resposta
			}
		});
	});
}

const formCadastroAgente = document.querySelector(
	".main-page-form-cadastro-agente"
);
if (formCadastroAgente) {
	formCadastroAgente.addEventListener("submit", (event) => {
		event.preventDefault();

		if (loaderContainer) {
			loaderContainer.style.display = "flex"; // Exibe o loader
		}

		const formDate = new FormData(formCadastroAgente);
		const bodyForm = Object.fromEntries(formDate.entries());
		fetchPost("/agentes/cadastrar", bodyForm, "/agentes").then(() => {
			if (loaderContainer) {
				loaderContainer.style.display = "none"; // Esconde o loader após a resposta
			}
		});
	});
}

const formCadastroFaturacao = document.querySelector(
	".main-page-form-cadastro-faturacao"
);
if (formCadastroFaturacao) {
	formCadastroFaturacao.addEventListener("submit", (event) => {
		event.preventDefault();
		if (loaderContainer) {
			loaderContainer.style.display = "flex"; // Exibe o loader
		}

		const formDate = new FormData(formCadastroFaturacao);
		const bodyForm = Object.fromEntries(formDate.entries());
		console.log(bodyForm);

		fetchPost(
			"/faturacao/cadastrar",
			bodyForm,
			`/agentes/perfil/${bodyForm.agente_id}`
		).then(() => {
			if (loaderContainer) {
				loaderContainer.style.display = "none"; // Esconde o loader após a resposta
			}
		});
	});
}

const formPagar = document.querySelectorAll(".form-pagar form");
if (formPagar) {
	formPagar.forEach((form) => {
		form
			.addEventListener("submit", (event) => {
				event.preventDefault();
				if (loaderContainer) {
					loaderContainer.style.display = "flex"; // Exibe o loader
				}

				const formDate = new FormData(form);
				const bodyForm = Object.fromEntries(formDate.entries());
				fetchPost("/agentes/relatorio/pagar", bodyForm, window.location.href);
			})
			.then(() => {
				if (loaderContainer) {
					loaderContainer.style.display = "none"; // Esconde o loader após a resposta
				}
			});
	});
}

async function fetchPost(url, body, newPage) {
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const res = await response.json();

	if (response.status > 299) {
		if (res.page) {
			alert(res.msg);
			return (window.location.href = res.page);
		}
		return alert(res.msg);
	}

	if (res.msg === "Logado") {
		const usuario = res.usuario;

		localStorage.setItem("idUsuario", usuario.id_usuario);
		localStorage.setItem("nomeUsuario", usuario.nome);
		localStorage.setItem("logoUsuario", usuario.nome[0].toLocaleUpperCase());
		localStorage.setItem("tipoUsuario", usuario.tipo);
		return (window.location.href = newPage);
	}

	alert(res.msg);
	return (window.location.href = newPage);
}
