import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // React plugin
  ],
  server: {  // Specify your desired IP address here
    port: 5173,           // Port for the Vite server
    strictPort: true,     // Ensures that if port 5173 is occupied, it doesn't fall back to another port
  }
})