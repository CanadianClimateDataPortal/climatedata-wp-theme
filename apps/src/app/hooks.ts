/**
 * Redux Hooks
 *
 * Custom hooks for typed usage of `useDispatch` and `useSelector` in a Redux setup.
 * This file contains custom Redux hooks for the application.
 *
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

import type { RootState, AppDispatch } from "@/app/store";

export const useAppDispatch = () => useDispatch<AppDispatch>()

/**
 * Custom hook that acts as a typed version of the useSelector hook from Redux.
 * It is used to select state from the Redux store with the RootState type.
 *
 * @type {TypedUseSelectorHook<RootState>}
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
