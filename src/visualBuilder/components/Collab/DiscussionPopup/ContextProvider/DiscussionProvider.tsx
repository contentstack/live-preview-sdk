import React from "preact/compat";
import { IDiscussionContext } from "../../../../types/collab.types";

export const DiscussionProvider =
    React.createContext<IDiscussionContext | null>(null);
