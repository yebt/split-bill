<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useParcheStore } from '@/stores/parcheStore'
import { useBillStore } from '@/stores/billStore'
import { useThemeStore } from '@/stores/themeStore'
import { getRandomUnusedColor, type Group } from '@/types/domain'
import { capitalizeWords } from '@/utils/text'
import { formatCurrency } from '@/utils/currency'
import BaseButton from '@/components/BaseButton.vue'
import BaseCard from '@/components/BaseCard.vue'
import BaseAccordion from '@/components/BaseAccordion.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseInput from '@/components/BaseInput.vue'
import ColorPicker from '@/components/ColorPicker.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const route = useRoute()
const parcheStore = useParcheStore()
const billStore = useBillStore()
const themeStore = useThemeStore()

const activeTab = ref<'people' | 'bills' | 'summary'>('people')

// Group accordion state
const groupExpandedState = ref<Record<string, boolean>>({})

// Group modals
const showAddGroupModal = ref(false)
const showEditGroupModal = ref(false)
const newGroupName = ref('')
const newGroupColor = ref('')
const editGroupName = ref('')
const editGroupColor = ref('')
const selectedGroupId = ref<string | null>(null)
const groupError = ref('')
const showDeleteGroupConfirm = ref(false)

// Person modals
const showAddPersonModal = ref(false)
const showEditPersonModal = ref(false)
const showMovePersonModal = ref(false)
const newPersonName = ref('')
const editPersonName = ref('')
const selectedPersonId = ref<string | null>(null)
const personError = ref('')
const showDeletePersonConfirm = ref(false)

const parche = computed(() => parcheStore.currentParche)

const sortedBills = computed(() => {
  if (!parche.value) return []
  return [...parche.value.bills].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

const parcheTotals = computed(() => {
  if (!parche.value) return new Map()
  return billStore.getParcheTotals(parche.value.id)
})

const totalAmount = computed(() => {
  let sum = 0
  parcheTotals.value.forEach((amount) => {
    sum += amount
  })
  return sum
})

// Initialize parche
const id = route.params.id as string
parcheStore.setCurrentParche(id)
// Initialize all groups as expanded
if (parche.value) {
  parche.value.groups.forEach((group) => {
    groupExpandedState.value[group.id] = true
  })
}

// onMounted(() => {
//   // const id = route.params.id as string
//   // parcheStore.setCurrentParche(id)

//   // Initialize all groups as expanded
//   if (parche.value) {
//     parche.value.groups.forEach((group) => {
//       groupExpandedState.value[group.id] = true
//     })
//   }
// })

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Group accordion functions
function expandAllGroups() {
  if (!parche.value) return
  parche.value.groups.forEach((group) => {
    groupExpandedState.value[group.id] = true
  })
}

function collapseAllGroups() {
  if (!parche.value) return
  parche.value.groups.forEach((group) => {
    groupExpandedState.value[group.id] = false
  })
}

// Group functions
function handleAddGroup() {
  if (!parche.value) return
  groupError.value = ''

  // Validate group name
  const trimmedName = newGroupName.value.trim()
  if (!trimmedName) {
    groupError.value = 'Group name is required'
    return
  }

  // Capitalize group name
  const capitalizedName = capitalizeWords(trimmedName)

  // Get random unused color
  const usedColors = parche.value.groups.map((g) => g.color)
  const color = newGroupColor.value || getRandomUnusedColor(usedColors)

  try {
    const newGroup = parcheStore.addGroup(parche.value.id, capitalizedName, color)
    // Set new group as expanded
    groupExpandedState.value[newGroup.id] = true
    showAddGroupModal.value = false
    newGroupName.value = ''
    newGroupColor.value = ''
  } catch (error) {
    groupError.value = error instanceof Error ? error.message : 'Failed to add group'
  }
}

function openEditGroup(groupId: string) {
  if (!parche.value) return
  const group = parche.value.groups.find((g) => g.id === groupId)
  if (group) {
    selectedGroupId.value = groupId
    editGroupName.value = group.name
    editGroupColor.value = group.color
    groupError.value = ''
    showEditGroupModal.value = true
  }
}

function handleEditGroup() {
  if (!parche.value || !selectedGroupId.value) return
  groupError.value = ''

  // Validate group name
  const trimmedName = editGroupName.value.trim()
  if (!trimmedName) {
    groupError.value = 'Group name is required'
    return
  }

  // Capitalize group name
  const capitalizedName = capitalizeWords(trimmedName)

  try {
    parcheStore.updateGroup(parche.value.id, selectedGroupId.value, {
      name: capitalizedName,
      color: editGroupColor.value,
    })
    showEditGroupModal.value = false
  } catch (error) {
    groupError.value = error instanceof Error ? error.message : 'Failed to update group'
  }
}

function confirmDeleteGroup(groupId: string) {
  selectedGroupId.value = groupId
  showDeleteGroupConfirm.value = true
}

function handleDeleteGroup() {
  if (!parche.value || !selectedGroupId.value) return
  parcheStore.deleteGroup(parche.value.id, selectedGroupId.value)
  selectedGroupId.value = null
}

// Person functions
function openAddPerson(groupId: string) {
  selectedGroupId.value = groupId
  newPersonName.value = ''
  personError.value = ''
  showAddPersonModal.value = true
}

function handleAddPerson() {
  if (!parche.value || !selectedGroupId.value) return
  personError.value = ''

  // Capitalize person name
  const capitalizedName = capitalizeWords(newPersonName.value)

  try {
    parcheStore.addPerson(parche.value.id, selectedGroupId.value, capitalizedName)
    showAddPersonModal.value = false
    newPersonName.value = ''
  } catch (error) {
    personError.value = error instanceof Error ? error.message : 'Failed to add person'
  }
}

function openEditPerson(personId: string) {
  if (!parche.value) return
  const person = parche.value.groups.flatMap((g) => g.people).find((p) => p.id === personId)
  if (person) {
    selectedPersonId.value = personId
    editPersonName.value = person.name
    showEditPersonModal.value = true
  }
}

function handleEditPerson() {
  if (!parche.value || !selectedPersonId.value) return
  personError.value = ''

  // Capitalize person name
  const capitalizedName = capitalizeWords(editPersonName.value)

  try {
    parcheStore.updatePerson(parche.value.id, selectedPersonId.value, {
      name: capitalizedName,
    })
    showEditPersonModal.value = false
  } catch (error) {
    personError.value = error instanceof Error ? error.message : 'Failed to update person'
  }
}

function openMovePerson(personId: string, groupId: string) {
  selectedPersonId.value = personId
  selectedGroupId.value = groupId
  showMovePersonModal.value = true
}

function handleMovePerson(targetGroupId: string) {
  if (!parche.value || !selectedPersonId.value) return
  parcheStore.movePerson(parche.value.id, selectedPersonId.value, targetGroupId)
  showMovePersonModal.value = false
}

function confirmDeletePerson(personId: string) {
  selectedPersonId.value = personId
  showDeletePersonConfirm.value = true
}

function handleDeletePerson() {
  if (!parche.value || !selectedPersonId.value) return
  parcheStore.deletePerson(parche.value.id, selectedPersonId.value)
  selectedPersonId.value = null
}

function shareAsText() {
  if (!parche.value) return

  let text = `💰 ${parche.value.name} - Expense Summary\n\n`

  parcheStore.currentParcheAllPeople.forEach((person) => {
    const amount = parcheTotals.value.get(person.id) || 0
    text += `${person.name}: ${formatCurrency(amount)}\n`
  })

  text += `\n📊 Total: ${formatCurrency(totalAmount.value)}`

  if (navigator.share) {
    navigator.share({ text })
  } else {
    navigator.clipboard.writeText(text)
    alert('Summary copied to clipboard!')
  }
}
</script>

<template>
  <div v-if="parche" class="min-h-screen">
    <!-- Header -->
    <header
      class="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto max-w-7xl px-4 py-4">
        <div class="mb-3 flex items-center gap-3">
          <button
            class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            @click="router.push('/')"
          >
            <div class="i-lucide-arrow-left text-2xl" />
          </button>
          <h1 class="flex-1 text-2xl font-bold">
            {{ parche.name }}
          </h1>
          <BaseButton variant="ghost" size="sm" @click="themeStore.toggleTheme()">
            <div
              :class="themeStore.theme === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              class="text-lg"
            />
          </BaseButton>
        </div>

        <!-- Stats -->
        <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-1">
            <div class="i-lucide-users" />
            <span>{{ parcheStore.currentParcheStats.totalPeople }} people</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="i-lucide-user-check" />
            <span>{{ parcheStore.currentParcheStats.activePeople }} active</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="i-lucide-receipt" />
            <span>{{ parche.bills.length }} bills</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-6">
      <!-- Tabs -->
      <div class="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          :class="[
            'border-b-2 px-4 py-2 font-medium transition-colors',
            activeTab === 'people'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
          ]"
          @click="activeTab = 'people'"
        >
          People & Groups
        </button>
        <button
          :class="[
            'border-b-2 px-4 py-2 font-medium transition-colors',
            activeTab === 'bills'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
          ]"
          @click="activeTab = 'bills'"
        >
          Bills
        </button>
        <button
          :class="[
            'border-b-2 px-4 py-2 font-medium transition-colors',
            activeTab === 'summary'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
          ]"
          @click="activeTab = 'summary'"
        >
          Summary
        </button>
      </div>

      <!-- People & Groups Tab -->
      <div v-if="activeTab === 'people'" class="h-full space-y-4 overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <BaseButton variant="ghost" size="sm" @click="expandAllGroups">
              <div class="i-lucide-chevrons-down text-lg" />
              <span class="hidden sm:inline">Expand All</span>
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="collapseAllGroups">
              <div class="i-lucide-chevrons-up text-lg" />
              <span class="hidden sm:inline">Collapse All</span>
            </BaseButton>
          </div>
          <BaseButton @click="showAddGroupModal = true">
            <div class="i-lucide-plus text-lg" />
            <span class="hidden sm:inline">Add Group</span>
          </BaseButton>
        </div>

        <TransitionGroup name="list" tag="section" class="relative space-y-4">
          <div v-for="group in parche.groups" :key="group.id" class="space-y-3">
            <BaseAccordion
              v-model="groupExpandedState[group.id]"
              :title="group.name"
              :color="group.color"
              :badge="group.people.length"
            >
              <template #actions>
                <BaseButton variant="ghost" size="sm" @click.stop="openEditGroup(group.id)">
                  <div class="i-lucide-edit text-lg text-white" />
                </BaseButton>
                <BaseButton
                  v-if="parche.groups.length > 1"
                  variant="ghost"
                  size="sm"
                  @click.stop="confirmDeleteGroup(group.id)"
                >
                  <div class="i-lucide-trash text-lg text-white" />
                </BaseButton>
              </template>

              <!-- People in Group -->
              <div class="space-y-2">
                <TransitionGroup name="list" tag="section" class="space-y-2">
                  <div
                    v-for="person in group.people"
                    :key="person.id"
                    class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <div class="flex items-center gap-3">
                      <button
                        :class="[
                          'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                          person.active
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 bg-gray-300 dark:border-gray-600 dark:bg-gray-600',
                        ]"
                        @click="parcheStore.togglePersonActive(parche.id, person.id)"
                      >
                        <div v-if="person.active" class="i-lucide-check text-sm text-white" />
                      </button>
                      <span
                        :class="
                          person.active ? '' : 'text-gray-500 line-through dark:text-gray-400'
                        "
                      >
                        {{ person.name }}
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <BaseButton variant="ghost" size="sm" @click="openEditPerson(person.id)">
                        <div class="i-lucide-edit text-base" />
                      </BaseButton>
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        @click="openMovePerson(person.id, group.id)"
                      >
                        <div class="i-lucide-move text-base" />
                      </BaseButton>
                      <BaseButton variant="ghost" size="sm" @click="confirmDeletePerson(person.id)">
                        <div class="i-lucide-trash text-base" />
                      </BaseButton>
                    </div>
                  </div>
                </TransitionGroup>

                <BaseButton variant="ghost" full-width @click="openAddPerson(group.id)">
                  <div class="i-lucide-plus text-lg" />
                  <span class="hidden sm:inline">Add Person</span>
                </BaseButton>
              </div>
            </BaseAccordion>
          </div>
        </TransitionGroup>
      </div>

      <!-- Bills Tab -->
      <div v-else-if="activeTab === 'bills'" class="space-y-4">
        <div class="flex justify-end">
          <BaseButton @click="router.push({ name: 'bill-create', params: { id: parche.id } })">
            <div class="i-lucide-plus text-lg" />
            <span class="hidden sm:inline">New Bill</span>
          </BaseButton>
        </div>

        <div v-if="parche.bills.length === 0" class="py-12 text-center">
          <div class="i-lucide-receipt mx-auto mb-3 text-5xl text-gray-300 dark:text-gray-600" />
          <p class="text-gray-500 dark:text-gray-400">No bills yet</p>
        </div>

        <BaseCard
          v-for="bill in sortedBills"
          :key="bill.id"
          clickable
          @click="
            router.push({ name: 'bill-detail', params: { parcheId: parche.id, billId: bill.id } })
          "
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="mb-2 flex items-center gap-2">
                <span
                  :class="[
                    'rounded px-2 py-1 text-xs font-medium',
                    bill.type === 'equal'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                  ]"
                >
                  {{ bill.type === 'equal' ? 'Equal Split' : 'Distributed' }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(bill.createdAt) }}
                </span>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ bill.products.length }} items
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-gray-900 dark:text-gray-100">
                {{ formatCurrency(billStore.getBillTotal(bill.id)) }}
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Summary Tab -->
      <div v-else-if="activeTab === 'summary'">
        <BaseCard>
          <h3 class="mb-4 text-lg font-semibold">Total Expenses</h3>
          <div
            v-if="parcheStore.currentParcheAllPeople.length === 0"
            class="py-8 text-center text-gray-500 dark:text-gray-400"
          >
            No people in this parche
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="person in parcheStore.currentParcheAllPeople"
              :key="person.id"
              class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
            >
              <span class="font-medium">{{ person.name }}</span>
              <span class="text-lg font-bold text-blue-600 dark:text-blue-400">
                {{ formatCurrency(parcheTotals.get(person.id) || 0) }}
              </span>
            </div>
          </div>

          <div class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div class="flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span class="text-blue-600 dark:text-blue-400">{{
                formatCurrency(totalAmount)
              }}</span>
            </div>
          </div>

          <div class="mt-6 flex gap-2">
            <BaseButton variant="secondary" full-width @click="shareAsText">
              <div class="i-lucide-share-2 text-lg" />
              Share as Text
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </main>

    <!-- Add Group Modal -->
    <BaseModal v-model="showAddGroupModal" title="Add Group">
      <form @submit.prevent="handleAddGroup">
        <div class="space-y-4">
          <BaseInput
            v-model="newGroupName"
            label="Group Name"
            placeholder="e.g., Friends, Family"
            required
            autofocus
            :error="groupError"
          />
          <ColorPicker v-model="newGroupColor" label="Group Color (Optional - Random if empty)" />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showAddGroupModal = false">Cancel</BaseButton>
          <BaseButton @click="handleAddGroup">Add</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit Group Modal -->
    <BaseModal v-model="showEditGroupModal" title="Edit Group">
      <form @submit.prevent="handleEditGroup">
        <div class="space-y-4">
          <BaseInput
            v-model="editGroupName"
            label="Group Name"
            required
            autofocus
            :error="groupError"
          />
          <ColorPicker v-model="editGroupColor" label="Group Color" />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showEditGroupModal = false">Cancel</BaseButton>
          <BaseButton @click="handleEditGroup">Save</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Add Person Modal -->
    <BaseModal v-model="showAddPersonModal" title="Add Person">
      <form @submit.prevent="handleAddPerson">
        <BaseInput
          v-model="newPersonName"
          label="Person Name"
          placeholder="Enter name"
          required
          autofocus
          :error="personError"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showAddPersonModal = false">Cancel</BaseButton>
          <BaseButton @click="handleAddPerson">Add</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Edit Person Modal -->
    <BaseModal v-model="showEditPersonModal" title="Edit Person">
      <form @submit.prevent="handleEditPerson">
        <BaseInput
          v-model="editPersonName"
          label="Person Name"
          required
          autofocus
          :error="personError"
        />
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="showEditPersonModal = false">Cancel</BaseButton>
          <BaseButton @click="handleEditPerson">Save</BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Move Person Modal -->
    <BaseModal v-model="showMovePersonModal" title="Move Person">
      <div class="space-y-2">
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">Select target group:</p>
        <BaseButton
          v-for="group in parche.groups.filter((g: Group) => g.id !== selectedGroupId)"
          :key="group.id"
          variant="ghost"
          full-width
          @click="handleMovePerson(group.id)"
        >
          <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: group.color }" />
          {{ group.name }}
        </BaseButton>
      </div>
    </BaseModal>

    <!-- Delete Confirmations -->
    <ConfirmDialog
      v-model="showDeleteGroupConfirm"
      title="Delete Group"
      message="Are you sure you want to delete this group? All people in this group will be removed."
      confirm-text="Delete"
      confirm-variant="danger"
      @confirm="handleDeleteGroup"
    />

    <ConfirmDialog
      v-model="showDeletePersonConfirm"
      title="Delete Person"
      message="Are you sure you want to delete this person?"
      confirm-text="Delete"
      confirm-variant="danger"
      @confirm="handleDeletePerson"
    />
  </div>
</template>
