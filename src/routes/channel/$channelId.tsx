import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {useState} from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable.tsx'
import {CLIENT_ID, TIME_AGO} from "@/lib/constants.ts";
import {
  cn,
  defaultPicture,
  localizedDuration,
  localizedLongDay,
  localizedShortDay,
  localizedTime
} from "@/lib/utils.ts";
import {useQuery} from "@tanstack/react-query";
import {Separator} from "@/components/ui/separator.tsx";

type History = {
  channelLogin: string
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

type HelixUser = {
  id: string
  profile_image_url: string
  created_at: string
}

type HelixUserReturn = {
  data: HelixUser[]
}

type UserDataIndex = {
  [id: string]: {
    profile_image_url: string
    created_at: string
  }
}

export const Route = createFileRoute('/channel/$channelId')({
  beforeLoad: () => {
    if (!Cookies.get('twitch')) throw redirect({to: '/'})
  },
  loader: async (ctx) => {
    const {channelId} = ctx.params
    const token = Cookies.get('twitch')!

    const response = await fetch(
      `https://shared-chat-mod-helper.gitprodigy.workers.dev/?channel=${channelId}`,
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    )

    if (!response.ok) {
      throw response
    }

    return await response.json()
  },
  component: Channel,
  pendingComponent: Pending,
})

function /*component*/ Pending() {
  return <>Hello, I'm loading</>
}

function picture(pictures: UserDataIndex | undefined, id: number) {
  return pictures?.[id.toString()]?.profile_image_url ?? defaultPicture(id);
}

function /*component*/ Channel() {
  const token = Cookies.get('twitch') //TODO: use context instead
  const histories: History[] = useLoaderData({from: '/channel/$channelId'}).slice(0, 100)
  const [chatter, setChatter] = useState(histories[0]?.userId as number | null)

  const historyMap: { [id: number]: number } = {}

  const getHistory = (id: number): History => {
    return histories[historyMap[id]]
  }

  histories.forEach((value, index) => historyMap[value.userId] = index)

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

  const {isLoading, data} = useQuery({
    queryKey: ['user_info'],
    async queryFn() {
      const chatters = histories.map(history => history.userId).map((id) => {
        return `id=${id}`
      }).join("&")

      const r = await fetch(`https://api.twitch.tv/helix/users?${chatters}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID
        }
      });

      const dataIndex: UserDataIndex = {}

      const data: HelixUserReturn = await r.json()
      data.data.forEach((value) => {
        dataIndex[value.id] = {
          profile_image_url: value.profile_image_url,
          created_at: value.created_at
        }
      })

      return dataIndex;
    }
  })

  return (
    <>
      <div className={"min-h-14 bg-bg-alt font-semibold uppercase flex items-center pl-8 pr-4"}>Shared chat mod helper
      </div>
      <div>
        <ResizablePanelGroup direction="horizontal" className={'min-h-[calc(100vh-3.5rem)]'}>
          <ResizablePanel defaultSize={20} className={""}>
            <div className={"min-h-14 flex items-center pl-8 pr-4"}>
              {histories[0] ? `Channel: ${histories[0].channelLogin} • ${histories.length}+ actions` : "No shared mod actions found!"}
            </div>
            <Separator/>
            <ul className={'flex flex-col gap-2 py-4 px-4'}>
              {histories.map((history) => (
                <li>
                  <button
                    className={cn(
                      "p-4 w-full text-start transition-colors bg-bg-alt hover:bg-bg-hover rounded-medium flex flex-row",
                      {"bg-bg-hover": chatter === history.userId}
                    )}
                    key={history.userId}
                    onMouseDown={() => setChatter(history.userId)}
                  >
                    <div className={"w-8 mr-4 rounded-rounded"}>
                      {
                        <img className={"rounded-rounded"} src={picture(data, history.userId)}/>
                      }
                    </div>
                    <div>
                      <div className={"text-5 leading-heading font-semibold"}>
                        {history.userName}
                      </div>
                      <div className={"w-full text-nowrap overflow-ellipsis overflow-hidden"}>
                        <span className={"text-hinted-gray-9"}>{TIME_AGO.format(history.timestamp * 1000)}</span>
                        <MessageFragment history={history}/>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </ResizablePanel>
          <ResizableHandle className={"bg-bg-hover"}/>
          <ResizablePanel className={""}>
            {chatter != null ? (
              <MessageWindow data={data} history={getHistory(chatter)}/>
            ) : (
              <>Select a user</>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}

function /*component*/ MessageWindow({data, history}: { data: UserDataIndex | undefined, history: History }) {
  const exists = data?.[history.userId] != undefined

  return (
    <>
      <div className={"px-8 pt-4"}>
        <div className={"flex flex-row"}>
          <div>
            <img className={"w-16 rounded-rounded"} src={picture(data, history.userId)}/>
          </div>
          <div className={"px-4"}>
            <div className={"flex flex-row gap-2"}>
              <h5 className={"font-semibold"}>{history.userName}</h5>
              <a title={"Open viewer card"} href={`https://www.twitch.tv/popout/${history.channelLogin}/viewercard/${history.userName}`} target={"_blank"}>
                <img src={"/open.png"} className={"h-8 opacity-75 hover:opacity-100"} />
              </a>
            </div>
            <p className={cn(
              {
                "text-hinted-gray-9": exists,
                "text-red-10": !exists,
              }
            )}>
              {
                exists ?
                  `Account created ${localizedLongDay(data?.[history.userId]?.created_at, "en-US")}`
                  : "Account banned or deactivated"
              }
            </p>
          </div>
        </div>
        <div className={"text-hinted-gray-9 flex flex-row flex-nowrap pt-4 w-full"}>
          <div className={"flex flex-col basis-full"}>
            <p>Moderated by</p>
            <p className={"font-semibold"}>{history.modLogin}</p>
          </div>
          <div className={"flex flex-col basis-full"}>
            <p>Moderated at</p>
            <p className={"font-semibold"}>
              {localizedTime(history.timestamp * 1000)} • {localizedShortDay(history.timestamp * 1000)}
            </p>
          </div>

          <div className={"flex flex-col basis-full"}>
            <p>Duration</p>
            <p className={"font-semibold"}>
              {history.duration != -1 ? localizedDuration(history.duration) : "Infinite"}
            </p>
          </div>
          <div className={"flex flex-col basis-full"}>
            <p>Reason</p>
            <p className={cn(
              "font-semibold",
              {
                "text-hinted-gray-7": history.reason.length == 0
              }
            )}>
              {history.reason ? history.reason : "Unspecified"}
            </p>
          </div>
        </div>
        <Separator className={"my-4"}/>
      </div>
    </>
  )
}

function /*component*/ Message() {
  return (
    <>

    </>
  )
}

function /*component*/ MessageFragment({history}: { history: History }) {
  if (history.messages.length == 0) return null

  return (
    <>
      <span> • </span>
      <span>
        {history.messages[history.messages.length - 1].text}
      </span>
    </>
  )
}

// The output of a query, this is here just for reference,
// ============= Please remove on production =============
/*const vals = [{
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
}]*/
