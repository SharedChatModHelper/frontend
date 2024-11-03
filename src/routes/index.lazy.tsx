import {createLazyFileRoute} from '@tanstack/react-router'
import {Button} from "@/components/ui/button.tsx";
import {AUTH_URL} from "@/lib/constants.ts";
import {Check, Twitch} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion.tsx";

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <div className="w-full pt-48">
        <div className="container mx-auto">
          <div className="flex flex-col text-center py-10 gap-8 items-center">
            <h1>Shared Chat Mod Helper</h1>
            <h4 className="italic text-hinted-gray-9">
              A moderator's best friend for Shared Chat.
            </h4>
            <Button h6sb asChild icon={<Twitch/>}>
              <a href={AUTH_URL} className="text-inherit hover:text-inherit">Login with Twitch</a>
            </Button>
          </div>

          <div className="flex flex-row gap-24 py-36 items-center">
            <div className="flex flex-row gap-6 items-start">
              <Check className="w-6 h-6 mt-2 flex-shrink-0"/>
              <div className="flex flex-col gap-1">
                <p className="text-4">Context-driven</p>
                <p className="text-hinted-gray-9 text-6">
                  Our interface includes user details, their chat messages, and more!
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start">
              <Check className="w-6 h-6 mt-2 flex-shrink-0"/>
              <div className="flex flex-col gap-1">
                <p className="text-4">Feature-rich</p>
                <p className="text-hinted-gray-9 text-6">
                  Beyond bans, timeouts, and warnings, you can even poll your chat's opinion.
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start">
              <Check className="w-6 h-6 mt-2 flex-shrink-0"/>
              <div className="flex flex-col gap-1">
                <p className="text-4">Streamer Mode</p>
                <p className="text-hinted-gray-9 text-6">
                  Hide profile pictures and mod identities so it's safer to stream our tool!
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-start mb-16">
            <Accordion type="single" collapsible className="w-1/2">
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
                  How long is the data stored?
                </AccordionTrigger>
                <AccordionContent>
                  Once you act upon a given user, we delete their messages from our database.
                  We do not store long-term chat logs from users that aren't banned or timed-out,
                  in accordance with Twitch's developer agreement.
                  By using the app, you are consenting to our data storage policy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
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
              <AccordionItem value="item-7">
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
