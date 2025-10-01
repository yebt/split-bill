import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Parche, Group, Person } from '@/types/domain'
import { parcheRepository } from '@/repositories/parcheRepository'

export const useParcheStore = defineStore('parche', () => {
  // State
  const parches = ref<Parche[]>([])
  const currentParcheId = ref<string | null>(null)

  // Computed
  const currentParche = computed(() => {
    if (!currentParcheId.value) return null
    return parches.value.find((p) => p.id === currentParcheId.value) || null
  })

  const currentParcheActivePeople = computed(() => {
    if (!currentParcheId.value) return []
    return parcheRepository.getActivePeople(currentParcheId.value)
  })

  const currentParcheAllPeople = computed(() => {
    if (!currentParcheId.value) return []
    return parcheRepository.getAllPeople(currentParcheId.value)
  })

  const currentParcheStats = computed(() => {
    if (!currentParche.value) {
      return { totalPeople: 0, activePeople: 0, groupCount: 0 }
    }
    const allPeople = currentParche.value.groups.flatMap((g) => g.people)
    return {
      totalPeople: allPeople.length,
      activePeople: allPeople.filter((p) => p.active).length,
      groupCount: currentParche.value.groups.length,
    }
  })

  // Actions
  function loadParches() {
    parches.value = parcheRepository.findAll()
  }

  function setCurrentParche(id: string | null) {
    currentParcheId.value = id
  }

  function createParche(name: string): Parche {
    const parche = parcheRepository.create(name)
    loadParches()
    return parche
  }

  function updateParche(id: string, updates: Partial<Omit<Parche, 'id'>>) {
    parcheRepository.update(id, updates)
    loadParches()
  }

  function deleteParche(id: string) {
    parcheRepository.delete(id)
    if (currentParcheId.value === id) {
      currentParcheId.value = null
    }
    loadParches()
  }

  function duplicateParche(id: string, newName: string): Parche {
    const parche = parcheRepository.duplicate(id, newName)
    loadParches()
    return parche
  }

  // Group actions
  function addGroup(parcheId: string, name: string, color: string): Group {
    const group = parcheRepository.addGroup(parcheId, name, color)
    loadParches()
    return group
  }

  function updateGroup(
    parcheId: string,
    groupId: string,
    updates: Partial<Omit<Group, 'id' | 'people'>>,
  ) {
    parcheRepository.updateGroup(parcheId, groupId, updates)
    loadParches()
  }

  function deleteGroup(parcheId: string, groupId: string) {
    parcheRepository.deleteGroup(parcheId, groupId)
    loadParches()
  }

  // Person actions
  function addPerson(parcheId: string, groupId: string, name: string): Person {
    const person = parcheRepository.addPerson(parcheId, groupId, name)
    loadParches()
    return person
  }

  function updatePerson(parcheId: string, personId: string, updates: Partial<Omit<Person, 'id'>>) {
    parcheRepository.updatePerson(parcheId, personId, updates)
    loadParches()
  }

  function deletePerson(parcheId: string, personId: string) {
    parcheRepository.deletePerson(parcheId, personId)
    loadParches()
  }

  function movePerson(parcheId: string, personId: string, targetGroupId: string) {
    parcheRepository.movePerson(parcheId, personId, targetGroupId)
    loadParches()
  }

  function togglePersonActive(parcheId: string, personId: string) {
    const allPeople = parcheRepository.getAllPeople(parcheId)
    const person = allPeople.find((p) => p.id === personId)
    if (person) {
      parcheRepository.updatePerson(parcheId, personId, { active: !person.active })
      loadParches()
    }
  }

  // Import/Export
  function exportData(): string {
    return parcheRepository.exportData()
  }

  function importData(jsonData: string) {
    parcheRepository.importData(jsonData)
    loadParches()
    currentParcheId.value = null
  }

  // Initialize
  loadParches()

  return {
    // State
    parches,
    currentParcheId,
    // Computed
    currentParche,
    currentParcheActivePeople,
    currentParcheAllPeople,
    currentParcheStats,
    // Actions
    loadParches,
    setCurrentParche,
    createParche,
    updateParche,
    deleteParche,
    duplicateParche,
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
