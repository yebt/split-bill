import { ulid } from 'ulid'
import type { Parche, Group, Person } from '@/types/domain'
import { storage } from './storage'

const PARCHES_KEY = 'parches'

export class ParcheRepository {
  private getAll(): Parche[] {
    return storage.get<Parche[]>(PARCHES_KEY) || []
  }

  private saveAll(parches: Parche[]): void {
    storage.set(PARCHES_KEY, parches)
  }

  findAll(): Parche[] {
    return this.getAll()
  }

  findById(id: string): Parche | null {
    const parches = this.getAll()
    return parches.find((p) => p.id === id) || null
  }

  findByName(name: string): Parche | null {
    const parches = this.getAll()
    return parches.find((p) => p.name === name) || null
  }

  create(name: string): Parche {
    const parches = this.getAll()

    // Check for duplicate name
    if (parches.some((p) => p.name === name)) {
      throw new Error(`Parche with name "${name}" already exists`)
    }

    const newParche: Parche = {
      id: ulid(),
      name,
      groups: [
        {
          id: ulid(),
          name: 'Default',
          color: '#3b82f6',
          people: [],
        },
      ],
      bills: [],
    }

    parches.push(newParche)
    this.saveAll(parches)
    return newParche
  }

  update(id: string, updates: Partial<Omit<Parche, 'id'>>): Parche {
    const parches = this.getAll()
    const index = parches.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error(`Parche with id "${id}" not found`)
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== parches[index].name) {
      if (parches.some((p) => p.name === updates.name)) {
        throw new Error(`Parche with name "${updates.name}" already exists`)
      }
    }

    const updated: Parche = { ...parches[index], ...updates }
    parches[index] = updated
    this.saveAll(parches)
    return updated
  }

  delete(id: string): void {
    const parches = this.getAll()
    const filtered = parches.filter((p) => p.id !== id)

    if (filtered.length === parches.length) {
      throw new Error(`Parche with id "${id}" not found`)
    }

    this.saveAll(filtered)
  }

  duplicate(id: string, newName: string): Parche {
    const original = this.findById(id)
    if (!original) {
      throw new Error(`Parche with id "${id}" not found`)
    }

    const parches = this.getAll()
    if (parches.some((p) => p.name === newName)) {
      throw new Error(`Parche with name "${newName}" already exists`)
    }

    // Deep clone groups and people, but not bills
    const newParche: Parche = {
      id: ulid(),
      name: newName,
      groups: original.groups.map((group) => ({
        id: ulid(),
        name: group.name,
        color: group.color,
        people: group.people.map((person) => ({
          id: ulid(),
          name: person.name,
          active: person.active,
        })),
      })),
      bills: [], // Don't copy bills
    }

    parches.push(newParche)
    this.saveAll(parches)
    return newParche
  }

  // Group operations
  addGroup(parcheId: string, name: string, color: string): Group {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    if (parche.groups.some((g) => g.name === name)) {
      throw new Error(`Group with name "${name}" already exists in this parche`)
    }

    const newGroup: Group = {
      id: ulid(),
      name,
      color,
      people: [],
    }

    parche.groups.push(newGroup)
    this.update(parcheId, { groups: parche.groups })
    return newGroup
  }

  updateGroup(parcheId: string, groupId: string, updates: Partial<Omit<Group, 'id' | 'people'>>): Group {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    const groupIndex = parche.groups.findIndex((g) => g.id === groupId)
    if (groupIndex === -1) {
      throw new Error(`Group with id "${groupId}" not found`)
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== parche.groups[groupIndex].name) {
      if (parche.groups.some((g) => g.name === updates.name)) {
        throw new Error(`Group with name "${updates.name}" already exists in this parche`)
      }
    }

    const updated: Group = { ...parche.groups[groupIndex], ...updates }
    parche.groups[groupIndex] = updated
    this.update(parcheId, { groups: parche.groups })
    return updated
  }

  deleteGroup(parcheId: string, groupId: string): void {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    if (parche.groups.length === 1) {
      throw new Error('Cannot delete the last group in a parche')
    }

    const filtered = parche.groups.filter((g) => g.id !== groupId)
    if (filtered.length === parche.groups.length) {
      throw new Error(`Group with id "${groupId}" not found`)
    }

    this.update(parcheId, { groups: filtered })
  }

  // Person operations
  addPerson(parcheId: string, groupId: string, name: string): Person {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    // Check if person name already exists in parche (across all groups)
    const allPeople = parche.groups.flatMap((g) => g.people)
    if (allPeople.some((p) => p.name === name)) {
      throw new Error(`Person with name "${name}" already exists in this parche`)
    }

    const group = parche.groups.find((g) => g.id === groupId)
    if (!group) {
      throw new Error(`Group with id "${groupId}" not found`)
    }

    const newPerson: Person = {
      id: ulid(),
      name,
      active: true,
    }

    group.people.push(newPerson)
    this.update(parcheId, { groups: parche.groups })
    return newPerson
  }

  updatePerson(parcheId: string, personId: string, updates: Partial<Omit<Person, 'id'>>): Person {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    let person: Person | undefined
    let groupIndex = -1

    for (let i = 0; i < parche.groups.length; i++) {
      const personIndex = parche.groups[i].people.findIndex((p) => p.id === personId)
      if (personIndex !== -1) {
        person = parche.groups[i].people[personIndex]
        groupIndex = i
        break
      }
    }

    if (!person || groupIndex === -1) {
      throw new Error(`Person with id "${personId}" not found`)
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== person.name) {
      const allPeople = parche.groups.flatMap((g) => g.people)
      if (allPeople.some((p) => p.name === updates.name)) {
        throw new Error(`Person with name "${updates.name}" already exists in this parche`)
      }
    }

    const personIndex = parche.groups[groupIndex].people.findIndex((p) => p.id === personId)
    const updated: Person = { ...person, ...updates }
    parche.groups[groupIndex].people[personIndex] = updated
    this.update(parcheId, { groups: parche.groups })
    return updated
  }

  deletePerson(parcheId: string, personId: string): void {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    let found = false
    for (const group of parche.groups) {
      const filtered = group.people.filter((p) => p.id !== personId)
      if (filtered.length !== group.people.length) {
        group.people = filtered
        found = true
        break
      }
    }

    if (!found) {
      throw new Error(`Person with id "${personId}" not found`)
    }

    this.update(parcheId, { groups: parche.groups })
  }

  movePerson(parcheId: string, personId: string, targetGroupId: string): void {
    const parche = this.findById(parcheId)
    if (!parche) {
      throw new Error(`Parche with id "${parcheId}" not found`)
    }

    const targetGroup = parche.groups.find((g) => g.id === targetGroupId)
    if (!targetGroup) {
      throw new Error(`Target group with id "${targetGroupId}" not found`)
    }

    let person: Person | undefined
    for (const group of parche.groups) {
      const personIndex = group.people.findIndex((p) => p.id === personId)
      if (personIndex !== -1) {
        person = group.people[personIndex]
        group.people.splice(personIndex, 1)
        break
      }
    }

    if (!person) {
      throw new Error(`Person with id "${personId}" not found`)
    }

    targetGroup.people.push(person)
    this.update(parcheId, { groups: parche.groups })
  }

  // Utility methods
  getActivePeople(parcheId: string): Person[] {
    const parche = this.findById(parcheId)
    if (!parche) {
      return []
    }
    return parche.groups.flatMap((g) => g.people).filter((p) => p.active)
  }

  getAllPeople(parcheId: string): Person[] {
    const parche = this.findById(parcheId)
    if (!parche) {
      return []
    }
    return parche.groups.flatMap((g) => g.people)
  }

  exportData(): string {
    const parches = this.getAll()
    return JSON.stringify(parches, null, 2)
  }

  importData(jsonData: string): void {
    try {
      const parches = JSON.parse(jsonData) as Parche[]
      // Basic validation
      if (!Array.isArray(parches)) {
        throw new Error('Invalid data format')
      }
      this.saveAll(parches)
    } catch (error) {
      throw new Error(`Failed to import data: ${error}`)
    }
  }
}

export const parcheRepository = new ParcheRepository()
