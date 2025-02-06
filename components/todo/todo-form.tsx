"use client";

import React, { useContext } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../ui/form";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { PlusIcon } from "lucide-react";
import { Input } from "../ui/input";
import { TodoContext } from "./todo-context";

const todoFormSchema = z.object({
  todo: z.string().min(1, { message: "Enter a Todo" }),
});

const TodoForm = () => {
  const { todos, setTodos } = useContext(TodoContext);
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
    };
    setTodos([...todos, newTodo]);
    todoForm.reset();
  };

  return (
    <Form {...todoForm}>
      <form
        onSubmit={todoForm.handleSubmit(onSubmit)}
        className="flex border border-input rounded-lg items-center"
      >
        <PlusIcon className="w-4 h-4 text-input mx-2" />
        <FormField
          control={todoForm.control}
          name="todo"
          render={({ field }) => (
            <Input
              {...field}
              className="border-none focus-visible:ring-0 focus-visible:outline-none shadow-none"
            />
          )}
        />
      </form>
    </Form>
  );
};

export default TodoForm;
