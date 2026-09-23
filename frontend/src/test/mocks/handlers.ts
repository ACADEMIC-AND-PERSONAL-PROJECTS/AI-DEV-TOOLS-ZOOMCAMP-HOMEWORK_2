import { http, HttpResponse } from 'msw'
import type { ProblemDetail } from '@/types'

const API_URL = 'http://localhost:8080/api/v1'

const user = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'ada@techblocks.dev',
  fullName: 'Ada Developer',
  avatarUrl: null,
  createdAt: '2026-09-01T10:00:00Z',
}

const workspaces = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Backend',
    slug: 'backend',
    ownerId: user.id,
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Frontend',
    slug: 'frontend',
    ownerId: user.id,
    createdAt: '2026-09-02T10:00:00Z',
  },
]

const documentDetail = {
  id: '55555555-5555-5555-5555-555555555555',
  workspaceId: '22222222-2222-2222-2222-222222222222',
  parentId: '44444444-4444-4444-4444-444444444444',
  title: 'Architecture',
  icon: '🏗️',
  position: 0,
  createdAt: '2026-09-11T10:00:00Z',
  updatedAt: '2026-09-12T10:00:00Z',
  blocks: [
    {
      id: 'aaaa0001-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      type: 'MARKDOWN',
      content: { text: '# Vue globale\n\nArchitecture **monorepo**.' },
      position: 0,
      createdAt: '2026-09-11T10:00:00Z',
      updatedAt: '2026-09-11T10:00:00Z',
    },
    {
      id: 'aaaa0002-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      type: 'CODE',
      content: {
        language: 'typescript',
        code: 'const app = "TechBlocks"',
        showLineNumbers: true,
        fileName: 'main.ts',
      },
      position: 1,
      createdAt: '2026-09-11T10:05:00Z',
      updatedAt: '2026-09-11T10:05:00Z',
    },
    {
      id: 'aaaa0003-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      type: 'API_ENDPOINT',
      content: {
        method: 'GET',
        endpoint: '/api/v1/workspaces',
        summary: 'Liste les workspaces',
        headers: [{ key: 'Authorization', value: 'Bearer <token>' }],
        requestBody: '',
        responseExample: '{"items": []}',
      },
      position: 2,
      createdAt: '2026-09-11T10:10:00Z',
      updatedAt: '2026-09-11T10:10:00Z',
    },
    {
      id: 'aaaa0004-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      type: 'CALLOUT',
      content: { variant: 'INFO', title: 'À savoir', message: 'Le JWT expire après 24h.' },
      position: 3,
      createdAt: '2026-09-11T10:15:00Z',
      updatedAt: '2026-09-11T10:15:00Z',
    },
  ],
}

const documentTree = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    parentId: null,
    title: 'Onboarding',
    icon: '🚀',
    position: 0,
    updatedAt: '2026-09-10T10:00:00Z',
    children: [
      {
        id: '55555555-5555-5555-5555-555555555555',
        parentId: '44444444-4444-4444-4444-444444444444',
        title: 'Architecture',
        icon: '🏗️',
        position: 0,
        updatedAt: '2026-09-11T10:00:00Z',
        children: [],
      },
    ],
  },
]

function problem(status: number, detail: string): HttpResponse {
  const body: ProblemDetail = { status, detail }
  return HttpResponse.json(body, { status })
}

export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email === user.email && body.password === 'password123') {
      return HttpResponse.json({ token: 'fake-jwt-token', user }, { status: 200 })
    }
    return problem(401, 'Identifiants invalides')
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; fullName: string }
    if (body.password.length < 8) {
      return problem(400, 'Le mot de passe doit contenir au moins 8 caractères')
    }
    return HttpResponse.json(
      {
        token: 'fake-jwt-token',
        user: { ...user, email: body.email, fullName: body.fullName },
      },
      { status: 201 },
    )
  }),

  http.get(`${API_URL}/workspaces`, () => HttpResponse.json(workspaces)),

  http.post(`${API_URL}/workspaces`, async ({ request }) => {
    const body = (await request.json()) as { name: string; slug?: string }
    return HttpResponse.json(
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: body.name,
        slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-'),
        ownerId: user.id,
        createdAt: '2026-09-20T10:00:00Z',
      },
      { status: 201 },
    )
  }),

  http.get(`${API_URL}/workspaces/:workspaceId/documents`, () =>
    HttpResponse.json(documentTree),
  ),

  http.get(`${API_URL}/documents/:documentId`, () => HttpResponse.json(documentDetail)),

  http.put(`${API_URL}/documents/:documentId`, async ({ request }) => {
    const body = (await request.json()) as { title?: string; icon?: string }
    return HttpResponse.json({
      ...documentDetail,
      title: body.title ?? documentDetail.title,
      icon: body.icon ?? documentDetail.icon,
      updatedAt: '2026-09-23T10:00:00Z',
    })
  }),

  http.post(`${API_URL}/workspaces/:workspaceId/documents`, async ({ request }) => {
    const body = (await request.json()) as { title?: string }
    return HttpResponse.json(
      {
        id: '77777777-7777-7777-7777-777777777777',
        workspaceId: '22222222-2222-2222-2222-222222222222',
        parentId: null,
        title: body.title ?? 'Document sans titre',
        icon: '📄',
        position: 0,
        createdAt: '2026-09-20T10:00:00Z',
        updatedAt: '2026-09-20T10:00:00Z',
        blocks: [],
      },
      { status: 201 },
    )
  }),
]
