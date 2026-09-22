const SUPABASE_URL =
    "https://pkntkbnazykqehilggct.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbnRrYm5henlrcWVoaWxnZ2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDk4OTgsImV4cCI6MjEwNTMyNTg5OH0.K7aDh9ikINZuhL7RFiM91ENgcyARnZDlnvsIBGc8WQA";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =================================================
// ELEMENTOS DA PÁGINA
// =================================================

const form =
    document.getElementById(
        "surveyForm"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const confirmation =
    document.getElementById(
        "confirmation"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const surveyContainer =
    document.getElementById(
        "surveyContainer"
    );

const closedMessage =
    document.getElementById(
        "closedMessage"
    );

const alreadyAnswered =
    document.getElementById(
        "alreadyAnswered"
    );

const researchStatus =
    document.getElementById(
        "researchStatus"
    );

const loginContainer =
    document.getElementById(
        "loginContainer"
    );

const googleLoginButton =
    document.getElementById(
        "googleLoginButton"
    );

const userInfo =
    document.getElementById(
        "userInfo"
    );

const userName =
    document.getElementById(
        "userName"
    );

const userEmail =
    document.getElementById(
        "userEmail"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// =================================================
// USUÁRIO ATUAL
// =================================================

let currentUser = null;


// =================================================
// URL DO SITE
// =================================================

const SITE_URL =
    "https://rafaelchagasoliveira-afk.github.io/Pesquisa-escolar-2026-jose/";


// =================================================
// VERIFICAR STATUS DA PESQUISA
// =================================================

async function checkResearchStatus() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "get_research_status"
            );


        if (error) {

            console.error(
                "Erro ao verificar pesquisa:",
                error
            );

            return;
        }


        updateResearchInterface(
            data === true
        );


    } catch (error) {

        console.error(
            "Erro:",
            error
        );

    }

}


// =================================================
// ATUALIZAR INTERFACE DA PESQUISA
// =================================================

function updateResearchInterface(
    isOpen
) {

    if (isOpen) {

        closedMessage.classList.add(
            "hidden"
        );

        researchStatus.textContent =
            "● Pesquisa aberta";

        researchStatus.classList.remove(
            "closed"
        );

        if (
            currentUser &&
            surveyContainer
        ) {

            surveyContainer.classList.remove(
                "hidden"
            );

        }

    } else {

        if (surveyContainer) {

            surveyContainer.classList.add(
                "hidden"
            );

        }

        closedMessage.classList.remove(
            "hidden"
        );

        researchStatus.textContent =
            "● Pesquisa encerrada";

        researchStatus.classList.add(
            "closed"
        );

    }

}


// =================================================
// LOGIN COM GOOGLE
// =================================================

async function loginWithGoogle() {

    try {

        googleLoginButton.disabled =
            true;

        googleLoginButton.textContent =
            "Conectando...";


        const {
            error
        } =
            await supabaseClient.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo: SITE_URL

                }

            });


        if (error) {

            throw error;

        }


    } catch (error) {

        console.error(
            "Erro no login:",
            error
        );


        errorMessage.textContent =
            "Não foi possível entrar com o Google. Tente novamente.";

        errorMessage.classList.remove(
            "hidden"
        );


        googleLoginButton.disabled =
            false;

        googleLoginButton.textContent =
            "Continuar com Google";

    }

}


// =================================================
// MOSTRAR USUÁRIO
// =================================================

function showUser(
    user
) {

    currentUser =
        user;


    const metadata =
        user.user_metadata || {};


    const name =
        metadata.full_name ||
        metadata.name ||
        user.email ||
        "Aluno";


    const email =
        user.email ||
        "";


    userName.textContent =
        name;

    userEmail.textContent =
        email;


    googleLoginButton.classList.add(
        "hidden"
    );

    userInfo.classList.remove(
        "hidden"
    );


    checkIfUserAlreadyAnswered();

}


// =================================================
// ESCONDER USUÁRIO
// =================================================

function hideUser() {

    currentUser =
        null;


    googleLoginButton.classList.remove(
        "hidden"
    );

    userInfo.classList.add(
        "hidden"
    );


    userName.textContent =
        "—";

    userEmail.textContent =
        "—";


    surveyContainer.classList.add(
        "hidden"
    );

    alreadyAnswered.classList.add(
        "hidden"
    );

}


// =================================================
// VERIFICAR SE JÁ RESPONDEU
// =================================================

async function checkIfUserAlreadyAnswered() {

    if (!currentUser) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("respostas")
                .select("id")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Erro ao verificar resposta:",
                error
            );

            errorMessage.textContent =
                "Não foi possível verificar se você já respondeu.";

            errorMessage.classList.remove(
                "hidden"
            );

            return;

        }


        if (data) {

            surveyContainer.classList.add(
                "hidden"
            );

            alreadyAnswered.classList.remove(
                "hidden"
            );

            return;

        }


        alreadyAnswered.classList.add(
            "hidden"
        );


        await checkResearchStatus();


    } catch (error) {

        console.error(
            "Erro:",
            error
        );

    }

}


// =================================================
// LOGOUT
// =================================================

async function logout() {

    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            throw error;

        }


        hideUser();


    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

    }

}


// =================================================
// ENVIO DA PESQUISA
// =================================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!currentUser) {

            errorMessage.textContent =
                "Entre com sua conta Google antes de responder.";

            errorMessage.classList.remove(
                "hidden"
            );

            return;

        }


        submitButton.disabled =
            true;

        submitButton.textContent =
            "Enviando...";


        confirmation.classList.add(
            "hidden"
        );

        errorMessage.classList.add(
            "hidden"
        );


        try {

            const formData =
                new FormData(form);


            const resposta = {

                q1:
                    formData.get("q1"),

                q2:
                    formData.get("q2"),

                q3:
                    formData.get("q3"),

                q4:
                    formData.get("q4"),

                q5:
                    formData.get("q5")

            };


            if (
                !resposta.q1 ||
                !resposta.q2 ||
                !resposta.q3 ||
                !resposta.q4 ||
                !resposta.q5
            ) {

                throw new Error(
                    "Responda todas as perguntas."
                );

            }


            // -----------------------------------------
            // VERIFICAR SE A PESQUISA ESTÁ ABERTA
            // -----------------------------------------

            const {
                data: isOpen,
                error: statusError
            } =
                await supabaseClient.rpc(
                    "get_research_status"
                );


            if (statusError) {

                throw statusError;

            }


            if (isOpen !== true) {

                updateResearchInterface(
                    false
                );

                throw new Error(
                    "A pesquisa foi encerrada."
                );

            }


            // -----------------------------------------
            // VERIFICAR NOVAMENTE SE JÁ RESPONDEU
            // -----------------------------------------

            const {
                data: existingResponse,
                error: existingError
            } =
                await supabaseClient
                    .from("respostas")
                    .select("id")
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .maybeSingle();


            if (existingError) {

                throw existingError;

            }


            if (existingResponse) {

                surveyContainer.classList.add(
                    "hidden"
                );

                alreadyAnswered.classList.remove(
                    "hidden"
                );

                throw new Error(
                    "Esta conta Google já respondeu à pesquisa."
                );

            }


            // -----------------------------------------
            // DADOS DO USUÁRIO
            // -----------------------------------------

            const metadata =
                currentUser.user_metadata ||
                {};


            const nome =
                metadata.full_name ||
                metadata.name ||
                currentUser.email ||
                "Aluno";


            const email =
                currentUser.email ||
                "";


            // -----------------------------------------
            // ENVIAR RESPOSTA
            // -----------------------------------------

            const {
                error
            } =
                await supabaseClient
                    .from("respostas")
                    .insert({

                        user_id:
                            currentUser.id,

                        nome:
                            nome,

                        email:
                            email,

                        q1:
                            resposta.q1,

                        q2:
                            resposta.q2,

                        q3:
                            resposta.q3,

                        q4:
                            resposta.q4,

                        q5:
                            resposta.q5

                    });


            if (error) {

                console.error(
                    "Erro Supabase:",
                    error
                );


                // Caso o banco tenha bloqueado
                // uma segunda resposta por
                // usuário.

                if (
                    error.code ===
                    "23505"
                ) {

                    surveyContainer.classList.add(
                        "hidden"
                    );

                    alreadyAnswered.classList.remove(
                        "hidden"
                    );

                    throw new Error(
                        "Esta conta Google já respondeu à pesquisa."
                    );

                }


                throw new Error(
                    "Não foi possível enviar sua resposta."
                );

            }


            // -----------------------------------------
            // SUCESSO
            // -----------------------------------------

            form.reset();


            surveyContainer.classList.add(
                "hidden"
            );


            confirmation.classList.remove(
                "hidden"
            );


            confirmation.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });


            setTimeout(
                function() {

                    confirmation.classList.add(
                        "hidden"
                    );

                    alreadyAnswered.classList.remove(
                        "hidden"
                    );

                },
                6000
            );


        } catch (error) {

            console.error(
                "Erro:",
                error
            );


            if (
                error.message !==
                "Esta conta Google já respondeu à pesquisa."
            ) {

                errorMessage.textContent =
                    error.message ||
                    "Ocorreu um erro ao enviar sua resposta.";

                errorMessage.classList.remove(
                    "hidden"
                );

            }

        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Enviar minha resposta";

        }

    }
);


// =================================================
// EVENTO DO BOTÃO GOOGLE
// =================================================

googleLoginButton.addEventListener(
    "click",
    loginWithGoogle
);


// =================================================
// EVENTO DO BOTÃO SAIR
// =================================================

logoutButton.addEventListener(
    "click",
    logout
);


// =================================================
// INICIALIZAÇÃO DA AUTENTICAÇÃO
// =================================================

async function initializeAuth() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            throw error;

        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            showUser(
                data.session.user
            );

        } else {

            hideUser();

        }


        await checkResearchStatus();


    } catch (error) {

        console.error(
            "Erro ao iniciar autenticação:",
            error
        );

    }

}


// =================================================
// OBSERVAR MUDANÇAS DE LOGIN
// =================================================

supabaseClient.auth.onAuthStateChange(
    async function(
        event,
        session
    ) {

        if (
            session &&
            session.user
        ) {

            showUser(
                session.user
            );

        } else {

            hideUser();

        }

    }
);


// =================================================
// INICIAR
// =================================================

initializeAuth();
