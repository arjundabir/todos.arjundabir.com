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
    if (e.key === "[") {
      const todo = todoForm.getValues("todo");
      const cursorPosition = inputRef.current?.selectionStart || 0;
      const newTodo =
        todo.slice(0, cursorPosition) + "]" + todo.slice(cursorPosition);
      todoForm.setValue("todo", newTodo);

      setTimeout(() => {
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const todo = todoForm.getValues("todo");
      const cursorPosition = inputRef.current?.selectionStart || 0;

      // Find the nearest [ before the cursor
      const openBracketPos = todo.lastIndexOf("[", cursorPosition);
      // Find the nearest ] after the cursor
      const closeBracketPos = todo.indexOf("]", cursorPosition);

      // Check if cursor is between brackets and there's text of length > 1
      if (
        openBracketPos !== -1 &&
        closeBracketPos !== -1 &&
        cursorPosition > openBracketPos &&
        cursorPosition <= closeBracketPos
      ) {
        const categoryTitle = todo
          .slice(openBracketPos + 1, closeBracketPos)
          .trim();

        if (categoryTitle.length > 1) {
          // Add to categories
          setCategories([
            ...categories,
            {
              id: todos.length + 1,
              title: categoryTitle,
              color: getRandomColor(),
            },
          ]);

          // Remove the bracketed text from the input
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
