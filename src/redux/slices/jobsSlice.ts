import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Job {
  _id?: string;
  job_id: string;
  job_name: string;
  customer_id: string;
  customer_name: string;
  estimate_id: string;
  estimate_number: string;
  job_location_id: string;
  scheduled_date: string;
  actual_start_date: string;
  actual_completion_date: string;
  destruction_method: string;
  destruction_description: string;
  requires_affidavit: boolean;
  special_handling_notes: string;
  job_status: 'scheduled' | 'in_progress' | 'completed' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await fetch('/api/jobs');
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData: Omit<Job, '_id' | 'job_id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, ...jobData }: { id: string } & Partial<Job>) => {
  const response = await fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return result.data;
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id: string) => {
  const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
  const result = await response.json();
  if (!result.success) throw new Error(result.message);
  return id;
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      // Create job
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      // Update job
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job._id === action.payload._id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      // Delete job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job._id !== action.payload);
      });
  },
});

export default jobsSlice.reducer;