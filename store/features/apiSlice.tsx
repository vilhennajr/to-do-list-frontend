import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const scrumboardApi = createApi({
  reducerPath: 'scrumboardApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3123/' }),
  endpoints: (builder) => ({
    getScrumboard: builder.query({
      query: () => 'scrumboard',
    }),
    addPage: builder.mutation({
      query: (newColumn) => ({
        url: 'scrumboard',
        method: 'POST',
        body: newColumn,
      }),
    }),
    editPage: builder.mutation({
      query: ({ id, updatedColumn }) => ({
        url: `column/${id}`,
        method: 'PUT',
        body: updatedColumn,
      }),
    }),
    deletePage: builder.mutation({
      query: (id) => ({
        url: `column/${id}`,
        method: 'DELETE',
      }),
    }),
    addTask: builder.mutation({
        query: ({id, newTask}) => ({
          url: `tasks/${id}`,
          method: 'POST',
          body: newTask,
        }),
      }),
      editTask: builder.mutation({
        query: ({ id, updatedTask }) => ({
          url: `tasks/${id}`,
          method: 'PUT',
          body: updatedTask,
        }),
      }),
      deleteTask: builder.mutation({
        query: (id) => ({
          url: `tasks/${id}`,
          method: 'DELETE',
        }),
      }),
  }),
});
// Exportar os hooks corretos baseados nos nomes dos endpoints definidos
export const {
  useGetScrumboardQuery,  // Correspondente ao endpoint getScrumboard
  useAddPageMutation,     // Correspondente ao endpoint addPage
  useEditPageMutation,    // Correspondente ao endpoint editPage
  useDeletePageMutation   // Correspondente ao endpoint deletePage
} = scrumboardApi;
