const API_URL ="https://pratica-fullstack-backend-1-ubfn.onrender.com/livro";

const formulario = document.querySelector("#form-livro");
const campoId = document.querySelector("#livro-id");
const campoLivro = document.querySelector("#livro");
const campoTestamento = document.querySelector("#testamento");
const campoCapitulos = document.querySelector("#capitulos");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaLivros = document.querySelector("#lista-livros");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function criarCartaoLivro(livro) {
  const cartao = document.createElement("article");
  cartao.className = "livro";

  const titulo = document.createElement("h3");
  titulo.textContent = livro.nome;

  const testamento = document.createElement("p");
  testamento.textContent = `Testamento: ${livro.testamento}`;

  const capitulos = document.createElement("p");
  capitulos.textContent = `Capítulos: ${livro.capitulos ?? "Não informado"}`;

  const id = document.createElement("p");
  id.textContent = `ID: ${livro._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-livro";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarLivroParaEdicao(livro._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirLivro(livro._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(titulo, testamento, capitulos, id, acoes);

  return cartao;
}

function exibirLivros(livros) {
  listaLivros.innerHTML = "";

  if (livros.length === 0) {
    mostrarMensagem("Nenhum livro cadastrado");
    return;
  }

  livros.forEach((livro) => {
    listaLivros.appendChild(criarCartaoLivro(livro));
  });

  mostrarMensagem(`${livros.length} livro(s) encontrado(s)`);
}

async function listarLivros() {
  try {
    mostrarMensagem("Carregando livros...");
    const livros = await fazerRequisicao(API_URL);
    exibirLivros(livros);
  } catch (erro) {
    listaLivros.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function buscarLivroPorId(id) {
  const livro = await fazerRequisicao(`${API_URL}/${id}`);
  exibirLivros([livro]);
  return livro;
}

async function salvarLivro(evento) {
  evento.preventDefault();

  const livro = {
    nome: campoLivro.value.trim(),
    testamento: campoTestamento.value.trim()
  };

  if (campoCapitulos.value !== "") {
    livro.capitulos = Number(campoCapitulos.value);
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? "PUT" : "POST";

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livro)
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? "Livro atualizado" : "Livro cadastrado");
    await listarLivros();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarLivroParaEdicao(id) {
  try {
    const livro = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = livro._id;
    campoLivro.value = livro.nome;
    campoTestamento.value = livro.testamento;
    campoCapitulos.value = livro.capitulos ?? "";
    tituloFormulario.textContent = "Editar livros";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoLivro.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirLivro(id) {
  const confirmou = window.confirm("Deseja excluir este Livro?");

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    mostrarMensagem("Livro excluído");
    await listarLivros();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Novo Livro";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarLivro);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarLivros);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarLivros();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    await buscarLivroPorId(id);
  } catch (erro) {
    listarLivros.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarLivros();
