import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoAdd, IoTrash, IoPencil, IoCheckmark } from 'react-icons/io5';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { taskService } from '../services/taskService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Tasks.css';

export default function Tasks() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadTasks();
  }, [circleId]);

  const loadTasks = async () => {
    try {
      const response = await taskService.getAll(circleId);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      const data = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
      
      if (editingTask) {
        await taskService.update(circleId, editingTask.id, data);
      } else {
        await taskService.create(circleId, data);
      }
      
      await loadTasks();
      closeModal();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error al guardar tarea');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskService.updateStatus(circleId, task.id, newStatus);
      setTasks(tasks.map((t) => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    
    try {
      await taskService.delete(circleId, id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      priority: task.priority,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
    setFormError('');
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const priorityColors = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-danger',
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };

  const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Completada',
  };

  if (loading) {
    return <Loading text="Cargando tareas..." />;
  }

  return (
    <div className="tasks-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(`/circles/${circleId}`)}>
          <IoArrowBack /> Volver al círculo
        </button>

        <div className="page-header">
          <h1>✅ Tareas</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <IoAdd /> Nueva Tarea
          </button>
        </div>

        <div className="tasks-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            En progreso ({tasks.filter(t => t.status === 'in_progress').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completadas ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p className="empty-state-text">
              {filter === 'all' ? 'No hay tareas registradas' : `No hay tareas ${statusLabels[filter].toLowerCase()}`}
            </p>
            {filter === 'all' && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <IoAdd /> Nueva Tarea
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <div key={task.id} className={`task-card ${task.status}`}>
                <div className="task-checkbox">
                  <button
                    className={`checkbox-btn ${task.status === 'completed' ? 'checked' : ''}`}
                    onClick={() => handleStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}
                  >
                    {task.status === 'completed' && <IoCheckmark />}
                  </button>
                </div>
                <div className="task-info">
                  <h3 className={task.status === 'completed' ? 'completed' : ''}>{task.title}</h3>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span className={`badge ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    {task.dueDate && (
                      <span className="task-due">
                        📅 {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="task-actions">
                  <select 
                    className="status-select"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                  <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(task)}>
                    <IoPencil />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}>
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
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input
              type="text"
              className="form-input"
              placeholder="¿Qué hay que hacer?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              placeholder="Detalles adicionales..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha límite</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
