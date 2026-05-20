<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getToken } from './services/api'
import LoginPage from './pages/LoginPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import AddPostPage from './pages/AddPostPage.vue'
import ManageCommunitiesPage from './pages/ManageCommunitiesPage.vue'
import ManageAdvertsPage from './pages/ManageAdvertsPage.vue'
import ModeratePostsPage from './pages/ModeratePostsPage.vue'
import ManageUsersPage from './pages/ManageUsersPage.vue'
import ManageAdminUsersPage from './pages/ManageAdminUsersPage.vue'
import JobsAwaitingApprovalPage from './pages/JobsAwaitingApprovalPage.vue'
import ManageActiveJobsPage from './pages/ManageActiveJobsPage.vue'
import ViewJobsPage from './pages/ViewJobsPage.vue'
import ManageContestsPage from './pages/ManageContestsPage.vue'
import ManageFreelanceUsersPage from './pages/ManageFreelanceUsersPage.vue'

const pages = {
  login: LoginPage,
  home: DashboardPage,
  'add-post': AddPostPage,
  'manage-communities': ManageCommunitiesPage,
  'manage-adverts': ManageAdvertsPage,
  'moderate-posts': ModeratePostsPage,
  'manage-users': ManageUsersPage,
  'manage-admin-users': ManageAdminUsersPage,
  'jobs-awaiting-approval': JobsAwaitingApprovalPage,
  'manage-active-jobs': ManageActiveJobsPage,
  'view-jobs': ViewJobsPage,
  'manage-contests': ManageContestsPage,
  'manage-freelance-users': ManageFreelanceUsersPage,
}

const resolveRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, '')
  if (pages[route]) return route
  return getToken() ? 'home' : 'login'
}

const currentRoute = ref(resolveRoute())
const CurrentPage = computed(() => pages[currentRoute.value])

const closeOpenDropdowns = () => {
  document.querySelectorAll('.dropdown-menu.show').forEach((menu) => {
    menu.classList.remove('show')
    menu.style.display = ''
  })
}

const closeModal = () => {
  document.querySelectorAll('.modal.show').forEach((modal) => {
    modal.classList.remove('show')
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
  })
  document.body.classList.remove('modal-open')
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
}

const openModal = (selector) => {
  const modal = document.querySelector(selector)
  if (!modal) return
  closeModal()
  modal.classList.add('show')
  modal.style.display = 'block'
  modal.removeAttribute('aria-hidden')
  document.body.classList.add('modal-open')
  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop fade show'
  backdrop.addEventListener('click', closeModal)
  document.body.appendChild(backdrop)
}

const handleDocumentClick = (event) => {
  const dropdownToggle = event.target.closest('.dropdown [data-bs-toggle="dropdown"]')
  if (dropdownToggle) {
    event.preventDefault()
    event.stopPropagation()
    const menu = dropdownToggle.parentElement?.querySelector('.dropdown-menu')
    const isOpen = menu?.classList.contains('show')
    closeOpenDropdowns()
    if (menu && !isOpen) {
      menu.classList.add('show')
      menu.style.display = 'block'
    }
    return
  }

  const modalTrigger = event.target.closest('[data-bs-toggle="modal"]')
  if (modalTrigger) {
    event.preventDefault()
    const target = modalTrigger.getAttribute('data-bs-target')
    if (target) openModal(target)
    return
  }

  const modalDismiss = event.target.closest('[data-bs-dismiss="modal"], .modal .btn-close')
  if (modalDismiss) {
    event.preventDefault()
    closeModal()
    return
  }

  if (!event.target.closest('.dropdown-menu')) {
    closeOpenDropdowns()
  }
}

const wireInteractions = () => {
  document.querySelectorAll('.dropdown-btn').forEach((button) => {
    if (button.dataset.vueWired === 'true') return
    button.dataset.vueWired = 'true'
    button.addEventListener('click', () => {
      button.classList.toggle('active')
      const dropdownContent = button.nextElementSibling
      if (dropdownContent) {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block'
      }
    })
  })

  document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, { once: true })
}

const syncRoute = () => {
  currentRoute.value = resolveRoute()
  if (currentRoute.value !== 'login' && !getToken()) {
    currentRoute.value = 'login'
    window.location.hash = '#/login'
  }
  window.scrollTo({ top: 0, left: 0 })
}

onMounted(() => {
  syncRoute()
  window.addEventListener('hashchange', syncRoute)
  document.addEventListener('click', handleDocumentClick)
  nextTick(wireInteractions)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute)
  document.removeEventListener('click', handleDocumentClick)
})

watch(currentRoute, () => nextTick(wireInteractions))
</script>

<template>
  <component :is="CurrentPage" />
</template>
