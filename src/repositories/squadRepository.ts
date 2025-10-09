import { ulid } from 'ulid'
import type { Squad, Group, Person } from '@/types/domain'
import { storage } from './storage'

const SQUADS_KEY = 'squads'
const OLD_PARCHES_KEY = 'parches' // For migration

export class SquadRepository {
  constructor() {
    this.migrateFromParches()
  }

  private migrateFromParches(): void {
    // Check if old data exists and new data doesn't
    const oldData = storage.get<Squad[]>(OLD_PARCHES_KEY)
    const newData = storage.get<Squad[]>(SQUADS_KEY)
    
    if (oldData && !newData) {
      // Migrate old data to new key
      storage.set(SQUADS_KEY, oldData)
      storage.remove(OLD_PARCHES_KEY)
      console.log('Migrated data from "parches" to "squads"')
    }
  }

  private getAll(): Squad[] {
    return storage.get<Squad[]>(SQUADS_KEY) || []
  }

  private saveAll(squads: Squad[]): void {
    storage.set(SQUADS_KEY, squads)
  }

  findAll(): Squad[] {
    return this.getAll()
  }

  findById(id: string): Squad | null {
    const squads = this.getAll()
    return squads.find((p) => p.id === id) || null
  }

  findByName(name: string): Squad | null {
    const squads = this.getAll()
    return squads.find((p) => p.name === name) || null
  }

  create(name: string): Squad {
    const squads = this.getAll()

    // Check for duplicate name
    if (squads.some((p) => p.name === name)) {
      throw new Error(`Squad with name "${name}" already exists`)
    }

    const newSquad: Squad = {
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

    squads.push(newSquad)
    this.saveAll(squads)
    return newSquad
  }

  update(id: string, updates: Partial<Omit<Squad, 'id'>>): Squad {
    const squads = this.getAll()
    const index = squads.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error(`Squad with id "${id}" not found`)
    }

    const currentSquad = squads[index]
    if (!currentSquad) {
      throw new Error(`Squad with id "${id}" not found`)
    }
    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== currentSquad.name) {
      if (squads.some((p) => p.name === updates.name)) {
        throw new Error(`Squad with name "${updates.name}" already exists`)
      }
    }

    const updated = { ...currentSquad, ...updates } as Squad
    squads[index] = updated
    this.saveAll(squads)
    return updated
  }

  delete(id: string): void {
    const squads = this.getAll()
    const filtered = squads.filter((p) => p.id !== id)

    if (filtered.length === squads.length) {
      throw new Error(`Squad with id "${id}" not found`)
    }

    this.saveAll(filtered)
  }

  duplicate(id: string, newName: string): Squad {
    const original = this.findById(id)
    if (!original) {
      throw new Error(`Squad with id "${id}" not found`)
    }

    const squads = this.getAll()
    if (squads.some((p) => p.name === newName)) {
      throw new Error(`Squad with name "${newName}" already exists`)
    }

    // Deep clone groups and people, but not bills
    const newSquad: Squad = {
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

    squads.push(newSquad)
    this.saveAll(squads)
    return newSquad
  }

  // Group operations
  addGroup(squadId: string, name: string, color: string): Group {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    if (squad.groups.some((g) => g.name === name)) {
      throw new Error(`Group with name "${name}" already exists in this squad`)
    }

    const newGroup: Group = {
      id: ulid(),
      name,
      color,
      people: [],
    }

    squad.groups.push(newGroup)
    this.update(squadId, { groups: squad.groups })
    return newGroup
  }

  updateGroup(
    squadId: string,
    groupId: string,
    updates: Partial<Omit<Group, 'id' | 'people'>>,
  ): Group {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    const groupIndex = squad.groups.findIndex((g) => g.id === groupId)
    if (groupIndex === -1) {
      throw new Error(`Group with id "${groupId}" not found`)
    }

    const currentGroup = squad.groups[groupIndex]
    if (!currentGroup) {
      throw new Error(`Group with id "${groupId}" not found`)
    }
    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== currentGroup.name) {
      if (squad.groups.some((g) => g.name === updates.name)) {
        throw new Error(`Group with name "${updates.name}" already exists in this squad`)
      }
    }

    const updated = { ...currentGroup, ...updates } as Group
    squad.groups[groupIndex] = updated
    this.update(squadId, { groups: squad.groups })
    return updated
  }

  deleteGroup(squadId: string, groupId: string): void {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    if (squad.groups.length === 1) {
      throw new Error('Cannot delete the last group in a squad')
    }

    const filtered = squad.groups.filter((g) => g.id !== groupId)
    if (filtered.length === squad.groups.length) {
      throw new Error(`Group with id "${groupId}" not found`)
    }

    this.update(squadId, { groups: filtered })
  }

  // Person operations
  addPerson(squadId: string, groupId: string, name: string): Person {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    // Check if person name already exists in squad (across all groups)
    const allPeople = squad.groups.flatMap((g) => g.people)
    if (allPeople.some((p) => p.name === name)) {
      throw new Error(`Person with name "${name}" already exists in this squad`)
    }

    const group = squad.groups.find((g) => g.id === groupId)
    if (!group) {
      throw new Error(`Group with id "${groupId}" not found`)
    }

    const newPerson: Person = {
      id: ulid(),
      name,
      active: true,
    }

    group.people.push(newPerson)
    this.update(squadId, { groups: squad.groups })
    return newPerson
  }

  updatePerson(squadId: string, personId: string, updates: Partial<Omit<Person, 'id'>>): Person {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    let person: Person | undefined
    let groupIndex = -1

    for (let i = 0; i < squad.groups.length; i++) {
      const group = squad.groups[i]
      if (!group) continue
      const personIndex = group.people.findIndex((p) => p.id === personId)
      if (personIndex !== -1) {
        person = group.people[personIndex]
        groupIndex = i
        break
      }
    }

    if (!person || groupIndex === -1) {
      throw new Error(`Person with id "${personId}" not found`)
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== person.name) {
      const allPeople = squad.groups.flatMap((g) => g.people)
      if (allPeople.some((p) => p.name === updates.name)) {
        throw new Error(`Person with name "${updates.name}" already exists in this squad`)
      }
    }

    const group = squad.groups[groupIndex]
    if (!group) {
      throw new Error(`Group not found`)
    }
    const personIndex = group.people.findIndex((p) => p.id === personId)
    const updated = { ...person, ...updates } as Person
    group.people[personIndex] = updated
    this.update(squadId, { groups: squad.groups })
    return updated
  }

  deletePerson(squadId: string, personId: string): void {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    let found = false
    for (const group of squad.groups) {
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

    this.update(squadId, { groups: squad.groups })
  }

  movePerson(squadId: string, personId: string, targetGroupId: string): void {
    const squad = this.findById(squadId)
    if (!squad) {
      throw new Error(`Squad with id "${squadId}" not found`)
    }

    const targetGroup = squad.groups.find((g) => g.id === targetGroupId)
    if (!targetGroup) {
      throw new Error(`Target group with id "${targetGroupId}" not found`)
    }

    let person: Person | undefined
    for (const group of squad.groups) {
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
    this.update(squadId, { groups: squad.groups })
  }

  // Utility methods
  getActivePeople(squadId: string): Person[] {
    const squad = this.findById(squadId)
    if (!squad) {
      return []
    }
    return squad.groups.flatMap((g) => g.people).filter((p) => p.active)
  }

  getAllPeople(squadId: string): Person[] {
    const squad = this.findById(squadId)
    if (!squad) {
      return []
    }
    return squad.groups.flatMap((g) => g.people)
  }

  exportData(): string {
    const squads = this.getAll()
    return JSON.stringify(squads, null, 2)
  }

  importData(jsonData: string): void {
    try {
      const squads = JSON.parse(jsonData) as Squad[]
      // Basic validation
      if (!Array.isArray(squads)) {
        throw new Error('Invalid data format')
      }
      this.saveAll(squads)
    } catch (error) {
      throw new Error(`Failed to import data: ${error}`)
    }
  }
}

export const squadRepository = new SquadRepository()
