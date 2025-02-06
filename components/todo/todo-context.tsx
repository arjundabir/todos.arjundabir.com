"use client";
import React, { createContext, useState } from "react";
import { Todo } from "@/types/todo";

interface TodoContextProps {
  children: React.ReactNode;
}

interface TodoContextType {
  todos: Todo[];
  setTodos: (todo: Todo[]) => void;
}

export const TodoContext = createContext<TodoContextType>({
  todos: [],
  setTodos: (todo: Todo[]) => {
    console.log(todo);
  },
});

const TodoContextProvider = ({ children }: TodoContextProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  return (
    <TodoContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
