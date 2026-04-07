<script setup lang="ts">
const showEdit = ref(false)
const showDelete = ref(false)

const editHabit = (id: number) => {
  showEdit.value = true
}

const deleteHabit = (id: number) => {
  showDelete.value = true
}

const confirmEdit = () => {
  // save logic
  showEdit.value = false
}

const confirmDelete = () => {
  // delete logic
  showDelete.value = false
}
</script>

<template>
  <!-- Edit Modal -->
  <Modal v-model="showEdit" title="Edit Habit" description="Update your habit details below."
    primary-label="Save changes" @primary="confirmEdit">
    <!-- your form fields go here -->
    <input class="w-full border rounded-xl px-4 py-2" placeholder="Habit title" />
  </Modal>

  <!-- Delete Modal -->
  <Modal v-model="showDelete" title="Delete Habit" description="This action cannot be undone." primary-label="Delete"
    :dangerous="true" @primary="confirmDelete">
    <p class="text-sm text-gray-500">Are you sure you want to delete this habit?</p>
  </Modal>
</template>