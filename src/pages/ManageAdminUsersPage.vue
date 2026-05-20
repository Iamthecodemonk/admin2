<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'
import { useApiList } from '../composables/useApiList'

const { items: users, loading, error, load } = useApiList('/api/users', { per_page: 50 })
const message = ref('')
const form = reactive({ name: '', phone: '', email: '', password: '', permission: '1' })

async function createAdmin() {
  message.value = ''
  try {
    await apiRequest('/api/users', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        role: form.permission === '2' ? 'admin' : 'moderator',
        name: form.name,
        phone: form.phone,
      },
    })
    Object.assign(form, { name: '', phone: '', email: '', password: '', permission: '1' })
    message.value = 'Admin user created successfully.'
    await load()
  } catch (err) {
    message.value = err.message
  }
}

async function updateUser(user, status) {
  await apiRequest(`/api/users/${user.id}`, { method: 'PATCH', body: { status } })
  await load()
}

onMounted(load)
</script>

<template>
  <div id="preloader"><div class="loader"><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div></div>
  <AppHeader />

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-3"><div class="d-flex flex-wrap align-items-center justify-content-between pb-3"><h3 class="fs-22 fw-medium">Manage Admin Users <small class="fs-5" style="color:#f1f1f1"></small></h3></div></div>
      <hr><br>

      <form @submit.prevent="createAdmin">
        <legend>Create Admin users:</legend>
        <p v-if="message" class="alert" :class="message.includes('success') ? 'alert-success' : 'alert-danger'">{{ message }}</p>
        <div class="col-md-8 mb-3 mt-3"><label>Enter User Name:</label><input v-model="form.name" type="text" class="form-control"></div>
        <div class="col-md-8 mb-3 mt-3"><label>Enter User Phone:</label><input v-model="form.phone" type="number" class="form-control"></div>
        <div class="col-md-8 mb-3 mt-3"><label>Enter User Email:</label><input v-model="form.email" type="email" class="form-control" placeholder="Enter email" required></div>
        <div class="col-md-8 mb-3 mt-3"><label>Enter Password:</label><input v-model="form.password" type="password" class="form-control" required></div>
        <div class="col-md-8 mb-3 mt-3">
          <label class="form-label">Select User Permission (select one): <small><b>Level 1</b> - CAN NOT view the manage admin users menu, but can view and use all other menu <b>Level 2</b> - CAN view and use all menu</small></label>
          <select v-model="form.permission" class="form-select"><option>1</option><option>2</option></select>
        </div>
        <br>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>

      <br><br><hr><br>
      <h3 class="fs-20 pb-3">View and Edit Users</h3><br>
      <p v-if="loading" class="text-muted">Loading admin users...</p>
      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <table class="table table-bordered">
        <thead><tr><th>No</th><th>Admin User Name</th><th>Admin User Phone</th><th>Admin User Email</th><th>Admin User Permission</th><th>Action</th></tr></thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.id">
            <td>{{ index + 1 }}</td><td>{{ user.name || user.username }}</td><td>{{ user.phone || user.profile?.phone }}</td><td>{{ user.email }}</td><td>{{ user.role || user.permission }}</td>
            <td><div class="dropdown"><i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i><ul class="dropdown-menu"><li><a class="dropdown-item" href="" @click.prevent="updateUser(user, 'suspended')">suspend</a></li><li><a class="dropdown-item" href="" @click.prevent="updateUser(user, 'active')">un-suspend</a></li></ul></div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top"><i class="la la-arrow-up"></i></div>
</template>
