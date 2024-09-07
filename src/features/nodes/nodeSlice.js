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
        state.data = action.payload.props.data;
        state.title = action.payload.props.title;
        state.level = action.payload.props.level;
        state.number = action.payload.props.number;
        state.nodeId = action.payload.props.nodeId;
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