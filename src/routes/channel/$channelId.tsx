import {createFileRoute, redirect, useLoaderData} from '@tanstack/react-router'
import Cookies from "js-cookie";
import {useState} from "react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable.tsx";

type History = {
  userId: number
  userName: string
  modId: number
  modLogin: string
  sourceId: number
  sourceLogin: string
  duration: number
  reason: string
  timestamp: number
  messages: Message[]
}

type Message = {
  text: string
  sourceId: number
  sourceLogin: string
  timestamp: number
}

export const Route = createFileRoute('/channel/$channelId')({
  beforeLoad: () => {
    if (!Cookies.get("twitch")) throw redirect({to: "/"});
  },
  loader: async ctx => {
    const {channelId} = ctx.params
    const token = Cookies.get("twitch")!;

    const response = await fetch(`https://shared-chat-mod-helper.gitprodigy.workers.dev/?channel=${channelId}`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    })

    if (!response.ok) {
      throw response
    }

    return await response.json()
  },
  component: Channel,
  pendingComponent: Pending
})

function Pending() {
  return (
    <>Hello, I'm loading</>
  )
}

function Channel() {
  const [chatter, setChatter] = useState(null as number | null)
  const histories: History[] = useLoaderData({from: "/channel/$channelId"})
  /*const {channelId} = Route.useParams()

  const token = Cookies.get("twitch")!;

  const {isLoading, error, data} = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      if (chatter == null) return null;
      return fetch(`https://shared-chat-mod-helper.gitprodigy.workers.dev/?channel=${channelId}&user=${chatter}`, {
        headers: {
          "Authorization": "Bearer " + token
        }
      }).then(async r => {
        return {
          status: r.status,
          ok: r.ok,
          data: await (r.ok ? r.json() : r.text())
        }
      });
    }
  })*/

  return (
    <div className={""}>
      <ResizablePanelGroup direction="horizontal" className={"min-h-dvh"}>
        <ResizablePanel>
          <ul className={"flex flex-col gap-4"}>
            {
              histories.map((history, index) => (
                <li>
                  <button key={history.userId} onMouseDown={() => setChatter(index/*history.userId*/)}>
                    {history.userName}
                  </button>
                </li>
              ))
            }
          </ul>
        </ResizablePanel>
        <ResizableHandle/>
        <ResizablePanel>
          {chatter != null ? Messages(histories[chatter].messages) : <>Select a user</>}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

function Messages(messages: Message[]) {
  if (messages.length == 0) {
    return (
      <>
        This user haven't talked recently...
      </>
    )
  }

  return (
    <ul>
      {
        messages.map((message) => (
          <li>
            {message.text}
          </li>
        ))
      }
    </ul>
  )
}

// The output of a query, this is here just for reference,
// ============= Please remove on production =============
const vals = [{
  "userId": 53888434,
  "userName": "ogprodigy",
  "modId": 1171922673,
  "modLogin": "t4jtesting",
  "sourceId": 1171922673,
  "sourceLogin": "t4jtesting",
  "duration": 59,
  "reason": "smh my head",
  "timestamp": 1730105809,
  "messages": [{
    "text": "joy to",
    "sourceId": 1171922673,
    "sourceLogin": "t4jtesting",
    "timestamp": 1730105773
  }, {"text": "the world", "sourceId": "", "sourceLogin": "", "timestamp": 1730105776}, {
    "text": "that",
    "sourceId": 1171922673,
    "sourceLogin": "t4jtesting",
    "timestamp": 1730105783
  }]
}, {
  "userId": 35958947,
  "userName": null,
  "modId": 1171922673,
  "modLogin": "t4jtesting",
  "sourceId": 1171922673,
  "sourceLogin": "t4jtesting",
  "duration": 1,
  "reason": "attended jan 6",
  "timestamp": 1730105657,
  "messages": []
}, {
  "userId": 17337557,
  "userName": null,
  "modId": 1171922673,
  "modLogin": "t4jtesting",
  "sourceId": 1171922673,
  "sourceLogin": "t4jtesting",
  "duration": -1,
  "reason": "weirdo",
  "timestamp": 1730105629,
  "messages": []
}, {
  "userId": 268669435,
  "userName": null,
  "modId": 1171922673,
  "modLogin": "t4jtesting",
  "sourceId": 1171922673,
  "sourceLogin": "t4jtesting",
  "duration": 599,
  "reason": "",
  "timestamp": 1730105566,
  "messages": []
}]
