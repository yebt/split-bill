import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Squad, Group, Person } from '@/types/domain'
import { squadRepository } from '@/repositories/squadRepository'

export const useSquadStore = defineStore('squad', () => {
  // State
  const squads = ref<Squad[]>([])
  const currentSquadId = ref<string | null>(null)

  // Computed
  const currentSquad = computed(() => {
    if (!currentSquadId.value) return null
    return squads.value.find((p) => p.id === currentSquadId.value) || null
  })

  const currentSquadActivePeople = computed(() => {
    if (!currentSquadId.value) return []
    return squadRepository.getActivePeople(currentSquadId.value)
  })

  const currentSquadAllPeople = computed(() => {
    if (!currentSquadId.value) return []
    return squadRepository.getAllPeople(currentSquadId.value)
  })

  const currentSquadStats = computed(() => {
    if (!currentSquad.value) {
      return { totalPeople: 0, activePeople: 0, groupCount: 0 }
    }
    const allPeople = currentSquad.value.groups.flatMap((g) => g.people)
    return {
      totalPeople: allPeople.length,
      activePeople: allPeople.filter((p) => p.active).length,
      groupCount: currentSquad.value.groups.length,
    }
  })

  // Actions
  function loadSquads() {
    squads.value = squadRepository.findAll()
  }

  function setCurrentSquad(id: string | null) {
    currentSquadId.value = id
  }

  function createSquad(name: string): Squad {
    const squad = squadRepository.create(name)
    loadSquads()
    return squad
  }

  function updateSquad(id: string, updates: Partial<Omit<Squad, 'id'>>) {
    squadRepository.update(id, updates)
    loadSquads()
  }

  function deleteSquad(id: string) {
    squadRepository.delete(id)
    if (currentSquadId.value === id) {
      currentSquadId.value = null
    }
    loadSquads()
  }

  function duplicateSquad(id: string, newName: string): Squad {
    const squad = squadRepository.duplicate(id, newName)
    loadSquads()
    return squad
  }

  // Group actions
  function addGroup(squadId: string, name: string, color: string): Group {
    const group = squadRepository.addGroup(squadId, name, color)
    loadSquads()
    return group
  }

  function updateGroup(
    squadId: string,
    groupId: string,
    updates: Partial<Omit<Group, 'id' | 'people'>>,
  ) {
    squadRepository.updateGroup(squadId, groupId, updates)
    loadSquads()
  }

  function deleteGroup(squadId: string, groupId: string) {
    squadRepository.deleteGroup(squadId, groupId)
    loadSquads()
  }

  // Person actions
  function addPerson(squadId: string, groupId: string, name: string): Person {
    const person = squadRepository.addPerson(squadId, groupId, name)
    loadSquads()
    return person
  }

  function updatePerson(squadId: string, personId: string, updates: Partial<Omit<Person, 'id'>>) {
    squadRepository.updatePerson(squadId, personId, updates)
    loadSquads()
  }

  function deletePerson(squadId: string, personId: string) {
    squadRepository.deletePerson(squadId, personId)
    loadSquads()
  }

  function movePerson(squadId: string, personId: string, targetGroupId: string) {
    squadRepository.movePerson(squadId, personId, targetGroupId)
    loadSquads()
  }

  function togglePersonActive(squadId: string, personId: string) {
    const allPeople = squadRepository.getAllPeople(squadId)
    const person = allPeople.find((p) => p.id === personId)
    if (person) {
      squadRepository.updatePerson(squadId, personId, { active: !person.active })
      loadSquads()
    }
  }

  // Import/Export
  function exportData(): string {
    return squadRepository.exportData()
  }

  function importData(jsonData: string) {
    squadRepository.importData(jsonData)
    loadSquads()
    currentSquadId.value = null
  }

  // Initialize
  loadSquads()

  return {
    // State
    squads,
    currentSquadId,
    // Computed
    currentSquad,
    currentSquadActivePeople,
    currentSquadAllPeople,
    currentSquadStats,
    // Actions
    loadSquads,
    setCurrentSquad,
    createSquad,
    updateSquad,
    deleteSquad,
    duplicateSquad,
    addGroup,
    updateGroup,
    deleteGroup,
    addPerson,
    updatePerson,
    deletePerson,
    movePerson,
    togglePersonActive,
    exportData,
    importData,
  }
})
