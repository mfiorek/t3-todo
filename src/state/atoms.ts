import { atom } from "jotai";

export const selectedTaskListIdAtom = atom<string | null>(null)

export const mobileFocusRightAtom = atom<boolean>(false)