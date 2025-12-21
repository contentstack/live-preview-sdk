/** @jsxImportSource preact */
import React from "preact/compat";
import { IThreadContext } from "../../../../types/collab.types";

export const ThreadProvider = React.createContext<IThreadContext | null>(null);
