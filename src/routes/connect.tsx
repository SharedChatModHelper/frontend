import {createFileRoute, redirect} from '@tanstack/react-router'
import Cookies from "js-cookie";
import {RouteError} from "@/lib/routeError.ts";
import {Warning12Regular} from "@fluentui/react-icons";

export const Route = createFileRoute('/connect')({
  loader: async ctx => {
    if (!ctx.location.hash) throw redirect({to: "/"});

    const search = new URLSearchParams(ctx.location.hash)
    const token = search.get("access_token");
    if (!token) throw new RouteError("Token not provided", 0, {});

    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        "Authorization": "Bearer " + token
      }
    })

    const data = await response.json();
    if (response.ok) {

      Cookies.set("twitch", token, {secure: true, sameSite: "strict"})
      Cookies.set("self", data["user_id"], {secure: true, sameSite: "strict"})
      throw redirect({to: "/app"})
    } else {
      throw new RouteError("Invalid token", 3, {status: response.status, data: data});
    }
  },
  errorComponent: ErrorComponent
})

function ErrorComponent({error}: { error: Error }) {
  return (
    <div className={"w-screen h-screen fixed top-0 z-40 flex flex-col items-center justify-center bg-bg-base"}>
      <Warning12Regular className={"size-20 text-error"}/>
      <span className={"text-4 pt-2 text-error"}>Failed to connect to Twitch!</span>
      <span className={"text-5 pt-2 text-hinted-gray-9"}>{error.message}</span>
    </div>
  )
}
