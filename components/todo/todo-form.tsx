"use client";

import React, { useContext, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../ui/form";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { PlusIcon } from "lucide-react";
import { Input } from "../ui/input";
import { TodoContext } from "./todo-context";
import { Badge } from "../ui/badge";
import { getRandomColor } from "@/lib/utils";

const todoFormSchema = z.object({
  todo: z.string().min(1, { message: "Enter a Todo" }),
});

const TodoForm = () => {
  const { todos, setTodos, categories, setCategories } =
    useContext(TodoContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    React.useState<number>(-1);
  const todoForm = useForm<z.infer<typeof todoFormSchema>>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      todo: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof todoFormSchema>) => {
    const newTodo = {
      id: todos.length + 1,
      todo: data.todo,
      categories: categories,
    };
    setTodos([...todos, newTodo]);
    todoForm.reset();
    setCategories([]);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const todo = todoForm.getValues("todo");
      const cursorPosition = inputRef.current?.selectionStart || 0;
      if (cursorPosition === 0) {
        const categoriesMinusLast = categories.slice(0, -1);
        setCategories(categoriesMinusLast);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "[") {
      e.preventDefault(); // Prevent the [ from being typed
      const todo = todoForm.getValues("todo");
      const cursorPosition = inputRef.current?.selectionStart || 0;

      // Insert [] at cursor position
      const newTodo =
        todo.slice(0, cursorPosition) + "[]" + todo.slice(cursorPosition);
      todoForm.setValue("todo", newTodo);

      // Place cursor between brackets
      setTimeout(() => {
        inputRef.current?.setSelectionRange(
          cursorPosition + 1,
          cursorPosition + 1
        );
      }, 0);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const todo = todoForm.getValues("todo");
      const cursorPosition = inputRef.current?.selectionStart || 0;

      // Find any brackets in the text
      const openBracketPos = todo.lastIndexOf("[");
      const closeBracketPos = todo.indexOf("]", openBracketPos);

      if (openBracketPos !== -1 && closeBracketPos !== -1) {
        const currentInput = todo
          .slice(openBracketPos + 1, closeBracketPos)
          .trim()
          .toLowerCase();

        if (currentInput.length > 0) {
          // Get all existing categories from todos
          const todoCategories = todos.flatMap(({ categories }) => categories!);

          // Look for partial matches first, regardless of cursor position
          const matchingCategory = todoCategories.find((cat) =>
            cat.title.toLowerCase().startsWith(currentInput)
          );

          if (
            matchingCategory &&
            matchingCategory.title.toLowerCase() !== currentInput
          ) {
            // Autofill the bracket content with the matching category
            const newTodo =
              todo.slice(0, openBracketPos + 1) +
              matchingCategory.title +
              todo.slice(closeBracketPos);

            todoForm.setValue("todo", newTodo);

            // Place cursor at end of autofilled category
            setTimeout(() => {
              const newCursorPos =
                openBracketPos + 1 + matchingCategory.title.length;
              inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
            return;
          }

          // If no partial match or exact match found, proceed with category handling
          const existingCategory = todoCategories.find(
            (cat) => cat.title.toLowerCase() === currentInput
          );

          if (existingCategory) {
            // If exact match found, use the existing category
            setCategories([...categories, existingCategory]);
          } else {
            // If no exact match, create new category
            setCategories([
              ...categories,
              {
                id: todos.length + 1,
                title: currentInput,
                color: getRandomColor(),
              },
            ]);
          }

          // Remove the brackets and their content
          const newTodo =
            todo.slice(0, openBracketPos) + todo.slice(closeBracketPos + 1);

          todoForm.setValue("todo", newTodo);

          // Set cursor position to where the brackets were removed
          setTimeout(() => {
            inputRef.current?.setSelectionRange(openBracketPos, openBracketPos);
          }, 0);
        }
      }
    }
  };

  return (
    <Form {...todoForm}>
      <form
        onSubmit={todoForm.handleSubmit(onSubmit)}
        className="flex border border-input rounded-lg items-center relative"
      >
        <PlusIcon className="w-4 h-4 text-input mx-2 flex-shrink-0" />
        <div className="flex gap-0.5">
          {categories.map((category, index) => (
            <Badge
              key={index}
              className={`${category.color} text-white w-fit whitespace-nowrap `}
            >
              {category.title}
            </Badge>
          ))}
        </div>
        <FormField
          control={todoForm.control}
          name="todo"
          render={({ field }) => (
            <Input
              {...field}
              autoFocus
              ref={inputRef}
              onKeyUp={handleKeyUp}
              onKeyDown={handleKeyDown}
              className="border-none focus-visible:ring-0 focus-visible:outline-none shadow-none"
            />
          )}
        />
      </form>
    </Form>
  );
};

export default TodoForm;
