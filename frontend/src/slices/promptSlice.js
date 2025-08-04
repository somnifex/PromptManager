import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fetchPrompts = createAsyncThunk(
  'prompts/fetchPrompts',
  async () => {
    const response = await axios.get(`${API_BASE_URL}/prompts/`);
    return response.data.results;
  }
);

export const fetchPromptDetail = createAsyncThunk(
  'prompts/fetchPromptDetail',
  async (id) => {
    const response = await axios.get(`${API_BASE_URL}/prompts/${id}/`);
    return response.data;
  }
);

export const fetchPromptVersions = createAsyncThunk(
  'prompts/fetchPromptVersions',
  async (promptId) => {
    const response = await axios.get(`${API_BASE_URL}/prompts/${promptId}/versions/`);
    return response.data.results;
  }
);

export const createPrompt = createAsyncThunk(
  'prompts/createPrompt',
  async ({ title, content, sharing_mode, commit_message }) => {
    const response = await axios.post(`${API_BASE_URL}/prompts/`, {
      title,
      content,
      sharing_mode,
      commit_message,
    });
    return response.data;
  }
);

export const updatePrompt = createAsyncThunk(
  'prompts/updatePrompt',
  async ({ id, title, content, sharing_mode, commit_message }) => {
    const response = await axios.put(`${API_BASE_URL}/prompts/${id}/`, {
      title,
      content,
      sharing_mode,
      commit_message,
    });
    return response.data;
  }
);

export const deletePrompt = createAsyncThunk(
  'prompts/deletePrompt',
  async (id) => {
    await axios.delete(`${API_BASE_URL}/prompts/${id}/`);
    return id;
  }
);

export const restoreVersion = createAsyncThunk(
  'prompts/restoreVersion',
  async ({ promptId, versionId }) => {
    const response = await axios.post(`${API_BASE_URL}/prompts/${promptId}/versions/${versionId}/restore/`);
    return response.data;
  }
);

const promptSlice = createSlice({
  name: 'prompts',
  initialState: {
    prompts: [],
    currentPrompt: null,
    versions: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.prompts = action.payload;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPromptDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPromptDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPrompt = action.payload;
      })
      .addCase(fetchPromptDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPromptVersions.fulfilled, (state, action) => {
        state.versions = action.payload;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.prompts.unshift(action.payload);
      })
      .addCase(updatePrompt.fulfilled, (state, action) => {
        const index = state.prompts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.prompts[index] = action.payload;
        }
        if (state.currentPrompt?.id === action.payload.id) {
          state.currentPrompt = action.payload;
        }
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.prompts = state.prompts.filter(p => p.id !== action.payload);
      });
  },
});

export default promptSlice.reducer;