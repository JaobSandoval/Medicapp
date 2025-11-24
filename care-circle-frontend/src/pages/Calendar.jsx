import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoAdd, IoTrash, IoPencil, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { calendarService } from '../services/calendarService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import './Calendar.css';

export default function Calendar() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    eventType: 'appointment',
  });

  useEffect(() => {
    loadEvents();
  }, [circleId, currentDate]);

  const loadEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await calendarService.getByMonth(circleId, year, month);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime || '00:00'}`);
      
      const data = {
        title: formData.title,
        description: formData.description,
        eventDate: eventDateTime.toISOString(),
        location: formData.location,
        eventType: formData.eventType,
      };
      
      if (editingEvent) {
        await calendarService.update(circleId, editingEvent.id, data);
      } else {
        await calendarService.create(circleId, data);
      }
      
      await loadEvents();
      closeModal();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error al guardar evento');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    
    try {
      await calendarService.delete(circleId, id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const openEditModal = (event) => {
    const eventDate = new Date(event.eventDate);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: format(eventDate, 'yyyy-MM-dd'),
      eventTime: format(eventDate, 'HH:mm'),
      location: event.location || '',
      eventType: event.eventType,
    });
    setShowModal(true);
  };

  const openNewModal = (date = null) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      eventDate: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setSelectedDate(null);
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      location: '',
      eventType: 'appointment',
    });
    setFormError('');
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDay = (day) => {
    return events.filter((event) => isSameDay(new Date(event.eventDate), day));
  };

  const eventTypeLabels = {
    appointment: 'Cita',
    checkup: 'Revisión',
    therapy: 'Terapia',
    other: 'Otro',
  };

  if (loading) {
    return <Loading text="Cargando calendario..." />;
  }

  const days = getDaysInMonth();
  const startDay = startOfMonth(currentDate).getDay();

  return (
    <div className="calendar-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(`/circles/${circleId}`)}>
          <IoArrowBack /> Volver al círculo
        </button>

        <div className="page-header">
          <h1>📅 Calendario</h1>
          <button className="btn btn-primary" onClick={() => openNewModal()}>
            <IoAdd /> Nueva Cita
          </button>
        </div>

        <div className="calendar-container card">
          <div className="calendar-header">
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <IoChevronBack />
            </button>
            <h2>{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <IoChevronForward />
            </button>
          </div>

          <div className="calendar-grid">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                  onClick={() => openNewModal(day)}
                >
                  <span className="day-number">{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div className="day-events">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="day-event"
                          onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="more-events">+{dayEvents.length - 2} más</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de eventos del mes */}
        <div className="events-list mt-4">
          <h3 className="mb-2">Eventos del mes</h3>
          {events.length === 0 ? (
            <p style={{ color: 'var(--gray-500)' }}>No hay eventos este mes</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-date">
                  <span className="event-day">{format(new Date(event.eventDate), 'd')}</span>
                  <span className="event-month">{format(new Date(event.eventDate), 'MMM', { locale: es })}</span>
                </div>
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p>{format(new Date(event.eventDate), 'HH:mm')} - {eventTypeLabels[event.eventType]}</p>
                  {event.location && <p className="event-location">📍 {event.location}</p>}
                </div>
                <div className="event-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(event)}>
                    <IoPencil />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event.id)}>
                    <IoTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingEvent ? 'Editar Cita' : 'Nueva Cita'}
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Consulta con Dr. García"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                className="form-input"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input
                type="time"
                className="form-input"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tipo de Evento</label>
            <select
              className="form-select"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              <option value="appointment">Cita Médica</option>
              <option value="checkup">Revisión</option>
              <option value="therapy">Terapia</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ubicación</label>
            <input
              type="text"
              className="form-input"
              placeholder="Dirección o nombre del lugar"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-textarea"
              placeholder="Notas adicionales..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {editingEvent ? 'Guardar Cambios' : 'Crear Cita'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
