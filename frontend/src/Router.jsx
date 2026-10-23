import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PoseAnalysis from "./pages/PoseAnalysis";
import Sessions from "./pages/Sessions";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Exercise from "./pages/Exercises";
import Leaderboard from "./pages/Leaderboard";
import EmotionDetection from "./pages/EmotionDetection";

const Router = () => {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <HomeLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
      ],
    },

    {
      path: "/login",
      element: <Login />,
    },

    {
      path: "/register",
      element: <Register />,
    },

    {
      path: "/dashboard",
      element: <Dashboard />,
    },

    {
      path: "/pose-analysis",
      element: <PoseAnalysis />,
    },

    {
      path: "/sessions",
      element: <Sessions />,
    },

    {
      path: "/progress",
      element: <Progress />,
    },

    {
      path: "/exercises",
      element: <Exercise />,
    },

    {
      path: "/leaderboard",
      element: <Leaderboard />,
    },

    {
      path: "/profile",
      element: <Profile />,
    },

    {
      path: "/emotion-detection",
      element: <EmotionDetection />,
    },
  ]);

  return <RouterProvider router={routes} />;
};

export default Router;