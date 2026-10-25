import clsx from 'clsx'
import s from './Tabs.module.scss'

export default function Tabs({ tabs, activeKey, onChange, className }) {
  return (
    <div className={clsx(s.tabs, className)}>
      {tabs.map((tab) => {
        const isSelected = tab.key === activeKey
        return (
          <button
            key={tab.key}
            type="button"
            className={clsx(s.tab, isSelected && s.selected, tab.disabled && s.disabled)}
            onClick={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
