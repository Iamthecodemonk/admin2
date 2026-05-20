<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest, getPaginatorData } from '../services/api'

const loading = ref(true)
const error = ref('')
const stats = ref({
  referrals: 0,
  posts: 0,
  questions: 0,
  online: 0,
  users: 0,
  answered: 0,
  jobs: 0,
  scores: 0,
})

const cards = computed(() => [
  ['15332', 'Referrals Sent', stats.value.referrals, 'bg-1'],
  ['466698', 'Total Post', stats.value.posts, 'bg-2'],
  ['11488', 'Total Questions', stats.value.questions, 'bg-3'],
  ['400', 'Online', stats.value.online, 'bg-4'],
  ['188745095', 'Users', stats.value.users, 'bg-1'],
  ['43569', 'Answered', stats.value.answered, 'bg-2'],
  ['11', 'Active Jobs', stats.value.jobs, 'bg-3'],
  ['400', 'Total Scores', stats.value.scores, 'bg-4'],
])

async function count(path, params = '?per_page=1') {
  const response = await apiRequest(`${path}${params}`)
  return response?.total ?? response?.data?.total ?? getPaginatorData(response).length
}

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    const [posts, questions, users, jobs] = await Promise.all([
      count('/api/posts'),
      count('/api/questions'),
      count('/api/users'),
      count('/api/jobs'),
    ])

    stats.value = {
      ...stats.value,
      posts,
      questions,
      users,
      jobs,
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div id="preloader">
    <div class="loader">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
    </div>
  </div>

  <AppHeader />

  <section class="question-area pt-80px pb-30px">
    <div class="container">
      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <p v-if="loading" class="text-muted">Loading dashboard...</p>
      <div class="row">
        <div v-for="([fallback, label, value, bg], index) in cards" :key="label" class="col-lg-3 responsive-column-half">
          <div class="media media-card align-items-center shadow-none border border-gray p-3">
            <div class="icon-element icon-element-sm flex-shrink-0 me-3" :class="bg">
              <i v-if="index !== 2" class="las la-th"></i>
              <svg v-else class="svg-icon-color-white" height="25" viewBox="0 0 515.556 515.556" width="25" xmlns="http://www.w3.org/2000/svg">
                <path d="m0 274.226 176.549 176.886 339.007-338.672-48.67-47.997-290.337 290-128.553-128.552z"/>
              </svg>
            </div>
            <div class="media-body">
              <h5 class="fw-medium">{{ value || fallback }}</h5>
              <p class="fs-15">{{ label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top">
    <i class="la la-arrow-up"></i>
  </div>
</template>
