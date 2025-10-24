import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;
interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: any;
  members: any[];
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
  projects?: any[];
  loading: boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  loading: false,
  projects: [],
};

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchAll",
  async () => {
    const { data } = await axios.get("/api/v1/workspace", {
      withCredentials: true,
    });
    return data;
  }
);

export const createWorkspace = createAsyncThunk(
  "workspace/create",
  async (payload: { name: string; description?: string }) => {
    const { data } = await axios.post("/api/v1/workspace", payload, {
      withCredentials: true,
    });
    return data;
  }
);

export const fetchWorkspaceDetails = createAsyncThunk(
  "workspace/fetchDetails",
  async (workspaceId: string) => {
    const { data } = await axios.get(`/api/v1/workspace/${workspaceId}`, {
      withCredentials: true,
    });
    return data;
  }
);

export const inviteUser = createAsyncThunk(
  "workspace/invite",
  async ({
    workspaceId,
    email,
    role,
  }: {
    workspaceId: string;
    email: string;
    role: string;
  }) => {
    const { data } = await axios.post(
      `/api/v1/workspace/${workspaceId}/invite`,
      { email, role },
      { withCredentials: true }
    );
    return data;
  }
);

export const acceptInvite = createAsyncThunk(
  "workspace/acceptInvite",
  async ({ workspaceId, token }: { workspaceId: string; token: string }) => {
    const { data } = await axios.post(
      `/api/v1/workspace/${workspaceId}/invite/accept`,
      { token },
      { withCredentials: true }
    );
    return data;
  }
);

export const acceptGenerateInvite = createAsyncThunk(
  "workspace/acceptGenerateInvite",
  async (workspaceId: string) => {
    const { data } = await axios.post(
      `/api/v1/workspace/${workspaceId}/accept-generate-invite`,
      {},
      { withCredentials: true }
    );
    return data;
  }
);

export const removeMember = createAsyncThunk(
  "workspace/removeMember",
  async ({ workspaceId, userId }: { workspaceId: string; userId: string }) => {
    await axios.delete(`/api/v1/workspace/${workspaceId}/members/${userId}`, {
      withCredentials: true,
    });
    return { workspaceId, userId };
  }
);

export const fetchWorkspaceProjects = createAsyncThunk(
  "workspace/fetchProjects",
  async (workspaceId: string) => {
    const { data } = await axios.get(
      `/api/v1/workspace/${workspaceId}/projects`,
      { withCredentials: true }
    );
    return data;
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspace/delete",
  async (workspaceId: string) => {
    await axios.delete(`/api/v1/workspace/${workspaceId}`, {
      withCredentials: true,
    });
    return workspaceId;
  }
);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.push(action.payload);
      })
      .addCase(fetchWorkspaceDetails.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        if (
          state.currentWorkspace &&
          state.currentWorkspace._id === action.payload.workspaceId
        ) {
          state.currentWorkspace.members =
            state.currentWorkspace.members.filter(
              (m) => m.user._id !== action.payload.userId
            );
        }
      })
      .addCase(fetchWorkspaceProjects.fulfilled, (state, action) => {
        state.projects = action.payload.projects;
        state.currentWorkspace = action.payload.workspace;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter(
          (w) => w._id !== action.payload
        );

        if (state.currentWorkspace?._id === action.payload) {
          state.currentWorkspace = undefined;
          state.projects = [];
        }
      });
  },
});

export default workspaceSlice.reducer;
