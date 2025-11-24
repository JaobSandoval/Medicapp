import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoCalendar, 
  IoMedkit, 
  IoCheckboxOutline,
  IoPeople,
  IoExitOutline 
} from 'react-icons/io5';
import { useCircleStore } from '../store/circleStore';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import './CircleDetail.css';

export default function CircleDetail() {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const { currentCircle, loading, fetchCircleById, leaveCircle } = useCircleStore();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    fetchCircleById(circleId);
  }, [circleId, fetchCircleById]);

  const handleLeave = async () => {
    const result = await leaveCircle(circleId);
    if (result.success) {
      navigate('/circles');
    }
  };

  if (loading || !currentCircle) {
    return <Loading text="Cargando círculo..." />;
  }

  const menuItems = [
    {
      title: 'Calendario',
      description: 'Citas médicas y eventos',
      icon: <IoCalendar />,
      path: `/circles/${circleId}/calendar`,
      color: '#6366f1',
    },
    {
      title: 'Medicamentos',
      description: 'Control de medicinas',
      icon: <IoMedkit />,
      path: `/circles/${circleId}/medications`,
      color: '#10b981',
    },
    {
      title: 'Tareas',
      description: 'Actividades y pendientes',
      icon: <IoCheckboxOutline />,
      path: `/circles/${circleId}/tasks`,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="circle-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/circles')}>
          <IoArrowBack /> Volver a mis círculos
        </button>

        <div className="circle-detail-header">
          <div className="circle-detail-info">
            <h1>{currentCircle.name}</h1>
            <p className="patient-name">
              <IoPeople /> Paciente: {currentCircle.patientName}
            </p>
            <p className="circle-detail-code">Código: {currentCircle.code}</p>
          </div>
          <button 
            className="btn btn-danger btn-sm"
            onClick={() => setShowLeaveModal(true)}
          >
            <IoExitOutline /> Salir del círculo
          </button>
        </div>

        <div className="circle-menu-grid">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className="circle-menu-card"
              style={{ '--accent-color': item.color }}
            >
              <div className="menu-card-icon" style={{ background: item.color }}>
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>

        {currentCircle.members && (
          <div className="card mt-4">
            <h3 className="card-title mb-2">Miembros del Círculo</h3>
            <div className="members-list">
              {currentCircle.members.map((member) => (
                <div key={member.id} className="member-item">
                  <span className="member-name">{member.displayName}</span>
                  <span className={`badge ${member.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                    {member.role === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="¿Salir del círculo?"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={handleLeave}>
              Sí, salir
            </button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas salir de este círculo de cuidado?</p>
        <p className="mt-1" style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
          Podrás volver a unirte con el código del círculo.
        </p>
      </Modal>
    </div>
  );
}
