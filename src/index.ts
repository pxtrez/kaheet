import { Quiz, Question, Choice, Answer } from "./types/types";

let lastQuestion = 0;

const getInput = () => {
    const input: string | null = prompt(`
👋 Hi, ${
        JSON.parse(localStorage.getItem("kahoot-game_session") || "{}")
            .playerName || "Guest"
    }!
📜 Enter the last part of link, that's visible on the teacher's screen.
❓  Where's quizID?
🔗 https://play.kahoot.it/v2/lobby?quizId= [ quizID ]
🔗 https://kahoot.it/challenge/ [ quizID ]
⚠️  Remember that the quizID is not the quiz join code (e.g. 638592)
❌ TO EXIT CLICK F5
`);
    if (input == null) throw "Empty input";

    return input;
};

const checkForChallenge = (): boolean => {
    return window.location.href.includes("challenge");
};

const getChallengeId = (): string =>
    window.location.href.split("challenge/")[1].split("/")[0];

const getQuestionNumber = (): number =>
    JSON.parse(localStorage.getItem("kahoot-game_session") || "{}")
        .questionNumber;

const checkForNewQuestion = (): boolean => {
    const currentQuestion = getQuestionNumber();

    if (currentQuestion !== lastQuestion) {
        lastQuestion = currentQuestion;
        return true;
    } else return false;
};

const getQuizData = async (input: string): Promise<Quiz> => {
    const isChallenge = checkForChallenge();

    const result = isChallenge
        ? await (
              await fetch(`https://kahoot.it/rest/challenges/${input}/answers`)
          ).json()
        : await (await fetch(`https://kahoot.it/rest/kahoots/${input}`)).json();

    if (result.error) throw new Error("Invalid quiz");

    return isChallenge ? result.challenge.kahoot : result;
};

const getAnswersFromQuestion = (question: Question): any =>
    question.choices?.map((choice: Choice, index: number) => {
        return {
            index: index,
            answer: choice.answer,
            correct: choice.correct,
        } as Answer;
    });

const validateQuestion = (question: Question): boolean => {
    if (
        ["content", "multiple_select_poll", "survey"].some(
            (type: string) => question.type !== type
        ) &&
        question.choices
    )
        return true;
    else return false;
};

const highlight = (quiz: Quiz) => {
    const data = quiz.questions;

    if (checkForChallenge()) {
        data.forEach((question: Question) => {
            if (validateQuestion(question))
                consoleAnswers(
                    question.question,
                    getAnswersFromQuestion(question)
                );
        });
        return;
    }

    const question: Question = data[getQuestionNumber()];
    if (!validateQuestion(question)) return;

    const answers = getAnswersFromQuestion(question);

    if (question.type === "open_ended") {
        const element = document.querySelector(
            `[data-functional-selector="text-answer-input"]`
        ) as HTMLInputElement;

        if (element != null) element.placeholder = answers[0].answer;
    } else
        answers.forEach((choice: Answer) => {
            if (!choice.correct) return;

            const { index, answer } = choice;

            const answerElement = document.querySelector(
                `[data-functional-selector="answer-${index}"]`
            ) as HTMLElement;

            if (answerElement != null) {
                answerElement.style.border = "lime solid 10px";
                answerElement.style.borderRadius = "5px";
                answerElement.innerHTML = `<div style="display:grid;padding:5px;"><span style="color:white;font-size:150%;">${question.question}:</span><span style="color:lime;font-size:120%;">${answer}</span></div>`;
            }
        });

    if (checkForNewQuestion()) consoleAnswers(question.question, answers);
};

const consoleAnswers = (question: string, answers: Answer[]) => {
    const correctAnswers = answers.filter((answer: Answer) => answer.correct);

    console.log(
        `
%c❓ Question: %c${question}
%c📝 Answers (${correctAnswers.length}): %c\n${correctAnswers
            .map((answer) => answer.answer)
            .join("\n")}`,
        "color:orange;font-size:15px;",
        "color:white;font-size:20px;",
        "color:yellow;font-size:15px;",
        "color:white;font-size:20px;"
    );
};

(async () => {
    const promptQuizId = async () => {
        const input = getInput();
        const quiz = await getQuizData(input);

        setInterval(() => {
            highlight(quiz);
        }, 500);
    };

    if (checkForChallenge()) {
        const quizid = getChallengeId();
        if (quizid == undefined) promptQuizId();

        const quiz = await getQuizData(quizid);
        highlight(quiz);
    } else {
        promptQuizId();
    }
})();
