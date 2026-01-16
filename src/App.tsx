import {
  RevoGrid,
  type ColumnGrouping,
  type ColumnRegular,
} from "@revolist/react-datagrid";
import { users } from "./data";
import { initialColumns, columnTypes } from "./columns";
import React, { act, useEffect, useRef, useState } from "react";
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

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  AtSign,
  CalendarDays,
  CircleArrowDown,
  CircleDashed,
  CircleMinus,
  CircleUser,
  Clock3,
  Component,
  Copy,
  EyeOff,
  Hash,
  Link,
  List,
  ListFilter,
  MapPin,
  MoveUpRight,
  Paperclip,
  Phone,
  Pin,
  PinOff,
  Repeat2,
  Search,
  Sigma,
  SquareCheck,
  SquareCheckBig,
  SquareMousePointer,
  TableOfContents,
  TextAlignStart,
  Trash2,
  Undo2,
  UserRound,
} from "lucide-react";
import { Separator } from "@radix-ui/react-context-menu";
import { Button } from "./components/ui/button";
import PopupBox from "./common/Dialog";

type ColumnMenuState = {
  open: boolean;
  x: number;
  y: number;
  columnId?: string;
  columnName?: string;
  prop?: string;
  draftName?: string;
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
const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

export default function App() {
  const gridRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [menu, setMenu] = useState<ColumnMenuState>({
    open: false,
    x: 0,
    y: 0,
  });

  const [showPopUp, setShowPopUp] = useState("");

  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const [gridData, setGridData] = useState(users);
  const [gridColumns, setGridColumns] = useState(initialColumns);
  const [columnFreeze, setColumnFreeze] = useState(false);
  const [frozenColumnProp, setFrozenColumnProp] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);

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
      draftName: name,
    });

    // console.log("Menu", menu);

    // console.log("I am there");
  };

  const renameDataKey = (rows: any[], oldProp: string, newProp: string) => {
    console.log(oldProp, newProp, rows[0]);

    return rows.map((row) => {
      if (!(oldProp in row)) return row;

      const { [oldProp]: value, ...rest } = row;
      return {
        ...rest,
        [newProp]: value,
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

  const commitRename = () => {
    // const newHeader = newHeader;
    // if (!newHeader) return;
    const newHeader = menu.draftName;
    console.log("New Header", newHeader);
    if (!newHeader) {
      // empty → cancel
      setMenu((prev) => ({ ...prev, open: false }));
      return;
    }

    const oldProp = menu.prop;
    const newProp = newHeader.toLowerCase().replace(/\s+/g, "_");

    // Rename column
    setGridColumns((prev) => renameColumn(prev, oldProp, newProp, newHeader));

    // Rename data key
    setGridData((prev) => renameDataKey(prev, oldProp, newProp));

    // Close menu + sync state
    setMenu((prev) => ({
      ...prev,
      open: false,
      prop: newProp,
      columnName: newHeader,
      draftName: newHeader,
    }));
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename(menu.draftName);
    }

    if (e.key === "Escape") {
      // cancel rename
      setMenu((prev) => ({
        ...prev,
        open: false,
        draftName: prev.columnName,
      }));
    }
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

  /* const hideActiveColumn = () => {
    if (!activeColumn) return;

    setGridColumns((prev) =>
      prev.map((col) => {
        if ("children" in col) {
          return {
            ...col,
            children: col.children.map((child) =>
              child.prop === activeColumn ? { ...child, visible: false } : child
            ),
          };
        }
        return col.prop === activeColumn ? { ...col, visible: false } : col;
      })
    );
  }; */

  const hideActiveColumn = () => {
    if (!activeColumn) return;

    setGridColumns((prev) =>
      prev
        .map((col) => {
          if ("children" in col) {
            const childToHide = col.children.find(
              (c) => c.prop === activeColumn
            );

            if (childToHide) {
              setHiddenColumns((h) => [...h, childToHide]);

              const newChildren = col.children.filter(
                (c) => c.prop !== activeColumn
              );

              // remove parent group if empty
              if (newChildren.length === 0) return null;

              return { ...col, children: newChildren };
            }
          }

          return col;
        })
        .filter(Boolean)
    );
  };

  const showUnfreeze =
    columnFreeze && frozenColumnProp && activeColumn === frozenColumnProp;

  const showFreeze = !showUnfreeze;

  const removeColumnRecursive = (columns, propToRemove) => {
    return columns
      .map((col) => {
        if (col.children) {
          return {
            ...col,
            children: removeColumnRecursive(col.children, propToRemove),
          };
        }
        return col;
      })
      .filter((col) => col.prop != propToRemove && col.children?.length != 0);
  };

  const handleDelete = (prop, columnName) => {
    setGridColumns((prev) => removeColumnRecursive(prev, prop));

    setShowPopUp("");
    setMenu({ ...menu, open: false, prop: "" });
  };

  const duplicateColumnRecursive = (
    columns: (ColumnRegular | ColumnGrouping)[],
    targetProp: string
  ) => {
    const result: (ColumnRegular | ColumnGrouping)[] = [];

    for (const col of columns) {
      // clone column first (NO mutation)
      let newCol = { ...col };

      // handle grouped columns
      if ("children" in col && col.children) {
        newCol = {
          ...col,
          children: duplicateColumnRecursive(col.children, targetProp),
        };
      }

      // push original
      result.push(newCol);

      // duplicate ONLY the target column
      if ("prop" in col && col.prop === targetProp) {
        const duplicated: ColumnRegular = {
          ...(col as ColumnRegular),
          prop: `${col.prop}_copy`,
          name: `${col.name} (Copy)`,
        };

        result.push(duplicated);
      }
    }

    return result;
  };

  const handleDuplicateColumn = () => {
    if (!menu.prop) return;

    // console.log("columns",gridColumns)
    setGridColumns((prev) => duplicateColumnRecursive(prev, menu.prop));

    setGridData((prevData) =>
      prevData.map((row) => ({
        ...row,
        [`${menu.prop}_copy`]: row[menu.prop],
      }))
    );

    setMenu({ ...menu, open: false, prop: "" });
  };

  /* useEffect(() => {
    console.log("showPopUp =>", showPopUp);
    console.log("menu => ", menu);
  }, [showPopUp, menu]); */

  /* useEffect(() => {
    if (menu.open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [menu.open]); */

  useEffect(() => {
    if (menu.open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select(); // optional but 🔥
      });
    }
  }, [menu.open]);

  /* useEffect(() => {
    const closeMenu = () => setMenu((prev) => ({ ...prev, open: false }));

    if (menu.open) {
      document.addEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [menu.open]); */

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
              // 🔥 outside click = commit
              onPointerDownOutside={(e) => {
                console.log("I am there");
                e.preventDefault(); // stop Radix auto-close
                commitRename();
              }}
              // keep focus stable
              onCloseAutoFocus={(e) => e.preventDefault()}
              onFocusOutside={(e) => e.preventDefault()}
              style={{
                position: "fixed",
                top: menu.y,
                left: menu.x,
              }}
              className="w-56"
            >
              <DropdownMenuItem
                className="bg-transparent data-highlighted:bg-transparent "
                onSelect={(e) => e.preventDefault()}
              >
                <TableOfContents />
                <input
                  ref={inputRef}
                  type="text"
                  className="bg-gray-100 p-2 rounded-lg outline-sky-600"
                  // onChange={(e) => handleRename(e, menu)}
                  onChange={(e) =>
                    setMenu((prev) => ({
                      ...prev,
                      draftName: e.target.value,
                    }))
                  }
                  onKeyDown={handleRenameKeyDown}
                  onKeyDownCapture={(e) => {
                    if (e.key !== "Enter" ) {
                      e.stopPropagation(); // 🔥 stops Radix typeahead
                    }
                  }}
                  // onPointerDown={(e) => e.stopPropagation()}
                  // onClick={(e) => e.stopPropagation()}
                  value={menu.draftName}
                />
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {" "}
                  <Repeat2 /> Change type{" "}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <ScrollArea className="h-72 w-48 rounded-md">
                    <DropdownMenuItem>
                      {" "}
                      <TextAlignStart /> Text
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Hash /> Number
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <CircleArrowDown /> Select
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <List /> Multi-select
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <CircleDashed /> Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <CalendarDays /> Date
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <UserRound /> Person
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Paperclip /> Files & media
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <SquareCheckBig /> Checkbox
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Link /> URL
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <AtSign /> Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Phone /> Phone
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Sigma /> Formula
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <MoveUpRight /> Relation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Search /> Rollup
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Clock3 /> Created time
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <CircleUser /> Created by
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <Clock3 />
                      Last edited time
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <CircleUser /> Last edited by
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <SquareMousePointer /> Button
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <MapPin /> Place
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {" "}
                      <span className="text-gray-600 flex">No</span> ID
                    </DropdownMenuItem>
                  </ScrollArea>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                {" "}
                <ListFilter /> Filter
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {" "}
                  <ArrowDownUp /> Sort{" "}
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

              {showUnfreeze && (
                <DropdownMenuItem onClick={unfreezeAll}>
                  <PinOff /> Unfreeze columns
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={hideActiveColumn}>
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
              <DropdownMenuItem onClick={handleDuplicateColumn}>
                <Copy /> Duplicate property
              </DropdownMenuItem>

              <DropdownMenuItem
                className=" data-highlighted:text-red-400"
                onClick={() => setShowPopUp(menu.prop)}
              >
                <Trash2 />
                Delete property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <PopupBox
          title={`Delete ${menu.columnName} Column ?`}
          message={`Do you really Want to delete this column ? After Deleting You won't be able to see this column in table !`}
          dangerOption={"Delete"}
          cancelOption={"Cancel"}
          dangerAction={() => handleDelete(menu.prop, menu.columnName)}
          cancleAction={() => setShowPopUp("")}
          showPopUp={showPopUp == menu.prop && showPopUp != ""}
        />

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
