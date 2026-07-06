import React, { createContext, useContext, useRef, type MutableRefObject } from "react";
import type { Editor } from "tldraw";

interface EditorContextValue {
  editorRef: MutableRefObject<Editor | null>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const editorRef = useRef<Editor | null>(null);
  return (
    <EditorContext.Provider value={{ editorRef }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorRef(): MutableRefObject<Editor | null> {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorRef must be used inside EditorProvider");
  return ctx.editorRef;
}
