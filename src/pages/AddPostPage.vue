<script setup>
import { reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'

const loading = ref(false)
const message = ref('')
const form = reactive({
  name: '',
  email: '',
  title: '',
  content: '',
  category: '',
  tags: '',
})

async function publishPost() {
  loading.value = true
  message.value = ''

  try {
    await apiRequest('/api/posts', {
      method: 'POST',
      body: {
        title: form.title,
        content: form.content,
      },
    })
    Object.assign(form, { name: '', email: '', title: '', content: '', category: '', tags: '' })
    message.value = 'Post published successfully.'
  } catch (err) {
    message.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div id="preloader"><div class="loader"><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div></div>
  <AppHeader />

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-40px d-flex flex-wrap align-items-center justify-content-between">
        <h3 class="fs-22 fw-medium mr-0">Add new post</h3>
        <ul class="breadcrumb-list">
          <li><a href="#/home">Home</a><span><svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 0 24 24" width="19px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path></svg></span></li>
          <li>Add new post</li>
        </ul>
      </div>
      <form class="row" @submit.prevent="publishPost">
        <p v-if="message" class="alert" :class="message.includes('success') ? 'alert-success' : 'alert-danger'">{{ message }}</p>
        <div class="col-lg-8">
          <div class="card card-item">
            <div class="card-body">
              <div class="form-group"><label class="fs-14 text-black fw-medium lh-20">Your Name</label><input v-model="form.name" type="text" name="name" class="form-control form--control fs-14" placeholder="e.g. Alex smith"></div>
              <div class="form-group"><label class="fs-14 text-black fw-medium lh-20">Email <span class="text-gray">(Address never made public)</span></label><input v-model="form.email" type="email" name="email" class="form-control form--control fs-14" placeholder="e.g. alexsmith@gmail.com"></div>
              <div class="form-group"><label class="fs-14 text-black fw-medium lh-20">Post Title</label><input v-model="form.title" type="text" name="text" class="form-control form--control fs-14" placeholder="Please choose an appropriate title for the post." required></div>
              <div class="form-group"><label class="fs-14 text-black fw-medium lh-20">Post Content</label><textarea v-model="form.content" name="message" class="form-control form--control user-text-editor" rows="6" required></textarea></div>
              <div class="form-group"><div class="form-check fs-14"><input id="agreeCheckBox" class="form-check-input" type="checkbox" required><label class="form-check-label" for="agreeCheckBox">By posting, you agreed to the <a href="#" class="text-color hover-underline">Terms of Service </a> and <a href="#" class="text-color hover-underline">Privacy Policy.</a></label></div></div>
              <div class="form-group mb-0"><button class="btn theme-btn" type="submit" :disabled="loading">{{ loading ? 'Publishing...' : 'Publish Your Post' }}</button></div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-item"><div class="card-body"><div class="form-group"><label class="fs-14 text-black fw-medium lh-20">Category</label><select v-model="form.category" class="form-select"><option value="">Select a Category</option><option>Uncategorized</option><option>Work</option></select></div><div class="form-group mb-0"><label class="fs-14 text-black fw-medium lh-20">Tags</label><input v-model="form.tags" class="input-tags input--tags" type="text" name="tags" placeholder="e.g. javascript"></div></div></div>
          <div class="card card-item"><div class="card-body"><div class="form-group"><label class="fs-14 text-black fw-medium lh-20">Featured Image</label><div class="file-upload-wrap file-upload-layout-2"><input type="file" name="files[]" class="multi file-upload-input" multiple><span class="file-upload-text d-flex align-items-center justify-content-center"><i class="la la-cloud-upload me-2 fs-24"></i>Drop files here or click to upload.</span></div></div></div></div>
        </div>
      </form>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top"><i class="la la-arrow-up"></i></div>
</template>
