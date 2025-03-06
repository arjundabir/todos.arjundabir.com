"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { format, isBefore, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import FooterLogoAnimation from "@/components/footer";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  categories: string[];
  createdAt: string; // The date the todo was created
  lastCompleted?: string; // Date when the todo was last completed
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [displayedTodos, setDisplayedTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [currentCategories, setCurrentCategories] = useState<string[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

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
    if (todos.length === 0) {
      setDisplayedTodos([]);
      return;
    }

    // Get todos created for the selected date
    const dateTodos = todos.filter(
      (todo) => todo.createdAt === selectedDateStr
    );

    // For current date, also include incomplete todos from past dates
    if (isCurrentDate) {
      const incompletePastTodos = todos.filter(
        (todo) =>
          isBefore(parseISO(todo.createdAt), parseISO(currentDateStr)) &&
          !todo.completed
      );

      setDisplayedTodos([...dateTodos, ...incompletePastTodos]);
    } else {
      setDisplayedTodos([...dateTodos]);
    }
  }, [todos, selectedDateStr, currentDateStr, isCurrentDate]);

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingTodoId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTodoId]);

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
    // For regular todos, toggle completed status
    const updatedTodos = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
  };

  const deleteTodo = (id: string) => {
    // Update todos state
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);

    // Save to localStorage
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editingTodoId) return;

    // Update the todo with the new text
    const updatedTodos = todos.map((todo) =>
      todo.id === editingTodoId ? { ...todo, text: editText.trim() } : todo
    );

    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));

    // Exit edit mode
    setEditingTodoId(null);
    setEditText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      setEditingTodoId(null);
      setEditText("");
    }
  };

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col">
      <div className="max-h-full bg-white text-black p-6 md:p-12 lg:p-16 overflow-y-clip flex-1">
        <div className="max-w-md mx-auto space-y-12">
          <header className="pt-8">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousDay}
                className="p-1 text-gray-400 hover:text-black transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="font-medium text-xl text-black">{displayDate}</h1>
              <button
                onClick={goToNextDay}
                className={`p-1 transition-colors ${
                  isCurrentDate
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-black"
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
              <div className="relative">
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
                  maxLength={50}
                  className="border-0 border-b border-gray-200 rounded-none px-0 py-2 pr-8 bg-transparent focus-visible:ring-0 focus-visible:border-black placeholder:text-gray-400"
                />
                <button
                  onClick={addTodo}
                  disabled={
                    newTodo.trim() === "" && currentCategories.length === 0
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Add todo"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 pl-1">
                  Use [brackets] to add categories
                </p>
                <p className="text-xs text-gray-400">{newTodo.length}/50</p>
              </div>
            </div>

            {currentCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {currentCategories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-transparent text-gray-600 border-gray-300 font-normal cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => removeCategory(category)}
                  >
                    {category}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ul className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {displayedTodos.map((todo) => (
              <li key={todo.id} className="flex items-start gap-3 group">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="mt-1 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    {editingTodoId === todo.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleEditKeyDown}
                        maxLength={50}
                        className={`w-full bg-transparent border-0 border-b border-stone-200 focus:outline-none focus:border-stone-400 px-0 py-0 ${
                          todo.completed ? "text-stone-400" : ""
                        }`}
                        autoFocus
                      />
                    ) : (
                      <p
                        className={`${
                          todo.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {todo.text}
                        {todo.createdAt !== selectedDateStr &&
                          isCurrentDate && (
                            <span className="ml-2 text-xs text-gray-400">
                              (from {format(parseISO(todo.createdAt), "MMM d")})
                            </span>
                          )}
                      </p>
                    )}
                  </div>
                  {todo.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {todo.categories.map((category, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-transparent text-gray-600 border-gray-300 font-normal"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {!editingTodoId && (
                    <button
                      onClick={() => startEditing(todo)}
                      className="p-1 mr-1 text-gray-400 hover:text-black transition-colors"
                      aria-label="Edit todo"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-black transition-colors"
                    aria-label="Delete todo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <FooterLogoAnimation />
    </div>
  );
}
