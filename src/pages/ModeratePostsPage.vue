<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'
import { useApiList } from '../composables/useApiList'

const search = ref('')
const reviewed = ref('awaiting')
const userNames = ref({})
const editMessage = ref('')
const editForm = ref({ id: '', userId: '', title: '', content: '' })
const { items: posts, loading, error, load } = useApiList('/api/posts', { per_page: 50 })

const filteredPosts = computed(() => {
  const q = search.value.toLowerCase()
  return posts.value.filter((post) => {
    if (!isReportedPost(post)) return false
    const text = [post.id, post.title, post.content, post.status, reportReason(post)].filter(Boolean).join(' ').toLowerCase()
    const isReviewed = ['approved', 'active', 'live'].includes(post.status)
    return (!q || text.includes(q)) && (reviewed.value === 'reviewed' ? isReviewed : !isReviewed)
  })
})

async function deletePost(post) {
  if (!confirm('Delete this post?')) return
  await apiRequest(`/api/posts/${post.id}`, {
    method: 'DELETE',
    body: { userId: post.userId || post.authorId || post.createdByUserId },
  })
  await load()
}

async function approvePost(post) {
  await updatePostModeration(post, 'approved')
}

function nestedPosterName(post) {
  return post.author?.name ||
    post.author?.username ||
    post.user?.name ||
    post.user?.username ||
    post.createdBy?.name ||
    post.createdBy?.username ||
    post.createdByUser?.name ||
    post.createdByUser?.username ||
    post.owner?.name ||
    post.ownerName ||
    ''
}

function posterId(post) {
  return post.userId ||
    post.authorId ||
    post.createdByUserId ||
    post.created_by_user_id ||
    post.ownerId ||
    post.user_id ||
    ''
}

function postUserId(post) {
  return posterId(post)
}

function firstReport(post) {
  if (Array.isArray(post.reports) && post.reports.length) return post.reports[0]
  if (Array.isArray(post.report_reasons) && post.report_reasons.length) return post.report_reasons[0]
  return post.report || post.latestReport || post.latest_report || {}
}

function reportCount(post) {
  return Number(
    post.reports_count ||
    post.report_count ||
    post.reportCount ||
    post.reportsCount ||
    0,
  )
}

function isReportedPost(post) {
  return Boolean(
    post.is_report ||
    post.isReported ||
    post.reported ||
    post.report_reason_id ||
    post.reportReason ||
    post.report_reason ||
    post.reason ||
    post.reported_at ||
    reportCount(post) > 0 ||
    Object.keys(firstReport(post)).length,
  )
}

function reportReason(post) {
  const report = firstReport(post)
  return post.reportReason ||
    post.report_reason ||
    post.reason ||
    post.report_reason_name ||
    post.reportReasonName ||
    report.reason ||
    report.name ||
    report.reportReason ||
    report.report_reason ||
    report.report_reason_name ||
    post.status ||
    post.visibility ||
    ''
}

function posterName(post) {
  return nestedPosterName(post) || userNames.value[posterId(post)] || posterId(post) || 'User'
}

async function loadPosts() {
  await load()
  await loadPosterNames()
}

async function loadPosterNames() {
  const ids = [...new Set(posts.value.map(posterId).filter(Boolean))]

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

function firstPostImage(post) {
  const candidates = [
    post.imageUrl,
    post.image_url,
    post.mediaUrl,
    post.fileUrl,
    ...(Array.isArray(post.file_path) ? post.file_path : []),
    ...(Array.isArray(post.media_path) ? post.media_path : []),
    ...(Array.isArray(post.media) ? post.media : []),
    ...(Array.isArray(post.images) ? post.images : []),
  ]

  const value = candidates.find(Boolean)
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.url || value.secure_url || value.path || value.file_path || value.media_path || value.imageUrl || ''
}

function prepareEdit(post) {
  editMessage.value = ''
  editForm.value = {
    id: post.id,
    userId: postUserId(post),
    title: post.title || '',
    content: post.content || '',
  }
}

async function saveEdit() {
  editMessage.value = ''
  try {
    await apiRequest(`/api/posts/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        userId: editForm.value.userId,
        title: editForm.value.title,
        content: editForm.value.content,
      },
    })
    editMessage.value = 'Post updated successfully.'
    await loadPosts()
  } catch (err) {
    editMessage.value = err.message
  }
}

async function updatePostModeration(post, status) {
  const body = {
    userId: postUserId(post),
    title: post.title,
    content: post.content || post.title || '',
    status,
    visibility: status === 'suspended' ? 'suspended' : 'public',
  }

  try {
    await apiRequest(`/api/posts/${post.id}/status`, {
      method: 'PATCH',
      body: { status },
    })
  } catch (err) {
    if (err.status !== 404 && err.status !== 405) throw err
    await apiRequest(`/api/posts/${post.id}`, {
      method: 'PUT',
      body,
    })
  }

  await loadPosts()
}

onMounted(loadPosts)
</script>

<template>
  <div id="preloader"><div class="loader"><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div></div>
  <AppHeader />

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between pb-3">
          <h3 class="fs-22 fw-medium">Moderate Posts</h3>
        </div>
        <div class="d-flex flex-wrap align-items-center justify-content-between">
          <form method="post" class="me-3 w-25" @submit.prevent>
            <div class="form-group">
              <input v-model="search" class="form-control form--control form-control-sm h-auto lh-34" type="text" name="search" placeholder="Filter by rule violated">
              <button class="form-btn" type="button"><i class="la la-search"></i></button>
            </div>
          </form>
          <div class="btn-group btn--group mb-3">
            <input id="postAwaiting" v-model="reviewed" value="awaiting" type="radio" class="btn-check" name="postReview">
            <label class="btn btn-outline-primary" for="postAwaiting">Awaiting review</label>
            <input id="postReviewed" v-model="reviewed" value="reviewed" type="radio" class="btn-check" name="postReview">
            <label class="btn btn-outline-primary" for="postReviewed">Reviewed</label>
          </div>
        </div>
      </div>

      <br><br><hr><br><br>

      <h3>Report Table</h3>
      <p v-if="error" class="alert alert-danger">{{ error }}</p>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr><th>#</th><th>post id</th><th>name (profile link)</th><th>rule violated</th><th>Post <br>Content</th><th>post link</th><th>image(if any)</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading reported posts...
              </td>
            </tr>
            <template v-else>
              <tr v-for="(post, index) in filteredPosts" :key="post.id">
                <td>{{ index + 1 }}</td><td>{{ post.id }}</td><td><a href="" @click.prevent>{{ posterName(post) }}</a></td><td>{{ reportReason(post) }}</td><td>{{ post.content || post.title }}</td><td><a href="" @click.prevent>Post link</a></td><td><a v-if="firstPostImage(post)" :href="firstPostImage(post)" target="_blank" rel="noopener noreferrer">Click here to view image</a></td>
                <td><div class="dropdown"><i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i><ul class="dropdown-menu"><li><a class="dropdown-item" href="" data-bs-toggle="modal" data-bs-target="#editPost" @click.prevent="prepareEdit(post)">Edit</a></li><li><a class="dropdown-item" href="" @click.prevent="updatePostModeration(post, 'suspended')">Suspend</a></li><li><a class="dropdown-item" href="" @click.prevent="updatePostModeration(post, 'active')">Unsuspend</a></li><li><a class="dropdown-item" href="" @click.prevent="approvePost(post)">Approve</a></li></ul></div></td>
              </tr>
            </template>
            <tr v-if="!loading && filteredPosts.length === 0"><td colspan="8">No posts found.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top"><i class="la la-arrow-up"></i></div>

  <div class="modal" id="editPost">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Edit Post</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveEdit">
            <p v-if="editMessage" class="alert" :class="editMessage.includes('success') ? 'alert-success' : 'alert-danger'">{{ editMessage }}</p>
            <div class="mb-3">
              <label class="form-label">Post Title</label>
              <input v-model="editForm.title" type="text" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label">Post Content</label>
              <textarea v-model="editForm.content" class="form-control" rows="6"></textarea>
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
