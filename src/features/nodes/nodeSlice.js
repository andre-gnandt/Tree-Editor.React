import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: "00000000-0000-0000-0000-000000000000",
  data: null,
  title: "UNKWOWN",
  level: 0,
  description: null,
  number: null,
  nodeId: null,
  treeId: null,
  rankId: null,
  children: [],
  files: [],
  thumbnailId: null,
  isDeleted: false,
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
        state.description = action.payload.description;
        state.number = action.payload.number;
        state.nodeId = action.payload.nodeId;
        state.rankId = action.payload.rankId;
        state.isDeleted = action.payload.isDeleted;
        state.files = action.payload.files;
        state.thumbnailId = action.payload.thumbnailId;
        state.treeId = action.payload.treeId;
    },
    setStateProperty: (state, action) =>
    {
      state[action.payload.key] = action.payload.value;
    },
    updateNodeData: (state, action) => {
        state.data = action.payload;
    },
    updateNodeNumber: (state, action) => {
        state.number = action.payload;
    },
    updateNodeTitle: (state, action) => {
        state.title = action.payload;
    },
    updateNodeDescription: (state, action) => {
      state.description = action.payload;
    },
    updateNodeRank: (state, action) => {
      state.rankId = action.payload;
    },
    updateNodeParent: (state, action) => {
      state.nodeId = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setStateProperty, cloneNode, updateNodeData, updateNodeNumber, updateNodeTitle, updateNodeDescription, updateNodeRank, updateNodeParent} = nodeSlice.actions

export default nodeSlice.reducer