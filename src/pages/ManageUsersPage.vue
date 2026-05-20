<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'
import { useApiList } from '../composables/useApiList'

const search = ref('')
const filter = ref('all')
const { items: users, loading, error, load } = useApiList('/api/users', { per_page: 50 })

const filteredUsers = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter((user) => {
    const isFreelancer = Boolean(user.freelancerProfile || user.freelancer_profile || user.isFreelancer)
    const text = [
      user.name,
      user.displayName,
      user.username,
      user.email,
      user.country,
      user.state,
      user.profile?.country,
      user.profile?.state,
    ].filter(Boolean).join(' ').toLowerCase()

    return (!q || text.includes(q)) && (filter.value === 'all' || isFreelancer)
  })
})

function displayName(user) {
  return user.name || user.displayName || user.username || user.email || user.id
}

function profileValue(user, key) {
  return user[key] || user.profile?.[key] || user.latestProfile?.[key] || ''
}

function skills(user) {
  const list = user.skills || user.profile?.skills || user.latestSkills || []
  return list.map((skill) => skill.name || skill.skill || skill).filter(Boolean)
}

async function suspend(user, status) {
  await apiRequest(`/api/users/${user.id}`, {
    method: 'PATCH',
    body: { status },
  })
  await load()
}

onMounted(load)
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

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3">
          <h3 class="fs-22 fw-medium">Manage Users</h3>
        </div>
        <div class="d-flex flex-wrap align-items-center justify-content-between">
          <form method="post" class="me-3 w-25" @submit.prevent>
            <div class="form-group">
              <input v-model="search" class="form-control form--control form-control-sm h-auto lh-34" type="text" name="search" placeholder="Filter by username, country, state, email">
              <button class="form-btn" type="button"><i class="la la-search"></i></button>
            </div>
          </form>
          <div class="btn-group btn--group mb-3">
            <input id="btnradio1" v-model="filter" value="all" type="radio" class="btn-check" name="btnradio">
            <label class="btn btn-outline-primary" for="btnradio1">All users</label>
            <input id="btnradio2" v-model="filter" value="freelance" type="radio" class="btn-check" name="btnradio">
            <label class="btn btn-outline-primary" for="btnradio2">Freelance users</label>
          </div>
        </div>
      </div>

      <br><br>
      <hr>
      <br><br>

      <h3>All Users Table</h3>
      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>name (profile link)</th>
              <th>Country</th>
              <th>State</th>
              <th>Job Title</th>
              <th>Skills</th>
              <th>T.scores</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading users...
              </td>
            </tr>
            <template v-else>
              <tr v-for="(user, index) in filteredUsers" :key="user.id">
                <td>{{ index + 1 }}</td>
                <td><a href="" @click.prevent>{{ displayName(user) }}</a></td>
                <td>{{ profileValue(user, 'country') }}</td>
                <td>{{ profileValue(user, 'state') }}</td>
                <td>{{ profileValue(user, 'jobTitle') || profileValue(user, 'job_title') }}</td>
                <td>
                  <select class="form-select">
                    <option v-for="skill in skills(user)" :key="skill">{{ skill }}</option>
                    <option v-if="skills(user).length === 0">No skills</option>
                  </select>
                </td>
                <td>{{ user.totalScore || user.total_score || user.score || 0 }}</td>
                <td>
                  <div class="dropdown">
                    <i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" href="" @click.prevent="suspend(user, 'suspended')">Suspend</a></li>
                      <li><a class="dropdown-item" href="" @click.prevent="suspend(user, 'active')">Unsuspend</a></li>
                    </ul>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!loading && filteredUsers.length === 0">
              <td colspan="8">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top">
    <i class="la la-arrow-up"></i>
  </div>
</template>
