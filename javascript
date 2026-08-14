const TURMAS = [
    "9º Ano",
    "1ª Série - Ensino Médio",
    "2ª Série - Ensino Médio",
    "3ª Série - Ensino Médio"
];

const DISCIPLINAS_SUGERIDAS = [
    "Matemática",
    "Português",
    "História",
    "Geografia",
    "Ciências",
    "Física",
    "Química",
    "Biologia",
    "Inglês",
    "Educação Física",
    "Artes",
    "Sociologia",
    "Filosofia",
    "Redação"
];

const usuarios = {};
const notas = {};
const frequencias = {};

let usuarioLogado = null;

function mostrarMensagem(idContainer, texto, tipo) {

    const container = document.getElementById(idContainer);

    container.innerHTML = `
        <div class="flash flash-${tipo}">
            ${texto}
        </div>
    `;

    setTimeout(() => {
        container.innerHTML = "";
    }, 4000);
}

function irParaTela(idTela) {

    document
        .querySelectorAll(".tela")
        .forEach(tela => tela.classList.remove("ativa"));

    document
        .getElementById(idTela)
        .classList.add("ativa");
}


function normalizarEmail(email) {
    return email.trim().toLowerCase();
}


function formatarDataBR(dataISO) {

    const [ano, mes, dia] = dataISO.split("-");

    return `${dia}/${mes}/${ano}`;
}

function popularSelectDeTurmas(idSelect) {

    const select = document.getElementById(idSelect);

    select.innerHTML =
        '<option value="">Selecione a turma...</option>' +

        TURMAS
            .map(turma =>
                `<option value="${turma}">${turma}</option>`
            )
            .join("");
}


function alternarCampoTurma(
    idGrupo,
    idSelect,
    tipoSelecionado
) {

    const grupo = document.getElementById(idGrupo);

    const ehAluno = tipoSelecionado === "aluno";

    grupo.style.display = ehAluno
        ? "block"
        : "none";

    document.getElementById(idSelect).required = ehAluno;

    if (
        ehAluno &&
        document.getElementById(idSelect).options.length <= 1
    ) {
        popularSelectDeTurmas(idSelect);
    }
}

function aoRegistrarConta(event) {

    event.preventDefault();

    const nome =
        document.getElementById("nome").value.trim();

    const email =
        normalizarEmail(
            document.getElementById("email").value
        );

    const senha =
        document.getElementById("senha").value;

    const tipo =
        document.getElementById("tipo").value;

    const turma =
        document.getElementById("turma-cadastro").value;


    if (usuarios[email]) {

        mostrarMensagem(
            "flash-cadastro",
            "Este e-mail já está cadastrado.",
            "erro"
        );

        return false;
    }


    if (tipo === "aluno" && !turma) {

        mostrarMensagem(
            "flash-cadastro",
            "Selecione a turma do aluno.",
            "erro"
        );

        return false;
    }


    usuarios[email] =
        tipo === "aluno"
            ? {
                nome,
                senha,
                tipo,
                turma
            }
            : {
                nome,
                senha,
                tipo
            };


    mostrarMensagem(
        "flash-cadastro",
        "Cadastro realizado com sucesso! Faça login.",
        "sucesso"
    );


    document
        .getElementById("form-registrar")
        .reset();

    document
        .getElementById("grupo-turma-cadastro")
        .style.display = "none";

    return false;
}

function aoFazerLogin(event) {

    event.preventDefault();

    const email =
        normalizarEmail(
            document.getElementById("email_login").value
        );

    const senha =
        document.getElementById("senha_login").value;

    const tipo =
        document.getElementById("tipo_login").value;


    const usuario = usuarios[email];

    const credenciaisValidas =
        usuario &&
        usuario.senha === senha &&
        usuario.tipo === tipo;


    if (!credenciaisValidas) {

        mostrarMensagem(
            "flash-cadastro",
            "E-mail, senha ou tipo de usuário incorretos.",
            "erro"
        );

        return false;
    }


    usuarioLogado = {
        email,
        tipo
    };


    if (tipo === "aluno") {

        abrirPainelAluno(email);

    } else {

        abrirPainelProfessor(usuario);

    }


    return false;
}

function aoSair(event) {

    event.preventDefault();

    usuarioLogado = null;

    irParaTela("tela-cadastro");

    mostrarMensagem(
        "flash-cadastro",
        "Você saiu do sistema.",
        "sucesso"
    );

    return false;
}

function calcularResumoFrequencia(email) {

    const registros =
        frequencias[email] || [];

    const total =
        registros.length;

    const faltas =
        registros.filter(
            registro =>
                registro.status === "falta"
        ).length;

    const presencas =
        total - faltas;

    const percentual =
        total > 0
            ? Math.round(
                (presencas / total) * 100
            )
            : null;


    return {
        total,
        presencas,
        faltas,
        percentual
    };
}

function abrirPainelAluno(email) {

    const aluno = usuarios[email];


    document.getElementById("aluno-nome")
        .textContent = aluno.nome;

    document.getElementById("aluno-email")
        .textContent = email;

    document.getElementById("aluno-turma-texto")
        .textContent = aluno.turma || "não informada";

    document.getElementById("aluno-turma-cabecalho")
        .textContent = aluno.turma || "";


    const notasDoAluno =
        notas[email] || {};

    const disciplinas =
        Object.keys(notasDoAluno).sort();


    const listaDisciplinas =
        document.getElementById(
            "aluno-lista-disciplinas"
        );


    listaDisciplinas.innerHTML =
        disciplinas.length > 0

            ? disciplinas
                .map(
                    disciplina =>
                        `<li>${disciplina}</li>`
                )
                .join("")

            : `
                <li class="texto-vazio">
                    Nenhuma disciplina com nota lançada ainda.
                </li>
            `;


    const listaNotas =
        document.getElementById(
            "aluno-lista-notas"
        );


    listaNotas.innerHTML =
        disciplinas.length > 0

            ? disciplinas
                .map(
                    disciplina =>
                        `
                        <li>
                            <span>${disciplina}</span>

                            <span class="tag-nota">
                                ${notasDoAluno[disciplina]}
                            </span>
                        </li>
                        `
                )
                .join("")

            : `
                <li class="sem-nota">
                    Nenhuma nota registrada até o momento.
                </li>
            `;


    const resumo =
        calcularResumoFrequencia(email);


    const elementoPercentual =
        document.getElementById(
            "aluno-frequencia-percentual"
        );

    const elementoDetalhe =
        document.getElementById(
            "aluno-frequencia-detalhe"
        );


    if (resumo.total > 0) {

        elementoPercentual.textContent =
            `${resumo.percentual}%`;

        elementoDetalhe.textContent =
            `${resumo.presencas} presença(s) · ${resumo.faltas} falta(s)`;

    } else {

        elementoPercentual.textContent = "—";

        elementoDetalhe.textContent =
            "Nenhum registro ainda";
    }


    const registros =
        (frequencias[email] || [])
            .slice()
            .sort(
                (a, b) =>
                    b.data.localeCompare(a.data)
            );


    const listaFrequencia =
        document.getElementById(
            "aluno-lista-frequencia"
        );


    listaFrequencia.innerHTML =
        registros.length > 0

            ? registros
                .map(registro => {

                    const rotulo =
                        registro.status === "presente"
                            ? "Presente"
                            : "Falta";

                    const classe =
                        registro.status === "presente"
                            ? "tag-presenca"
                            : "tag-falta";


                    return `
                        <li>
                            <span>
                                ${formatarDataBR(registro.data)}
                            </span>

                            <span class="${classe}">
                                ${rotulo}
                            </span>
                        </li>
                    `;
                })
                .join("")

            : `
                <li class="sem-nota">
                    Nenhum registro de frequência ainda.
                </li>
            `;


    irParaTela("tela-aluno");
}

function abrirPainelProfessor(professor) {

    document.getElementById("professor-nome")
        .textContent = professor.nome;

    document.getElementById("professor-email")
        .textContent = usuarioLogado.email;


    popularSelectDeTurmas(
        "novo-aluno-turma"
    );


    const campoData =
        document.getElementById(
            "frequencia-data"
        );


    if (!campoData.value) {

        campoData.value =
            new Date()
                .toISOString()
                .slice(0, 10);
    }


    atualizarPainelProfessor();

    irParaTela("tela-professor");
}

function listarAlunos() {

    return Object
        .entries(usuarios)

        .filter(
            ([, usuario]) =>
                usuario.tipo === "aluno"
        )

        .map(
            ([email, usuario]) => ({
                email,
                ...usuario
            })
        );
}

function disciplinasJaUtilizadas() {

    const encontradas =
        new Set(DISCIPLINAS_SUGERIDAS);


    Object
        .values(notas)
        .forEach(notasDoAluno => {

            Object
                .keys(notasDoAluno)
                .forEach(
                    disciplina =>
                        encontradas.add(disciplina)
                );

        });


    return Array
        .from(encontradas)
        .sort();
}

function atualizarPainelProfessor() {

    const alunos =
        listarAlunos();


    const turmasComAlunos =
        new Set(
            alunos
                .map(aluno => aluno.turma)
                .filter(Boolean)
        );


    document.getElementById(
        "professor-total-alunos"
    ).textContent = alunos.length;


    document.getElementById(
        "professor-turmas-ativas"
    ).textContent =
        turmasComAlunos.size;


    atualizarSelectsDeAlunos(alunos);

    atualizarSugestoesDeDisciplina();

    atualizarTabelaDeAlunos(alunos);
}

function atualizarSelectsDeAlunos(alunos) {

    const opcoes =
        '<option value="">Selecione um aluno...</option>' +

        alunos
            .map(
                aluno =>
                    `
                    <option value="${aluno.email}">
                        ${aluno.nome} — ${aluno.turma}
                    </option>
                    `
            )
            .join("");


    [
        document.getElementById("nota-aluno"),
        document.getElementById("frequencia-aluno")
    ]
        .forEach(select => {

            const selecionadoAtualmente =
                select.value;


            select.innerHTML =
                opcoes;


            if (
                alunos.some(
                    aluno =>
                        aluno.email ===
                        selecionadoAtualmente
                )
            ) {

                select.value =
                    selecionadoAtualmente;
            }

        });
}

function atualizarSugestoesDeDisciplina() {

    const datalist =
        document.getElementById(
            "sugestoes-disciplinas"
        );


    datalist.innerHTML =
        disciplinasJaUtilizadas()
            .map(
                disciplina =>
                    `<option value="${disciplina}">`
            )
            .join("");
}

function formatarNotasParaTabela(email) {

    const notasDoAluno =
        notas[email] || {};

    const entradas =
        Object.entries(notasDoAluno);


    if (entradas.length === 0) {

        return `
            <span class="texto-vazio">
                Nenhuma nota lançada
            </span>
        `;
    }


    return entradas
        .map(
            ([disciplina, nota]) =>
                `${disciplina}: <strong>${nota}</strong>`
        )
        .join(" &nbsp;·&nbsp; ");
}

function formatarFrequenciaParaTabela(email) {

    const resumo =
        calcularResumoFrequencia(email);


    if (resumo.total === 0) {

        return `
            <span class="texto-vazio">
                Sem registros
            </span>
        `;
    }


    return `
        ${resumo.percentual}%
        &nbsp;

        <span class="texto-vazio">
            (${resumo.presencas}P / ${resumo.faltas}F)
        </span>
    `;
}

function atualizarTabelaDeAlunos(alunos) {

    const corpo =
        document.getElementById(
            "tabela-alunos-corpo"
        );

    const avisoVazio =
        document.getElementById(
            "tabela-alunos-vazia"
        );


    if (alunos.length === 0) {

        corpo.innerHTML = "";

        avisoVazio.style.display =
            "block";

        return;
    }


    avisoVazio.style.display =
        "none";


    corpo.innerHTML =
        alunos
            .map(
                aluno =>
                    `
                    <tr>

                        <td>
                            ${aluno.nome}
                        </td>

                        <td>
                            ${aluno.email}
                        </td>

                        <td>
                            <span class="tag-turma">
                                ${aluno.turma}
                            </span>
                        </td>

                        <td>
                            ${formatarNotasParaTabela(
                                aluno.email
                            )}
                        </td>

                        <td>
                            ${formatarFrequenciaParaTabela(
                                aluno.email
                            )}
                        </td>

                    </tr>
                    `
            )
            .join("");
}

function aoCadastrarAluno(event) {

    event.preventDefault();


    const nome =
        document
            .getElementById("novo-aluno-nome")
            .value
            .trim();


    const email =
        normalizarEmail(
            document
                .getElementById("novo-aluno-email")
                .value
        );


    const senha =
        document.getElementById(
            "novo-aluno-senha"
        ).value;


    const turma =
        document.getElementById(
            "novo-aluno-turma"
        ).value;


    if (usuarios[email]) {

        mostrarMensagem(
            "flash-professor",
            "Já existe um usuário cadastrado com este e-mail.",
            "erro"
        );

        return false;
    }


    if (!turma) {

        mostrarMensagem(
            "flash-professor",
            "Selecione a turma do aluno.",
            "erro"
        );

        return false;
    }


    usuarios[email] = {
        nome,
        senha,
        tipo: "aluno",
        turma
    };


    mostrarMensagem(
        "flash-professor",
        `Aluno "${nome}" cadastrado na turma ${turma}.`,
        "sucesso"
    );


    document
        .getElementById("form-cadastrar-aluno")
        .reset();


    atualizarPainelProfessor();

    return false;
}

function aoLancarNota(event) {

    event.preventDefault();


    const emailAluno =
        document.getElementById(
            "nota-aluno"
        ).value;


    const disciplina =
        document
            .getElementById("nota-disciplina")
            .value
            .trim();


    const valorNota =
        parseFloat(
            document.getElementById(
                "nota-valor"
            ).value
        );


    if (!emailAluno) {

        mostrarMensagem(
            "flash-professor",
            "Selecione um aluno antes de lançar a nota.",
            "erro"
        );

        return false;
    }


    if (!disciplina) {

        mostrarMensagem(
            "flash-professor",
            "Informe o nome da disciplina.",
            "erro"
        );

        return false;
    }


    if (
        isNaN(valorNota) ||
        valorNota < 0 ||
        valorNota > 10
    ) {

        mostrarMensagem(
            "flash-professor",
            "Informe uma nota válida entre 0 e 10.",
            "erro"
        );

        return false;
    }


    if (!notas[emailAluno]) {
        notas[emailAluno] = {};
    }


    notas[emailAluno][disciplina] =
        valorNota;


    const nomeAluno =
        usuarios[emailAluno].nome;


    mostrarMensagem(
        "flash-professor",
        `Nota de ${disciplina} lançada para ${nomeAluno}.`,
        "sucesso"
    );


    document.getElementById(
        "nota-disciplina"
    ).value = "";


    document.getElementById(
        "nota-valor"
    ).value = "";


    atualizarPainelProfessor();

    return false;
}

function aoRegistrarFrequencia(event) {

    event.preventDefault();


    const emailAluno =
        document.getElementById(
            "frequencia-aluno"
        ).value;


    const data =
        document.getElementById(
            "frequencia-data"
        ).value;


    const status =
        document.getElementById(
            "frequencia-status"
        ).value;


    if (!emailAluno) {

        mostrarMensagem(
            "flash-professor",
            "Selecione um aluno antes de registrar a frequência.",
            "erro"
        );

        return false;
    }


    if (!data) {

        mostrarMensagem(
            "flash-professor",
            "Informe a data do registro.",
            "erro"
        );

        return false;
    }


    if (
        status !== "presente" &&
        status !== "falta"
    ) {

        mostrarMensagem(
            "flash-professor",
            "Selecione a situação do aluno na data informada.",
            "erro"
        );

        return false;
    }


    if (!frequencias[emailAluno]) {
        frequencias[emailAluno] = [];
    }


    const registroExistente =
        frequencias[emailAluno]
            .find(
                registro =>
                    registro.data === data
            );


    if (registroExistente) {

        registroExistente.status =
            status;

    } else {

        frequencias[emailAluno].push({
            data,
            status
        });
    }


    const nomeAluno =
        usuarios[emailAluno].nome;


    const rotulo =
        status === "presente"
            ? "Presença"
            : "Falta";


    mostrarMensagem(
        "flash-professor",
        `${rotulo} registrada para ${nomeAluno} em ${formatarDataBR(data)}.`,
        "sucesso"
    );


    document.getElementById(
        "frequencia-status"
    ).value = "";


    atualizarPainelProfessor();

    return false;
}
