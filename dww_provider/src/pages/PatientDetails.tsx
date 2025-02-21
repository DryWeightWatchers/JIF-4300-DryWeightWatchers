import { useParams } from 'react-router-dom';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Details for patient id {id}</h1>
    </div>
  );
};

export default PatientDetails;