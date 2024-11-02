import React, {Suspense} from "react";
import {createRootRoute, Outlet, useRouterState} from '@tanstack/react-router'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {Pending} from "@/Components.tsx";
import {cn} from "@/lib/utils.ts";

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
      // Lazy load in development
      import('@tanstack/router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      })),
    )

export const Route = createRootRoute({
  component: Root
})

function /*component*/ Root() {
  const isLoading = useRouterState({
    select: (s) => s.status === 'pending',
  })

  return (
    <>
      <Pending className={cn("transition-all", {
        "opacity-100 visible": isLoading,
        "opacity-0 invisible": !isLoading
      })}/>
      <Outlet/>
      <ReactQueryDevtools initialIsOpen={false}/>
      <Suspense>
        <TanStackRouterDevtools/>
      </Suspense>
    </>
  );
}
