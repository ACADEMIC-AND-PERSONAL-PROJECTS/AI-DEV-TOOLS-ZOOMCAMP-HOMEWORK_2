import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import type { Workspace } from '@/types'

const workspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Backend',
    slug: 'backend',
    ownerId: 'user-1',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ws-2',
    name: 'Frontend',
    slug: 'frontend',
    ownerId: 'user-1',
    createdAt: '2026-09-02T10:00:00Z',
  },
]

function renderSwitcher(onCreate: (name: string, slug?: string) => Promise<void> = vi.fn()) {
  const props = {
    workspaces,
    current: workspaces[0],
    collapsed: false,
    onSelect: vi.fn(),
    onCreate,
  }
  const view = render(<WorkspaceSwitcher {...props} />)
  return { ...props, ...view }
}

describe('WorkspaceSwitcher', () => {
  it('shouldDisplayCurrentWorkspace', () => {
    renderSwitcher()

    expect(screen.getByRole('button', { name: 'Changer de workspace' })).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
  })

  it('shouldCallOnSelectWhenWorkspaceChosen', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderSwitcher()

    await user.click(screen.getByRole('button', { name: 'Changer de workspace' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Frontend' }))

    expect(onSelect).toHaveBeenCalledWith('ws-2')
  })

  it('shouldCallOnCreateWhenDialogSubmitted', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderSwitcher()

    await user.click(screen.getByRole('button', { name: 'Changer de workspace' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Nouveau workspace' }))
    expect(
      await screen.findByRole('heading', { name: 'Créer un workspace' }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nom'), 'Data Platform')
    await user.type(screen.getByLabelText('Slug (optionnel)'), 'data-platform')
    await user.click(screen.getByRole('button', { name: 'Créer' }))

    await screen.findByRole('button', { name: 'Changer de workspace' })
    expect(onCreate).toHaveBeenCalledWith('Data Platform', 'data-platform')
  })
})
