import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Login from "./pages/Login";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PoseAnalysis from "./pages/PoseAnalysis";
import Sessions from "./pages/Sessions";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Exercise from "./pages/Exercises";

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
      path: "/profile",
      element: <Profile />,
    },
  ]);

  return <RouterProvider router={routes} />;
};

export default Router;