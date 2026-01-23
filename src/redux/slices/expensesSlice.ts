import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Expense {
  _id?: string;
  expense_id: string;
  expense_type: 'transport' | 'packaging' | 'equipment' | 'labor' | 'materials' | 'utilities' | 'other';
  vendor_name: string;
  expense_date: string;
  amount: number;
  description: string;
  expense_status: 'draft' | 'submitted' | 'approved' | 'archived';
  payment_status: 'not_ready' | 'pending' | 'paid';
  payment_date?: string;
  payment_method?: 'bank_transfer' | 'check' | 'cash' | 'credit_card' | 'other';
  job_id?: string;
  purchase_order_number?: string;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/expenses');
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: Partial<Expense>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }: { id: string; data: Partial<Expense> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create expense
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(
          (expense) => expense._id === action.payload._id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== action.payload
        );
      });
  },
});

export default expensesSlice.reducer;