import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoAdd, IoTrash, IoPencil } from 'react-icons/io5';
import { medicationService } from '../services/medicationService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Medications.css';

export default function Medications() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
  });

  useEffect(() => {
    loadMedications();
  }, [circleId]);

  const loadMedications = async () => {
    try {
      const response = await medicationService.getAll(circleId);
      setMedications(response.data.medications);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      if (editingMed) {
        await medicationService.update(circleId, editingMed.id, formData);
      } else {
        await medicationService.create(circleId, formData);
      }
      
      await loadMedications();
      closeModal();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error al guardar medicamento');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este medicamento?')) return;
    
    try {
      await medicationService.delete(circleId, id);
      setMedications(medications.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      instructions: med.instructions || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMed(null);
    setFormData({ name: '', dosage: '', frequency: '', instructions: '' });
    setFormError('');
  };

  if (loading) {
    return <Loading text="Cargando medicamentos..." />;
  }

  return (
    <div className="medications-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(`/circles/${circleId}`)}>
          <IoArrowBack /> Volver al círculo
        </button>

        <div className="page-header">
          <h1>💊 Medicamentos</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <IoAdd /> Agregar Medicamento
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💊</div>
            <p className="empty-state-text">No hay medicamentos registrados</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <IoAdd /> Agregar Medicamento
            </button>
          </div>
        ) : (
          <div className="medications-list">
            {medications.map((med) => (
              <div key={med.id} className={`medication-card ${!med.isActive ? 'inactive' : ''}`}>
                <div className="medication-info">
                  <h3>{med.name}</h3>
                  {med.dosage && <p className="dosage">Dosis: {med.dosage}</p>}
                  {med.frequency && <p className="frequency">Frecuencia: {med.frequency}</p>}
                  {med.instructions && <p className="instructions">{med.instructions}</p>}
                </div>
                <div className="medication-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(med)}>
                    <IoPencil />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(med.id)}>
                    <IoTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingMed ? 'Editar Medicamento' : 'Nuevo Medicamento'}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Medicamento *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Paracetamol"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dosis</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: 500mg"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Frecuencia</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Cada 8 horas"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Instrucciones</label>
            <textarea
              className="form-textarea"
              placeholder="Instrucciones adicionales..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {editingMed ? 'Guardar Cambios' : 'Agregar Medicamento'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
