import {createFileRoute, redirect} from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import Cookies from "js-cookie";

export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    if (!Cookies.get().twitch) throw redirect({to: "/"});
  },
  component: App,
})

type Channel = {
  channel_id: number
  channel_name: string
  image_url: string
}

function App() {
  const token = Cookies.get().twitch;

  const {isLoading, error, data} = useQuery({
    queryKey: ['channels'],
    retry: () => false,
    queryFn: () =>
      fetch('https://shared-chat-mod-helper.gitprodigy.workers.dev/', {
        headers: {
          "Authorization": "Bearer " + token
        }
      }).then(async r => {
        return {
          status: r.status,
          ok: r.ok,
          data: await (r.ok ? r.json() : r.text())
        }
      })
  })

  if (isLoading) {
    return (
      <>
        Loading
      </>
    )
  }

  if (error) {
    return (
      <>
        {error.name}
      </>
    )
  }

  if (data) {
    if (!data.ok) {
      return (
        <>
          {JSON.stringify(data)}
        </>
      )
    }

    const channels: Channel[] = data.data

    return (
      <>
        <ul>
          {
            channels.map(channel => (
              <li key={channel.channel_id}>
                <a href={`/channel/${channel.channel_id}`}>{channel.channel_name}</a>
              </li>
            ))
          }
        </ul>
      </>
    )
  }

  return (
    <>
      not ok
    </>
  )
}
