import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister'

// Import the generated route tree
import {routeTree} from './routeTree.gen'
import {QueryClient} from "@tanstack/react-query";
import {PersistQueryClientOptions} from "@tanstack/query-persist-client-core";

// Create a new router instance
const router = createRouter({routeTree})
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
      staleTime: 1000 * 60 // 1 minute
    },
  }

})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

const persistOptions: PersistQueryClientOptions = {
  queryClient,
  persister,
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Log persistence attempts
      console.debug('Attempting to persist query:', query.queryKey);
      return query.state.status === 'success' && query.state.data !== undefined;
    },
  },
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <RouterProvider defaultPendingMinMs={100} router={router}/>
    </PersistQueryClientProvider>
  </StrictMode>,
)
