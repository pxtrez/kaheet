let type;
let data = [];


// -------------------------- notif -------------------------- //
// Show welcome notification

function notif() {
    console.clear();
    console.log(`%c\nKaheet made by pxtrez\n`, "color:#ff66ff");
    console.log(`Thank you for using Kaheet! I recommend that you read the docs before use!\nhttps://pxtrez.github.io/kaheet/\nPheaServices © 2021\nEducational purposes only!`);
    alert(`Thank you for using Kaheet!\nI recommend reading the docs before using!\nhttps://pxtrez.github.io/\nPheaServices © 2021`);
}
// -------------------------- notif -------------------------- //



// -------------------------- getInput -------------------------- //
// Get input from user
// Show instructions

function getInput() {
    return new Promise((resolve, reject) => {
        let input = prompt(
            `   📜 Enter the last part of link, that's visible on the teacher's screen.
    ❓  Where's quizID?
    🔗 https://play.kahoot.it/v2/lobby?quizId= [ quizID ]
    🔗 https://kahoot.it/challenge/ [ quizID ]
    ⚠️  Remember that the quizID is not the same as the quiz join code
    ⚠️  Getting answers by quiz join code is not supported yet
    ⚠️  Kaheet is 100% safe, which means it's not a virus or crap like that
    ❌ TO EXIT CLICK F5
        `);
        input.trim() !== "" ? resolve(input) : reject('Empty input');
    });
}
// -------------------------- getInput -------------------------- //





// -------------------------- checkInput -------------------------- //
// Check quizID

async function checkInput(input) {
    return new Promise(async(resolve, reject) => {
        const kahoot = await fetch(`https://kahoot.it/rest/kahoots/${input}`);

        if (!kahoot.ok || kahoot.status === 400) {
            const challenge = await fetch(
                `https://kahoot.it/rest/challenges/${input}/answers`
            );
            const json = await challenge.json();

            if (!challenge.ok ||
                challenge.status === 400
            ) {
                console.log(`⚠️  Error: QuizID not found!`);
                reject('QuizID not found');
            } else {
                type = "challenge";
                checkInput(json.challenge.kahoot.uuid);
            }
        } else {
            const json = await kahoot.json();
            resolve(json);
        }
    });
}
// -------------------------- checkInput -------------------------- //




// -------------------------- parse -------------------------- //
// Parse answers, questions and other data

function parse(json) {
    return new Promise((resolve) => {
        let returnData = [];
        let questions = json.questions;

        questions.forEach(question => {
            questionData = {
                question: question.question,
                type: question.type,
                answers: [],
                check: [],
                correct: [],
                skip: false
            }

            if (
                question.type === "content" ||
                question.type === "multiple_select_poll" ||
                question.type === "survey"
            ) {
                questionData.skip = true;
            }

            if (question.choices)
                question.choices.forEach((choice, index) => {
                    if (choice.correct) {
                        questionData.correct.push(index);

                        choice.answer ?
                            questionData.answers.push(choice.answer) :
                            questionData.answers.push('[ FAILED ]');

                    } else
                        questionData.check.push(index);
                });

            returnData.push(questionData);
        });
        answersToConsole(returnData);
        if (type === "challenge") {
            alert(`Ugh! We've detected, that you're running challenge mode!
For all answers, you have to check the console!`);
            alert(`If you want to have time to search current question,
you can pause quiz timers by typing 'pause()' in console!`);
        } else {
            resolve(returnData);
        }
    });
}
// -------------------------- parse -------------------------- //




// -------------------------- highlight -------------------------- //
// Show correct answers

function highlight(data) {
    setInterval(() => {
        let index;
        try {
            index = JSON.parse(
                localStorage.getItem("kahoot-game_session")
            ).questionNumber;
        } catch (e) {}

        if (index) {
            let type = data[index].type;
            let check = data[index].check;
            let correct = data[index].correct;
            let answers = data[index].answers;

            if (
                type !== "content" &&
                type !== "multiple_select_poll"
            ) {
                let box = document.querySelector(
                    "#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.status-bar__ContentBar-ivth8h-0.status-bar__TopBar-ivth8h-1.gCnEqt.GFKFx.top-bar__TopBar-sc-186o9v8-0.bIPhxy.question__TopBar-sc-12j7dwx-0.buBRpJ > div"
                );

                if (box) {
                    let text = answers.join("</p><p>");
                    if (box.style.display !== 'grid') {
                        elementModifier.display(box, 'grid');
                        elementModifier.fontSize(box, "25px");
                        elementModifier.textAlign(box, 'left');
                        elementModifier.lineHeight(box, '1.3');
                        elementModifier.text(box, `<p><p style="font-size: xxx-large;color: #00fff8;">Correct ${correct.length}/${correct.length + check.length} answers:</p><p>${text}</p><p style="color: lime;">Question type: ${type}`);
                    }
                }

                if (
                    type === "quiz" ||
                    type === "multiple_select_quiz"
                ) {

                    if (document.querySelector(
                            `[data-functional-selector="answer-1"]`
                        ) !== null) {
                        check.forEach(i => {
                            let element = document.querySelector(
                                `[data-functional-selector="answer-${i}"]`
                            );
                            if (element.style.transition !== '0.5s') {
                                elementModifier.transition(element, '0.5s');
                                elementModifier.opacity(element, 0.2);
                                elementModifier.filter(element, "blur(3px) grayscale(1)");
                            }
                        });

                        correct.forEach(i => {
                            let element = document.querySelector(
                                `[data-functional-selector="answer-${i}"]`);
                            if (element.style.transition !== '0.5s') {
                                elementModifier.transition(element, '0.5s');
                                elementModifier.filter(element, 'contrast(2)');
                                elementModifier.border(element, 'lime solid 3px');
                                elementModifier.borderRadius(element, '5px');
                            }
                        });
                    }
                }

            }
            if (type === "open_ended") {
                let element = document.querySelector(
                    `[data-functional-selector="text-answer-input"]`
                );
                if (element)
                    element.placeholder = answers[0];
            }
        }
    }, 50);
}
// -------------------------- highlight -------------------------- //




// -------------------------- pause -------------------------- //
// Pause quiz timers

function pause() {
    alert(`Now you can search your question without loosing time!
Remember, that teacher can see illegal time!
To resume, click 'OK' below`)
}
// -------------------------- pause -------------------------- //




// -------------------------- answersToConsole -------------------------- //
// Show answers in console

function answersToConsole(json) {
    json.forEach(question => {
        if (!question.skip) {
            console.log(`
%c❓ Question: %c${question.question}
%c📝 Answers (${question.answers.length}): %c\n${question.answers.join('\n')}
`,
                'color:orange;font-size:15px;',
                'color:white;font-size:20px;',
                'color:yellow;font-size:15px;',
                'color:white;font-size:20px;border:orange 1px solid;'
            );
        }
    });
}
// -------------------------- answersToConsole -------------------------- //





// -------------------------- element values change functions -------------------------- //

let elementModifier = {
    text(element, value) {
        element.innerHTML = value;
    },
    color(element, value) {
        element.style.color = value;
    },
    backgroundColor(element, value) {
        element.style.backgroundColor = value;
    },
    backgroundImage(element, value) {
        element.style.backgroundImage = `url(${value})`;
    },
    backgroundSize(element, value) {
        element.style.backgroundSize = value;
    },
    border(element, value) {
        element.style.border = value;
    },
    borderRadius(element, value) {
        element.style.borderRadius = value;
    },
    opacity(element, value) {
        element.style.opacity = value;
    },
    transition(element, value) {
        element.style.transition = value;
    },
    filter(element, value) {
        element.style.filter = value;
    },
    fontSize(element, value) {
        element.style.fontSize = value;
    },
    display(element, value) {
        element.style.display = value;
    },
    textAlign(element, value) {
        element.style.textAlign = value;
    },
    lineHeight(element, value) {
        element.style.lineHeight = value;
    }
};
// -------------------------- element values change functions -------------------------- //





// -------------------------- doFunc -------------------------- //
// Check if element exists and do function

function doFunc(selector, functions) {
    let main = "black";
    let text = "white";
    let background = "https://gifimage.net/wp-content/uploads/2017/09/black-and-white-gif-background-tumblr-7.gif";
    let border = "lime dashed 3px";

    let element = document.querySelector(selector);
    if (element) {
        console.log()
        functions.forEach(func => {
            eval(func);
        });
    };
}
// -------------------------- doFunc -------------------------- //





// -------------------------- theme -------------------------- //
// Change kahoot theme

function theme() {
    let elements = {
        nameholder: {
            elems: [
                '[data-functional-selector="nickname-status-bar"]'
            ],
            do: [
                "elementModifier.text(element, 'Kaheet has been injected!')"
            ]
        },
        nav: {
            elems: [
                '[data-functional-selector="controller-top-bar"]'
            ],
            do: [
                "elementModifier.backgroundColor(element, main)",
                "elementModifier.color(element, text)"
            ]
        },
        footer: {
            elems: [
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.status-bar__ContentBar-ivth8h-0.status-bar__BottomBar-ivth8h-2.gCnEqt.deQFTW.bottom-bar__BottomBar-sc-1bibjvm-0.cNyMFo',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div'
            ],
            do: [
                "elementModifier.backgroundColor(element, main)",
                "elementModifier.color(element, text)"
            ]
        },
        contentBg: {
            elems: [
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.question__PageMainContent-sc-12j7dwx-1.fMGBvU',
            ],
            do: [
                "elementModifier.backgroundColor(element, main)",
            ]
        },
        bg: {
            elems: [
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.styles__ResultPageMainContent-sc-15a2o5w-1.bMYQoA',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.styles__ResultPageMainContent-sc-15a2o5w-1.bMYQoA',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > main',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.background__Background-sc-15eg2v3-0.kPfwDm.sent__Background-sc-1s8zmdp-1.ffyYDa',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.wait-for-next-question__MainContainer-sc-1jhgzye-4.bXhFLq',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.background__Background-sc-15eg2v3-0.kPfwDm > div',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > div > main',
            ],
            do: [
                "elementModifier.backgroundImage(element, background)",
                "elementModifier.backgroundSize(element, 'cover')"
            ]
        },
        dragbox: {
            elems: [
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.question__PageMainContent-sc-12j7dwx-1.fMGBvU > div > section > div:nth-child(1)',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.question__PageMainContent-sc-12j7dwx-1.fMGBvU > div > section > div:nth-child(2)',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.question__PageMainContent-sc-12j7dwx-1.fMGBvU > div > section > div:nth-child(3)',
                '#root > div.controller__AppWrapper-sc-1m4rw0k-0.hHwuuw > main > div.question__PageMainContent-sc-12j7dwx-1.fMGBvU > div > section > div:nth-child(4)',
            ],
            do: [
                "elementModifier.border(element, border)"
            ]
        },
    };

    setInterval(() => {
        Object.keys(elements).forEach((element, index) => {
            let name = Object.keys(elements)[index];
            elements[name].elems.forEach(selector => {
                doFunc(selector, elements[name].do);
            });
        });
    });
}
// -------------------------- theme -------------------------- //




// -------------------------- init -------------------------- //
// Trigger functions

(async() => {
    theme();
    notif();

    const input = await getInput()
    const json = await checkInput(input);
    const parsed = await parse(json)

    highlight(parsed);

    console.log(`If you want to have time to search current question,
you can pause quiz timers by typing 'pause()' in console!`)

    return true;
})();
// -------------------------- init -------------------------- //