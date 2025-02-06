"use client";
import React, { createContext, useState } from "react";
import { Category, Todo } from "@/types/todo";

interface TodoContextProps {
  children: React.ReactNode;
}

interface TodoContextType {
  todos: Todo[];
  setTodos: (todo: Todo[]) => void;
  categories: Category[];
  setCategories: (category: Category[]) => void;
}

export const TodoContext = createContext<TodoContextType>({
  todos: [],
  setTodos: (todo: Todo[]) => {
    console.log(todo);
  },
  categories: [],
  setCategories: (category: Category[]) => {
    console.log(category);
  },
});

const TodoContextProvider = ({ children }: TodoContextProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  return (
    <TodoContext.Provider
      value={{ todos, setTodos, categories, setCategories }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
