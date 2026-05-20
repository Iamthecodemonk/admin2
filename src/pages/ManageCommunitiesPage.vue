<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'
import { useApiList } from '../composables/useApiList'

const { items: communities, loading, error, load } = useApiList('/api/communities', { per_page: 50 })
const saving = ref(false)
const message = ref('')
const editMessage = ref('')
const form = reactive({
  name: '',
  description: '',
  icon: '',
  categoryId: '',
  type: 'Horizontal',
})
const editForm = reactive({
  id: '',
  name: '',
  description: '',
  icon: '',
  type: 'Horizontal',
})

function uiTypeToApi(type) {
  return type === 'Vertical' ? 'community' : 'public'
}

function apiTypeToUi(value) {
  if (value === 'community') return 'Vertical'
  if (value === 'connections') return 'Connections'
  return 'Horizontal'
}

function communityIcon(community) {
  return community.icon || community.iconClass || 'las la-th'
}

async function saveCommunity() {
  saving.value = true
  message.value = ''
  try {
    await apiRequest('/api/communities', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description,
        icon: form.icon,
        categoryId: form.categoryId || undefined,
        defaultPostVisibility: uiTypeToApi(form.type),
        membersOnlyPosting: form.type === 'Vertical',
      },
    })
    Object.assign(form, { name: '', description: '', icon: '', categoryId: '', type: 'Horizontal' })
    message.value = 'Community created successfully.'
    await load()
  } catch (err) {
    message.value = err.message
  } finally {
    saving.value = false
  }
}

async function deleteCommunity(community) {
  if (!confirm(`Delete ${community.name}?`)) return
  await apiRequest(`/api/communities/${community.id}`, { method: 'DELETE' })
  await load()
}

function prepareEdit(community) {
  Object.assign(editForm, {
    id: community.id,
    name: community.name || '',
    description: community.description || '',
    icon: community.icon || community.iconClass || '',
    type: apiTypeToUi(community.defaultPostVisibility),
  })
  editMessage.value = ''
}

async function saveEdit() {
  editMessage.value = ''
  try {
    await apiRequest(`/api/communities/${editForm.id}`, {
      method: 'PUT',
      body: {
        name: editForm.name,
        description: editForm.description,
        icon: editForm.icon,
        defaultPostVisibility: uiTypeToApi(editForm.type),
        membersOnlyPosting: editForm.type === 'Vertical',
      },
    })
    editMessage.value = 'Community updated successfully.'
    await load()
  } catch (err) {
    editMessage.value = err.message
  }
}

async function setCommunityActive(community, isActive) {
  await apiRequest(`/api/communities/${community.id}`, {
    method: 'PUT',
    body: { is_active: isActive ? 1 : 0 },
  })
  await load()
}

onMounted(async () => {
  await load()
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

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-40px d-flex flex-wrap align-items-center justify-content-between">
        <h3>Create Community</h3>
        <ul class="breadcrumb-list">
          <li><a href="#/home">Home</a><span><svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 0 24 24" width="19px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path></svg></span></li>
          <li>Create Community</li>
        </ul>
      </div>

      <form @submit.prevent="saveCommunity">
        <p v-if="message" class="alert" :class="message.includes('success') ? 'alert-success' : 'alert-danger'">{{ message }}</p>
        <div class="col-md-8 mb-3 mt-3">
          <label>Community Name:</label>
          <input v-model="form.name" type="text" class="form-control" required>
        </div>
        <div class="mb-3 col-md-8 mt-3">
          <label>Description:</label>
          <textarea v-model="form.description" class="form-control" rows="5"></textarea>
        </div>
        <div class="col-md-8 mb-3">
          <label>Enter Icon name:</label>
          <input v-model="form.icon" type="text" class="form-control" placeholder="<i class=las la-pen></i>">
        </div>
        <div class="col-md-8 mb-3">
          <label class="form-label">Select type of Community:</label>
          <select v-model="form.type" class="form-select">
            <option>Horizontal</option>
            <option>Vertical</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Submitting...' : 'Submit' }}</button>
      </form>

      <br><br>
      <hr>
      <br><br>

      <h3>Community Table</h3>
      <p v-if="loading" class="text-muted">Loading communities...</p>
      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Community name</th>
            <th>Description</th>
            <th>icon type</th>
            <th>Community type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(community, index) in communities" :key="community.id">
            <td>{{ index + 1 }}</td>
            <td>{{ community.name }}</td>
            <td>{{ community.description }}</td>
            <td><i :class="communityIcon(community)"></i></td>
            <td>{{ apiTypeToUi(community.defaultPostVisibility) }}</td>
            <td>
              <div class="dropdown">
                <i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="" data-bs-toggle="modal" data-bs-target="#editCommunity" @click.prevent="prepareEdit(community)">Edit</a></li>
                  <li><a class="dropdown-item" href="" @click.prevent="setCommunityActive(community, false)">Suspend</a></li>
                  <li><a class="dropdown-item" href="" @click.prevent="setCommunityActive(community, true)">Unsuspend</a></li>
                  <li><a class="dropdown-item" href="" @click.prevent="deleteCommunity(community)">Delete</a></li>
                </ul>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && communities.length === 0">
            <td colspan="6">No communities found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top">
    <i class="la la-arrow-up"></i>
  </div>

  <div class="modal" id="editCommunity">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">editCommunity</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveEdit">
            <p v-if="editMessage" class="alert" :class="editMessage.includes('success') ? 'alert-success' : 'alert-danger'">{{ editMessage }}</p>
            <div class="col-md-8 mb-3 mt-3">
              <label>Community Name:</label>
              <input v-model="editForm.name" type="text" class="form-control" required>
            </div>
            <div class="mb-3 col-md-8 mt-3">
              <label>Description:</label>
              <textarea v-model="editForm.description" class="form-control" rows="5"></textarea>
            </div>
            <div class="col-md-8 mb-3">
              <label>Enter Icon name:</label>
              <input v-model="editForm.icon" type="text" class="form-control" placeholder="<i class=las la-pen></i>">
            </div>
            <div class="col-md-8 mb-3">
              <label class="form-label">Select type of Community:</label>
              <select v-model="editForm.type" class="form-select">
                <option>Horizontal</option>
                <option>Vertical</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Save</button>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
