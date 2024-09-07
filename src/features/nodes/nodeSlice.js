import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: null,
  title: "untitled",
  level: 0,
  number: null,
  nodeId: null
}

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    cloneNode: (state, action) => {
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
        console.log(action.payload);
        state.number = action.payload;
    } 
  },
})

// Action creators are generated for each case reducer function
export const { cloneNode, updateNodeData, updateNodeNumber} = nodeSlice.actions

export default nodeSlice.reducer