import { GoogleOAuthProvider } from "@react-oauth/google";

import QueryProvider from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { BrowserRouter } from "react-router-dom";

function OptionalGoogle({children}) {const id=import.meta.env.VITE_GOOGLE_CLIENT_ID;return id?<GoogleOAuthProvider clientId={id} locale="vi">{children}</GoogleOAuthProvider>:children;}

function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <OptionalGoogle>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </OptionalGoogle>
    </BrowserRouter>
  );
}

export default AppProviders;
