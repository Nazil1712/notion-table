import { RevoGrid } from "@revolist/react-datagrid";
import { users } from "./data";
import { columns, columnTypes } from "./columns";
import { useRef, useState } from "react";
import { ColumnContextMenu } from "./ColumnContextMenu";
import { Button } from "@/components/ui/button";
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
import { ArrowDown, ArrowDownUp, ArrowLeftToLine, ArrowRightToLine, ArrowUp, Component, Copy, EyeOff, ListFilter, Pin, Repeat2, Sigma, TableOfContents, Trash2, Undo2 } from "lucide-react";

export default function App() {
  const gridRef = useRef(null);

  const [menu, setMenu] = useState<ColumnMenuState>({
    open: false,
    x: 0,
    y: 0,
  });

  type ColumnMenuState = {
    open: boolean;
    x: number;
    y: number;
    columnId?: string;
  };

  const handleHeaderClick = (e) => {
    // console.log("Event ==>", e)
    // console.log("Event Target ==>", e.target.clientX)
    const { prop } = e.detail;
    const { clientX, clientY } = e.detail.originalEvent;

    e.preventDefault();

    setMenu({
      open: true,
      x: clientX,
      y: clientY,
      columnId: prop,
    });

    console.log("Menu", menu);

    console.log("I am there");
  };

  /* useEffect(() => {
    const close = () => setMenu((m) => ({ ...m, open: false }));

    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []); */

  /* const handleClick =(e)=>{
    console.log("Event of para =>",e)
  }

  if(menu.open == true){
    console.log("I am true................")
  } */

  return (
    <div className="p-6 h-screen bg-gray-50">
      <div className="h-125 bg-white rounded-xl shadow w-220">
        <RevoGrid
          source={users}
          columns={columns}
          rowHeaders
          resize
          filter
          columnTypes={columnTypes}
          theme="material"
          ref={gridRef}
          onHeaderclick={handleHeaderClick}
        />

        {/* {menu.open && (
          <ColumnContextMenu
            {...menu}
            onClose={() => setMenu({ ...menu, open: false })}
            gridRef={gridRef}
          />
        )} */}
        {menu.open && (
          <DropdownMenu
            open={menu.open}
            onOpenChange={(open) => setMenu((prev) => ({ ...prev, open }))}
          >
            {/* Inopen trigger (we open it manually) */}
            <DropdownMenuContent
              style={{
                position: "fixed",
                top: menu.y,
                left: menu.x,
              }}
              className="w-56"
            >
              <DropdownMenuItem 
              className='bg-transparent data-highlighted:bg-transparent '> 
                <TableOfContents/> 
                <input type="text" className="bg-gray-100 p-2 rounded-lg"/>
                </DropdownMenuItem>

              <DropdownMenuItem> <Repeat2/> Change type</DropdownMenuItem>
              {/* <DropdownMenuItem>Sort Descending</DropdownMenuItem> */}

              <DropdownMenuSeparator />

              <DropdownMenuItem> <ListFilter/> Filter</DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger> <ArrowDownUp/> Sort</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem> <ArrowUp/> Sort ascending</DropdownMenuItem>
                  <DropdownMenuItem> <ArrowDown/> Sort descending</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem> <Component/> Group</DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger> <Sigma/> Calculate</DropdownMenuSubTrigger>
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

              <DropdownMenuItem> <Pin/> Freeze</DropdownMenuItem>

              <DropdownMenuItem> <EyeOff/> Hide</DropdownMenuItem>

              <DropdownMenuItem> <Undo2/> Wrap content</DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem> <ArrowLeftToLine/> Insert left</DropdownMenuItem>
              <DropdownMenuItem> <ArrowRightToLine/> Insert right</DropdownMenuItem>
              <DropdownMenuItem> <Copy/> Duplicate property</DropdownMenuItem>
              <DropdownMenuItem 
              className=" data-highlighted:text-red-400">
                <Trash2/>
                Delete property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
