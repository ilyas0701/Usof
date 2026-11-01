import s from './Footer.module.scss'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <span className={s.logo}>USOF</span>
        <span className={s.copyright}>© {year} USOF</span>
      </div>
    </footer>
  )
}
