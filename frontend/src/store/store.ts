import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./workspace/workspace-slice";
import taskReducer from "./task/task-slice";
import projectReducer from "./project/project-slice";
import authReducer from "./auth/auth-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    task: taskReducer,
    project: projectReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
