import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ requestId, message }: { requestId: string; message: string }) => {
    const response = await fetch(`/api/customer-requests/${requestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to send message');
    }
    
    return result.data;
  }
);

interface MessagesState {
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  loading: false,
  error: null
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      });
  }
});

export const { clearError } = messagesSlice.actions;
export default messagesSlice.reducer;