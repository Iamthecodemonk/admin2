<template>
  <div class="sidenav">
    <a href="#/manage-communities">Manage communities</a>
    <a href="#/manage-users">Manage users</a>
    <a href="#/moderate-posts">Moderate posts</a>
    <a href="#/manage-adverts">Manage adverts</a>
    <a href="#/manage-contests">Manage contest</a>
    <a href="#/manage-admin-users">Manage admin users</a>
    <a href="#/moderate-posts">Moderate posts</a>
    <a href="#/manage-freelance-users">Manage freelance users</a>
    <button class="dropdown-btn" type="button">
      Jobs
      <i class="fa fa-caret-down"></i>
    </button>
    <div class="dropdown-container">
      <a href="#/jobs-awaiting-approval">Jobs awaiting approval</a>
      <a href="#/manage-active-jobs">Manage active jobs</a>
      <a href="" @click.prevent>View in-active jobs</a>
    </div>
    <a href="" @click.prevent>Search</a>
  </div>
</template>
