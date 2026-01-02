export interface User {
  id: number;
  name: string;
  avatar: string;
  age: number;
  company: string;
  eyes: string;
}

export const users: User[] = [
  {
    id: 1,
    name: "Garret Schmitt",
    avatar: "https://i.pravatar.cc/40?img=1",
    age: 1,
    company: "EXTRAGENE",
    eyes: "brown",
  },
  {
    id: 2,
    name: "Matt Hessel",
    avatar: "https://i.pravatar.cc/40?img=2",
    age: 23,
    company: "HOPELI",
    eyes: "dimgrey",
  },
  {
    id: 3,
    name: "Jana Fay",
    avatar: "https://i.pravatar.cc/40?img=3",
    age: 18,
    company: "EQUITOX",
    eyes: "maroon",
  },
];
