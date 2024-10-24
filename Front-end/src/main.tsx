import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "react-hot-toast"
import App from "./App.tsx"
import "./index.css"

import store from "./store/store.ts"
import { Provider } from "react-redux"

import { GoogleOAuthProvider } from "@react-oauth/google"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<Provider store={store}>
				<Toaster />
				<App />
			</Provider>
		</GoogleOAuthProvider>
	</StrictMode>
)
