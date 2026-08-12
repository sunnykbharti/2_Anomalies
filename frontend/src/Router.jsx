import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Login from "./pages/Login";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

const Router = () => {

  const routes = createBrowserRouter([
    {
      path: "/",
      element:<HomeLayout />,
      children: [
        {
          index: true,
          element: <Home />
        },
      ],
    },
    {
      path:"/login",
      element:<Login />
    },
    {
      path:"/dashboard",
      element:<Dashboard />
    }
  ]);

  return <RouterProvider router={routes} />;
};

export default Router;