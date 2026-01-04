import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Route definitions
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue'),
    },
    {
        path: '/builder',
        name: 'builder',
        component: () => import('../views/Builder.vue'),
    },
    {
        path: '/builds/:id',
        name: 'build-display',
        component: () => import('../views/BuildDisplay.vue'),
    },
    {
        path: '/my-builds',
        name: 'my-builds',
        component: () => import('../views/MyBuilds.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/browse',
        name: 'browse',
        component: () => import('../views/Browse.vue'),
    },
    {
        path: '/account',
        name: 'account',
        component: () => import('../views/Account.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/tree-test',
        name: 'tree-test',
        component: () => import('../views/PassiveTreeTest.vue'),
    },
];

// Create router
const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    },
});

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Redirect to home if not authenticated
        next({ name: 'home', query: { redirect: to.fullPath } });
    } else {
        next();
    }
});

export default router;
