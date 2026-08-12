import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Login from "./pages/Login";
import Log_Reg from "./layouts/Log_Reg";

const Router = () => {

  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Log_Reg />,
      children: [
        {
          index: true,
          element: <Login />,
        },
      ],
    },
  ]);

  return <RouterProvider router={routes} />;
};

export default Router;