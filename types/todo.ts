type Todo = {
  id: number;
  todo: string;
  categories?: Category[];
};

type Category = {
  id: Todo["id"];
  title: string;
  color: string;
};

export type { Todo, Category };
