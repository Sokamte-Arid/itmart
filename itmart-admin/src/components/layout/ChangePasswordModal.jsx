import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { changePassword } from '../../api/auth';
import { useToast } from '../ui/Toast';

export default function ChangePasswordModal({ open, onClose }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('account.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('account.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast(t('account.passwordChanged'));
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || t('account.passwordError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={t('account.changePassword')} width="max-w-sm">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-danger-100 text-danger-600 text-sm">{error}</div>
        )}
        <Field label={t('account.currentPassword')} required>
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field label={t('account.newPassword')} required hint={t('account.passwordHint')}>
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        <Field label={t('account.confirmPassword')} required>
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
