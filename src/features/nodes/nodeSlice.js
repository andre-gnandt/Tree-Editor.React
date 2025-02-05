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
  region: null,
  country: null,
  children: [],
  files: [],
  thumbnailId: null,
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
        state.country = action.payload.country;
        state.region = action.payload.region;
        state.files = action.payload.files;
        state.thumbnailId = action.payload.thumbnailId;
        state.treeId = action.payload.treeId;
    },
    setStateProperty: (state, action) =>
    {
      if(action.payload.key === "country" && action.payload.value != state.country) state.region = null;
      state[action.payload.key] = action.payload.value;
    },
    uploadThumbnail: (state, action) => 
    {
      state.thumbnailId = action.payload.name;
      state.files = action.payload.files;
    },
    removeThumbnail: (state) =>
    {
      if(state.files && state.thumbnailId)
      {
        const removeIndex = state.files.findIndex((object) => object.id === state.thumbnailId || (object.name === state.thumbnailId && object.id === "00000000-0000-0000-0000-000000000000"));
        if(removeIndex > -1)  state.files.splice(removeIndex, 1);
      }
      else if(state.thumbnailId)
      {
        state.files = [];
      }
      state.thumbnailId = null;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setStateProperty, cloneNode, uploadThumbnail, removeThumbnail} = nodeSlice.actions

export default nodeSlice.reducer