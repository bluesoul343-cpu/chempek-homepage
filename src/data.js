import { loadContent } from './content'
export let content = loadContent()
export let { company, images, projects, services, faqs, hero, about } = content

export function refreshContent() {
  content = loadContent()
  ;({ company, images, projects, services, faqs, hero, about } = content)
}
