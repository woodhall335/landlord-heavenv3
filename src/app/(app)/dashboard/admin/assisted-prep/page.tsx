import { AdminCasesPage } from '../cases/page';

export default function AssistedPrepConsultationsPage() {
  return (
    <AdminCasesPage
      initialPreset="assisted_consultations"
      title="Assisted Prep Consultation Requests"
      description="Every landlord who has submitted the free consultation form. Review their contact details, requested assistance, case summary, documents and next action in one place."
    />
  );
}
