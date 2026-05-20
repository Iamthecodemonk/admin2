import { ref } from 'vue'
import { apiRequest, getPaginatorData, toQuery } from '../services/api'

export function useApiList(path, initialParams = {}) {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')

  async function load(params = initialParams) {
    loading.value = true
    error.value = ''
    try {
      const response = await apiRequest(`${path}${toQuery(params)}`)
      items.value = getPaginatorData(response)
      return response
    } catch (err) {
      error.value = err.message
      items.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, load }
}
