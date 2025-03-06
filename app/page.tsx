"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { format, isBefore, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  categories: string[];
  createdAt: string; // The date the todo was created
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [displayedTodos, setDisplayedTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [currentCategories, setCurrentCategories] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const currentDateStr = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(selectedDate, "EEEE, MMMM d");
  const isCurrentDate = selectedDateStr === currentDateStr;

  // Load all todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Filter todos for display based on selected date
  useEffect(() => {
    if (todos.length === 0) return;

    if (isCurrentDate) {
      // For current date, show:
      // 1. Todos created today
      // 2. Incomplete todos from past dates
      const todayTodos = todos.filter(
        (todo) => todo.createdAt === currentDateStr
      );

      const incompletePastTodos = todos.filter(
        (todo) =>
          isBefore(parseISO(todo.createdAt), parseISO(currentDateStr)) &&
          !todo.completed
      );

      setDisplayedTodos([...todayTodos, ...incompletePastTodos]);
    } else {
      // For past/future dates, only show todos created on that date
      const dateTodos = todos.filter(
        (todo) => todo.createdAt === selectedDateStr
      );
      setDisplayedTodos(dateTodos);
    }
  }, [todos, selectedDateStr, currentDateStr, isCurrentDate]);

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    if (!isCurrentDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
    }
  };

  // Handle input changes and extract categories in real-time
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTodo(value);

    // Check if a bracket was just closed
    if (value.endsWith("]")) {
      const lastOpenBracket = value.lastIndexOf("[");
      if (lastOpenBracket !== -1) {
        // Extract the category
        const category = value
          .substring(lastOpenBracket + 1, value.length - 1)
          .trim();
        if (category) {
          // Add to categories if not empty
          setCurrentCategories([...currentCategories, category]);

          // Remove the bracketed text from input
          const newValue =
            value.substring(0, lastOpenBracket) + value.substring(value.length);
          setNewTodo(newValue);
        }
      }
    }
  };

  // Remove a category when clicked
  const removeCategory = (categoryToRemove: string) => {
    setCurrentCategories(
      currentCategories.filter((cat) => cat !== categoryToRemove)
    );
  };

  const addTodo = () => {
    if (newTodo.trim() === "" && currentCategories.length === 0) return;

    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      categories: currentCategories,
      createdAt: selectedDateStr,
    };

    // Update todos state
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);

    // Save to localStorage
    localStorage.setItem("todos", JSON.stringify(updatedTodos));

    // Reset input and categories
    setNewTodo("");
    setCurrentCategories([]);
  };

  const toggleTodo = (id: string) => {
    // Update todos state
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);

    // Save to localStorage
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
  };

  const deleteTodo = (id: string) => {
    // Update todos state
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);

    // Save to localStorage
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 lg:p-16">
      <div className="max-w-md mx-auto space-y-12">
        <header className="pt-8">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              className="p-1 text-black hover:text-stone-600 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="font-medium text-xl text-black">{displayDate}</h1>
            <button
              onClick={goToNextDay}
              className={`p-1 transition-colors ${
                isCurrentDate
                  ? "text-stone-300 cursor-not-allowed"
                  : "text-black hover:text-stone-600"
              }`}
              disabled={isCurrentDate}
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Add a todo [category]"
              value={newTodo}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTodo();
                }
              }}
              className="border-0 border-b border-black rounded-none px-0 py-2 bg-transparent focus-visible:ring-0 focus-visible:border-stone-400 placeholder:text-stone-600"
            />
            <p className="text-xs text-stone-600 pl-1">
              Use [brackets] to add categories
            </p>
          </div>

          {currentCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {currentCategories.map((category, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-transparent text-black border-stone-300 font-normal cursor-pointer hover:bg-stone-100 transition-colors"
                  onClick={() => removeCategory(category)}
                >
                  {category}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <ul className="space-y-6">
          {displayedTodos.map((todo) => (
            <li key={todo.id} className="flex items-start gap-3 group">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="mt-1 border-black "
              />
              <div className="flex-1 space-y-2">
                <p
                  className={`${
                    todo.completed ? "line-through text-stone-400" : ""
                  }`}
                >
                  {todo.text}
                  {todo.createdAt !== selectedDateStr && isCurrentDate && (
                    <span className="ml-2 text-xs text-stone-400">
                      (from {format(parseISO(todo.createdAt), "MMM d")})
                    </span>
                  )}
                </p>
                {todo.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {todo.categories.map((category, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-transparent text-black border-stone-300 font-normal"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete todo"
              >
                <X className="h-4 w-4 text-black hover:text-stone-600" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
