import type { CellTemplate } from "@revolist/react-datagrid";

export const NameCell: CellTemplate = (h, { value, model }) => {
  return h(
    "div",
    { class: "flex items-center gap-2 px-2 cursor-pointer" },
    [
      h("img", {
        src: model.avatar,
        class: "h-7 w-7 rounded-full",
        alt: value,
      }),
      h("span", { class: "font-medium" }, value),
    ]
  );
};

export const AgeCell: CellTemplate = (h, { value }) => {
  return h(
    "div",
    { class: "flex items-center gap-2 px-2 cursor-pointer" },
    [
      h("span", { class: "h-3 w-3 rounded-full bg-blue-500" }),
      value,
    ]
  );
};

export const EyesCell: CellTemplate = (h, { value }) => {
  return h(
    "span",
    {
      class: "px-3 py-1 rounded-full text-white text-sm cursor-pointer",
      style: { backgroundColor: value },
    },
    value
  );
};
