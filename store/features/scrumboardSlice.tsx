import { api } from '@/services/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Board {
    id: string;
    name: string;
    columns: Column[];
}

interface Column {
    id: string;
    title: string;
    boardId: string;
    tasks: any[];
}

interface Task {
    id: string;
    title: string;
    description: string;
    columnId: string;
}

export const fetchBoards = createAsyncThunk<Board[], string>('boards/fetchBoards', async (id) => {
    const response = await api.get(`/users/${id}/boards`);
    return response.data[0].columns;
});

export const addColumn = createAsyncThunk<Column, { newColumn: Column; id: string }>('columns/addColumns', async ({ newColumn, id }) => {
    const response = await api.post(`/columns/${id}`, newColumn);
    return response.data;
});

export const deleteColumn = createAsyncThunk<string, string>('columns/deleteColumns', async (id) => {
    await api.delete(`/columns/${id}`);
    return id;
});

export const editColumn = createAsyncThunk<Column, { id: string; updatedColumns: Column }>('columns/editColumns', async ({ id, updatedColumns }) => {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulando delay
    const response = await api.put(`/columns/${id}`, updatedColumns);
    return response.data;
});

export const addTask = createAsyncThunk<Task, { columnId: string; updateTask: Task }>('tasks/addTask', async ({ columnId, updateTask }) => {
    const response = await api.post(`/tasks/${columnId}`, updateTask);
    return response.data;
});

export const deleteTask = createAsyncThunk<string, string>('tasks/deleteTask', async (id) => {
    await api.delete(`/tasks/${id}`);
    return id;
});

export const editTask = createAsyncThunk<Task, { id: string; updatedTask: Task }>('tasks/editTask', async ({ id, updatedTask }) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await api.put(`/tasks/${id}`, updatedTask);
    return response.data;
});

const scrumboardSlice = createSlice({
    name: 'scrumboard',
    initialState: {
        tableData: [] as Board[],
        status: 'idle',
        loadingTask: false,
        loadingColumn: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoards.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBoards.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tableData = action.payload;
            })
            .addCase(fetchBoards.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch boards';
            })
            .addCase(addColumn.fulfilled, (state, action) => {
                const newColumn: Column = action.payload;
                const newBoard: Board = {
                    id: newColumn.id,
                    name: newColumn.title,
                    columns: [newColumn],
                };
                state.tableData.push(newBoard);
            })
            .addCase(deleteColumn.fulfilled, (state, action) => {
                state.tableData = state.tableData.filter((scrumboard) => scrumboard.id !== action.payload);
            })
            .addCase(editColumn.pending, (state) => {
                state.loadingColumn = true;
            })
            .addCase(editColumn.fulfilled, (state, action) => {
                state.loadingColumn = false;
                const index = state.tableData.findIndex((scrumboard) => scrumboard.id === action.payload.id);
                if (index !== -1) {
                    state.tableData[index] = action.payload as unknown as Board;
                }
            })
            .addCase(editColumn.rejected, (state) => {
                state.loadingColumn = false;
            })
            .addCase(addTask.fulfilled, (state, action) => {
                const { columnId } = action.payload;
                const updateTask = action.payload;
                const boardIndex = state.tableData.findIndex((board) => board.id === columnId);
                if (boardIndex !== -1) {
                    state.tableData[boardIndex].columns.push(updateTask as unknown as Column);
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const taskId = action.payload;
                state.tableData.forEach((board) => {
                    board.columns = board.columns.filter((column) => column.id !== taskId);
                });
            })
            .addCase(editTask.pending, (state) => {
                state.loadingTask = true;
            })
            .addCase(editTask.fulfilled, (state, action) => {
                state.loadingTask = false;
                const updatedTask = action.payload;
                state.tableData.forEach((board) => {
                    board.columns = board.columns.map((column) => {
                        if (column.id === updatedTask.columnId) {
                            return {
                                ...column,
                                tasks: column.tasks.map((task) => {
                                    if (task.id === updatedTask.id) {
                                        return updatedTask;
                                    }
                                    return task;
                                }),
                            };
                        }
                        return column;
                    });
                });
            })
            .addCase(editTask.rejected, (state) => {
                state.loadingTask = false;
            });
    },
});
export default scrumboardSlice.reducer;
