import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, body, loading }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={title || t('common.confirmDeleteTitle')} width="max-w-sm">
      <p className="text-ink-700 text-sm mb-6">{body || t('common.confirmDeleteBody')}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {t('common.delete')}
        </Button>
      </div>
    </Modal>
  );
}
