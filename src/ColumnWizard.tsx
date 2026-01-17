import { useState } from "react";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";

import {
  Type,
  Hash,
  List,
  CheckSquare,
  CircleDot,
  Calendar,
  Users,
  Paperclip,
  Link,
  AtSign,
  Phone,
  Sigma,
  GitFork,
  Search,
  MousePointerClick,
  MapPin,
  Minus,
} from "lucide-react";

const TYPES = [
  { id: "text", label: "Text", icon: Type },
  { id: "number", label: "Number", icon: Hash },
  { id: "select", label: "Select", icon: List },
  { id: "multi_select", label: "Multi-select", icon: List },
  { id: "status", label: "Status", icon: CircleDot },
  { id: "date", label: "Date", icon: Calendar },
  { id: "person", label: "Person", icon: Users },
  { id: "files", label: "Files & media", icon: Paperclip },
  { id: "checkbox", label: "Checkbox", icon: CheckSquare },
  { id: "url", label: "URL", icon: Link },
  { id: "email", label: "Email", icon: AtSign },
  { id: "phone", label: "Phone", icon: Phone },

  // 👇 everything below is "advanced"
  { id: "relation", label: "Relation", icon: GitFork, advanced: true },
  { id: "rollup", label: "Rollup", icon: Search, advanced: true },
  { id: "formula", label: "Formula", icon: Sigma, advanced: true },
  { id: "button", label: "Button", icon: MousePointerClick, advanced: true },
  { id: "place", label: "Place", icon: MapPin, advanced: true },
  { id: "id", label: "ID", icon: Minus, advanced: true },
];

export function ColumnWizard({ onConfirm, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string | null>(null);
  const basicTypes = TYPES.filter((t) => !t.advanced);
  const advancedTypes = TYPES.filter((t) => t.advanced);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Column name"
        value={name}
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />

      {/* <ScrollArea className="h-[200px] border rounded-md">
        {TYPES.map((t) => (
          <div
            key={t.id}
            className={`px-3 py-2 cursor-pointer hover:bg-muted ${
              type === t.id && "bg-muted"
            }`}
            onClick={() => setType(t.id)}
          >
            {t.label}
          </div>
        ))}
      </ScrollArea> */}

      <ScrollArea className="h-52 shadow-[0_-1px_6px_rgba(0,0,0,0.05)]">
        {/* BASIC */}
        <div className="px-3 py-2 text-xs text-muted-foreground">Basic</div>

        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
          {basicTypes.map((item) => {
            const Icon = item.icon;
            const isActive = type === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  setType(item.id);
                  //   onSelect?.(item); // optional if you still want callback
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2
            hover:bg-muted
            ${isActive ? "bg-muted" : ""}
          `}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Separator */}
        {advancedTypes.length > 0 && <div className="my-1 h-px bg-border" />}

        {/* ADVANCED */}
        {advancedTypes.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Advanced
            </div>

            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
              {advancedTypes.map((item) => {
                const Icon = item.icon;
                const isActive = type === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setType(item.id);
                      //   onSelect?.(item);
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2
                hover:bg-muted
                ${isActive ? "bg-muted" : ""}
              `}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </ScrollArea>

      {/* <div className="flex justify-end gap-2"> */}
      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background px-3 py-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!name || !type}
          onClick={() => onConfirm({ name, type })}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
