export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, init } = useSession()

  await init()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
