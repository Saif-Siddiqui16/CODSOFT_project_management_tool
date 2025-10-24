import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

export interface Task {
  _id: string;
  project: string;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  createdBy?: string;
  dueDate?: string;
  assignees?: string[];
}

interface TaskState {
  tasks: Record<string, Task[]>;
  loading: boolean;
  error?: string;
}

const initialState: TaskState = {
  tasks: {},
  loading: false,
  error: undefined,
};

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (projectId: string, thunkAPI) => {
    try {
      const { data } = await axios.get(`/api/v1/tasks/${projectId}/list`, {
        withCredentials: true,
      });
      return { projectId, tasks: data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

export const createTask = createAsyncThunk<
  Task,
  {
    projectId: string;
    title: string;
    description?: string;
    status?: "To Do" | "In Progress" | "Done";
    priority?: "Low" | "Medium" | "High";
    dueDate?: string;
    assignees?: string[];
  },
  { rejectValue: string }
>("task/createTask", async (payload, thunkAPI) => {
  try {
    const { data } = await axios.post(
      `/api/v1/tasks/${payload.projectId}`,
      {
        title: payload.title,
        description: payload.description,
        status: payload.status || "Todo",
        priority: payload.priority || "Medium",
        dueDate: payload.dueDate,
        assignees: payload.assignees || [],
      },
      { withCredentials: true }
    );
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to create task"
    );
  }
});

export const updateTaskTitle = createAsyncThunk(
  "task/updateTaskTitle",
  async ({ taskId, title }: { taskId: string; title: string }, thunkAPI) => {
    try {
      const { data } = await axios.put(
        `/api/v1/tasks/${taskId}/title`,
        { title },
        { withCredentials: true }
      );
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update title"
      );
    }
  }
);

export const updateTaskDescription = createAsyncThunk(
  "task/updateTaskDescription",
  async (
    { taskId, description }: { taskId: string; description: string },
    thunkAPI
  ) => {
    try {
      const { data } = await axios.put(
        `/api/v1/tasks/${taskId}/description`,
        { description },
        { withCredentials: true }
      );
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update description"
      );
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "task/updateTaskStatus",
  async ({ taskId, status }: { taskId: string; status: string }, thunkAPI) => {
    try {
      const { data } = await axios.patch(
        `/api/v1/tasks/status/${taskId}`,
        { status },
        { withCredentials: true }
      );
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export const updateTaskPriority = createAsyncThunk(
  "task/updateTaskPriority",
  async (
    { taskId, priority }: { taskId: string; priority: string },
    thunkAPI
  ) => {
    try {
      const { data } = await axios.put(
        `/api/v1/tasks/${taskId}/priority`,
        { priority },
        { withCredentials: true }
      );
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update priority"
      );
    }
  }
);

export const updateTaskAssignees = createAsyncThunk(
  "task/updateTaskAssignees",
  async (
    { taskId, assignees }: { taskId: string; assignees: string[] },
    thunkAPI
  ) => {
    try {
      const { data } = await axios.put(
        `/api/v1/tasks/${taskId}/assignees`,
        { assignees },
        { withCredentials: true }
      );
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update assignees"
      );
    }
  }
);
export const deleteTask = createAsyncThunk(
  "task/deleteTask",
  async (taskId: string, thunkAPI) => {
    try {
      await axios.delete(`/api/v1/tasks/${taskId}`, { withCredentials: true });
      return taskId;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete task"
      );
    }
  }
);

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload;
        const projectId = task.project;
        if (!state.tasks[projectId]) state.tasks[projectId] = [];
        state.tasks[projectId].push(task);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskId = action.payload;
        for (const projectId in state.tasks) {
          state.tasks[projectId] = state.tasks[projectId].filter(
            (t) => t._id !== taskId
          );
        }
      })
      .addMatcher(
        (action) =>
          [
            updateTaskTitle.fulfilled.type,
            updateTaskDescription.fulfilled.type,
            updateTaskPriority.fulfilled.type,
            updateTaskStatus.fulfilled.type,
            updateTaskAssignees.fulfilled.type,
          ].includes(action.type),
        (state, action: PayloadAction<Task>) => {
          const updatedTask: Task = action.payload;
          const projectId = updatedTask.project;
          const projectTasks = state.tasks[projectId] || [];
          const index = projectTasks.findIndex(
            (t) => t._id === updatedTask._id
          );
          if (index !== -1) projectTasks[index] = updatedTask;
        }
      );
  },
});

export default taskSlice.reducer;
