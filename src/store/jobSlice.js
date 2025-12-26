import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
    jobs: [],
    loading: false,
    error: null
};  

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    getJobs: (state, action) => {
      state.jobs = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchJobs.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchJobs.fulfilled, (state, action) => {
      state.jobs = action.payload;
      state.loading = false;
    });
  }
});

export const { getJobs } = jobSlice.actions;
export default jobSlice.reducer;

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (url = '/api/jobs') => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
});



// export function fetchJobs() {
//   return async (dispatch) => {
//     try {
//       const response = await fetch('/api/jobs');
//       const data = await response.json();
//       dispatch(getJobs(data));
//     } catch (error) {
//       console.error('Failed to fetch jobs:', error);
//     }
//   };
// }