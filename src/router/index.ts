import { createRouter, createWebHistory } from 'vue-router'
import { parcheRepository } from '@/repositories/parcheRepository'

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
      beforeEnter: (to) => {
        const parche = parcheRepository.findById(to.params.id as string)
        if (!parche) {
          return { name: 'not-found' }
        }
      },
    },
    {
      path: '/parche/:id/bill/new',
      name: 'bill-create',
      component: () => import('../views/BillCreateView.vue'),
      beforeEnter: (to) => {
        const parche = parcheRepository.findById(to.params.id as string)
        if (!parche) {
          return { name: 'not-found' }
        }
      },
    },
    {
      path: '/parche/:parcheId/bill/:billId',
      name: 'bill-detail',
      component: () => import('../views/BillDetailView.vue'),
      beforeEnter: (to) => {
        const parche = parcheRepository.findById(to.params.parcheId as string)
        if (!parche) {
          return { name: 'not-found' }
        }
        const bill = parche.bills.find((b) => b.id === to.params.billId)
        if (!bill) {
          return { name: 'not-found' }
        }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
