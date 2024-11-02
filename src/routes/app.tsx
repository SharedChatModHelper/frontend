import {createFileRoute, Link, redirect, useLoaderData} from '@tanstack/react-router'
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
        }).then(async r => await r.json() as Channel[])
    })
  },
  component: App,
})

type Channel = {
  channel_id: number
  channel_name: string
  image_url: string
}

function /*component*/ Card({channel}: { channel: Channel }) {
  return (
    <Link
      href={`/channel/${channel.channel_id}`}
      className={"mx-2 my-2 border-bg-alt border-solid border-2 rounded-large bg-bg-hover p-6 text-white hover:text-white cursor-pointer hover:scale-[1.02] transition-transform shadow w-[25rem] max-w-[35rem] flex-grow"}
    >
      <div className={"flex flex-col items-center"}>
        <div className={"pb-6 pt-2"}>
          <img className={"w-32 rounded-rounded"} alt={`${channel.channel_name}`} src={channel.image_url}/>
        </div>
        <div>
          <h4 className={"font-semibold"}>{channel.channel_name}</h4>
        </div>
      </div>
    </Link>
  )
}

function /*component*/ App() {
  const channels = useLoaderData({from: '/app'});

  return (
    <div className={"pt-4 flex flex-col items-center"}>
      <h2 className={"text-center font-semibold"}>Shared Chat Mod Helper</h2>
      <div className={"flex flex-row p-4 flex-wrap justify-center"}>
        {
          channels.map(channel => (
            <Card channel={channel}/>
          ))
        }
      </div>
    </div>
  )
}
