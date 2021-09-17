let lastQuestion: number = 0;

import { Quiz, Question, Choice, Answer } from "./types/types";

const getInput = () => {
    const input: string | null = prompt(`
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

const getQuestion = (data: Quiz): Question | any => {
    const index = getQuestionNumber();

    const question: Question = data.questions[index];

    const hasCorrectAnswers = [
        "content",
        "multiple_select_poll",
        "survey",
    ].some((type: string) => !(question.type === type));

    if (hasCorrectAnswers) return question;
    else return;
};

const getAnswersFromQuestion = (data: Question): any =>
    data.choices?.map((choice: Choice, index: number) => {
        return {
            index: index,
            answer: choice.answer,
            correct: choice.correct,
        } as Answer;
    });

const highlight = (quiz: Quiz) => {
    const data = getQuestion(quiz);
    const answers = getAnswersFromQuestion(data);

    if (data.type === "open_ended") {
        const element = document.querySelector(
            `[data-functional-selector="text-answer-input"]`
        ) as HTMLInputElement;

        if (element) element.placeholder = answers[0].answer;
    } else
        try {
            answers.forEach((choice: Answer) => {
                if (!choice.correct) return;

                const { index, answer } = choice;

                const answerElement = document.querySelector(
                    `[data-functional-selector="answer-${index}"]`
                ) as HTMLElement;

                if (answerElement == null) return;

                answerElement.style.border = "lime solid 10px";
                answerElement.style.borderRadius = "5px";
                answerElement.innerHTML = `<div style="display:grid;padding:5px;"><span style="color:white;font-size:150%;">${data.question}:</span><span style="color:lime;font-size:120%;">${answer}</span></div>`;
            });
        } catch (e) {}

    consoleAnswers(data.question, answers);
};

const consoleAnswers = (question: string, answers: Answer[]) => {
    if (!checkForNewQuestion()) return;

    const parsed_answers = answers.map((answer: Answer) => {
        if (answer.correct) return answer.answer;
    });

    console.log(
        `
%c❓ Question: %c${question}
%c📝 Answers (${parsed_answers.length}): %c\n${parsed_answers.join("\n")}`,
        "color:orange;font-size:15px;",
        "color:white;font-size:20px;",
        "color:yellow;font-size:15px;",
        "color:white;font-size:20px;"
    );
};

(async () => {
    const input = getInput();
    const quiz = await getQuizData(input);

    setInterval(() => {
        highlight(quiz);
    }, 500);
})();
