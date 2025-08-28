import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  
  user: null,
  loading: false,
  error: null,
  
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    // Define actions for login and logout
    getprofileRequest: (state) => {
        state.loading=true;
        state.error=null;

    },
    getProfileSucess:(state,action) =>{
        state.user=action.payload.user;
        state.loading=false;
    },
    getProfileFailure:(state,action)=>{
     state.loading = false;
      state.error = action.payload;
      state.user = null;
      

    },

    updateProfleRequest: (state, _action: PayloadAction<{ email?: string; phone?: string; bio?: string; username?: string; avatarFile?: File | null }>) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      
      state.user = action.payload.user;
      state.loading = false;
    },

    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      
    },

    
    deleteProfleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteProfileSuccess: (state, action) => {
      
      state.user = action.payload.user;
      state.loading = false;
    },

    deleteProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      
    },



  

  },
});

export const {
  getprofileRequest,
  getProfileSucess,
  getProfileFailure,
  updateProfleRequest,
  updateProfileSuccess,
  updateProfileFailure,
  deleteProfileFailure,
  deleteProfileSuccess,
  deleteProfleRequest
} = profileSlice.actions;

export const profileReducer = profileSlice.reducer;