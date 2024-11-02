import {createFileRoute, redirect, useLoaderData} from '@tanstack/react-router'
import Cookies from "js-cookie";
import {queryClient} from "@/main.tsx";

export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    if (!Cookies.get().twitch) throw redirect({to: "/"});
  },
  loader: async () => {
    const token = Cookies.get('twitch')!

    return await queryClient.fetchQuery({
      queryKey: ['channels'],
      queryFn: () =>
        fetch('https://shared-chat-mod-helper.gitprodigy.workers.dev/', {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }).then(async r => {
          return {
            status: r.status,
            ok: r.ok,
            data: await r.json()
          }
        })
    })
  },
  pendingComponent: Pending,
  component: App,
})

type Channel = {
  channel_id: number
  channel_name: string
  image_url: string
}

function /*component*/ Pending() {
  return (
    <>TODO: Loading page</>
  )
}

function App() {
  const data = useLoaderData({from: '/app'})

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
