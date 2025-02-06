"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContext } from "react";
import { TodoContext } from "./todo-context";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { XIcon } from "lucide-react";
import { Todo } from "@/types/todo";
import { Badge } from "../ui/badge";
export function TodoTable() {
  const { todos, setTodos } = useContext(TodoContext);
  const handleDelete = ({ id }: Todo) => {
    setTodos(todos.filter((t) => t.id !== id));
  };
  return (
    <Table>
      <TableCaption>A list of your todos.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead className="w-auto">Todo</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody key={todos.length}>
        {todos.map(({ id, todo, categories }) => (
          <TableRow key={id}>
            <TableCell className="w-fit">
              <Checkbox />
            </TableCell>
            <TableCell className="font-medium">
              <span className="inline-flex items-center gap-1">
                {categories?.map((category) => (
                  <Badge
                    key={category.id}
                    className={`${category.color} text-white w-fit whitespace-nowrap`}
                  >
                    {category.title}
                  </Badge>
                ))}
                <span>{todo}</span>
              </span>
            </TableCell>
            <TableCell
              className="text-right"
              onClick={() => handleDelete({ id, todo })}
            >
              <Button variant="ghost" size="icon">
                <XIcon className="w-4 h-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
