import type { ColumnRegular, ColumnGrouping } from "@revolist/react-datagrid";

import { NameCell, AgeCell, EyesCell } from "./cells";
import SelectTypePlugin from "@revolist/revogrid-column-select";
import Plugin from "@revolist/revogrid-column-date";

const dropdown = [
  {
    labelKey: "label",
    valueKey: "value",
    source: [
      { label: "Go Mindz", value: "Go Mindz" },
      { label: "Zam Zam", value: "Zam Zam" },
      { label: "TCS", value: "TCS" },
      { label: "Infosys", value: "Infosys" },
      { label: "Wipro", value: "Wipro" },
      { label: "Accenture", value: "Accenture" },
      { label: "Cognizant", value: "Cognizant" },
      { label: "HCL", value: "HCL" },
      { label: "Capgemini", value: "Capgemini" },
      { label: "IBM", value: "IBM" },
      { label: "Tech Mahindra", value: "Tech Mahindra" },
      { label: "Oracle", value: "Oracle" },
      { label: "Zoho", value: "Zoho" },
      { label: "Microsoft", value: "Microsoft" },
      { label: "Flipkart", value: "Flipkart" },
      { label: "Amazon", value: "Amazon" },
      { label: "Deloitte", value: "Deloitte" },
      { label: "Startup Inc", value: "Startup Inc" },
      { label: "Paytm", value: "Paytm" },
      { label: "Meta", value: "Meta" },
      { label: "Swiggy", value: "Swiggy" },
      { label: "Netflix", value: "Netflix" },
      { label: "Byjus", value: "Byjus" },
      { label: "Adobe", value: "Adobe" },
      { label: "PhonePe", value: "PhonePe" },
    ],
  },
  {
    labelKey: "label",
    valueKey: "value",
    source: [
      { label: "Blue", value: "blue" },
      { label: "Green", value: "green" },
      { label: "Brown", value: "brown" },
      { label: "Black", value: "black" },
      { label: "Grey", value: "grey" },
      { label: "Hazel", value: "hazel" },
      { label: "Maroon", value: "maroon" },
      { label: "Dim Grey", value: "dimgrey" },
    ],
  },
];


export const columns: (ColumnRegular | ColumnGrouping)[] = [
  {
    name: "Name group",
    children: [
      {
        prop: "name",
        name: "Name",
        size: 220,
        cellTemplate: NameCell,
        pin: "colPinStart",
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
        ...dropdown[0],
        prop: "company",
        name: "Company",
        size: 150,
        columnType: "select",
      },
      {
        ...dropdown[1],
        prop: "eyes",
        name: "Eyes",
        size: 120,
        cellTemplate: EyesCell,
        columnType: "select",
      },
      {
        prop: "birthdate",
        name: "Birth Date",
        size: 180,
        columnType: "date",
        direction: "left",
        required: "true",
        valueAsDate: "true",
      },
      {
        prop: "a",
        name: "A",
        size: 120,
      } as ColumnRegular,
    ],
  },
];

export const columnTypes = {
  select: new SelectTypePlugin(),
  date: new Plugin(),
};
