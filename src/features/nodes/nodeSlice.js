import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: "00000000-0000-0000-0000-000000000000",
  data: null,
  title: "UNKWOWN",
  level: 0,
  number: null,
  nodeId: null,
  children: []
}

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    cloneNode: (state, action) => {
        state.id = action.payload.id;
        state.data = action.payload.data;
        state.title = action.payload.title;
        state.level = action.payload.level;
        state.number = action.payload.number;
        state.nodeId = action.payload.nodeId;
    },
    updateNodeData: (state, action) => {
        state.data = action.payload;
    },
    updateNodeNumber: (state, action) => {
        state.number = action.payload;
    },
    updateNodeTitle: (state, action) => {
        state.title = action.payload;
    } 
  },
})

// Action creators are generated for each case reducer function
export const { cloneNode, updateNodeData, updateNodeNumber, updateNodeTitle} = nodeSlice.actions

export default nodeSlice.reducer