<script setup>
import { getStoredUser, logout } from '../services/api'

const user = getStoredUser()

async function handleLogout() {
  await logout()
  window.location.hash = '#/login'
}
</script>

<template>
  <header class="header-area bg-white shadow-sm">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-1">
          <div class="logo-box">
            <a href="#/login" class="logo">Admin</a>
            <div class="user-action">
              <div class="search-menu-toggle icon-element icon-element-xs shadow-sm me-1" data-bs-toggle="tooltip" data-placement="top" title="Search">
                <i class="la la-search"></i>
              </div>
              <div class="off-canvas-menu-toggle icon-element icon-element-xs shadow-sm" data-bs-toggle="tooltip" data-placement="top" title="Main menu">
                <i class="la la-bars"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-11">
          <div class="menu-wrapper border-left border-left-gray ps-4 justify-content-end">
            <nav class="menu-bar me-auto menu--bar">
              <ul>
                <li>
                  <a href="#/home">Home</a>
                </li>
                <li>
                  <a href="#/manage-communities">Mng Communities</a>
                </li>
                <li>
                  <a href="#/manage-adverts">Mng Adverts</a>
                </li>
                <li>
                  <a href="#/moderate-posts">Moderate Posts</a>
                </li>
                <li>
                  <a href="#">Jobs <i class="la la-angle-down fs-11"></i></a>
                  <ul class="dropdown-menu-item">
                    <li><a href="#/jobs-awaiting-approval">Jobs awaiting approval</a></li>
                    <li><a href="#/manage-active-jobs">Manage active jobs</a></li>
                  </ul>
                </li>
                <li>
                  <a href="#">Users <i class="la la-angle-down fs-11"></i></a>
                  <ul class="dropdown-menu-item">
                    <li><a href="#/manage-users">Manage users</a></li>
                    <li><a href="#/manage-admin-users">Manage Admin users</a></li>
                  </ul>
                </li>
              </ul>
            </nav>
            <div class="d-flex align-items-center gap-2">
              <span v-if="user" class="fs-14 text-muted">{{ user.email || user.username }}</span>
              <button class="btn btn-outline-danger btn-sm" type="button" @click="handleLogout">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="body-overlay"></div>
  </header>
</template>
