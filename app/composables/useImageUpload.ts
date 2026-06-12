export function useImageUpload() {
  const { $supabase } = useNuxtApp()

  async function uploadFile(
    bucket: string,
    file: File,
    agentId: string,
  ): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${agentId}/${crypto.randomUUID()}.${ext}`

    const { error } = await $supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type })

    if (error) {
      throw error
    }

    return path
  }

  async function uploadLogo(file: File, agentId: string) {
    return uploadFile('agent-logos', file, agentId)
  }

  async function uploadBanner(file: File, agentId: string) {
    return uploadFile('agent-banners', file, agentId)
  }

  async function uploadImage(file: File, agentId: string) {
    return uploadFile('agent-images', file, agentId)
  }

  function getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = $supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }

  return {
    uploadLogo,
    uploadBanner,
    uploadImage,
    getPublicUrl,
  }
}
