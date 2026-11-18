import React from "react";
import AppRouter from "@/app/router/AppRouter";
import AppProviders from "@/app/providers/AppProviders";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;