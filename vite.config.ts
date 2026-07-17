import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget/booking-widget.ts'),
      name: 'BookingWidget',
      fileName: 'booking-widget',
      formats: ['es'],
    },
    outDir: 'dist/widget',
    rollupOptions: {
      external: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
      output: {
        globals: {
          'firebase/app': 'FirebaseApp',
          'firebase/firestore': 'FirebaseFirestore',
          'firebase/auth': 'FirebaseAuth',
        },
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
});
