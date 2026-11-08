import {createElement, useEffect, useMemo} from 'react'
import {PatchEvent, set, useFormValue} from 'sanity'

type AvailabilityDate = {
  _key: string
  _type: 'availabilityDate'
  date: string
  available?: boolean
}

type AvailabilityMonthInputProps = {
  value?: AvailabilityDate[]
  onChange: (event: PatchEvent) => void
}

function getMonthDays(month?: string) {
  if (!month) return []

  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7)) - 1
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()

  return Array.from({length: daysInMonth}, (_, index) => {
    const day = String(index + 1).padStart(2, '0')

    return `${month.slice(0, 7)}-${day}`
  })
}

function createKey(date: string) {
  return `date${date.replaceAll('-', '')}`
}

function normalizeDates(month: string | undefined, value: AvailabilityDate[] | undefined) {
  const storedByDate = new Map(
    (value ?? [])
      .filter((item) => typeof item.date === 'string')
      .map((item) => [item.date, item]),
  )

  return getMonthDays(month).map((date) => {
    const stored = storedByDate.get(date)
    const item: AvailabilityDate = {
      _key: stored?._key ?? createKey(date),
      _type: 'availabilityDate',
      date,
    }

    if (!stored) {
      item.available = true
    } else if (typeof stored.available === 'boolean') {
      item.available = stored.available
    }

    return item
  })
}

function datesNeedSync(month: string | undefined, value: AvailabilityDate[] | undefined) {
  if (!month) return false

  const monthDays = getMonthDays(month)

  if (!Array.isArray(value) || value.length !== monthDays.length) return true

  return monthDays.some((date) => !value.some((entry) => entry.date === date))
}

function getNextAvailability(value: boolean | undefined) {
  if (value === true) return false
  if (value === false) return undefined

  return true
}

function getDayLabel(available: boolean | undefined) {
  if (available === undefined) return 'Non disponible'

  return available ? 'Disponible' : 'Complet'
}

export function AvailabilityMonthInput(props: AvailabilityMonthInputProps) {
  const {value, onChange} = props
  const month = useFormValue(['month']) as string | undefined
  const normalizedDates = useMemo(() => normalizeDates(month, value), [month, value])

  useEffect(() => {
    if (!datesNeedSync(month, value)) return

    onChange(PatchEvent.from(set(normalizeDates(month, value))))
  }, [month, value, onChange])

  if (!month) {
    return createElement('p', null, 'Sélectionnez un mois pour générer automatiquement les jours.')
  }

  return createElement(
    'div',
    {style: {display: 'grid', gap: '0.75rem'}},
    createElement(
      'p',
      {style: {margin: 0}},
      'Cliquez sur une date pour alterner : disponible, complet, non disponible.',
    ),
    createElement(
      'div',
      {style: {display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.5rem'}},
      normalizedDates.map((item) =>
        createElement(
          'button',
          {
            key: item._key,
            type: 'button',
            onClick: () => {
              const nextAvailability = getNextAvailability(item.available)
              const nextDates = normalizedDates.map((dateItem) => {
                if (dateItem.date !== item.date) return dateItem

                const nextItem = {...dateItem}

                if (nextAvailability === undefined) {
                  delete nextItem.available
                } else {
                  nextItem.available = nextAvailability
                }

                return nextItem
              })

              onChange(PatchEvent.from(set(nextDates)))
            },
            style: {
              border: '1px solid var(--card-border-color, #d9d9d9)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              padding: '0.5rem',
            },
          },
          createElement('strong', null, item.date.slice(8, 10)),
          createElement('br'),
          getDayLabel(item.available),
        ),
      ),
    ),
  )
}
