import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { VisitedListPage } from "./pages/VisitedListPage";
import { PeakDetailPage } from "./pages/PeakDetailPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "peaks/:id", element: <PeakDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "visited", element: <VisitedListPage /> }],
      },
    ],
  },
]);
