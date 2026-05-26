<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'
import { jobCompanyName, jobDetailsRows, jobEmail, jobEndDate, jobTitle, loadJobsByBucket, updateAdminJobStatus } from '../services/jobs'

const type = ref('regular')
const search = ref('')
const userNames = ref({})
const regularJobs = ref([])
const freelanceJobs = ref([])
const loading = ref(false)
const error = ref('')
const selectedJob = ref(null)
const jobs = computed(() => type.value === 'regular' ? regularJobs.value : freelanceJobs.value)
const filteredJobs = computed(() => {
  const q = search.value.toLowerCase()
  return jobs.value.filter((job) => !q || [jobEndDate(job), jobEmail(job), job.location, job.title, jobCompanyName(job)].filter(Boolean).join(' ').toLowerCase().includes(q))
})

async function loadCurrentJobs() {
  loading.value = true
  error.value = ''
  try {
    const loadedJobs = await loadJobsByBucket(type.value, 'active')
    if (type.value === 'regular') regularJobs.value = loadedJobs
    else freelanceJobs.value = loadedJobs
    await loadPosterNames()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function updateStatus(job, status) {
  await updateAdminJobStatus(type.value, job, status)
  await loadCurrentJobs()
}

function showJobDetails(job) {
  selectedJob.value = job
}

function nestedPosterName(job) {
  return job.user?.name || job.user?.username || job.author?.name || job.author?.username || job.createdBy?.name || job.createdBy?.username || job.createdByUser?.name || job.createdByUser?.username || job.owner?.name || job.ownerName || ''
}

function posterId(job) {
  return job.createdByUserId || job.userId || job.ownerId || job.created_by_user_id || ''
}

function posterName(job) {
  return nestedPosterName(job) || userNames.value[posterId(job)] || posterId(job) || 'User'
}

async function loadPosterNames() {
  const ids = [...new Set(jobs.value.map(posterId).filter(Boolean))]

  await Promise.all(ids.map(async (id) => {
    if (userNames.value[id]) return
    try {
      const response = await apiRequest(`/api/users/${id}`)
      const user = response?.data || response
      userNames.value[id] = user.name || user.displayName || user.username || user.email || id
    } catch {
      userNames.value[id] = id
    }
  }))
}

onMounted(loadCurrentJobs)
watch(type, loadCurrentJobs)
</script>

<template>
  <div id="preloader"><div class="loader"><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div></div>
  <AppHeader />

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3">
          <h3 class="fs-22 fw-medium">Manage Active Jobs</h3>
        </div>
        <div class="d-flex flex-wrap align-items-center justify-content-between">
          <form method="post" class="me-3 w-25" @submit.prevent>
            <div class="form-group">
              <input v-model="search" class="form-control form--control form-control-sm h-auto lh-34" type="text" name="search" placeholder="end date, return email, location, post name, company">
              <button class="form-btn" type="button"><i class="la la-search"></i></button>
            </div>
          </form>
          <div class="btn-group btn--group mb-3">
            <input id="activeRegular" v-model="type" value="regular" type="radio" class="btn-check" name="activeType">
            <label class="btn btn-outline-primary" for="activeRegular">Regular Jobs</label>
            <input id="activeFreelance" v-model="type" value="freelance" type="radio" class="btn-check" name="activeType">
            <label class="btn btn-outline-primary" for="activeFreelance">Freelance Jobs</label>
          </div>
        </div>
      </div>

      <br><br><hr><br><br>
      <h3>{{ type === 'regular' ? 'Regular Jobs Table' : 'Freelance Jobs Table' }}</h3>
      <p v-if="loading" class="text-muted">Loading jobs...</p>
      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>post name (profile link)</th>
              <th>Company(view job details)</th>
              <th>Location</th>
              <th>Return email</th>
              <th>End Date</th>
              <th>Status - <br>deleted/suspended/expired/active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(job, index) in filteredJobs" :key="job.id">
              <td>{{ index + 1 }}</td>
              <td><a href="" @click.prevent>{{ posterName(job) }}</a></td>
              <td><a href="" data-bs-toggle="modal" data-bs-target="#activeJobDetailsModal" @click.prevent="showJobDetails(job)">{{ jobCompanyName(job) || jobTitle(job) }}</a></td>
              <td>{{ job.location }}</td>
              <td>{{ jobEmail(job) }}</td>
              <td>{{ jobEndDate(job) }}</td>
              <td>{{ job.status }}</td>
              <td>
                <div class="dropdown">
                  <i class="la la-list-ul dropdown-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="" @click.prevent="updateStatus(job, 'suspended')">Suspend</a></li>
                    <li><a class="dropdown-item" href="" @click.prevent="updateStatus(job, 'active')">Unsuspend</a></li>
                    <li><a class="dropdown-item" href="" @click.prevent="updateStatus(job, 'deleted')">Delete</a></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && filteredJobs.length === 0"><td colspan="8">No jobs found.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top"><i class="la la-arrow-up"></i></div>

  <div class="modal" id="activeJobDetailsModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Job Details</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <table v-if="selectedJob" class="table table-bordered">
            <tbody>
              <tr v-for="[label, value] in jobDetailsRows(selectedJob, posterName(selectedJob))" :key="label">
                <th style="width: 180px;">{{ label }}</th>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
