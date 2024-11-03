import {createFileRoute, Link, redirect, useLoaderData} from '@tanstack/react-router'
import Cookies from "js-cookie";
import {queryClient} from "@/main.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useState} from "react";
import {CheckedState} from "@radix-ui/react-checkbox";
import {BOT_ID, CLIENT_ID} from "@/lib/constants.ts";
import {Switch} from "@/components/ui/switch.tsx";

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
      key={channel.channel_id}
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
  const token = Cookies.get('twitch');
  const selfId = Cookies.get('self');
  const [modded, setModded] = useState(false)
  const [moddedReady, setModdedReady] = useState(false)

  const moddedUrl = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${selfId}&user_id=${BOT_ID}`
  fetch(moddedUrl,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID
        }
      })
      .then(resp => resp.json())
      .then(body => setModded(!!body.data[0]))
      .catch(e => console.error("Failed to check mod status", e))
      .finally(() => setModdedReady(true))

  const handleModChecked = async (checked: CheckedState) => {
    if (checked === "indeterminate") return
    try {
      const resp = await fetch(moddedUrl, {
        method: checked ? "POST" : "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID
        }
      })
      if (resp.ok) {
        setModded(checked)
      } else {
        const body = await resp.json()
        console.error(`Failed to set desired bot moderator status: ${body.message}`)
      }
    } catch (e) {
      console.error("Could not set desired bot moderator status", e)
    }
  }

  return (
    <div className={"pt-4 flex flex-col items-center"}>
      <h2 className={"text-center font-semibold"}>Shared Chat Mod Helper</h2>
      <h4 className={"text-gray-300"}>Please select which channel to moderate</h4>
      <div className={"flex flex-row p-4 flex-wrap justify-center"}>
        {
          channels.map(channel => (
            <Card channel={channel}/>
          ))
        }
      </div>
      <div className={"flex items-center space-x-2"}>
        <Switch id="modded" checked={modded} onCheckedChange={handleModChecked} disabled={!moddedReady} />
        <Label htmlFor="modded">Allow bot to operate in my chat</Label>
      </div>
    </div>
  )
}
