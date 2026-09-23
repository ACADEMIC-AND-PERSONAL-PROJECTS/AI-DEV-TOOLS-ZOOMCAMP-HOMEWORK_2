import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'
import type { DocumentTree, Workspace } from '@/types'

const workspace: Workspace = {
  id: 'ws-1',
  name: 'Backend',
  slug: 'backend',
  ownerId: 'user-1',
  createdAt: '2026-09-01T10:00:00Z',
}

const tree: DocumentTree[] = [
  {
    id: 'doc-1',
    parentId: null,
    title: 'Onboarding',
    icon: '🚀',
    position: 0,
    updatedAt: '2026-09-10T10:00:00Z',
    children: [
      {
        id: 'doc-2',
        parentId: 'doc-1',
        title: 'Architecture',
        icon: '🏗️',
        position: 0,
        updatedAt: '2026-09-11T10:00:00Z',
        children: [],
      },
    ],
  },
]

function renderSidebar(treeValue: DocumentTree[] = tree) {
  const props = {
    workspaces: [workspace],
    currentWorkspace: workspace,
    tree: treeValue,
    selectedDocumentId: null as string | null,
    onSelectWorkspace: vi.fn(),
    onCreateWorkspace: vi.fn(),
    onSelectDocument: vi.fn(),
    onCreateDocument: vi.fn(),
  }
  const view = render(<Sidebar {...props} />)
  return { ...props, ...view }
}

describe('Sidebar', () => {
  it('shouldRenderDocumentTree', () => {
    renderSidebar()

    expect(screen.getByRole('button', { name: /Onboarding/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Architecture/ })).toBeInTheDocument()
  })

  it('shouldCallOnSelectDocumentWhenNodeClicked', async () => {
    const user = userEvent.setup()
    const { onSelectDocument } = renderSidebar()

    await user.click(screen.getByRole('button', { name: /Architecture/ }))

    expect(onSelectDocument).toHaveBeenCalledWith('doc-2')
  })

  it('shouldCallOnCreateDocumentWhenButtonClicked', async () => {
    const user = userEvent.setup()
    const { onCreateDocument } = renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Nouveau document' }))

    expect(onCreateDocument).toHaveBeenCalledOnce()
  })

  it('shouldCollapseAndHideTitles', async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByRole('button', { name: 'Replier la barre latérale' }))

    expect(
      screen.getByRole('button', { name: 'Déplier la barre latérale' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Onboarding')).not.toBeInTheDocument()
  })

  it('shouldShowEmptyStateWhenNoDocuments', () => {
    renderSidebar([])

    expect(
      screen.getByText('Aucun document. Créez votre premier document.'),
    ).toBeInTheDocument()
  })
})
