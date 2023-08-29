import formatTodosForAI from "./formatTodosForAI";

const fetchSuggestion = async (board: Board) => {
  const todos = formatTodosForAI(board);

  console.log("todos in fetch suggestions ", todos);

  const response = await fetch("/api/generateSummary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todos }),
  });

  const GPTdata = await response.json();
  const { content } = GPTdata;

  return content;
};

export default fetchSuggestion;
