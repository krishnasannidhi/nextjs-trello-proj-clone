import { databases, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { StringLiteral } from "typescript";
import { create } from "zustand";

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;
  searchString: string;
  setSearchString: (searchString: string) => void;
  deleteTodo: (taskIndex: number, todo: Todo, id: TypedColumn) => void;
  newTaskInput: string;
  setNewTaskInput: (newTaskInput: string) => void;
  newTaskType: TypedColumn;
  setNewTaskType: (columnId: TypedColumn) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  newTaskType: "todo",

  newTaskInput: "",
  searchString: "",
  setNewTaskInput: (newTaskInput: string) => set({ newTaskInput }),
  setNewTaskType: (columnId: TypedColumn) => set({ newTaskType: columnId }),

  setSearchString: (searchString: string) => set({ searchString }),
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },

  setBoardState: (board) => set({ board }),

  updateTodoInDB: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },

  deleteTodo: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    //delete todoId from new columns
    newColumns.get(id)?.todos.splice(taskIndex, 1);

    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
}));
