import { configureStore } from '@reduxjs/toolkit'
import nodeReducer from './features/nodes/nodeSlice';

export const store = configureStore({
  reducer: {
    node: nodeReducer,
  },
})