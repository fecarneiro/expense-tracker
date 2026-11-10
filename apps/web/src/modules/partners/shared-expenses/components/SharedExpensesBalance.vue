<script setup lang="ts">
import { computed } from 'vue'
import {
  useSettleMutation,
  useSharedBalanceQuery,
} from '@/modules/partners/shared-expenses/queries/settlements.queries'
import { useUserFormat } from '@/shared/composables/useUserFormat'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

const { money } = useUserFormat()

const { data: balance, isPending: loading, isError } = useSharedBalanceQuery()
const { mutate: settle, isPending: settling, isError: settleFailed } = useSettleMutation()

const youOweCents = computed(() => balance.value?.userTotals ?? 0)
const partnerOwesCents = computed(() => balance.value?.partnerTotals ?? 0)
const totalCents = computed(() => balance.value?.totalAmountCents ?? 0)

const pendingCents = computed(() => youOweCents.value + partnerOwesCents.value)
const youShare = computed(() => `${(youOweCents.value / pendingCents.value) * 100}%`)
const partnerShare = computed(() => `${(partnerOwesCents.value / pendingCents.value) * 100}%`)

const totalLabel = computed(() => money(Math.abs(totalCents.value)))
const summary = computed(() => {
  if (totalCents.value > 0) return 'You owe Partner'
  if (totalCents.value < 0) return 'Partner owes you'
  return 'Settled up'
})
</script>

<template>
  <Card class="gap-0 rounded-lg py-0 shadow-none">
    <p v-if="loading" class="text-muted-foreground p-6">Loading balance...</p>
    <p v-else-if="isError" class="text-destructive p-6" role="alert">Unable to load balance.</p>

    <template v-else>
      <div class="grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div class="p-4 md:px-6 lg:py-5">
          <p class="text-lg font-semibold">{{ summary }}</p>
          <div v-if="totalCents !== 0" class="mt-1 flex flex-wrap items-center gap-5">
            <p
              class="text-4xl font-semibold tracking-tight tabular-nums"
              :class="{ 'text-you': totalCents > 0 }"
            >
              {{ totalLabel }}
            </p>

            <AlertDialog v-if="totalCents > 0">
              <AlertDialogTrigger as-child>
                <Button class="text-you" variant="outline" :disabled="settling">
                  {{ settling ? 'Settling...' : 'Settle up' }}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Settle up {{ totalLabel }}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This records your payment to Partner and marks every pending expense as settled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="settle()">Settle up</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p v-else-if="pendingCents === 0" class="text-muted-foreground">
            Nothing pending between you and Partner.
          </p>
        </div>

        <div v-if="pendingCents > 0" class="border-t p-4 md:px-6 lg:border-t-0 lg:py-5 lg:pl-0">
          <div class="flex h-1 gap-0.5 overflow-hidden rounded-full opacity-70" aria-hidden="true">
            <span v-if="youOweCents > 0" class="bg-you-bar" :style="{ width: youShare }" />
            <span
              v-if="partnerOwesCents > 0"
              class="bg-partner-bar"
              :style="{ width: partnerShare }"
            />
          </div>
          <div
            class="text-muted-foreground mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[0.8125rem] tabular-nums"
          >
            <span class="inline-flex items-center gap-1.5">
              <i class="bg-you-bar size-2 rounded-full opacity-70" aria-hidden="true" />
              You owe −{{ money(youOweCents) }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <i class="bg-partner-bar size-2 rounded-full opacity-70" aria-hidden="true" />
              Partner owes +{{ money(partnerOwesCents) }}
            </span>
          </div>
        </div>
      </div>

      <p v-if="settleFailed" class="text-destructive border-t px-4 py-3 md:px-6" role="alert">
        Unable to settle. Nothing was changed.
      </p>
    </template>
  </Card>
</template>
