export interface Quiz {
    questions: [];
}

export interface Question {
    type: string;
    choices: [];
    question: string;
    layout: string;
}

export interface Choice {
    answer: string;
    correct: boolean;
}

export interface Answer {
    index: number;
    answer: string;
    correct: boolean;
}

export interface QuestionNumber {
    completedGameBlockIndex: number;
}
