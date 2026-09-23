import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Blocks } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import * as documentsApi from '@/services/documents'
import * as workspacesApi from '@/services/workspaces'
import type { DocumentTree, ProblemDetail, Workspace } from '@/types'

function extractError(error: unknown): string {
  if (axios.isAxiosError<ProblemDetail>(error)) {
    const detail = error.response?.data?.detail
    if (detail) return detail
    const errors = error.response?.data?.errors
    if (errors && errors.length > 0) return errors[0]
  }
  return 'Une erreur est survenue, réessayez'
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null)
  const [tree, setTree] = useState<DocumentTree[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentWorkspace =
    workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null

  const loadWorkspaces = useCallback(async () => {
    const items = await workspacesApi.listWorkspaces()
    setWorkspaces(items)
    return items
  }, [])

  const loadTree = useCallback(async (workspaceId: string) => {
    const nodes = await documentsApi.listDocumentTree(workspaceId)
    setTree(nodes)
  }, [])

  useEffect(() => {
    let cancelled = false
    loadWorkspaces()
      .then(async (items) => {
        if (cancelled) return
        if (items.length > 0) {
          setCurrentWorkspaceId(items[0].id)
          await loadTree(items[0].id)
        }
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadWorkspaces, loadTree])

  const handleSelectWorkspace = async (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId)
    setSelectedDocumentId(null)
    try {
      await loadTree(workspaceId)
    } catch (err) {
      setError(extractError(err))
    }
  }

  const handleCreateWorkspace = async (name: string, slug?: string) => {
    const workspace = await workspacesApi.createWorkspace(name, slug)
    const items = [...workspaces, workspace]
    setWorkspaces(items)
    setCurrentWorkspaceId(workspace.id)
    setTree([])
    setSelectedDocumentId(null)
  }

  const handleCreateDocument = async () => {
    if (!currentWorkspaceId) return
    try {
      const document = await documentsApi.createDocument(currentWorkspaceId, {})
      setSelectedDocumentId(document.id)
      await loadTree(currentWorkspaceId)
    } catch (err) {
      setError(extractError(err))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  if (!user) return null

  return (
    <div className="flex h-screen flex-col bg-[#09090b] text-zinc-200">
      <Navbar user={user} workspaceName={currentWorkspace?.name ?? null} onLogout={handleLogout} />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          tree={tree}
          selectedDocumentId={selectedDocumentId}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onSelectDocument={setSelectedDocumentId}
          onCreateDocument={handleCreateDocument}
        />
        <main className="flex min-w-0 flex-1 items-center justify-center bg-[#18181b]">
          {loading ? (
            <p className="text-sm text-zinc-500">Chargement…</p>
          ) : error ? (
            <p role="alert" className="max-w-md text-sm text-red-300">
              {error}
            </p>
          ) : currentWorkspace ? (
            <div className="flex flex-col items-center gap-3 text-zinc-500">
              <Blocks className="size-8" />
              <p className="text-sm">Sélectionnez un document dans la barre latérale</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-500">
              <Blocks className="size-8" />
              <p className="text-sm">Créez votre premier workspace pour commencer</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
