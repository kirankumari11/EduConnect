import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "http://localhost:5000/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  tagTypes: ["CourseDetail", "MyLearning", "Reviews"], // Added tag types
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: data,
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: ["CourseDetail"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["MyLearning"],
    }),
    createReview: builder.mutation({
      query: ({ courseId, rating, comment }) => ({
        url: `/course/${courseId}/review`,
        method: "POST",
        body: { rating, comment },
      }),
      // FIXED: Removed the extra comma that was causing syntax issues
      invalidatesTags: ["CourseDetail", "MyLearning"], 
    }),
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/review/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CourseDetail", "MyLearning"],
    }),
    getCourseReviews: builder.query({
      query: (courseId) => `/course/${courseId}/reviews`,
      providesTags: ["Reviews"],
    }),
    getDashboardStats: builder.query({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      providesTags: ["Dashboard"], 
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetDashboardStatsQuery,
} = purchaseApi;