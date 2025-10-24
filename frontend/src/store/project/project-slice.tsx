import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Project {
  _id: string;
  title: string;
  description?: string;
  workspace?: string;
  startDate?: string;
  dueDate?: string;
  progress: number;
  status: "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
  members?: any[];
  createdBy: string | { _id: string; name?: string };
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  projectTasks: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  projectTasks: [],
  loading: false,
  error: null,
};

export const fetchProjectDetails = createAsyncThunk<
  Project,
  string,
  { rejectValue: string }
>("project/fetchProjectDetails", async (projectId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/v1/projects/${projectId}`, {
      withCredentials: true,
    });
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch project details"
    );
  }
});

export const fetchProjects = createAsyncThunk<
  Project[],
  string,
  { rejectValue: string }
>("project/fetchProjects", async (workspaceId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/v1/projects/${workspaceId}/list`, {
      withCredentials: true,
    });
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch projects"
    );
  }
});

export const fetchProjectTasks = createAsyncThunk<
  { project: any; tasks: any[] },
  string,
  { rejectValue: string }
>("project/fetchProjectTasks", async (projectId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/v1/projects/${projectId}/tasks`, {
      withCredentials: true,
    });
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch project tasks"
    );
  }
});

export const createProject = createAsyncThunk<
  Project,
  {
    workspaceId: string;
    title: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    status?: "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
    members?: { user: string; role: string }[];
  },
  { rejectValue: string }
>("project/createProject", async (payload, thunkAPI) => {
  try {
    const { data } = await axios.post(
      `/api/v1/projects/${payload.workspaceId}`,
      {
        title: payload.title,
        description: payload.description,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        status: payload.status || "Planning",
        members: payload.members || [],
      },
      { withCredentials: true }
    );
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to create project"
    );
  }
});

export const fetchProjectProgress = createAsyncThunk<
  { projectId: string; progress: number },
  string,
  { rejectValue: string }
>("project/fetchProgress", async (projectId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/api/v1/projects/progress/${projectId}`, {
      withCredentials: true,
    });
    return { projectId, progress: data.progress };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch progress"
    );
  }
});

export const editProject = createAsyncThunk<
  Project,
  {
    projectId: string;
    title?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    status?: "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
    members?: { user: string; role: string }[];
  },
  { rejectValue: string }
>("project/editProject", async (payload, thunkAPI) => {
  try {
    const { data } = await axios.put(
      `/api/v1/projects/${payload.projectId}`,
      {
        title: payload.title,
        description: payload.description,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        status: payload.status,
        members: payload.members,
      },
      { withCredentials: true }
    );
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to edit project"
    );
  }
});

export const deleteProject = createAsyncThunk<
  { projectId: string },
  string,
  { rejectValue: string }
>("project/deleteProject", async (projectId, thunkAPI) => {
  try {
    await axios.delete(`/api/v1/projects/${projectId}`, {
      withCredentials: true,
    });
    return { projectId };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to delete project"
    );
  }
});

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch projects";
      })
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload.project;
        state.projectTasks = action.payload.tasks;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch project tasks";
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
        state.loading = false;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create project";
      })
      .addCase(fetchProjectProgress.fulfilled, (state, action) => {
        const project = state.projects.find(
          (p) => p._id === action.payload.projectId
        );
        if (project) project.progress = action.payload.progress;
      })
      .addCase(fetchProjectDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch project details";
      })
      .addCase(editProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.projects[index] = action.payload;
        if (state.selectedProject?._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(editProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to edit project";
      })

      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(
          (p) => p._id !== action.payload.projectId
        );
        if (state.selectedProject?._id === action.payload.projectId) {
          state.selectedProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete project";
      });
  },
});

export default projectSlice.reducer;
