import { createRouter, createWebHistory } from 'vue-router'
import { squadRepository } from '@/repositories/squadRepository'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/SquadListView.vue'),
    },
    {
      path: '/squad/:id',
      name: 'squad-detail',
      component: () => import('../views/SquadDetailView.vue'),
      beforeEnter: (to) => {
        const squad = squadRepository.findById(to.params.id as string)
        if (!squad) {
          return { name: 'not-found' }
        }
      },
    },
    {
      path: '/squad/:id/bill/new',
      name: 'bill-create',
      component: () => import('../views/BillCreateView.vue'),
      beforeEnter: (to) => {
        const squad = squadRepository.findById(to.params.id as string)
        if (!squad) {
          return { name: 'not-found' }
        }
      },
    },
    {
      path: '/squad/:squadId/bill/:billId',
      name: 'bill-detail',
      component: () => import('../views/BillDetailView.vue'),
      beforeEnter: (to) => {
        const squad = squadRepository.findById(to.params.squadId as string)
        if (!squad) {
          return { name: 'not-found' }
        }
        const bill = squad.bills.find((b) => b.id === to.params.billId)
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

router.beforeEach((to, _) => {
  if (to.name === 'not-found') {
    return { name: 'home' }
  }
})

// router.beforeResolve((to, from, next) => {
//   if (document.startViewTransition) {
//     document.startViewTransition(() => next())
//   } else {
//     next()
//   }
// })

export default router
