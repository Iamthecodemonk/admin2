<script setup>
import { ref } from 'vue'
import { login } from '../services/api'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submitLogin() {
  loading.value = true
  error.value = ''

  try {
    await login(email.value, password.value)
    window.location.hash = '#/home'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div id="preloader">
    <div class="loader">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
    </div>
  </div>

  <section class="question-area pt-80px pb-30px">
    <div class="container">
      <div class="row">
        <div class="col-lg-3 px-0"></div>
        <div class="col-lg-6 px-0">
          <h2 style="text-align:center">Login Form</h2>

          <form action="#/home" method="post" @submit.prevent="submitLogin">
            <div class="imgcontainer">
              <img src="/images/img_avatar2.png" alt="Avatar" class="avatar">
            </div>

            <div class="container">
              <label for="uname"><b>Username - email</b></label>
              <input id="uname" v-model="email" type="text" inputmode="email" placeholder="Enter email " name="uname" required>

              <label for="psw"><b>Password</b></label>
              <input id="psw" v-model="password" type="password" placeholder="Enter Password" name="psw" required>

              <p v-if="error" class="text-danger mb-0">{{ error }}</p>
              <button type="submit" :disabled="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
            </div>
          </form>
        </div>
        <div class="col-lg-3 px-0"></div>
      </div>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top">
    <i class="la la-arrow-up"></i>
  </div>
</template>
