import { Route, Routes } from "react-router";
import { Layout } from "@/layout/layout";
import { HomePage } from "@/pages/Home/home";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<HomePage />} index />
      </Route>
    </Routes>
  );
}
