<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { apiRequest } from '../services/api'
import { useApiList } from '../composables/useApiList'

const adverts = useApiList('/api/adverts/all', { per_page: 50 })
const locations = useApiList('/api/advert-locations')
const sites = useApiList('/api/advert-sites')
const message = ref('')
const editMessage = ref('')
const locationName = ref('')
const siteName = ref('')
const advert = reactive({
  locationId: '',
  siteId: '',
  duration: 24,
  imageUrl: '',
  linkUrl: '',
  ownerName: '',
  ownerPhone: '',
  approvedBy: '',
  textAbove: '',
})
const editAdvert = reactive({
  id: '',
  locationId: '',
  siteId: '',
  duration: 24,
  imageUrl: '',
  linkUrl: '',
  ownerName: '',
  ownerPhone: '',
  approvedBy: '',
  textAbove: '',
})

async function loadAll() {
  await Promise.all([adverts.load(), locations.load(), sites.load()])
}

async function createLocation() {
  await apiRequest('/api/advert-locations', { method: 'POST', body: { name: locationName.value, status: 'active' } })
  locationName.value = ''
  await locations.load()
}

async function createSite() {
  await apiRequest('/api/advert-sites', { method: 'POST', body: { name: siteName.value, status: 'active' } })
  siteName.value = ''
  await sites.load()
}

async function createAdvert() {
  message.value = ''
  try {
    await apiRequest('/api/adverts', { method: 'POST', body: advert })
    Object.assign(advert, { locationId: '', siteId: '', duration: 24, imageUrl: '', linkUrl: '', ownerName: '', ownerPhone: '', approvedBy: '', textAbove: '' })
    message.value = 'Advert created successfully.'
    await adverts.load()
  } catch (err) {
    message.value = err.message
  }
}

async function updateStatus(row, status) {
  await apiRequest(`/api/adverts/${row.id}/status`, { method: 'PATCH', body: { status } })
  await adverts.load()
}

async function updateLocationStatus(row, status) {
  await apiRequest(`/api/advert-locations/${row.id}/status`, { method: 'PATCH', body: { status } })
  await locations.load()
}

async function updateSiteStatus(row, status) {
  await apiRequest(`/api/advert-sites/${row.id}/status`, { method: 'PATCH', body: { status } })
  await sites.load()
}

async function deleteLocation(row) {
  await apiRequest(`/api/advert-locations/${row.id}`, { method: 'DELETE' })
  await locations.load()
}

async function deleteSite(row) {
  await apiRequest(`/api/advert-sites/${row.id}`, { method: 'DELETE' })
  await sites.load()
}

function relationName(list, id) {
  return list.find((item) => item.id === id)?.name || id || ''
}

function advertLocation(row) {
  return row.location?.name || row.locationName || relationName(locations.items.value, row.locationId)
}

function advertSite(row) {
  return row.site?.name || row.siteName || relationName(sites.items.value, row.siteId)
}

function advertImage(row) {
  return row.imageUrl || row.mediaPath || row.image_url || row.media_path || ''
}

function prepareEdit(row) {
  editMessage.value = ''
  Object.assign(editAdvert, {
    id: row.id,
    locationId: row.locationId || row.location_id || row.location?.id || '',
    siteId: row.siteId || row.site_id || row.site?.id || '',
    duration: row.duration || 24,
    imageUrl: advertImage(row),
    linkUrl: row.linkUrl || row.link_url || '',
    ownerName: row.ownerName || row.owner_name || '',
    ownerPhone: row.ownerPhone || row.ownerContact || row.owner_phone || row.owner_contact || '',
    approvedBy: row.approvedBy || row.approved_by || '',
    textAbove: row.textAbove || row.textBelow || row.text_above || row.text_below || '',
  })
}

async function saveAdvertEdit() {
  editMessage.value = ''
  try {
    await apiRequest(`/api/adverts/${editAdvert.id}`, {
      method: 'PATCH',
      body: {
        locationId: editAdvert.locationId,
        siteId: editAdvert.siteId,
        duration: editAdvert.duration,
        imageUrl: editAdvert.imageUrl,
        mediaPath: editAdvert.imageUrl,
        linkUrl: editAdvert.linkUrl,
        ownerName: editAdvert.ownerName,
        ownerPhone: editAdvert.ownerPhone,
        ownerContact: editAdvert.ownerPhone,
        approvedBy: editAdvert.approvedBy,
        textAbove: editAdvert.textAbove,
      },
    })
    editMessage.value = 'Advert updated successfully.'
    await adverts.load()
  } catch (err) {
    editMessage.value = err.message
  }
}

onMounted(loadAll)
</script>

<template>
  <div id="preloader"><div class="loader"><svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div></div>
  <AppHeader />

  <section class="question-area pt-40px pb-40px">
    <div class="container">
      <div class="filters pb-40px d-flex flex-wrap align-items-center justify-content-between">
        <h3 class="fs-32 fw-medium mr-0">Manage Adverts</h3>
        <ul class="breadcrumb-list">
          <li><a href="#/home">Home</a><span><svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 0 24 24" width="19px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path></svg></span></li>
          <li>Manage Adverts</li>
        </ul>
      </div>

      <form @submit.prevent="createLocation">
        <fieldset>
          <legend>Maintain AD Location:</legend>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">AD Location:</label>
              <input v-model="locationName" type="text" class="form-control" placeholder="enter AD page locations, e.g - Feeds, home page" required>
            </div>
            <div class="col-md-4 mb-3">
              <table class="table table-bordered">
                <thead><tr><th>Location ID</th><th>AD location</th><th>Action</th></tr></thead>
                <tbody>
                  <tr v-for="row in locations.items.value" :key="row.id">
                    <td>{{ row.id }}</td>
                    <td>{{ row.name }}</td>
                    <td>
                      <div class="dropdown">
                        <i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i>
                        <ul class="dropdown-menu">
                          <li><a class="dropdown-item" href="#" @click.prevent="updateLocationStatus(row, 'suspended')">Suspend</a></li>
                          <li><a class="dropdown-item" href="#" @click.prevent="updateLocationStatus(row, 'active')">Unsuspend</a></li>
                          <li><a class="dropdown-item" href="#" @click.prevent="deleteLocation(row)">Delete</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </fieldset>
      </form>
      <hr><br><br><br>

      <form @submit.prevent="createSite">
        <fieldset>
          <legend>Maintain AD Size:</legend>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">AD Size:</label>
              <input v-model="siteName" type="text" class="form-control" placeholder="299x500, 299x300 ..." required>
            </div>
            <div class="col-md-4 mb-3">
              <table class="table table-bordered">
                <thead><tr><th>#</th><th>AD Size</th><th>Action</th></tr></thead>
                <tbody>
                  <tr v-for="row in sites.items.value" :key="row.id">
                    <td>{{ row.id }}</td>
                    <td>{{ row.name }}</td>
                    <td>
                      <div class="dropdown">
                        <i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i>
                        <ul class="dropdown-menu">
                          <li><a class="dropdown-item" href="#" @click.prevent="updateSiteStatus(row, 'suspended')">Suspend</a></li>
                          <li><a class="dropdown-item" href="#" @click.prevent="updateSiteStatus(row, 'active')">Unsuspend</a></li>
                          <li><a class="dropdown-item" href="#" @click.prevent="deleteSite(row)">Delete</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </fieldset>
      </form>
      <hr><br><br><br>

      <form @submit.prevent="createAdvert">
        <fieldset>
          <legend>Create Adverts:</legend>
          <p v-if="message" class="alert" :class="message.includes('success') ? 'alert-success' : 'alert-danger'">{{ message }}</p>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">AD Location:</label>
              <select v-model="advert.locationId" class="form-select" required>
                <option value="">Select location</option>
                <option v-for="row in locations.items.value" :key="row.id" :value="row.id">{{ row.name }}</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Duration(hours) <small> minimum value = 24 </small></label>
              <input v-model.number="advert.duration" type="number" class="form-control" placeholder="in multiples of 24" required>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">AD Size:</label>
              <select v-model="advert.siteId" class="form-select" required>
                <option value="">Select size</option>
                <option v-for="row in sites.items.value" :key="row.id" :value="row.id">{{ row.name }}</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3"><label class="form-label">Image URL:</label><input v-model="advert.imageUrl" type="text" class="form-control" placeholder="https://..."></div>
            <div class="col-md-4 mb-3"><label class="form-label">Link URL:</label><input v-model="advert.linkUrl" type="text" class="form-control" placeholder="www.xlehub.com"></div>
            <div class="col-md-4 mb-3"><label class="form-label">Approved by:</label><input v-model="advert.approvedBy" type="text" class="form-control" placeholder="john Doe"></div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-3"><label class="form-label">Ad Owner:</label><input v-model="advert.ownerName" type="text" class="form-control" placeholder="john Doe, elixis ltd"></div>
            <div class="col-md-4 mb-3"><label class="form-label">Contact:</label><input v-model="advert.ownerPhone" type="number" class="form-control" placeholder="phone number"></div>
            <div class="col-md-4 mb-3"><label>AD text: <small> Not more than 50 words </small></label><textarea v-model="advert.textAbove" class="form-control" rows="5"></textarea></div>
          </div>
          <button type="submit" class="btn btn-primary">Create new advert</button>
        </fieldset>
      </form>

      <br><br><hr><br><br>

      <h2>Adverts Table</h2>
      <p v-if="adverts.loading.value" class="text-muted">Loading adverts...</p>
      <p v-if="adverts.error.value" class="alert alert-danger">{{ adverts.error.value }}</p>
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr><th>#</th><th>AD<br> location</th><th>Dur<br> in hrs</th><th>AD Size</th><th>AD Link</th><th>AD Image link</th><th>AD text</th><th>Owner(name)</th><th>Contact<br>Phone</th><th>Approved by</th><th>Status<br>active/exp</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in adverts.items.value" :key="row.id">
              <td>{{ index + 1 }}</td><td>{{ advertLocation(row) }}</td><td>{{ row.duration }}</td><td>{{ advertSite(row) }}</td><td><a :href="row.linkUrl" target="_blank" rel="noopener noreferrer">{{ row.linkUrl }}</a></td><td><a v-if="advertImage(row)" :href="advertImage(row)" target="_blank" rel="noopener noreferrer">Click here to view image</a></td><td>{{ row.textAbove || row.textBelow }}</td><td>{{ row.ownerName }}</td><td>{{ row.ownerPhone || row.ownerContact }}</td><td>{{ row.approvedBy }}</td><td>{{ row.status }}</td>
              <td><div class="dropdown"><i class="la la-list-ul dropdow-toggle" data-bs-toggle="dropdown" style="font-size: 25px;"></i><ul class="dropdown-menu"><li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editAdvert" @click="prepareEdit(row)">Edit</a></li><li><a class="dropdown-item" href="#" @click.prevent="updateStatus(row, 'suspended')">Suspend</a></li><li><a class="dropdown-item" href="#" @click.prevent="updateStatus(row, 'active')">Unsuspend</a></li><li><a class="dropdown-item" href="#" @click.prevent="updateStatus(row, 'deleted')">Delete</a></li></ul></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <div id="back-to-top" data-bs-toggle="tooltip" data-placement="top" title="Return to top"><i class="la la-arrow-up"></i></div>

  <div class="modal" id="editAdvert">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Edit Advert</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveAdvertEdit">
            <fieldset>
              <legend>Edit Adverts:</legend>
              <p v-if="editMessage" class="alert" :class="editMessage.includes('success') ? 'alert-success' : 'alert-danger'">{{ editMessage }}</p>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Page Location:</label>
                  <select v-model="editAdvert.locationId" class="form-select">
                    <option v-for="row in locations.items.value" :key="row.id" :value="row.id">{{ row.name }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Duration(hours):</label>
                  <input v-model.number="editAdvert.duration" type="text" class="form-control" placeholder="24">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">AD Size:</label>
                  <select v-model="editAdvert.siteId" class="form-select">
                    <option v-for="row in sites.items.value" :key="row.id" :value="row.id">{{ row.name }}</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Image URL:</label>
                  <input v-model="editAdvert.imageUrl" type="text" class="form-control" placeholder="https://...">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Link URL:</label>
                  <input v-model="editAdvert.linkUrl" type="text" class="form-control" placeholder="www.xlehub.com">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Approved by:</label>
                  <input v-model="editAdvert.approvedBy" type="text" class="form-control" placeholder="john Doe">
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Ad Owner:</label>
                  <input v-model="editAdvert.ownerName" type="text" class="form-control" placeholder="john Doe, elixis ltd">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Contact:</label>
                  <input v-model="editAdvert.ownerPhone" type="number" class="form-control" placeholder="phone number">
                </div>
                <div class="col-md-4 mb-3">
                  <label>AD text:</label>
                  <textarea v-model="editAdvert.textAbove" class="form-control" rows="5"></textarea>
                </div>
              </div>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </fieldset>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
