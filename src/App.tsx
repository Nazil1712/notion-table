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
  Check,
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
import { Dialog, DialogContent } from "./components/ui/dialog";
import { PropertyPicker } from "./PropertyPicker";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "./components/ui/popover";
import { ColumnWizard } from "./ColumnWizard";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { COLUMN_TYPES } from "./utils/constants";

type ColumnMenuState = {
  open: boolean;
  x: number;
  y: number;
  columnId?: string;
  columnName?: string;
  columnType?: string;
  prop?: string;
  draftName?: string;
  anchorEl?: null | HTMLElement;
  columnSize?: number;
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
  (_, i, a) => `v1.2.0-beta.${a.length - i}`,
);

export default function App() {
  const gridRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [menu, setMenu] = useState<ColumnMenuState>({
    open: false,
    x: 0,
    y: 0,
    anchorEl: null as HTMLElement | null,
  });

  const [showPopUp, setShowPopUp] = useState("");

  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const [gridData, setGridData] = useState(users);
  const [gridColumns, setGridColumns] = useState(initialColumns);
  const [columnFreeze, setColumnFreeze] = useState(false);
  const [frozenColumnProp, setFrozenColumnProp] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  // const [activeColumn, setActiveColumn] = useState(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const [columnWizard, setColumnWizard] = useState<{
    open: boolean;
    tempProp: string | null;
    anchorEl: HTMLElement | null;
    position?: "left" | "right" | null;
  }>({
    open: false,
    tempProp: null,
    anchorEl: null,
    position: null,
  });

  const virtualAnchorRef = useRef<{
    getBoundingClientRect: () => DOMRect;
  } | null>(null);

  const getColumnFromX = async (clientX: number) => {
    const grid = gridRef.current;
    if (!grid) return null;

    // console.log("Grid",grid)

    const columns = await grid.getColumns(); // RevoGrid API
    // console.log("Columns", columns)
    if (!columns) return null;

    let x = grid.getBoundingClientRect().left;
    // console.log("X := ", x)

    for (const col of columns) {
      const width = col.size ?? 150;
      x += width;

      if (clientX <= x) {
        return col;
      }
    }

    return null;
  };

  /* const handleHeaderContextMenu = (e) => {
    const { clientX, clientY } = e;
    const { columnName } = e.target.innerHTML;
    console.log("Context Event =>", e);

    console.log("Hi");
    e.preventDefault(); // 🔑 stop browser menu

    setActiveColumn(e.detail?.prop);
    setContextPos({ x: clientX, y: clientY });
    setContextOpen(true);

    triggerRef.current?.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: e.clientX,
        clientY: e.clientY,
      }),
    );

    setMenu({
      open: true,
      x: clientX,
      y: clientY,
      columnId: prop,
      columnName: columnName,
      columnType: columnType == "string" ? "text" : columnType,
      prop: prop,
      draftName: name,
      anchorEl: headerEl,
      columnSize: size,
    });
  }; */

  const handleHeaderContextMenu = async (e) => {
    const { clientX, clientY } = e;
    e.preventDefault();

    const col = await getColumnFromX(e.clientX);
    if (!col) return;

    // console.log("Hi from context menu handler", col)

    setActiveColumn(e.detail?.prop);
    setContextPos({ x: clientX, y: clientY });
    setContextOpen(true);

    requestAnimationFrame(() => {
      triggerRef.current?.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          clientX: e.clientX,
          clientY: e.clientY,
        }),
      );
    });

    setMenu({
      open: false,
      x: e.clientX,
      y: e.clientY,
      columnId: col.prop,
      columnName: col.name,
      columnType: col.columnType,
      prop: col.prop,
      draftName: col.name,
      columnSize: col.size,
      anchorEl: e.target,
    });
  };

  const handleHeaderClick = (e) => {
    console.log("Event ==>", e);
    // console.log("Event Target ==>", e.target.clientX)
    const { prop, name, size, columnType } = e.detail;
    const { clientX, clientY } = e.detail.originalEvent;
    const headerEl = e.target;

    e.preventDefault();

    if (!name) return;

    setActiveColumn(prop);
    setMenu({
      open: true,
      x: clientX,
      y: clientY,
      columnId: prop,
      columnName: name,
      columnType: columnType == "string" ? "text" : columnType,
      prop: prop,
      draftName: name,
      anchorEl: headerEl,
      columnSize: size,
    });

    // console.log("Menu", menu);

    // console.log("I am there");
  };

  const POPOVER_WIDTH = 450;
  const OFFSET_Y = 140;
  const MARGIN = 16;

  const popoverStyle = {
    position: "relative",
    top: (menu?.y ?? 0) - OFFSET_Y,
    left: Math.max(
      columnWizard.position === "right"
        ? // 👉 insert RIGHT → popover after column
          (menu?.x ?? 0) + (menu?.columnSize ?? 0) / 2 - POPOVER_WIDTH / 2 + 10
        : // 👉 insert LEFT → popover before column
          (menu?.x ?? 0) - POPOVER_WIDTH,
      MARGIN,
    ),
  };

  const renameDataKey = (rows: any[], oldProp: string, newProp: string) => {
    // console.log(oldProp, newProp, rows[0]);

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
    newName,
  ) => {
    return columns.map((col) => {
      if (col.children) {
        return {
          ...col,
          children: col.children.map((child: any) =>
            child.prop === oldProp
              ? { ...child, prop: newProp, name: newName }
              : child,
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
    // console.log("New Header", newHeader);
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

    setContextOpen(false);
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
              (c) => c.prop === activeColumn,
            );

            if (childToHide) {
              setHiddenColumns((h) => [...h, childToHide]);

              const newChildren = col.children.filter(
                (c) => c.prop !== activeColumn,
              );

              // remove parent group if empty
              if (newChildren.length === 0) return null;

              return { ...col, children: newChildren };
            }
          }

          return col;
        })
        .filter(Boolean),
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
    targetProp: string,
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
      })),
    );

    setMenu({ ...menu, open: false, prop: "" });
  };

  const insertTempColumn = (targetProp, position, anchorEl) => {
    const rect = anchorEl.getBoundingClientRect();

    virtualAnchorRef.current = {
      getBoundingClientRect: () => rect,
    };
    const tempProp = `__temp_${Date.now()}`;

    setGridColumns((prev) =>
      insertColumnAtPosition(prev, targetProp, position, {
        prop: tempProp,
        name: " ",
        size: 250,
        // attach cellTemplate / columnType based on property.type
      }),
    );

    setGridData((prev) =>
      prev.map((row) => ({
        ...row,
        [tempProp]: "",
      })),
    );

    setColumnWizard({
      open: true,
      tempProp,
      anchorEl,
      position,
    });
  };

  const insertColumn = (property, panel) => {
    const newProp = property.label.toLowerCase().replace(/\s+/g, "_");

    setGridColumns((prev) =>
      insertColumnAtPosition(prev, panel.targetProp, panel.position, {
        prop: newProp,
        name: property.label,
        size: 150,
        // attach cellTemplate / columnType based on property.type
      }),
    );

    setGridData((prev) =>
      prev.map((row) => ({
        ...row,
        [newProp]: "",
      })),
    );
  };

  const insertColumnAtPosition = (columns, targetProp, position, newColumn) => {
    const result = [];

    for (const col of columns) {
      if (col.children) {
        result.push({
          ...col,
          children: insertColumnAtPosition(
            col.children,
            targetProp,
            position,
            newColumn,
          ),
        });
        continue;
      }

      if (col.prop === targetProp && position === "left") {
        result.push(newColumn);
      }

      result.push(col);

      if (col.prop === targetProp && position === "right") {
        result.push(newColumn);
      }
    }

    return result;
  };

  const replaceTempColumn = (columns, tempProp, newCol) =>
    columns.map((col) => {
      if (col.children) {
        return {
          ...col,
          children: replaceTempColumn(col.children, tempProp, newCol),
        };
      }
      return col.prop === tempProp ? newCol : col;
    });

  const finalizeColumn = ({ name, type }) => {
    const newProp = name.toLowerCase().replace(/\s+/g, "_");
    const tempProp = columnWizard.tempProp;

    setGridColumns((prev) =>
      replaceTempColumn(prev, tempProp, {
        prop: newProp,
        name,
        size: 150,
        // ...resolveColumnType(type),
      }),
    );

    setGridData((prev) =>
      prev.map((row) => {
        const { [tempProp]: _, ...rest } = row;
        return {
          ...rest,
          [newProp]: "",
        };
      }),
    );

    setColumnWizard({ open: false, tempProp: null, anchorEl: null });
  };

  const cancelTempColumn = () => {
    const tempProp = columnWizard.tempProp;
    if (!tempProp) return;

    setGridColumns((prev) => removeColumnRecursive(prev, tempProp));

    setGridData((prev) =>
      prev.map((row) => {
        const { [tempProp]: _, ...rest } = row;
        return rest;
      }),
    );

    setColumnWizard({ open: false, tempProp: null, anchorEl: null });
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
    if (menu.open || contextOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [menu.open, contextOpen]);

  /* useEffect(() => {
    const closeMenu = () => setMenu((prev) => ({ ...prev, open: false }));

    if (menu.open) {
      document.addEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [menu.open]); */
  // console.log("ROWS DEBUG", gridData[0]);
  // console.log("COLUMN TYPES", columnTypes);

  /* useEffect(() => {
    gridRef.current?.refresh?.();
  }, [gridColumns]); */

  return (
    <div className="p-6 h-screen bg-gray-50">
      <div className="h-125 bg-white rounded-xl shadow w-220">
        {/* <ContextMenu> */}
        {/* <ContextMenuTrigger> */}
        <RevoGrid
          ref={gridRef}
          source={gridData}
          columns={gridColumns}
          rowHeaders
          resize
          // filter
          columnTypes={columnTypes}
          theme="material"
          onHeaderclick={handleHeaderClick}
          onContextMenu={handleHeaderContextMenu}
        />
        {/* </ContextMenuTrigger> */}

        {contextOpen && (
          <ContextMenu
            key={`${contextOpen}-${contextPos.x}-${contextPos.y}`}
            open={contextOpen}
            onOpenChange={setContextOpen}
          >
            {/* Invisible anchor at mouse position */}
            <ContextMenuTrigger asChild>
              <div
                ref={triggerRef}
                style={{
                  position: "fixed",
                  top: contextPos.y,
                  left: contextPos.x,
                  width: 1,
                  height: 1,
                }}
              />
            </ContextMenuTrigger>

            <ContextMenuContent
              // 🔥 outside click = commit
              onPointerDownOutside={(e) => {
                e.preventDefault(); // stop Radix auto-close
                commitRename();
              }}
              // keep focus stable
              onCloseAutoFocus={(e) => e.preventDefault()}
              onFocusOutside={(e) => e.preventDefault()}
              style={{
                position: "fixed",
                // top: contextPos.y,
                // left: contextPos.x,
              }}
              className="w-56"
            >
              <ScrollArea
                className=" 
                max-h-[calc(100vh-120px)]
                w-52
                rounded-md"
              >
                <ContextMenuItem
                  className="bg-transparent data-highlighted:bg-transparent "
                  onSelect={(e) => e.preventDefault()}
                >
                  <TableOfContents />
                  <input
                    ref={inputRef}
                    type="text"
                    className="bg-gray-100 p-2 rounded-lg outline-sky-600"
                    onChange={(e) =>
                      setMenu((prev) => ({
                        ...prev,
                        draftName: e.target.value,
                      }))
                    }
                    onKeyDown={handleRenameKeyDown}
                    onKeyDownCapture={(e) => {
                      if (e.key !== "Enter") {
                        e.stopPropagation(); // 🔥 stops Radix typeahead
                      }
                    }}
                    value={menu.draftName}
                  />
                </ContextMenuItem>

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Repeat2 /> Change type
                  </ContextMenuSubTrigger>

                  <ContextMenuSubContent>
                    <ScrollArea className="h-72 w-56 rounded-md">
                      {COLUMN_TYPES.map(
                        ({ value, label, icon: Icon, muted }) => {
                          const selected = value === menu.columnType;

                          return (
                            <ContextMenuItem
                              key={value}
                              className={`flex items-center justify-between hover:bg-accent`}
                              // disabled={selected}
                            >
                              {/* Left side */}
                              <div className="flex items-center gap-2">
                                {Icon ? (
                                  <Icon className="h-4 w-4" />
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}

                                <span className={muted ? "text-gray-500" : ""}>
                                  {label}
                                </span>
                              </div>

                              {/* Right side ✓ */}
                              {selected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </ContextMenuItem>
                          );
                        },
                      )}
                    </ScrollArea>
                  </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator />

                <ContextMenuItem>
                  <ListFilter /> Filter
                </ContextMenuItem>

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    {" "}
                    <ArrowDownUp /> Sort{" "}
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem
                      onClick={() => sortGridData(menu.columnId, "asc")}
                    >
                      <ArrowUp /> Sort ascending
                    </ContextMenuItem>

                    <ContextMenuItem
                      onClick={() => sortGridData(menu.columnId, "desc")}
                    >
                      <ArrowDown /> Sort descending
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    {" "}
                    <Sigma /> Calculate
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

                {showFreeze && (
                  <ContextMenuItem onClick={freezeTillColumn}>
                    <Pin /> Freeze
                  </ContextMenuItem>
                )}

                {showUnfreeze && (
                  <ContextMenuItem onClick={unfreezeAll}>
                    <PinOff /> Unfreeze columns
                  </ContextMenuItem>
                )}

                <ContextMenuItem onClick={hideActiveColumn}>
                  <EyeOff /> Hide
                </ContextMenuItem>

                <ContextMenuItem>
                  {" "}
                  <Undo2 /> Wrap content
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                  onClick={() => {
                    if (!menu.prop || !menu.anchorEl) return;

                    insertTempColumn(menu.prop, "left", menu.anchorEl);
                  }}
                >
                  <ArrowLeftToLine /> Insert left
                </ContextMenuItem>

                <ContextMenuItem
                  onClick={() => {
                    if (!menu.prop || !menu.anchorEl) return;

                    insertTempColumn(menu.prop, "right", menu.anchorEl);

                    /* setInsertPanel({
                      open: true,
                      position: "right",
                      targetProp: menu.prop,
                    }); */
                  }}
                >
                  <ArrowRightToLine /> Insert right
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDuplicateColumn}>
                  <Copy /> Duplicate property
                </ContextMenuItem>

                <ContextMenuItem
                  className=" data-highlighted:text-red-400"
                  onClick={() => setShowPopUp(menu.prop)}
                >
                  <Trash2 />
                  Delete property
                </ContextMenuItem>
              </ScrollArea>
            </ContextMenuContent>
          </ContextMenu>
        )}

        {menu.open && (
          <DropdownMenu
            open={menu.open}
            onOpenChange={(open) => setMenu((prev) => ({ ...prev, open }))}
          >
            <DropdownMenuContent
              // 🔥 outside click = commit
              onPointerDownOutside={(e) => {
                // console.log("I am there");
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
              <ScrollArea
                className=" 
                max-h-[calc(100vh-120px)]
                w-52
                rounded-md"
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
                      if (e.key !== "Enter") {
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
                    <Repeat2 /> Change type
                  </DropdownMenuSubTrigger>

                  <DropdownMenuSubContent>
                    {/* <ScrollArea className="h-72 w-48 rounded-md">
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
                    </ScrollArea> */}
                    <ScrollArea className="h-72 w-56 rounded-md">
                      {COLUMN_TYPES.map(
                        ({ value, label, icon: Icon, muted }) => {
                          const selected = value === menu.columnType;

                          return (
                            <DropdownMenuItem
                              key={value}
                              className={`flex items-center justify-between hover:bg-accent`}
                              // disabled={selected}
                            >
                              {/* Left side */}
                              <div className="flex items-center gap-2">
                                {Icon ? (
                                  <Icon className="h-4 w-4" />
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}

                                <span className={muted ? "text-gray-500" : ""}>
                                  {label}
                                </span>
                              </div>

                              {/* Right side ✓ */}
                              {selected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          );
                        },
                      )}
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
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

                <DropdownMenuItem
                  onClick={() => {
                    if (!menu.prop || !menu.anchorEl) return;

                    insertTempColumn(menu.prop, "left", menu.anchorEl);
                  }}
                >
                  <ArrowLeftToLine /> Insert left
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    if (!menu.prop || !menu.anchorEl) return;

                    insertTempColumn(menu.prop, "right", menu.anchorEl);

                    /* setInsertPanel({
                      open: true,
                      position: "right",
                      targetProp: menu.prop,
                    }); */
                  }}
                >
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
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* PopOver While inserting new Column through insert left OR insert right */}
        <Popover
          open={columnWizard.open}
          onOpenChange={(open) => !open && cancelTempColumn()}
        >
          <PopoverAnchor ref={virtualAnchorRef} />
          <PopoverContent
            className={`
              w-[450px] p-3
              ${columnWizard.position === "left" && "origin-right"}
              ${columnWizard.position === "right" && "origin-left"}
            `}
            style={popoverStyle}
          >
            <ColumnWizard
              onConfirm={finalizeColumn}
              onCancel={cancelTempColumn}
            />
          </PopoverContent>
        </Popover>

        {/* PopUp Box for Confirm Delete Column? */}
        <PopupBox
          title={`Delete ${menu.columnName} Column ?`}
          message={`Do you really Want to delete this column ? After Deleting You won't be able to see this column in table !`}
          dangerOption={"Delete"}
          cancelOption={"Cancel"}
          dangerAction={() => handleDelete(menu.prop, menu.columnName)}
          cancleAction={() => setShowPopUp("")}
          showPopUp={showPopUp == menu.prop && showPopUp != ""}
        />
      </div>
    </div>
  );
}
