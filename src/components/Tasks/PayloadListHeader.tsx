import '@payloadcms/ui/styles.css'
import Link from 'next/link'

type PayloadListHeaderProps = {
  title: string
  newDocumentURL: string
  createLabel?: string
  createAriaLabel?: string
}

export function PayloadListHeader({
  title,
  newDocumentURL,
  createLabel = '+ Add',
  createAriaLabel = 'Create new document',
}: PayloadListHeaderProps) {
  return (
    <header className="list-header">
      <div className="list-header__content">
        <div className="list-header__title-and-actions">
          <h1 className="list-header__title">{title}</h1>

          <div className="list-header__title-actions">
            <Link
              type="button"
              aria-label={createAriaLabel}
              className="btn list-create-new-doc__create-new-button btn--icon-style-without-border btn--size-small btn--withoutPopup btn--style-pill btn--withoutPopup"
              title={createAriaLabel}
              href={newDocumentURL}
            >
              <span className="btn__content">
                <span className="btn__label">{createLabel}</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="list-header__actions"></div>
      </div>

      <div className="list-header__after-header-content">
        <div className="collection-list__sub-header"></div>
      </div>
    </header>
  )
}
