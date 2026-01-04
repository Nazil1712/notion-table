import {
  RevoGrid,
  type ColumnGrouping,
  type ColumnRegular,
} from "@revolist/react-datagrid";
import { users } from "./data";
import { initialColumns, columnTypes } from "./columns";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUp,
  Component,
  Copy,
  EyeOff,
  ListFilter,
  Pin,
  PinOff,
  Repeat2,
  Sigma,
  TableOfContents,
  Trash2,
  Undo2,
} from "lucide-react";

type ColumnMenuState = {
  open: boolean;
  x: number;
  y: number;
  columnId?: string;
  columnName?: string;
  prop?: string;
};

type ColumnType = "string" | "number" | "date";

const columnTypeMap: Record<string, ColumnType> = {
  name: "string",
  company: "string",
  eyes: "string",
  age: "number",
  a: "number",
  birthdate: "date",
};

export default function App() {
  const gridRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [menu, setMenu] = useState<ColumnMenuState>({
    open: false,
    x: 0,
    y: 0,
  });

  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const [gridData, setGridData] = useState(users);
  const [gridColumns, setGridColumns] = useState(initialColumns);
  const [columnFreeze, setColumnFreeze] = useState(false);
  const [frozenColumnProp, setFrozenColumnProp] = useState<string | null>(null);

  const handleHeaderClick = (e) => {
    console.log("Event ==>", e);
    // console.log("Event Target ==>", e.target.clientX)
    const { prop, name } = e.detail;
    const { clientX, clientY } = e.detail.originalEvent;

    e.preventDefault();

    setActiveColumn(prop);
    setMenu({
      open: true,
      x: clientX,
      y: clientY,
      columnId: prop,
      columnName: name,
      prop: prop,
    });

    // console.log("Menu", menu);

    // console.log("I am there");
  };

  const renameDataKey = (rows: any[], oldKey: string, newKey: string) => {
    return rows.map((row) => {
      if (!(oldKey in row)) return row;

      const { [oldKey]: value, ...rest } = row;
      return {
        ...rest,
        [newKey]: value,
      };
    });
  };

  const renameColumn = (
    /* columns: any[],
    oldProp: string,
    newProp: string,
    newName: string */
    columns,
    oldProp,
    newProp,
    newName
  ) => {
    return columns.map((col) => {
      if (col.children) {
        return {
          ...col,
          children: col.children.map((child: any) =>
            child.prop === oldProp
              ? { ...child, prop: newProp, name: newName }
              : child
          ),
        };
      }
      return col;
    });
  };

  const handleRename = (
    e: React.ChangeEvent<HTMLInputElement>,
    // menu: { prop: string; columnName: string }
    menu
  ) => {
    const newHeader = e.target.value;

    // Header → prop
    const newProp = newHeader.toLowerCase().replace(/\s+/g, "_");

    setGridColumns((prev) => renameColumn(prev, menu.prop, newProp, newHeader));

    setGridData((prev) => renameDataKey(prev, menu.prop, newProp));

    // Update menu reference (if needed)
    menu.prop = newProp;
    menu.columnName = newHeader;
  };

  const sortGridData = (columnId: string, direction: "asc" | "desc") => {
    const type = columnTypeMap[columnId];

    if (!type) return;

    const sorted = [...gridData].sort((a, b) => {
      let valA = a[columnId];
      let valB = b[columnId];

      if (type === "string") {
        return direction === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }

      if (type === "number") {
        return direction === "asc"
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
      }

      if (type === "date") {
        return direction === "asc"
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      }

      return 0;
    });

    setGridData(sorted);
  };

  const freezeTillColumn = () => {
    if (!activeColumn) return;

    setColumnFreeze(true);
    setFrozenColumnProp(activeColumn); // boundary

    let freeze = true;

    const updatedColumns = initialColumns.map((group) => {
      if (!("children" in group)) return group;

      return {
        ...group,
        children: group.children.map((col) => {
          if (freeze) {
            // Freeze current column
            col = { ...col, pin: "colPinStart" };

            // Stop freezing AFTER clicked column
            if (col.prop === activeColumn) {
              freeze = false;
            }
            return col;
          }

          // Unfreeze columns after clicked column
          return { ...col, pin: undefined };
        }),
      };
    });

    setGridColumns(updatedColumns);
  };

  const unfreezeAll = () => {
    setColumnFreeze(false);
    setFrozenColumnProp(null);

    const updated = initialColumns.map((group) => {
      if (!("children" in group)) return group;

      return {
        ...group,
        children: group.children.map((col) => ({
          ...col,
          pin: undefined,
        })),
      };
    });

    setGridColumns(updated);
  };

  const getFlatColumns = (columns: (ColumnRegular | ColumnGrouping)[]) => {
    const flat: ColumnRegular[] = [];

    columns.forEach((col) => {
      if ("children" in col) {
        col.children.forEach((child) => flat.push(child));
      }
    });

    return flat;
  };

  const getColumnIndex = (prop: string) => {
    const flat = getFlatColumns(gridColumns);
    return flat.findIndex((col) => col.prop === prop);
  };

  const showUnfreeze =
    columnFreeze && frozenColumnProp && activeColumn === frozenColumnProp;

  const showFreeze = !showUnfreeze;

  useEffect(() => {
    if (menu.open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [menu.open]);

  useEffect(() => {
    const closeMenu = () => setMenu((prev) => ({ ...prev, open: false }));

    if (menu.open) {
      document.addEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [menu.open]);

  return (
    <div className="p-6 h-screen bg-gray-50">
      <div className="h-125 bg-white rounded-xl shadow w-220">
        {/* <ContextMenu> */}
        {/* <ContextMenuTrigger> */}
        <RevoGrid
          source={gridData}
          columns={gridColumns}
          rowHeaders
          resize
          filter
          columnTypes={columnTypes}
          theme="material"
          ref={gridRef}
          onHeaderclick={handleHeaderClick}
        />
        {/* </ContextMenuTrigger> */}

        {menu.open && (
          <DropdownMenu
            open={menu.open}
            onOpenChange={(open) => setMenu((prev) => ({ ...prev, open }))}
          >
            <DropdownMenuContent
              onCloseAutoFocus={(e) => e.preventDefault()}
              onFocusOutside={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
              style={{
                position: "fixed",
                top: menu.y,
                left: menu.x,
              }}
              className="w-56"
            >
              <DropdownMenuItem className="bg-transparent data-highlighted:bg-transparent ">
                <TableOfContents />
                <input
                  ref={inputRef}
                  type="text"
                  className="bg-gray-100 p-2 rounded-lg"
                  onChange={(e) => handleRename(e, menu)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  value={menu.columnName}
                />
              </DropdownMenuItem>

              <DropdownMenuItem>
                {" "}
                <Repeat2 /> Change type
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                {" "}
                <ListFilter /> Filter
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {" "}
                  <ArrowDownUp /> Sort
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => sortGridData(menu.columnId, "asc")}
                  >
                    <ArrowUp /> Sort ascending
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => sortGridData(menu.columnId, "desc")}
                  >
                    <ArrowDown /> Sort descending
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {" "}
                  <Sigma /> Calculate
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>None</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Count</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Count all</DropdownMenuItem>
                      <DropdownMenuItem>Count values</DropdownMenuItem>
                      <DropdownMenuItem>Count unique values</DropdownMenuItem>
                      <DropdownMenuItem>Count empty</DropdownMenuItem>
                      <DropdownMenuItem>Count not empty</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Percent</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Percent empty</DropdownMenuItem>
                      <DropdownMenuItem>Percent not empty</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {showFreeze && (
                <DropdownMenuItem onClick={freezeTillColumn}>
                  <Pin /> Freeze
                </DropdownMenuItem>
              )}

              {showUnfreeze  && (
                <DropdownMenuItem onClick={unfreezeAll}>
                  <PinOff /> Unfreeze columns
                </DropdownMenuItem>
              )}

              <DropdownMenuItem>
                {" "}
                <EyeOff /> Hide
              </DropdownMenuItem>

              <DropdownMenuItem>
                {" "}
                <Undo2 /> Wrap content
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                {" "}
                <ArrowLeftToLine /> Insert left
              </DropdownMenuItem>
              <DropdownMenuItem>
                {" "}
                <ArrowRightToLine /> Insert right
              </DropdownMenuItem>
              <DropdownMenuItem>
                {" "}
                <Copy /> Duplicate property
              </DropdownMenuItem>
              <DropdownMenuItem className=" data-highlighted:text-red-400">
                <Trash2 />
                Delete property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* <ContextMenuContent className="w-56">
              <ContextMenuItem className="bg-transparent data-highlighted:bg-transparent">
                <TableOfContents />
                <input
                  ref={inputRef}
                  type="text"
                  className="ml-2 bg-gray-100 p-2 rounded-lg"
                  value={menu.columnName}
                  onChange={(e) => handleRename(e, menu)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </ContextMenuItem>

              <ContextMenuItem>
                <Repeat2 /> <span className="ml-2">Change type</span>
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem>
                <ListFilter /> <span className="ml-2">Filter</span>
              </ContextMenuItem>

              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <ArrowDownUp /> <span className="ml-2">Sort</span>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>
                    <ArrowUp /> <span className="ml-2">Sort ascending</span>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <ArrowDown /> <span className="ml-2">Sort descending</span>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>

              <ContextMenuItem>
                <Component /> <span className="ml-2">Group</span>
              </ContextMenuItem>

              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Sigma /> <span className="ml-2">Calculate</span>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem>None</ContextMenuItem>

                  <ContextMenuSub>
                    <ContextMenuSubTrigger>Count</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem>Count all</ContextMenuItem>
                      <ContextMenuItem>Count values</ContextMenuItem>
                      <ContextMenuItem>Count unique values</ContextMenuItem>
                      <ContextMenuItem>Count empty</ContextMenuItem>
                      <ContextMenuItem>Count not empty</ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>

                  <ContextMenuSub>
                    <ContextMenuSubTrigger>Percent</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem>Percent empty</ContextMenuItem>
                      <ContextMenuItem>Percent not empty</ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                </ContextMenuSubContent>
              </ContextMenuSub>

              <ContextMenuItem>
                <Pin /> <span className="ml-2">Freeze</span>
              </ContextMenuItem>

              <ContextMenuItem>
                <EyeOff /> <span className="ml-2">Hide</span>
              </ContextMenuItem>

              <ContextMenuItem>
                <Undo2 /> <span className="ml-2">Wrap content</span>
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem>
                <ArrowLeftToLine /> <span className="ml-2">Insert left</span>
              </ContextMenuItem>

              <ContextMenuItem>
                <ArrowRightToLine /> <span className="ml-2">Insert right</span>
              </ContextMenuItem>

              <ContextMenuItem>
                <Copy /> <span className="ml-2">Duplicate property</span>
              </ContextMenuItem>

              <ContextMenuItem className="data-highlighted:text-red-400">
                <Trash2 /> <span className="ml-2">Delete property</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu> */}
      </div>
    </div>
  );
}
