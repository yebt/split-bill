import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/ParcheListView.vue'),
    },
    {
      path: '/parche/:id',
      name: 'parche-detail',
      component: () => import('../views/ParcheDetailView.vue'),
    },
    {
      path: '/parche/:id/bill/new',
      name: 'bill-create',
      component: () => import('../views/BillCreateView.vue'),
    },
    {
      path: '/parche/:parcheId/bill/:billId',
      name: 'bill-detail',
      component: () => import('../views/BillDetailView.vue'),
    },
  ],
})

export default router
