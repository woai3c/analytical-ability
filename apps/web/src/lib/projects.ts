import { type Project, projectSchema } from '@clarity/domain'

const projectsKey = 'analysis-projects-v1'

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(projectsKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const result = projectSchema.safeParse(item)
      return result.success ? [result.data] : []
    })
  } catch {
    return []
  }
}

function writeAll(projects: Project[]) {
  localStorage.setItem(projectsKey, JSON.stringify(projects))
}

export function listProjects(): Project[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getProject(id: string): Project | null {
  return readAll().find((project) => project.id === id) ?? null
}

/** 新建或覆盖同 id 项目，返回保存后的项目。 */
export function saveProject(project: Omit<Project, 'updatedAt'>): Project {
  const saved: Project = { ...project, updatedAt: new Date().toISOString() }
  const rest = readAll().filter((item) => item.id !== saved.id)
  writeAll([saved, ...rest])
  return saved
}

export function deleteProject(id: string) {
  writeAll(readAll().filter((project) => project.id !== id))
}

export function createProjectId(): string {
  return `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
