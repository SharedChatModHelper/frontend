import {createLazyFileRoute} from '@tanstack/react-router'
import '../App.css'
import {AUTH_URL} from "@/lib/constants.ts";

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <>
      <div>
        <a href={AUTH_URL}>Login</a>
      </div>
    </>
  )
}
