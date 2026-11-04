export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  created_at: string;
};

export type RoutineGroup = {
  id: string;
  title: string;
  subtitle: string;
  sort_order: number;
};

export type RoutineTopic = {
  id: string;
  group_id: string;
  title: string;
  hint: string;
  sort_order: number;
};
