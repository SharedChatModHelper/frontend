import {createFileRoute, useLoaderData, useRouter} from '@tanstack/react-router'
import Cookies from "js-cookie";

export const Route = createFileRoute('/connect')({
  loader: async ctx => {
    if (!ctx.location.hash) throw "no hash"

    const search = new URLSearchParams(location.hash)
    const token = search.get("access_token");
    if (!token) throw "no token"

    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        "Authorization": "Bearer " + token
      }
    })

    if (response.ok) {
      return token
    } else {
      throw "check failed"
    }
  },
  component: Connect,
  pendingComponent: Pending,
  errorComponent: Error
})

function Pending() {
  return (
    <>
      show loading page
    </>
  )
}

function Error() {
  return (
    <>
      show loading page
    </>
  )
}

function Connect() {
  const token = useLoaderData({from: "/connect"})
  const router = useRouter()

  Cookies.set("twitch", token)
  router.history.push("/app")
  return
}
