/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './assets/main.css'

import {createApp} from 'vue';
import App from './App.vue';
import ui from '@nuxt/ui/vue-plugin'
import {createRouter, createWebHistory} from "vue-router";
import routes from './routes.config';

const app = createApp(App);

const router = createRouter({
    routes,
    history: createWebHistory()
})

app.use(router);
app.use(ui);

app.mount('#app');