import {RouteRecordRaw} from "vue-router";

export default <RouteRecordRaw[]>[
  {name: 'index', path: '/', redirect: '/games'},
  {name: 'games', path: '/games', component: () => import('./pages/games.vue')},
  {name: 'admin', path: '/admin', component: () => import('./pages/admin.vue')},
  {name: 'logs', path: '/logs', component: () => import('./pages/logs.vue')},
]