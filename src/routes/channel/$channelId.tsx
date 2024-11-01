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
import {useMutation, useQuery} from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Button} from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Separator} from "@/components/ui/separator.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {useToast} from "@/hooks/use-toast"

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

type PollInput = {
  title?: string
  duration?: number
  channelPoints?: number
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
  const histories: History[] = useLoaderData({from: '/channel/$channelId'})
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

  const {data} = useQuery({
    queryKey: ['channels'],
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
      <Toaster />
    </>
  )
}

function /*component*/ MessageWindow({data, history}: { data: UserDataIndex | undefined, history: History }) {
  const exists = data?.[history.userId] != undefined
  const { toast } = useToast()
  const { channelId } = Route.useParams()
  const token = Cookies.get('twitch')
  const selfId = Cookies.get('self')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dismiss = useMutation({
    mutationFn: (dismissData) => {
      return fetch(`https://shared-chat-mod-helper.gitprodigy.workers.dev/?channel=${channelId}&user=${dismissData.userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ban = useMutation({
    mutationFn: (banData) => {
      return fetch(`https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${channelId}&moderator_id=${selfId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: banData }),
      }).then(resp => resp.json())
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const poll = useMutation({
    mutationFn: (pollData: PollInput) => {
      return fetch("https://api.twitch.tv/helix/polls", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "broadcaster_id": channelId,
          "title": pollData?.title ?? "Should we punish this chatter?",
          "choices": [
            {"title": "Yes"},
            {"title": "No"}
          ],
          "duration": pollData?.duration ?? 60,
          "channel_points_voting_enabled": !!pollData?.channelPoints,
          "channel_points_per_vote": pollData?.channelPoints
        })
      }).then(resp => resp.json())
    }
  })

  return (
    <>
      <div className={"px-8 pt-4 h-full flex flex-col"}>
        <div className={"flex flex-row"}>
          <div>
            <img className={"w-16 rounded-rounded"} src={picture(data, history.userId)}/>
          </div>
          <div className={"px-4"}>
            <h5 className={"font-semibold"}>{history.userName}</h5>
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
            <p>Source Channel</p>
            <p className={"font-semibold"}>{history.sourceLogin}</p>
          </div>
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

        <div className={"mb-auto"}>
          Messages will go here
        </div>

        <div className={"min-h-20 bg-bg-alt p-8 rounded-t-3xl flex flex-row gap-20 justify-center"}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default">Dismiss</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove the user's chat logs from our server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={async () => {
                  try {
                    const resp = await dismiss.mutateAsync({ userId: history.userId })
                    if (resp.ok) {
                      toast({
                        description: `Dismissed logs of ${history.userName}`
                      })
                      // TODO: remove user from UI
                    } else {
                      const body = await resp.json()
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `Failed to dismiss logs for ${history.userName} due to ${body.error}`
                      })
                    }
                  } catch (e) {
                    console.log(e)
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: `Failed to dismiss logs for ${history.userName}; try again later`
                    })
                  } finally {
                    dismiss.reset()
                  }
                }}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Ban</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ban Details</DialogTitle>
                <DialogDescription>
                  Customize the ban reason here. Click execute once done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Input id="reason" defaultValue="Reinstated shared chat ban" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Execute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Timeout</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Timeout Details</DialogTitle>
                <DialogDescription>
                  Customize the timeout here. Click execute once done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Seconds
                  </Label>
                  <Input id="duration" type="number" defaultValue="600" className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Input id="reason" defaultValue="Reinstated shared chat timeout" className="col-span-3"/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Execute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Start Chat Poll</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Poll Details</DialogTitle>
                <DialogDescription>
                  Customize the poll here. Click execute once done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input id="title" defaultValue="Should we punish this chatter?" className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Seconds
                  </Label>
                  <Input id="duration" type="number" defaultValue="60" className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="points" className="text-right">
                    Channel Points
                  </Label>
                  <Input id="points" type="number" defaultValue="0" className="col-span-3"/>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Execute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
