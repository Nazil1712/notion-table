import type {
  ColumnRegular,
  ColumnGrouping,
} from "@revolist/react-datagrid";

import { NameCell, AgeCell, EyesCell } from "./cells";

export const columns: (ColumnRegular | ColumnGrouping)[] = [
  {
    name: "Name group",
    children: [
      {
        prop: "name",
        name: "Name",
        size: 220,
        cellTemplate: NameCell,
      } as ColumnRegular,
    ],
  },
  {
    name: "Personal",
    children: [
      {
        prop: "age",
        name: "Age",
        size: 120,
        cellTemplate: AgeCell,
      } as ColumnRegular,
      {
        prop: "company",
        name: "Company",
        size: 150,
      } as ColumnRegular,
      {
        prop: "eyes",
        name: "Eyes",
        size: 120,
        cellTemplate: EyesCell,
      } as ColumnRegular,
    ],
  },
];
