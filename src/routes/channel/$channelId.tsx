import {createFileRoute, Link, redirect, useLoaderData,} from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {ResizableHandle, ResizablePanel, ResizablePanelGroup,} from '@/components/ui/resizable.tsx'
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Separator} from "@/components/ui/separator.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {useToast} from "@/hooks/use-toast"
import {
  ArrowLeft12Regular,
  Clock12Regular,
  Comment12Regular,
  Dismiss12Regular,
  Open12Regular,
  Prohibited12Regular
} from "@fluentui/react-icons";
import {queryClient} from "@/main.tsx";
import {IconCommentOff, IconGavel} from "@/components/Icons.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {ShieldAlert} from "lucide-react";

//region Types
type Moderation = {
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

type PollInput = {
  title?: string
  duration?: number
  channelPoints?: number
}
//endregion

export const Route = createFileRoute('/channel/$channelId')({
  beforeLoad: () => {
    if (!Cookies.get('twitch')) throw redirect({to: '/'})
  },
  loader: async (ctx) => {
    const {channelId} = ctx.params
    const token = Cookies.get('twitch')!

    return await queryClient.fetchQuery({
      queryKey: [`histories`, channelId],
      queryFn: () => fetch(
        `https://shared-chat-mod-helper.gitprodigy.workers.dev/?channel=${channelId}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      ).then(value => value.json()),

    })
  },
  component: Channel,
})

function picture(pictures: UserDataIndex | undefined, id: number) {
  return pictures?.[id.toString()]?.profile_image_url ?? defaultPicture(id);
}

function /*component*/ Channel() {
  const [moderations, setModerations]: [Moderation[], (value: Moderation[]) => void] = useState(useLoaderData({from: '/channel/$channelId'}).slice(0, 100));
  const [chatter, setChatter] = useState(moderations[0]?.userId as number | null);
  const [streamerMode, setStreamerMode] = useState(false);

  const token = useMemo(() => Cookies.get('twitch'), []);

  const moderationMap = useMemo(() => {
    const moderationMap: { [id: number]: number } = {};
    moderations.forEach((value, index) => moderationMap[value.userId] = index);
    return moderationMap;
  }, [moderations]);

  useEffect(() => {
  }, [moderations]);

  const removeModeration = useCallback((index: number) => {
    const copy = [...moderations]
    copy.splice(index, 1)

    let newIndex = index
    if (moderationMap[chatter!] >= copy.length) {
      newIndex = copy.length - 1;
    }

    if (copy.length == 0) {
      setChatter(null)
    } else {
      setChatter(copy[newIndex].userId);
    }

    setModerations(copy);
  }, [moderations, moderationMap, chatter]);

  const getModeration = (id: number): Moderation => {
    return moderations[moderationMap[id]];
  }

  const {isLoading, data} = useQuery({
    queryKey: [`user_info`, moderations.reduce((acc, curr) => (acc * 31 + curr.userId) | 0, 17)],
    async queryFn() {
      const chatters = moderations.map(moderation => moderation.userId).map((id) => {
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
  });

  return (
    <div className={"bg-bg-body"}>
      <div className={"min-h-14 bg-bg-alt flex items-center pl-6 pr-4"}>
        <Link href={"/app"} className={"text-white hover:text-twitch-purple-11 transition-colors"}><ArrowLeft12Regular className={"mr-4 size-[1.6rem]"}/></Link>
        <p className={"font-semibold uppercase mr-auto"}>Shared chat mod helper</p>
        <div className={"flex items-center space-x-2"}>
          <Switch id="streamer" checked={streamerMode} onCheckedChange={(checked) => setStreamerMode(checked)} />
          <Label htmlFor="streamer">Streamer Mode</Label>
        </div>
      </div>
      <div className={"h-[calc(100vh-3.5rem)]"}>
        <ResizablePanelGroup direction="horizontal" className={'h-full flex'}>
          <ResizablePanel defaultSize={20} minSize={13} className={"h-full flex flex-col"}>
            <div className={"min-h-14 flex items-center pl-8 pr-4"}>
              {moderations[0] ? `Channel: ${moderations[0].channelLogin} • ${moderations.length}+ actions` : "No shared mod actions found!"}
            </div>
            <Separator/>
            <ScrollArea className={"h-full"}>
              <div className={'flex flex-col gap-2 py-4 px-4'}>
                {moderations.map((moderation) => (
                  <button
                    className={cn(
                      "p-4 w-full text-start transition-colors bg-bg-alt hover:bg-bg-hover rounded-medium flex flex-row",
                      {"bg-bg-hover": chatter === moderation.userId}
                    )}
                    key={moderation.userId}
                    onMouseDown={() => setChatter(moderation.userId)}
                  >
                    <div className={"w-8 mr-4 rounded-rounded flex-shrink-0"}>
                      <img alt={moderation.userName} className={cn("rounded-rounded", {"blur": streamerMode})}
                           src={picture(data, moderation.userId)}/>
                    </div>
                    <div className={"min-w-0"}>
                      <div className={"text-5 leading-heading font-semibold"}>
                        {moderation.userName}
                      </div>
                      <div className={"w-full text-nowrap overflow-ellipsis overflow-hidden"}>
                        <span className={"text-hinted-gray-9"}>{TIME_AGO.format(moderation.timestamp * 1000)}</span>
                        <MessageFragment moderation={moderation}/>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>
          <ResizableHandle className={"bg-bg-hover"}/>
          <ResizablePanel minSize={35} className={""}>
            {chatter != null ? (
              <MessageWindow data={data} loading={isLoading} streamerMode={streamerMode}
                             deleteFn={() => removeModeration(moderationMap[chatter])}
                             moderation={getModeration(chatter)}/>
            ) : (
              <div className={"h-full"}>
                <div className={"w-full h-full relative my-auto flex flex-col items-center justify-center text-hinted-gray-9"}>
                  <span className={"size-12"}><IconGavel/></span>
                  <p className={"pt-2 text-5"}>No pending actions found</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster/>
    </div>
  );
}

function /*component*/ MessageWindow({data, loading, streamerMode, moderation, deleteFn}: {
  data: UserDataIndex | undefined,
  loading: boolean,
  streamerMode: boolean,
  moderation: Moderation,
  deleteFn: () => void
}) {
  const exists = data?.[moderation.userId] != undefined || loading;
  const {toast} = useToast();
  const {channelId} = Route.useParams();
  const token = Cookies.get('twitch');
  const selfId = Cookies.get('self');

  const dismiss = useMutation({
    mutationFn: (dismissData: { userId: number }) => {
      return fetch(`https://shared-chat-mod-helper.gitprodigy.workers.dev/?channel=${channelId}&user=${dismissData.userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
    }
  });

  const warn = useMutation({
    mutationFn: (warnData: { user_id: number, reason: string }) => {
      return fetch(`https://api.twitch.tv/helix/moderation/warnings?broadcaster_id=${channelId}&moderator_id=${selfId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({data: warnData}),
      })
    }
  });

  const ban = useMutation({
    mutationFn: (banData: { user_id: number, reason?: string, duration?: number }) => {
      return fetch(`https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${channelId}&moderator_id=${selfId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-Id": CLIENT_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({data: banData}),
      })
    }
  });
  const banUser = async (duration: number, reasonElement: HTMLInputElement) => {
    const actionName = duration > 0 ? "timeout" : "ban"
    const actionNamePast = duration > 0 ? "timed-out" : "banned"
    try {
      const resp = await ban.mutateAsync({
        "user_id": moderation.userId,
        "reason": reasonElement.value,
        "duration": duration > 0 ? duration : undefined
      })
      if (resp.ok) {
        toast({
          description: `Successfully ${actionNamePast} ${moderation.userName}`
        })

        try {
          const resp = await dismiss.mutateAsync({userId: moderation.userId});
          if (resp.ok) {
            deleteFn()
          } else {
            const body = await resp.json()
            console.error(`Failed to delete logs of ${moderation.userName} due to ${body.error}`)
          }
        } catch (e) {
          console.error(`Could not delete logs of ${moderation.userName}`, e)
        } finally {
          dismiss.reset()
        }
      } else {
        const body = await resp.json()
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: `Failed to ${actionName} ${moderation.userName} due to ${body.error}`
        })
      }
    } catch (e) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Could not ${actionName} ${moderation.userName}; try again later`
      })
    } finally {
      ban.reset()
    }
  }

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
          "duration": Math.max(pollData?.duration ?? 60, 15),
          "channel_points_voting_enabled": !!pollData?.channelPoints,
          "channel_points_per_vote": pollData?.channelPoints
        })
      })
    }
  });

  let accountDetails: string;
  if (loading) {
    accountDetails = `Loading information`;
  } else if (exists) {
    accountDetails = `Account created ${localizedLongDay(data?.[moderation.userId]?.created_at, "en-US")}`;
  } else {
    accountDetails = "Account banned or deactivated";
  }

  const isBroadcaster = selfId === channelId

  return (
    <div className={"px-8 pt-4 h-full flex flex-col"}>
      <div className={"flex flex-row"}>
        <div>
          <img alt={moderation.userName} className={cn("w-16 rounded-rounded", {"blur": streamerMode})} src={picture(data, moderation.userId)}/>
        </div>
        <div className={"px-4"}>
          <div className={"flex flex-row gap-2"}>
            <h5 className={"font-semibold"}>{moderation.userName}</h5>
            <a title={"Open viewer card"} href={`https://www.twitch.tv/popout/${moderation.channelLogin}/viewercard/${moderation.userName}`} target={"_blank"}>
              <Open12Regular className={"size-8 text-white opacity-75 hover:opacity-100 transition-opacity"}/>
            </a>
          </div>
          <p className={cn(
            {
              "text-hinted-gray-9": exists,
              "text-red-10": !exists,
            }
          )}>
            {accountDetails}
          </p>
        </div>
      </div>
      <div className={"text-hinted-gray-9 flex flex-row flex-nowrap pt-4 w-full"}>
        <div className={"flex flex-col basis-full"}>
          <p>Source Channel</p>
          <p className={"font-semibold"}>{moderation.sourceLogin}</p>
        </div>
        <div className={"flex flex-col basis-full"}>
          <p>Moderated by</p>
          <p className={cn("font-semibold", {"blur": streamerMode})}>{streamerMode ? "hidden_moderator" : moderation.modLogin}</p>
        </div>
        <div className={"flex flex-col basis-full"}>
          <p>Moderated at</p>
          <p className={"font-semibold"}>
            {localizedTime(moderation.timestamp * 1000)} • {localizedShortDay(moderation.timestamp * 1000)}
          </p>
        </div>

        <div className={"flex flex-col basis-full"}>
          <p>Duration</p>
          <p className={"font-semibold"}>
            {moderation.duration != -1 ? localizedDuration(moderation.duration) : "Infinite"}
          </p>
        </div>
        <div className={"flex flex-col basis-full"}>
          <p>Reason</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  "font-semibold overflow-hidden line-clamp-1 w-fit data-[state=delayed-open]:cursor-default",
                  {"text-hinted-gray-7": moderation.reason.length == 0}
                )}>
                  {moderation.reason ? moderation.reason : "Unspecified"}
                </p>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <div className={"max-w-5xl leading-[1.2] text-6"}>
                    {moderation.reason ? moderation.reason : "Unspecified"}
                  </div>
                  <TooltipArrow className="fill-white"/>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Separator className={"my-4"}/>

      <ScrollArea type={"auto"} className={"h-full mb-4 pr-4"}>
        {
          moderation.messages.length > 0 ?
            moderation.messages.map(message => <Message chatter={moderation.userName} message={message}/>) :
            <div className={"w-full h-full relative my-auto flex flex-col items-center justify-center text-hinted-gray-9"}>
              <span className={"size-12"}><IconCommentOff/></span>
              <p className={"pt-2 text-5"}>No recent messages</p>
            </div>
        }
      </ScrollArea>

      <div className={"min-h-24 bg-bg-alt p-4 rounded-t-extra-extra-large flex flex-row gap-20 justify-center items-center"}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button h6sb icon={<Dismiss12Regular/>}>Dismiss</Button>
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
                  const resp = await dismiss.mutateAsync({userId: moderation.userId})
                  if (resp.ok) {
                    toast({
                      description: `Dismissed logs of ${moderation.userName}`
                    });
                    deleteFn();
                  } else {
                    const body = await resp.json()
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: `Failed to dismiss logs for ${moderation.userName} due to ${body.error}`
                    })
                  }
                } catch (e) {
                  console.error(e)
                  toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: `Could not dismiss logs for ${moderation.userName}; try again later`
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
            <Button h6sb icon={<ShieldAlert/>}>Warn</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Warning Details</DialogTitle>
              <DialogDescription>
                Customize the warning here. Click execute once done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="warnreason" className="text-right">
                  Reason
                </Label>
                <Input id="warnreason" className="col-span-3" defaultValue="Please comply with the chat rules"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="brand" onClick={async () => {
                  const reason = document.getElementById("warnreason") as HTMLInputElement
                  try {
                    const resp = await warn.mutateAsync({user_id: moderation.userId, reason: reason.value})
                    if (resp.ok) {
                      toast({
                        description: `Successfully warned ${moderation.userName}`
                      })
                      try {
                        const resp = await dismiss.mutateAsync({ userId: moderation.userId });
                        if (resp.ok) {
                          deleteFn()
                        } else {
                          const body = await resp.json()
                          console.error(`Failed to delete logs of ${moderation.userName} due to ${body.error}`)
                        }
                      } catch (e) {
                        console.error(`Could not delete logs of ${moderation.userName}`, e)
                      } finally {
                        dismiss.reset()
                      }
                    } else {
                      const body = await resp.json()
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `Failed to warn ${moderation.userName}: ${body.error}`
                      })
                    }
                  } catch (e) {
                    console.error(e)
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: `Could not warn ${moderation.userName}; try again later`
                    })
                  } finally {
                    warn.reset()
                  }
                }}>
                  Execute
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button h6sb icon={<Prohibited12Regular/>}>Ban</Button>
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
                <Label htmlFor="banreason" className="text-right">
                  Reason
                </Label>
                <Input id="banreason" defaultValue="Reinstated shared chat ban" className="col-span-3"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={async () => await banUser(-1, document.getElementById("banreason") as HTMLInputElement)}>
                  Execute
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button h6sb icon={<Clock12Regular/>}>Timeout</Button>
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
                <Label htmlFor="timeoutduration" className="text-right">
                  Seconds
                </Label>
                <Input id="timeoutduration" type="number" defaultValue="600" min="1" max="1209600" className="col-span-3"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeoutreason" className="text-right">
                  Reason
                </Label>
                <Input id="timeoutreason" defaultValue="Reinstated shared chat timeout" className="col-span-3"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={async () => {
                  const duration = document.getElementById("timeoutduration") as HTMLInputElement
                  const reason = document.getElementById("timeoutreason") as HTMLInputElement
                  await banUser(duration.valueAsNumber, reason)
                }}>
                  Execute
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild disabled={!isBroadcaster}>
            <Button h6sb icon={<Comment12Regular/>}>Start Chat Poll</Button>
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
                <Label htmlFor="polltitle" className="text-right">
                  Title
                </Label>
                <Input id="polltitle" defaultValue="Should we punish this chatter?" className="col-span-3"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pollduration" className="text-right">
                  Seconds
                </Label>
                <Input id="pollduration" type="number" defaultValue="60" min="0" max="1800" className="col-span-3"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pollpoints" className="text-right">
                  Channel Points
                </Label>
                <Input id="pollpoints" type="number" defaultValue="0" min="0" max="1000000" className="col-span-3"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" onClick={async () => {
                  const titleEl = document.getElementById("polltitle") as HTMLInputElement
                  const secondsEl = document.getElementById("pollduration") as HTMLInputElement
                  const pointsEl = document.getElementById("pollpoints") as HTMLInputElement
                  try {
                    const resp = await poll.mutateAsync({
                      title: titleEl.value,
                      duration: secondsEl.valueAsNumber,
                      channelPoints: pointsEl.valueAsNumber
                    })
                    if (resp.ok) {
                      toast({
                        description: `Started poll about ${moderation.userName}`
                      })
                      window.open(`https://www.twitch.tv/popout/${moderation.channelLogin}/poll`, "_blank")
                    } else {
                      const body = await resp.json()
                      toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: `Failed to start poll about ${moderation.userName}: ${body.message}`
                      })
                    }
                  } catch (e) {
                    console.error(e)
                    toast({
                      variant: "destructive",
                      title: "Uh oh! Something went wrong.",
                      description: `Could not start poll about ${moderation.userName}; try again later`
                    })
                  } finally {
                    poll.reset()
                  }
                }}>
                  Execute
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function /*component*/ Message({chatter, message}: { chatter: string, message: Message }) {
  return (
    <div className={"py-2 word-break"}>
      <span className={"text-hinted-gray-9 mr-2"}>{localizedTime(message.timestamp * 1000)}</span>
      <span className={"font-bold"}>{chatter}</span>
      <span>:&nbsp;</span>
      <span>{message.text}</span>
      <span className={"ml-2 text-hinted-gray-9"}>(Sent in {message.sourceLogin})</span>
    </div>
  );
}

function /*component*/ MessageFragment({moderation}: { moderation: Moderation }) {
  if (moderation.messages.length == 0) return null

  return (
    <>
      <span> • </span>
      <span>
        {moderation.messages[moderation.messages.length - 1].text}
      </span>
    </>
  );
}
