"use client";

import React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";

interface MessageSelectorProps {
  messages: Record<string, string[]>;
  selectedMessages: string[];
  onChange: (messages: string[]) => void;
  title?: string;
}

export function MessageSelector({ 
  messages, 
  selectedMessages, 
  onChange,
  title
}: MessageSelectorProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("fuzzing.messageSelector.selectMessages");

  const allMessages = Object.values(messages).flat();
  const allSelected = allMessages.every(m => selectedMessages.includes(m)) && allMessages.length > 0;
  
  // Track collapsed state for each group - Default to collapsed (true)
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    Object.keys(messages).forEach(key => {
      initialState[key] = true;
    });
    return initialState;
  });

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  const handleToggleMessage = (message: string) => {
    if (selectedMessages.includes(message)) {
      onChange(selectedMessages.filter((m) => m !== message));
    } else {
      onChange([...selectedMessages, message]);
    }
  };

  const handleToggleGroup = (groupMessages: string[]) => {
    const allGroupSelected = groupMessages.every(m => selectedMessages.includes(m));
    
    if (allGroupSelected) {
      // Deselect all in group
      onChange(selectedMessages.filter(m => !groupMessages.includes(m)));
    } else {
      // Select all in group (merge unique)
      const newSelection = [...new Set([...selectedMessages, ...groupMessages])];
      onChange(newSelection);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...allMessages]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <Label className="text-slate-300 font-medium text-xs uppercase tracking-wider">{resolvedTitle}</Label>
        <button
          onClick={handleSelectAll}
          type="button"
          className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 transition-colors tracking-wide"
        >
          {allSelected
            ? t("fuzzing.messageSelector.deselectAll")
            : t("fuzzing.messageSelector.selectAll")}
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950/30 flex flex-col h-[450px]">
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {Object.entries(messages).map(([groupName, groupMessages]) => {
              const isGroupSelected = groupMessages.every(m => selectedMessages.includes(m));
              const isGroupPartiallySelected = groupMessages.some(m => selectedMessages.includes(m)) && !isGroupSelected;
              const isCollapsed = collapsedGroups[groupName];

              return (
                <div key={groupName} className="rounded-md border border-slate-800/50 bg-slate-900/40 overflow-hidden">
                   {/* Group Header */}
                   <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 hover:bg-slate-800/60 transition-colors">
                      <div className="flex items-center gap-3 select-none">
                          <button 
                            type="button"
                            onClick={() => toggleGroupCollapse(groupName)}
                            className="text-slate-500 hover:text-slate-300 focus:outline-none"
                          >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox
                                id={`group-${groupName}`}
                                checked={isGroupSelected || (isGroupPartiallySelected ? "indeterminate" : false)}
                                onCheckedChange={() => handleToggleGroup(groupMessages)}
                                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=indeterminate]:bg-blue-600/50 h-3.5 w-3.5"
                            />
                            <Label 
                                htmlFor={`group-${groupName}`}
                                className="text-xs font-semibold text-slate-300 cursor-pointer"
                            >
                                {groupName}
                            </Label>
                          </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-950/50 px-1.5 py-0.5 rounded">
                          {groupMessages.filter(m => selectedMessages.includes(m)).length}/{groupMessages.length}
                      </span>
                   </div>

                   {/* Grid layout for items */}
                   {!isCollapsed && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 bg-slate-950/20">
                          {groupMessages.map((message) => (
                            <div
                              key={message}
                              className={cn(
                                "flex items-center space-x-2 rounded px-2 py-1.5 transition-all text-xs border",
                                selectedMessages.includes(message)
                                  ? "bg-blue-500/10 text-blue-100 border-blue-500/20"
                                  : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-300"
                              )}
                            >
                              <Checkbox
                                id={`msg-${message}`}
                                checked={selectedMessages.includes(message)}
                                onCheckedChange={() => handleToggleMessage(message)}
                                className="border-slate-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-3 w-3"
                              />
                              <Label
                                htmlFor={`msg-${message}`}
                                className="cursor-pointer flex-1 truncate select-none"
                                title={message}
                              >
                                {message}
                              </Label>
                            </div>
                          ))}
                       </div>
                   )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="px-3 py-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 bg-slate-900/50">
           <span className="font-medium text-slate-400">
             {t("fuzzing.messageSelector.selectedCount", {
               count: selectedMessages.length,
             })}
           </span>
           <span>
             {t("fuzzing.messageSelector.totalMessages", {
               count: allMessages.length,
             })}
           </span>
        </div>
      </div>
    </div>
  );
}
