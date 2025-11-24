export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="loading">
      <div className="flex flex-col items-center gap-2">
        <div className="spinner"></div>
        <p style={{ color: 'var(--gray-500)' }}>{text}</p>
      </div>
    </div>
  );
}
