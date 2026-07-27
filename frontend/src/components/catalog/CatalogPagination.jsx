export function CatalogPagination({ isLoading, onNext, onPrevious, page, totalPages }) {
  return (
    <div className="catalog-pagination">
      <button className="catalog-page-button" type="button" onClick={onPrevious} disabled={isLoading || page === 0}>
        Anterior
      </button>

      <p className="catalog-page-summary">
        Pagina <strong>{totalPages === 0 ? 0 : page + 1}</strong> de <strong>{totalPages}</strong>
      </p>

      <button
        className="catalog-page-button"
        type="button"
        onClick={onNext}
        disabled={isLoading || totalPages === 0 || page + 1 >= totalPages}
      >
        Siguiente
      </button>
    </div>
  )
}
