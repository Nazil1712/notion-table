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

import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function PropertyPicker({ onSelect }) {
  const basicTypes = TYPES.filter((t) => !t.advanced);
  const advancedTypes = TYPES.filter((t) => t.advanced);


  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Type property name…" />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <ScrollArea className="max-h-[60vh]">
          {/* BASIC */}
          <CommandGroup heading="Basic">
            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
              {basicTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => onSelect(item)}
                    className="flex items-center gap-2 rounded-md px-2 py-2"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>

          {advancedTypes.length > 0 && <CommandSeparator />}

          {/* ADVANCED */}
          {advancedTypes.length > 0 && (
            <CommandGroup heading="Advanced">
              <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                {advancedTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.label}
                      onSelect={() => onSelect(item)}
                      className="flex items-center gap-2 rounded-md px-2 py-2"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          )}
        </ScrollArea>
      </CommandList>
    </Command>
  );
}
