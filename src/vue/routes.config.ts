import {RouteRecordRaw} from "vue-router";

export default <RouteRecordRaw[]>[
    {name: 'index', path: '/', component: () => import('./pages/Index.vue')},
]