import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoPeople, IoEnter, IoCopy, IoCheckmark } from 'react-icons/io5';
import { useCircleStore } from '../store/circleStore';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Circles.css';

export default function Circles() {
  const { circles, loading, error, fetchCircles, createCircle, joinCircle } = useCircleStore();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newCircleCode, setNewCircleCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [createForm, setCreateForm] = useState({ name: '', patientName: '', displayName: '' });
  const [joinForm, setJoinForm] = useState({ code: '', displayName: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const result = await createCircle(createForm);
    if (result.success) {
      setShowCreateModal(false);
      setCreateForm({ name: '', patientName: '', displayName: '' });
      setNewCircleCode(result.code);
      setShowCodeModal(true);
    } else {
      setFormError(result.message);
    }
  };

  const handleJoinCircle = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const result = await joinCircle(joinForm);
    if (result.success) {
      setShowJoinModal(false);
      setJoinForm({ code: '', displayName: '' });
    } else {
      setFormError(result.message);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(newCircleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && circles.length === 0) {
    return <Loading text="Cargando círculos..." />;
  }

  return (
    <div className="circles-page">
      <div className="container">
        <div className="circles-header">
          <h1>Mis Círculos de Cuidado</h1>
          <div className="circles-actions">
            <button className="btn btn-outline" onClick={() => setShowJoinModal(true)}>
              <IoEnter /> Unirme a Círculo
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <IoAdd /> Crear Círculo
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {circles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏥</div>
            <p className="empty-state-text">
              No tienes círculos de cuidado aún.<br />
              Crea uno nuevo o únete a uno existente.
            </p>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-outline" onClick={() => setShowJoinModal(true)}>
                <IoEnter /> Unirme a Círculo
              </button>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <IoAdd /> Crear Círculo
              </button>
            </div>
          </div>
        ) : (
          <div className="circles-grid">
            {circles.map((circle) => (
              <div
                key={circle.id}
                className="circle-card"
                onClick={() => navigate(`/circles/${circle.id}`)}
              >
                <div className="circle-card-header">
                  <span className="circle-icon">👥</span>
                  <span className={`badge ${circle.myRole === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                    {circle.myRole === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                </div>
                <h3 className="circle-name">{circle.name}</h3>
                <p className="circle-patient">
                  <IoPeople /> Paciente: {circle.patientName}
                </p>
                <p className="circle-code">Código: {circle.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Círculo */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setFormError(''); }}
        title="Crear Nuevo Círculo"
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleCreateCircle}>
          <div className="form-group">
            <label className="form-label">Nombre del Círculo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Cuidado de Mamá"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre del Paciente</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nombre de la persona a cuidar"
              value={createForm.patientName}
              onChange={(e) => setCreateForm({ ...createForm, patientName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tu nombre en el círculo (opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Cómo quieres que te llamen"
              value={createForm.displayName}
              onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Círculo'}
          </button>
        </form>
      </Modal>

      {/* Modal Unirse a Círculo */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => { setShowJoinModal(false); setFormError(''); }}
        title="Unirse a un Círculo"
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleJoinCircle}>
          <div className="form-group">
            <label className="form-label">Código del Círculo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ingresa el código de 8 caracteres"
              value={joinForm.code}
              onChange={(e) => setJoinForm({ ...joinForm, code: e.target.value.toUpperCase() })}
              maxLength={8}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tu nombre en el círculo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Cómo quieres que te llamen"
              value={joinForm.displayName}
              onChange={(e) => setJoinForm({ ...joinForm, displayName: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Uniéndose...' : 'Unirse al Círculo'}
          </button>
        </form>
      </Modal>

      {/* Modal Código del Círculo */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        title="¡Círculo Creado!"
      >
        <div className="text-center">
          <p className="mb-2">Comparte este código con los miembros del círculo:</p>
          <div className="code-display">
            <span className="code-text">{newCircleCode}</span>
            <button className="btn btn-sm btn-secondary" onClick={copyCode}>
              {copied ? <IoCheckmark /> : <IoCopy />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <button 
            className="btn btn-primary btn-block mt-3"
            onClick={() => setShowCodeModal(false)}
          >
            Entendido
          </button>
        </div>
      </Modal>
    </div>
  );
}
