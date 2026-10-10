import { randomInt, randomUUID } from "node:crypto";
import type { Concept, Evidence } from "../analysis/concepts";

type Assistance = "yes" | "no" | "prefer_not_to_say";
type Option = { id: string; text: string };
type Choice = { text: string; misconception: string | null };
export type StoredItem = {
  id: string; conceptId: string; type: "multiple_choice"; question: string; options: Option[]; evidence: Evidence[];
  correctOptionId: string; choices: Map<string, Choice>; explanation: string;
};
export type StoredAssessment = { id: string; runId: string; items: StoredItem[] };
export type StoredAttempt = {
  id: string; itemId: string; conceptId: string; outcome: "correct" | "incorrect"; aiAssistance: Assistance;
  practiceOnly: boolean; feedback: string; gradingLabel: "Deterministically graded";
  misconception: string | null; evidence: Evidence[]; followUpQuestion: string; createdAt: number;
};

const templates: Record<string, { prompt: string; choices: [Choice, Choice, Choice]; explanation: string; followUp: string }> = {
  "async-await": {
    prompt: "What do async functions and await allow in code like this?",
    choices: [
      { text: "An async function returns a Promise, and await can use a Promise result inside it without blocking the whole runtime.", misconception: null },
      { text: "It makes the network or other asynchronous work run synchronously for every caller.", misconception: "Await blocks the whole JavaScript runtime" },
      { text: "It automatically catches every error from the asynchronous operation.", misconception: "Async/await catches every error automatically" },
    ], explanation: "An async function returns a Promise; await can use an asynchronous result inside it. Callers still need to handle failures.", followUp: "Where would you handle a rejection from this operation?",
  },
  promise: {
    prompt: "What is the role of Promise usage on this line?",
    choices: [
      { text: "It represents or combines asynchronous outcomes that can resolve or reject later.", misconception: null },
      { text: "It guarantees the operation succeeds.", misconception: "A Promise always succeeds" },
      { text: "It forces every task to run one after another.", misconception: "Promises always make tasks sequential" },
    ], explanation: "A Promise represents a result that may arrive later, including failure.", followUp: "How would this code respond if the Promise rejects?",
  },
  "error-handling": {
    prompt: "Why does this code use try/catch here?",
    choices: [
      { text: "It gives this code a place to respond when an operation throws or an awaited Promise rejects.", misconception: null },
      { text: "It prevents the operation from ever failing.", misconception: "Try/catch prevents the operation from failing" },
      { text: "It silently retries the operation by default.", misconception: "Try/catch retries an operation automatically" },
    ], explanation: "Try/catch provides an explicit path for handling thrown errors and awaited rejections.", followUp: "What should the catch block do for a caller or user?",
  },
  "react-state": {
    prompt: "What does useState help the component do at this line?",
    choices: [
      { text: "Keep a value across renders and schedule a render when its setter updates it.", misconception: null },
      { text: "Store a value permanently on the server.", misconception: "useState persists data on the server" },
      { text: "Change the rendered page without React processing an update.", misconception: "A state setter bypasses React's update process" },
    ], explanation: "useState gives a component a value and a setter that participates in React rendering.", followUp: "Which user action or effect might update this state?",
  },
  "react-effect": {
    prompt: "Why might this component call useEffect here?",
    choices: [
      { text: "To synchronize with something outside rendering after React commits an update.", misconception: null },
      { text: "To make the component's render function asynchronous.", misconception: "useEffect turns rendering into an async function" },
      { text: "To store data permanently in the repository.", misconception: "useEffect persists data automatically" },
    ], explanation: "useEffect is for work that synchronizes a component with an external system after rendering.", followUp: "What dependencies should cause this effect to run again?",
  },
  "fetch-api": {
    prompt: "What must this code account for when it calls fetch here?",
    choices: [
      { text: "The request returns a Promise, and the response status and failures need handling.", misconception: null },
      { text: "A successful fetch call always means the HTTP status is 200.", misconception: "A resolved fetch always has HTTP status 200" },
      { text: "Fetch executes server code from the response automatically.", misconception: "Fetch automatically executes source returned by the server" },
    ], explanation: "Fetch starts a request and returns a Promise for a response; application code should check response status and handle failures.", followUp: "Where does this code check whether the response is usable?",
  },
  functions: {
    prompt: "What does defining this function make possible for the surrounding code?",
    choices: [
      { text: "It groups behavior that can be called with inputs and can produce a result.", misconception: null },
      { text: "It runs once automatically as soon as the file is parsed.", misconception: "Defining a function immediately calls it" },
      { text: "It guarantees its output is the same for every input.", misconception: "A function returns the same result for every input" },
    ], explanation: "A function definition groups behavior; its body runs when the function is called.", followUp: "Where is this function called, and what does the caller expect?",
  },
  modules: {
    prompt: "What is the module syntax doing on this line?",
    choices: [
      { text: "It connects this file's declarations with other modules through import or export.", misconception: null },
      { text: "It copies every dependency's source into this line at runtime.", misconception: "Import/export copies all dependency source into this line at runtime" },
      { text: "It makes all values in the repository global variables.", misconception: "Module declarations make every value global" },
    ], explanation: "Import/export declares how this file shares or uses values across modules.", followUp: "Which other file supplies or uses the value named here?",
  },
};

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function createAssessment(runId: string, concepts: Concept[], requestedIds: string[]): StoredAssessment {
  const eligible = concepts.filter((concept) => templates[concept.id] && concept.evidence.length > 0);
  const selected = [...eligible.filter((concept) => requestedIds.includes(concept.id)), ...eligible.filter((concept) => !requestedIds.includes(concept.id))].slice(0, 2);
  if (selected.length < 2) throw new Error("At least two supported concepts with evidence are needed.");
  const items = selected.map((concept): StoredItem => {
    const template = templates[concept.id];
    const evidence = [concept.evidence[0]];
    const choices = shuffle(template.choices.map((choice, index) => ({ id: randomUUID(), ...choice, correct: index === 0 })));
    return {
      id: randomUUID(), conceptId: concept.id, type: "multiple_choice",
      question: `In ${evidence[0].path}:${evidence[0].startLine}, ${template.prompt}`,
      options: choices.map(({ id, text }) => ({ id, text })), evidence,
      correctOptionId: choices.find((choice) => choice.correct)!.id,
      choices: new Map(choices.map(({ id, text, misconception }) => [id, { text, misconception }])),
      explanation: template.explanation,
    };
  });
  return { id: randomUUID(), runId, items };
}

export function publicAssessment(assessment: StoredAssessment) {
  return { id: assessment.id, runId: assessment.runId, items: assessment.items.map(({ id, conceptId, type, question, options, evidence }) => ({ id, conceptId, type, question, options, evidence })) };
}

export function gradeAttempt(item: StoredItem, answer: string, aiAssistance: Assistance): StoredAttempt {
  if (!item.choices.has(answer) || !["yes", "no", "prefer_not_to_say"].includes(aiAssistance)) throw new Error("The answer or assistance declaration is invalid.");
  const correct = answer === item.correctOptionId;
  const misconception = correct ? null : item.choices.get(answer)!.misconception;
  const citation = `${item.evidence[0].path}:${item.evidence[0].startLine}`;
  const feedback = correct
    ? `Correct. In ${citation}, ${item.explanation}`
    : `This answer assumes ${misconception}. In ${citation}, ${item.explanation}`;
  return {
    id: randomUUID(), itemId: item.id, conceptId: item.conceptId, outcome: correct ? "correct" : "incorrect",
    aiAssistance, practiceOnly: aiAssistance === "prefer_not_to_say", feedback,
    gradingLabel: "Deterministically graded", misconception, evidence: item.evidence,
    followUpQuestion: templates[item.conceptId].followUp, createdAt: Date.now(),
  };
}

export function publicAttempt(attempt: StoredAttempt) {
  const { id, itemId, outcome, aiAssistance, practiceOnly, feedback, gradingLabel, misconception, evidence, followUpQuestion } = attempt;
  return { id, itemId, outcome, aiAssistance, practiceOnly, feedback, gradingLabel, misconception, evidence, followUpQuestion };
}

export function getCompletion(assessment: StoredAssessment, concepts: Concept[], attempts: StoredAttempt[], expiresAt: string) {
  const itemIds = new Set(assessment.items.map((item) => item.id));
  const relevant = attempts.filter((attempt) => itemIds.has(attempt.itemId));
  const gradedItems = new Set(relevant.filter((attempt) => !attempt.practiceOnly).map((attempt) => attempt.itemId));
  return {
    assessmentId: assessment.id, completed: assessment.items.every((item) => gradedItems.has(item.id)),
    itemCount: assessment.items.length, attemptedItemCount: new Set(relevant.map((attempt) => attempt.itemId)).size,
    concepts: concepts.map((concept) => {
      const related = relevant.filter((attempt) => attempt.conceptId === concept.id);
      const independent = related.filter((attempt) => attempt.aiAssistance === "no").at(-1);
      const assisted = related.filter((attempt) => attempt.aiAssistance === "yes").at(-1);
      return {
        conceptId: concept.id,
        status: independent?.outcome === "correct" || assisted?.outcome === "correct" ? "demonstrated" as const : "unverified" as const,
        independentOutcome: independent?.outcome ?? null, assistedOutcome: assisted?.outcome ?? null,
        practiceOnly: related.some((attempt) => attempt.practiceOnly), evidence: concept.evidence,
      };
    }),
    expiresAt,
  };
}
