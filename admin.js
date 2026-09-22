// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

const SUPABASE_URL =
    "https://pkntkbnazykqehilggct.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXAiLCJyZWYiOiJwa250a2JuYXp5a3FlaGlsZ2djdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg5NzQ5ODk4LCJleHAiOjIxMDUzMjU4OTh9.K7aDh9ikINZuhL7RFiM91ENgcyARnZDlnvsIBGc8WQA";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================================
// VARIÁVEIS
// ============================================================

let adminPassword = "";
let respostas = [];


// ============================================================
// ELEMENTOS
// ============================================================

const loginForm =
    document.getElementById("loginForm");

const loginSection =
    document.getElementById("loginSection");

const adminPanel =
    document.getElementById("adminPanel");

const adminPasswordInput =
    document.getElementById("adminPassword");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const closeResearchButton =
    document.getElementById("closeResearchButton");

const openResearchButton =
    document.getElementById("openResearchButton");

const refreshButton =
    document.getElementById("refreshButton");

const exportButton =
    document.getElementById("exportButton");

const resetResearchButton =
    document.getElementById("resetResearchButton");

const totalResponses =
    document.getElementById("totalResponses");

const totalParticipants =
    document.getElementById("totalParticipants");

const lastResponse =
    document.getElementById("lastResponse");

const resultsContainer =
    document.getElementById("resultsContainer");

const participantsContainer =
    document.getElementById("participantsContainer");

const individualResponseSection =
    document.getElementById(
        "individualResponseSection"
    );

const individualResponseContainer =
    document.getElementById(
        "individualResponseContainer"
    );

const individualResponseDescription =
    document.getElementById(
        "individualResponseDescription"
    );

const adminStatus =
    document.getElementById("adminStatus");

const statusDescription =
    document.getElementById(
        "statusDescription"
    );

const adminMessage =
    document.getElementById("adminMessage");

const adminMessageTitle =
    document.getElementById(
        "adminMessageTitle"
    );

const adminMessageText =
    document.getElementById(
        "adminMessageText"
    );

const adminError =
    document.getElementById("adminError");


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const senha =
            adminPasswordInput.value.trim();

        loginError.classList.add("hidden");

        if (!senha) {

            loginError.textContent =
                "Digite a senha.";

            loginError.classList.remove(
                "hidden"
            );

            return;
        }

        try {

            const { data, error } =
                await supabaseClient.rpc(
                    "admin_get_responses",
                    {
                        admin_password: senha
                    }
                );

            if (error) {
                console.error(
                    "Erro RPC admin_get_responses:",
                    error
                );

                throw error;
            }

            adminPassword = senha;

            respostas = data || [];

            loginSection.classList.add(
                "hidden"
            );

            adminPanel.classList.remove(
                "hidden"
            );

            adminPasswordInput.value = "";

            await carregarPainel();

        } catch (error) {

            console.error(
                "Erro no login:",
                error
            );

            loginError.textContent =
                "Senha incorreta ou erro ao acessar o painel.";

            loginError.classList.remove(
                "hidden"
            );
        }
    }
);


// ============================================================
// CARREGAR PAINEL
// ============================================================

async function carregarPainel() {

    esconderMensagens();

    await verificarStatus();

    await carregarRespostas();
}


// ============================================================
// VERIFICAR STATUS
// ============================================================

async function verificarStatus() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "get_research_status"
            );

        if (error) {
            throw error;
        }

        atualizarStatus(
            data === true
        );

    } catch (error) {

        console.error(
            "Erro ao verificar status:",
            error
        );

        mostrarErro(
            "Não foi possível verificar o status da pesquisa."
        );
    }
}


// ============================================================
// ATUALIZAR STATUS
// ============================================================

function atualizarStatus(isOpen) {

    if (isOpen) {

        adminStatus.textContent =
            "● Pesquisa aberta";

        adminStatus.classList.remove(
            "closed"
        );

        statusDescription.textContent =
            "A pesquisa está recebendo novas respostas.";

        closeResearchButton.disabled =
            false;

        openResearchButton.disabled =
            true;

    } else {

        adminStatus.textContent =
            "● Pesquisa encerrada";

        adminStatus.classList.add(
            "closed"
        );

        statusDescription.textContent =
            "A pesquisa não está recebendo novas respostas.";

        closeResearchButton.disabled =
            true;

        openResearchButton.disabled =
            false;
    }
}


// ============================================================
// CARREGAR RESPOSTAS
// ============================================================

async function carregarRespostas() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "admin_get_responses",
                {
                    admin_password:
                        adminPassword
                }
            );

        if (error) {
            throw error;
        }

        respostas = data || [];

        atualizarResumo();

        mostrarResultados();

        mostrarParticipantes();

    } catch (error) {

        console.error(
            "Erro ao carregar respostas:",
            error
        );

        mostrarErro(
            "Não foi possível carregar os resultados."
        );
    }
}


// ============================================================
// RESUMO
// ============================================================

function atualizarResumo() {

    const total =
        respostas.length;

    if (totalResponses) {
        totalResponses.textContent =
            total;
    }

    if (totalParticipants) {
        totalParticipants.textContent =
            total;
    }

    if (
        lastResponse &&
        respostas.length > 0
    ) {

        const datas =
            respostas
                .map(
                    resposta =>
                        new Date(
                            resposta.created_at
                        )
                )
                .sort(
                    (a, b) =>
                        b - a
                );

        lastResponse.textContent =
            formatarDataHora(
                datas[0]
            );

    } else if (lastResponse) {

        lastResponse.textContent =
            "—";
    }
}


// ============================================================
// RESULTADOS
// ============================================================

function mostrarResultados() {

    if (!resultsContainer) {
        return;
    }

    resultsContainer.innerHTML = "";

    if (respostas.length === 0) {

        resultsContainer.innerHTML = `

            <div class="admin-card">

                <h2>
                    Ainda não há respostas
                </h2>

                <p>
                    Quando os alunos responderem à pesquisa,
                    os resultados aparecerão aqui.
                </p>

            </div>

        `;

        return;
    }

    const perguntas = [

        {
            titulo:
                "1. Com qual cor ou raça você se identifica?",
            campo: "q1",
            opcoes: [
                "Branca",
                "Preta",
                "Parda",
                "Amarela",
                "Indígena",
                "Prefiro não responder"
            ]
        },

        {
            titulo:
                "2. Qual é a sua origem familiar ou cultural?",
            campo: "q2",
            opcoes: [
                "Brasileira",
                "Indígena",
                "Africana",
                "Europeia",
                "Asiática",
                "Outra"
            ]
        },

        {
            titulo:
                "3. Você participa ou conhece alguma tradição cultural da sua família ou comunidade?",
            campo: "q3",
            opcoes: [
                "Sim",
                "Não"
            ]
        },

        {
            titulo:
                "4. Você costuma participar de festas ou eventos culturais da sua comunidade?",
            campo: "q4",
            opcoes: [
                "Sempre",
                "Às vezes",
                "Raramente",
                "Nunca"
            ]
        },

        {
            titulo:
                "5. Você considera importante preservar a cultura e as tradições da sua região?",
            campo: "q5",
            opcoes: [
                "Sim, muito importante",
                "Sim, importante",
                "Pouco importante",
                "Não considero importante"
            ]
        }
    ];

    perguntas.forEach(
        function (pergunta, indice) {

            const contagens = {};

            pergunta.opcoes.forEach(
                function (opcao) {
                    contagens[opcao] = 0;
                }
            );

            respostas.forEach(
                function (resposta) {

                    const valor =
                        resposta[
                            pergunta.campo
                        ];

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                contagens,
                                valor
                            )
                    ) {
                        contagens[valor]++;
                    }
                }
            );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-card result-card";

            let html = `

                <div class="result-header">

                    <span class="tag">
                        PERGUNTA ${indice + 1}
                    </span>

                    <h2>
                        ${escapeHTML(
                            pergunta.titulo
                        )}
                    </h2>

                </div>

            `;

            pergunta.opcoes.forEach(
                function (opcao) {

                    const quantidade =
                        contagens[opcao];

                    const porcentagem =
                        respostas.length > 0
                            ? (
                                quantidade /
                                respostas.length
                            ) * 100
                            : 0;

                    html += `

                        <div class="result-item">

                            <div class="result-label">

                                <span>
                                    ${escapeHTML(
                                        opcao
                                    )}
                                </span>

                                <strong>
                                    ${quantidade}
                                    (${porcentagem.toFixed(1)}%)
                                </strong>

                            </div>

                            <div class="result-bar">

                                <div
                                    class="result-bar-fill"
                                    style="width: ${porcentagem}%"
                                ></div>

                            </div>

                        </div>

                    `;
                }
            );

            card.innerHTML =
                html;

            resultsContainer.appendChild(
                card
            );
        }
    );
}


// ============================================================
// PARTICIPANTES
// ============================================================

function mostrarParticipantes() {

    if (!participantsContainer) {
        return;
    }

    participantsContainer.innerHTML = "";

    if (respostas.length === 0) {

        participantsContainer.innerHTML = `

            <div class="admin-card">

                <h2>
                    Nenhum participante ainda
                </h2>

                <p>
                    Quando alguém responder à pesquisa,
                    o participante aparecerá nesta área.
                </p>

            </div>

        `;

        return;
    }

    respostas.forEach(
        function (resposta, indice) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "admin-card participant-item";

            const nome =
                resposta.nome ||
                "Nome não informado";

            const email =
                resposta.email ||
                "E-mail não informado";

            const data =
                resposta.created_at
                    ? formatarDataHora(
                        new Date(
                            resposta.created_at
                        )
                    )
                    : "Data não disponível";

            item.innerHTML = `

                <div class="participant-info">

                    <div>

                        <h3>
                            ${escapeHTML(nome)}
                        </h3>

                        <p>
                            ${escapeHTML(email)}
                        </p>

                        <small>
                            Respondeu em:
                            ${escapeHTML(data)}
                        </small>

                    </div>

                    <button
                        type="button"
                        class="secondary-button"
                        data-participant-index="${indice}"
                    >
                        👁️ Ver respostas
                    </button>

                </div>

            `;

            const botao =
                item.querySelector(
                    "[data-participant-index]"
                );

            if (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        mostrarRespostaIndividual(
                            indice
                        );
                    }
                );
            }

            participantsContainer.appendChild(
                item
            );
        }
    );
}


// ============================================================
// RESPOSTA INDIVIDUAL
// ============================================================

function mostrarRespostaIndividual(
    indice
) {

    const resposta =
        respostas[indice];

    if (!resposta) {
        return;
    }

    const nome =
        resposta.nome ||
        "Participante";

    const email =
        resposta.email ||
        "E-mail não informado";

    if (individualResponseSection) {

        individualResponseSection.classList.remove(
            "hidden"
        );
    }

    if (individualResponseDescription) {

        individualResponseDescription.textContent =
            `${nome} — ${email}`;
    }

    if (!individualResponseContainer) {
        return;
    }

    const perguntas = [

        {
            numero: 1,
            titulo:
                "Com qual cor ou raça você se identifica?",
            campo: "q1"
        },

        {
            numero: 2,
            titulo:
                "Qual é a sua origem familiar ou cultural?",
            campo: "q2"
        },

        {
            numero: 3,
            titulo:
                "Você participa ou conhece alguma tradição cultural da sua família ou comunidade?",
            campo: "q3"
        },

        {
            numero: 4,
            titulo:
                "Você costuma participar de festas ou eventos culturais da sua comunidade?",
            campo: "q4"
        },

        {
            numero: 5,
            titulo:
                "Você considera importante preservar a cultura e as tradições da sua região?",
            campo: "q5"
        }
    ];

    let html = `

        <div class="admin-card">

            <h2>
                ${escapeHTML(nome)}
            </h2>

            <p>
                ${escapeHTML(email)}
            </p>

            <hr>

    `;

    perguntas.forEach(
        function (pergunta) {

            html += `

                <div class="individual-answer">

                    <strong>
                        ${pergunta.numero}.
                        ${escapeHTML(
                            pergunta.titulo
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            resposta[
                                pergunta.campo
                            ] || "Não informado"
                        )}
                    </p>

                </div>

            `;
        }
    );

    html += `

        </div>

    `;

    individualResponseContainer.innerHTML =
        html;

    individualResponseSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================================
// ENCERRAR PESQUISA
// ============================================================

closeResearchButton.addEventListener(
    "click",
    async function () {

        if (
            !confirm(
                "Tem certeza que deseja encerrar a pesquisa?"
            )
        ) {
            return;
        }

        try {

            const { error } =
                await supabaseClient.rpc(
                    "admin_set_research_status",
                    {
                        admin_password:
                            adminPassword,
                        new_status:
                            false
                    }
                );

            if (error) {
                throw error;
            }

            atualizarStatus(false);

            mostrarMensagem(
                "Pesquisa encerrada",
                "A coleta de novas respostas foi encerrada."
            );

        } catch (error) {

            console.error(
                "Erro ao encerrar:",
                error
            );

            mostrarErro(
                "Não foi possível encerrar a pesquisa."
            );
        }
    }
);


// ============================================================
// REABRIR PESQUISA
// ============================================================

openResearchButton.addEventListener(
    "click",
    async function () {

        try {

            const { error } =
                await supabaseClient.rpc(
                    "admin_set_research_status",
                    {
                        admin_password:
                            adminPassword,
                        new_status:
                            true
                    }
                );

            if (error) {
                throw error;
            }

            atualizarStatus(true);

            mostrarMensagem(
                "Pesquisa reaberta",
                "A pesquisa voltou a receber respostas."
            );

        } catch (error) {

            console.error(
                "Erro ao reabrir:",
                error
            );

            mostrarErro(
                "Não foi possível reabrir a pesquisa."
            );
        }
    }
);


// ============================================================
// ATUALIZAR
// ============================================================

refreshButton.addEventListener(
    "click",
    async function () {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "Atualizando...";

        await carregarPainel();

        refreshButton.disabled =
            false;

        refreshButton.textContent =
            "↻ Atualizar resultados";

        mostrarMensagem(
            "Resultados atualizados",
            "Os dados mais recentes foram carregados."
        );
    }
);


// ============================================================
// ZERAR PESQUISA
// ============================================================

if (resetResearchButton) {

    resetResearchButton.addEventListener(
        "click",
        async function () {

            if (
                !confirm(
                    "ATENÇÃO!\n\n" +
                    "Isso apagará TODAS as respostas " +
                    "da pesquisa.\n\n" +
                    "Essa ação não poderá ser desfeita.\n\n" +
                    "Deseja realmente zerar a pesquisa?"
                )
            ) {
                return;
            }

            try {

                resetResearchButton.disabled =
                    true;

                resetResearchButton.textContent =
                    "Zerando...";

                const { data, error } =
                    await supabaseClient.rpc(
                        "admin_reset_research",
                        {
                            admin_password:
                                adminPassword
                        }
                    );

                if (error) {
                    throw error;
                }

                respostas = [];

                atualizarResumo();

                mostrarResultados();

                mostrarParticipantes();

                if (individualResponseSection) {

                    individualResponseSection.classList.add(
                        "hidden"
                    );
                }

                if (individualResponseContainer) {

                    individualResponseContainer.innerHTML =
                        "";
                }

                mostrarMensagem(
                    "Pesquisa zerada",
                    `${data || 0} resposta(s) foram apagadas. A pesquisa está pronta para uma nova coleta.`
                );

            } catch (error) {

                console.error(
                    "Erro ao zerar:",
                    error
                );

                mostrarErro(
                    "Não foi possível zerar a pesquisa."
                );

            } finally {

                resetResearchButton.disabled =
                    false;

                resetResearchButton.textContent =
                    "🔄 Zerar pesquisa";
            }
        }
    );
}


// ============================================================
// EXPORTAR CSV
// ============================================================

exportButton.addEventListener(
    "click",
    function () {

        if (respostas.length === 0) {

            mostrarErro(
                "Não há respostas para exportar."
            );

            return;
        }

        const cabecalho = [
            "Nome",
            "E-mail",
            "ID",
            "Pergunta 1",
            "Pergunta 2",
            "Pergunta 3",
            "Pergunta 4",
            "Pergunta 5",
            "Data"
        ];

        const linhas =
            respostas.map(
                function (resposta) {

                    return [
                        resposta.nome,
                        resposta.email,
                        resposta.id,
                        resposta.q1,
                        resposta.q2,
                        resposta.q3,
                        resposta.q4,
                        resposta.q5,
                        resposta.created_at
                    ];
                }
            );

        const csv = [
            cabecalho,
            ...linhas
        ]
            .map(
                function (linha) {

                    return linha
                        .map(
                            function (valor) {

                                return `"${String(
                                    valor ?? ""
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`;
                            }
                        )
                        .join(",");
                }
            )
            .join("\n");

        const blob =
            new Blob(
                ["\uFEFF" + csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "resultados-pesquisa-identidade-cultura-diversidade.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        mostrarMensagem(
            "CSV exportado",
            "O arquivo com os resultados foi preparado."
        );
    }
);


// ============================================================
// SAIR
// ============================================================

logoutButton.addEventListener(
    "click",
    function () {

        adminPassword = "";

        respostas = [];

        adminPanel.classList.add(
            "hidden"
        );

        loginSection.classList.remove(
            "hidden"
        );

        loginError.classList.add(
            "hidden"
        );

        resultsContainer.innerHTML =
            "";

        if (participantsContainer) {
            participantsContainer.innerHTML =
                "";
        }

        if (individualResponseSection) {

            individualResponseSection.classList.add(
                "hidden"
            );
        }

        if (individualResponseContainer) {

            individualResponseContainer.innerHTML =
                "";
        }

        if (totalResponses) {
            totalResponses.textContent =
                "0";
        }

        if (totalParticipants) {
            totalParticipants.textContent =
                "0";
        }

        if (lastResponse) {
            lastResponse.textContent =
                "—";
        }
    }
);


// ============================================================
// MENSAGEM DE SUCESSO
// ============================================================

function mostrarMensagem(
    titulo,
    texto
) {

    if (adminError) {
        adminError.classList.add(
            "hidden"
        );
    }

    if (adminMessageTitle) {
        adminMessageTitle.textContent =
            titulo;
    }

    if (adminMessageText) {
        adminMessageText.textContent =
            texto;
    }

    if (adminMessage) {

        adminMessage.classList.remove(
            "hidden"
        );

        setTimeout(
            function () {

                adminMessage.classList.add(
                    "hidden"
                );

            },
            5000
        );
    }
}


// ============================================================
// MENSAGEM DE ERRO
// ============================================================

function mostrarErro(
    texto
) {

    if (adminMessage) {

        adminMessage.classList.add(
            "hidden"
        );
    }

    if (adminError) {

        adminError.textContent =
            texto;

        adminError.classList.remove(
            "hidden"
        );
    }
}


// ============================================================
// ESCONDER MENSAGENS
// ============================================================

function esconderMensagens() {

    if (adminMessage) {

        adminMessage.classList.add(
            "hidden"
        );
    }

    if (adminError) {

        adminError.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// DATA E HORA
// ============================================================

function formatarDataHora(
    data
) {

    if (
        !data ||
        isNaN(data.getTime())
    ) {

        return "—";
    }

    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


// ============================================================
// PROTEÇÃO HTML
// ============================================================

function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
