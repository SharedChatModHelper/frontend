import {createLazyFileRoute, Link} from '@tanstack/react-router'
import {SimpleButton} from "@/components/ui/button.tsx";
import {AUTH_URL} from "@/lib/constants.ts";
import {Check, Twitch} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion.tsx";
import Cookies from "js-cookie";
import {IconGavel} from "@/components/Icons.tsx";
import {ReactNode} from "react";

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function /*component*/ FeatureCard({children}: {children: ReactNode[]}) {
  if (children.length != 2) {
    throw "Feature card must have 2 children"
  }

  return (
    <div className="flex flex-row gap-6 items-start bg-bg-alt p-4 rounded-medium max-w-xl">
      <Check className="w-6 h-6 mt-2 flex-shrink-0"/>
      <div className="flex flex-col gap-1">
        <p className="text-4">{children[0]}</p>
        <p className="text-hinted-gray-9 text-6">
          {children[1]}
        </p>
      </div>
    </div>
  );
}

function Index() {
  const token = Cookies.get("twitch");
  const connected = !!token;

  return (
    <>
      <div className="w-full pt-8 flex justify-center">
        <div className="w-full container">
          <div className="flex flex-col text-center py-8 gap-8 items-center">
            <h1>Shared Chat Mod Helper</h1>
            <h4 className="italic text-hinted-gray-9">
              A moderator's best friend for Shared Chat.
            </h4>
            <SimpleButton h6sb variant={connected ? "default" : "brand"} asChild className={"cursor-pointer text-inherit hover:text-inherit hover:decoration-none"}>
              {
                !connected ?
                  <a href={AUTH_URL}>
                    <div className={"px-2 min-h-8 flex flex-row justify-between"}>
                      <h6 className={"font-semibold"}>Login with Twitch</h6>
                      <div className={"pl-4 flex"}>
                        <div className={"h-8 w-8 m-auto justify-center items-center inline-flex"}>
                          <Twitch/>
                        </div>
                      </div>
                    </div>
                  </a> :
                  <Link href={"/app"} className="text-inherit hover:text-inherit">
                    <div className={"px-2 min-h-8 flex flex-row justify-between"}>
                      <h6 className={"font-semibold"}>Access app</h6>
                      <div className={"pl-4 flex"}>
                        <div className={"h-8 w-8 m-auto justify-center items-center inline-flex"}>
                          <IconGavel/>
                        </div>
                      </div>
                    </div>
                  </Link>
              }
            </SimpleButton>
          </div>

          <div className="flex flex-row gap-8 py-16 items-center w-full justify-center">
            <FeatureCard>
              <>Context-driven</>
              <>Our interface includes user details, their chat messages, and more!</>
            </FeatureCard>
            <FeatureCard>
              <>Feature-rich</>
              <>Beyond bans, timeouts, and warnings, you can even poll your chat's opinion.</>
            </FeatureCard>
            <FeatureCard>
              <>Streamer Mode</>
              <>Hide profile pictures and mod identities so it's safer to stream our tool!</>
            </FeatureCard>
          </div>

          <div className="flex justify-center items-start mb-8">
            <Accordion type="single" collapsible className="w-2/3 lg:w-1/2">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-hinted-gray-12">
                  What does it do?
                </AccordionTrigger>
                <AccordionContent>
                  We keep track of users banned and timed-out by moderators of other channels
                  during Shared Chat sessions, so you can take appropriate actions in your own channel.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-hinted-gray-12">
                  How does it help?
                </AccordionTrigger>
                <AccordionContent>
                  We offer a novel, convenient interface to selectively view and manage <i>shared</i> moderation actions,
                  improving safety for channels that regularly collaborate with others.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-hinted-gray-12">
                  Why do I need it?
                </AccordionTrigger>
                <AccordionContent>
                  Twitch automatically lifts all shared bans and timeouts once the Shared Chat session ends,
                  which can be problematic when you want to keep certain users punished.
                  <br/><br/>
                  In addition, mods could already be dealing with six (6) times the normal message rate,
                  so it can be difficult to remember to re-ban certain users without such a tool.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-hinted-gray-12">
                  When should I use it?
                </AccordionTrigger>
                <AccordionContent>
                  You should authorize the app today so it can start collecting messages once you join a Shared Chat.
                  <br/><br/>
                  Moderators should review the dashboard once the Shared Chat session concludes to reinstate desired actions.
                  <br/><br/>
                  Broadcasters can even stream the tool to their audience to democratize moderation decision making,
                  similar to "ban appeal" streams that are already popular on the platform.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-hinted-gray-12">
                  How does it differ from Shared Ban Info?
                </AccordionTrigger>
                <AccordionContent>
                  While Twitch's Shared Ban Info feature can be useful, our tool is more <strong>flexible</strong>, <strong>scalable</strong>, and <strong>proactive</strong>.
                  <br/><br/>
                  Here, a broadcaster can simply authorize the app <strong>once</strong>, and leave moderation to their team.<br/>
                  With Shared Ban Info, broadcasters need to request data sharing from <em>every</em>  Shared Chat participant they ever interact with.
                  Those other broadcasters may not bother to accept the request, or could be constrained by the 30 channel limit for Shared Ban Info.
                  <br/><br/>
                  Also, our tool allows <strong>individualized</strong> actions (ban, timeout, warn, restrict, monitor) whereas Shared Ban Info institutes blanket reactions (monitor or restrict).
                  With blunt instruments, the suspicious treatment can be too permissive or too restrictive depending on the context.
                  Our tool allows moderators to take the appropriate action with the relevant context.
                  <br/><br/>
                  Further, our tool shows <strong>both</strong> shared bans and timeouts, while Shared Ban Info only reacts to bans.
                  While short timeouts are usually benign, long timeouts (e.g., 14 days) are likely to be reinstated in the shared channels (when given the choice).
                  <br/><br/>
                  That said, using both tools is optimal so you can benefit from shared mod comments while taking proactive, individualized decisions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-hinted-gray-12">
                  How long is the data stored?
                </AccordionTrigger>
                <AccordionContent>
                  Once you act upon a given user, we delete their messages from our database.
                  We do not store long-term chat logs from users that aren't banned or timed-out,
                  in accordance with Twitch's developer agreement.
                  By using the app, you are consenting to our data storage policy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-hinted-gray-12">
                  Who built it?
                </AccordionTrigger>
                <AccordionContent>
                  This product was created by <a href="https://twitch.tv/ogprodigy">OGprodigy</a> and <a href="https://twitch.tv/awakenedredstone">AwakenedRedstone</a> during the <a href="https://twitchstreamertools.devpost.com">Twitch Streamer Tools Hackathon 2024</a>.
                  <br/>
                  Combined, they moderate hundreds of channels and maintain <a href="https://twitch4j.github.io">Twitch4J</a>, a Twitch API wrapper for the JVM.
                  <br/><br/>
                  We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with Twitch, or any of its subsidiaries or its affiliates.
                  The official Twitch website can be found at <a href="https://twitch.tv">twitch.tv</a>.
                  The name Twitch as well as related names, marks, emblems, and images are registered trademarks of their respective owners, including Twitch Interactive Inc.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-hinted-gray-12">
                  How do I get started?
                </AccordionTrigger>
                <AccordionContent>
                  Simply click on the "Login with Twitch" button above, and select which channel you would like to moderate!
                  You will see any users that were banned by moderators of other channels
                  during Shared Chat sessions involving the selected broadcaster.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  )
}
