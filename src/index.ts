import { Quiz, Question, Choice, Answer, QuestionNumber } from "./types/types";

let lastQuestion = -1;

const getInput = () => {
    const input: string | null = prompt(`
👋 Hi, ${
        JSON.parse(localStorage.getItem("kahoot-game_session") || "")
            .playerName || "Guest"
    }!
📜 Enter the last part of link, that's visible on the teacher's screen.
❓ => Example:
🔗 https://play.kahoot.it/v2/lobby?quizId= [here]

⚠️  Remember that the quizID is not the quiz join code (e.g. 638592)
❌ TO EXIT CLICK F5
`);
    if (input == null) throw "Empty input";
    if (new RegExp(/^\d+$/g).test(input.replace(/\s/g, "")))
        throw "You cannot use the quiz join code";
    return input;
};

const checkForChallenge = (): boolean =>
    new RegExp(/\/\/kahoot\.it\/challenge\//g).test(window.location.href);

const getChallengeId = (): string => {
    const url = window.location.href;

    if (new RegExp(/\/\/kahoot\.it\/challenge\//g).test(url)) {
        const challenge = new RegExp(
            /\/\/kahoot\.it\/challenge\/.*?\?challenge-id=/g
        ).test(url)
            ? url.match(
                  /(?<=(\/\/kahoot\.it\/challenge\/.*?\?challenge-id=)).*$/g
              )
            : url.match(/(?<=(\/\/kahoot\.it\/challenge\/)).*$/g);
        return challenge != null ? challenge[0] : "";
    } else return "";
};

const getQuestionNumber = (): number =>
    checkForChallenge()
        ? (
              Object.values(
                  JSON.parse(
                      localStorage.getItem("kahoot-challenge_session") || "{}"
                  )
              ).at(-1) as QuestionNumber
          ).completedGameBlockIndex
        : JSON.parse(localStorage.getItem("kahoot-game_session") || "{}")
              .questionNumber;

const checkForNewQuestion = (): boolean => {
    const currentQuestion = getQuestionNumber();

    if (currentQuestion != lastQuestion) {
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

const parseAnswers = (question: Question): Answer[] =>
    question.choices
        ?.filter((choice) => (<Choice>choice).correct)
        .map((choice, index: number) => {
            const choiceParsed = <Choice>choice;
            return question.type === "jumble"
                ? {
                      index: question.choices.indexOf(choice),
                      answer: `${index + 1}. ${choiceParsed.answer}`,
                      correct: choiceParsed.correct,
                  }
                : {
                      index: question.choices.indexOf(choice),
                      answer: choiceParsed.answer,
                      correct: choiceParsed.correct,
                  };
        });

const validateQuestion = (question: Question): boolean =>
    !["content", "multiple_select_poll", "survey"].some(
        (type: string) => question.type == type
    ) && question.choices != null;

const getCurrentQuestion = (title: string, data): Question =>
    data.find((question: Question) => question.question === title);

const getAnswerElement = (answer: Answer, length: number): HTMLElement => {
    if (checkForChallenge()) {
        const dummy = document.createElement("span");
        dummy.innerHTML = answer.answer;

        return Array.from(Array(length).keys())
            .map(
                (index) =>
                    (document.querySelector(
                        `[data-functional-selector="answer-${index}"]`
                    ) ||
                        document.querySelectorAll("[shape]")[
                            index
                        ]) as HTMLElement
            )
            .find((element: HTMLElement) =>
                element.innerText
                    .replace(/\s/g, "")
                    .includes(dummy.innerText.replace(/\s/g, ""))
            ) as HTMLElement;
    } else {
        return document.querySelector(
            `[data-functional-selector="answer-${answer.index}"]`
        ) as HTMLElement;
    }
};

const highlight = (question: Question) => {
    const answers = parseAnswers(question);

    if (question.type === "open_ended") {
        const element = (document.querySelector(
            `[data-functional-selector="text-answer-input"]`
        ) || document.querySelector("input")) as HTMLInputElement;

        if (element != null) {
            element.placeholder = answers[0].answer;
        }
    } else
        answers.forEach((choice: Answer) => {
            const answerElement =
                question.layout == "TRUE_FALSE"
                    ? (document.querySelector(
                          `[data-functional-selector="answer-0"]`
                      ) as HTMLElement)
                    : getAnswerElement(choice, question.choices.length);

            if (answerElement != null) {
                answerElement.style.border = "lime solid 10px";
                answerElement.style.borderRadius = "5px";
                answerElement.innerHTML = `<div style="display:grid;padding:5px;"><span style="color:white;font-size:150%;">${question.question}:</span><span style="color:lime;font-size:120%;">${choice.answer}</span></div>`;
            }
        });
};

const showAnswers = (quiz: Quiz) => {
    const data = quiz.questions;
    let currentQuestion;

    if (checkForChallenge()) {
        const element = document.querySelector(
            `[data-functional-selector="block-title"]`
        ) as HTMLInputElement;

        if (element != null) {
            currentQuestion = getCurrentQuestion(element.innerHTML, data);
        }
    } else {
        currentQuestion =
            data[getQuestionNumber() != null ? getQuestionNumber() : 0];
    }

    if (currentQuestion == null || !validateQuestion(currentQuestion)) return;

    highlight(currentQuestion);

    if (checkForNewQuestion()) {
        consoleAnswers(currentQuestion);
        if (currentQuestion.type === "jumble")
            alert(
                parseAnswers(currentQuestion)
                    .map((answer: Answer) => answer.answer)
                    .join("\n")
            );
    }
};

const consoleAnswers = (question: Question) => {
    const correctAnswers = parseAnswers(question).map(
        (answer: Answer) => answer.answer
    );

    console.log(
        `
%c❓ Question: %c${question.question}
%c📝 Answers (${correctAnswers.length}): %c\n${correctAnswers.join("\n")}`,
        "color:orange;font-size:15px;",
        "color:white;font-size:20px;",
        "color:yellow;font-size:15px;",
        "color:white;font-size:20px;"
    );
};

let quizid = checkForChallenge() ? getChallengeId() : getInput();
if (quizid == "") quizid = getInput();

getQuizData(quizid).then((quiz: Quiz) => {
    setInterval(() => {
        showAnswers(quiz);
    }, 500);
});
