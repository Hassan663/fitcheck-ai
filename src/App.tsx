import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteFallback } from "./components/RouteFallback";

const Landing = lazy(() => import("./pages/marketing/Landing"));
const AppShell = lazy(() => import("./pages/app/AppShell"));
const Studio = lazy(() => import("./pages/app/Studio"));
const CatalogPage = lazy(() => import("./pages/app/Catalog"));
const Looks = lazy(() => import("./pages/app/Looks"));
const Analytics = lazy(() => import("./pages/app/Analytics"));
const Settings = lazy(() => import("./pages/app/Settings"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="studio" replace />} />
            <Route path="studio" element={<Studio />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="looks" element={<Looks />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
