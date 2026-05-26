import { apiRequest, getPaginatorData, toQuery } from './api'

const statusBuckets = {
  pending: ['pending_review', 'pending'],
  active: ['approved', 'active', 'live'],
}

const endpoints = {
  regular: {
    admin: '/api/admin/jobs',
    fallback: ['/api/jobs/all'],
  },
  freelance: {
    admin: '/api/admin/freelance-jobs',
    fallback: ['/api/freelance-jobs/all'],
  },
}

function uniqueJobs(jobs) {
  const seen = new Set()
  return jobs.filter((job) => {
    const key = job.id || job.slug || JSON.stringify(job)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function matchesStatus(job, bucket) {
  const statuses = statusBuckets[bucket] || []
  return statuses.includes(job.status)
}

async function tryJobRequest(path, params) {
  try {
    const response = await apiRequest(`${path}${toQuery(params)}`)
    return { ok: true, items: getPaginatorData(response) }
  } catch (error) {
    return { ok: false, error, items: [] }
  }
}

export async function loadJobsByBucket(kind, bucket, params = {}) {
  const config = endpoints[kind]
  const statuses = statusBuckets[bucket] || []
  const requests = []
  const paths = [config.admin, ...config.fallback]

  paths.forEach((path) => {
    requests.push(tryJobRequest(path, { per_page: 100, ...params }))
  })

  statuses.forEach((status) => {
    paths.forEach((path) => {
      requests.push(tryJobRequest(path, { per_page: 100, ...params, status }))
    })
  })

  const groups = await Promise.all(requests)
  const successfulGroups = groups.filter((group) => group.ok)
  if (!successfulGroups.length && groups[0]?.error) throw groups[0].error

  return uniqueJobs(successfulGroups.flatMap((group) => group.items)).filter((job) => matchesStatus(job, bucket))
}

export function adminJobBase(kind) {
  return endpoints[kind].admin
}

export async function updateAdminJobStatus(kind, job, status) {
  const base = adminJobBase(kind)
  if (status === 'approved') {
    return apiRequest(`${base}/${job.id}/approve`, { method: 'POST' })
  }
  if (status === 'suspended') {
    return apiRequest(`${base}/${job.id}/suspend`, { method: 'POST' })
  }
  if (status === 'active' || status === 'live') {
    return apiRequest(`${base}/${job.id}/unsuspend`, { method: 'POST' })
  }
  if (status === 'deleted') {
    return apiRequest(`${base}/${job.id}`, { method: 'DELETE' })
  }
  return apiRequest(`${base}/${job.id}/status`, { method: 'PATCH', body: { status } })
}

export function jobCompanyName(job) {
  return job.companyName || job.company_name || job.company || job.clientName || job.client_name || ''
}

export function jobTitle(job) {
  return job.title || job.name || ''
}

export function jobEmail(job) {
  return job.applicationEmail || job.application_email || job.senderEmail || job.sender_email || job.email || ''
}

export function jobEndDate(job) {
  return job.applicationEndDate || job.application_end_date || job.endDate || job.end_date || ''
}

export function formatJobValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'object' ? item.name || item.title || JSON.stringify(item) : item).filter(Boolean).join(', ')
  }
  if (value && typeof value === 'object') return value.name || value.title || JSON.stringify(value)
  return value || ''
}

export function jobPay(job) {
  const min = job.salaryMin ?? job.salary_min ?? job.minSalary ?? job.min_salary ?? job.minFee ?? job.min_fee
  const max = job.salaryMax ?? job.salary_max ?? job.maxSalary ?? job.max_salary ?? job.maxFee ?? job.max_fee
  const currency = job.salaryCurrency || job.salary_currency || job.currency || ''
  const label = job.salaryLabel || job.salary_label || job.feeLabel || job.fee_label || ''
  if (label) return label
  if (min && max) return `${currency} ${min} - ${max}`.trim()
  if (min) return `${currency} ${min}`.trim()
  if (max) return `${currency} ${max}`.trim()
  return ''
}

export function jobDetailsRows(job, posterName = '') {
  return [
    ['Job ID', job.id],
    ['Title', jobTitle(job)],
    ['Posted by', posterName],
    ['Company', jobCompanyName(job)],
    ['Location', job.location],
    ['Work mode', job.workMode || job.work_mode],
    ['Type', job.type],
    ['Status', job.status],
    ['Email', jobEmail(job)],
    ['End Date', jobEndDate(job)],
    ['Pay', jobPay(job)],
    ['Experience', job.experience || job.workExperience || job.work_experience],
    ['Skills', job.skills],
    ['Summary', job.summary],
    ['Description', job.description],
    ['Qualifications', job.qualifications],
    ['Requirements', job.requirements],
    ['Responsibilities', job.responsibilities || job.tasks],
    ['Perks', job.perks],
    ['Application URL', job.applicationUrl || job.application_url],
    ['Applicants', job.applicantCount ?? job.applicant_count],
    ['Created At', job.createdAt || job.created_at],
    ['Updated At', job.updatedAt || job.updated_at],
  ]
    .map(([label, value]) => [label, formatJobValue(value)])
    .filter(([, value]) => value !== '')
}
