import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import * as deliveryZonesApi from '../../api/deliveryZones';
import { useToast } from '../../components/ui/Toast';

const emptyForm = { city: '', fee: '', sortOrder: '0' };

export default function DeliveryZoneFormModal({ open, onClose, zone, onSaved }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        zone
          ? { city: zone.city, fee: String(zone.fee), sortOrder: String(zone.sortOrder ?? 0) }
          : emptyForm
      );
    }
  }, [open, zone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { city: form.city, fee: Number(form.fee), sortOrder: Number(form.sortOrder) };
      if (zone) {
        await deliveryZonesApi.updateDeliveryZone(zone.id, payload);
      } else {
        await deliveryZonesApi.createDeliveryZone(payload);
      }
      showToast(t('common.saveChanges') + ' ✓');
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={zone ? t('common.edit') : t('deliveryZones.addZone')} width="max-w-sm">
      <form onSubmit={handleSubmit}>
        <Field label={t('deliveryZones.city')} required hint={t('deliveryZones.cityHint')}>
          <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Yaoundé" />
        </Field>
        <Field label={t('deliveryZones.fee')} required>
          <Input
            type="number"
            required
            min="0"
            value={form.fee}
            onChange={(e) => setForm({ ...form, fee: e.target.value })}
            placeholder="1500"
          />
        </Field>
        <Field label={t('banners.sortOrder')} hint={t('deliveryZones.sortHint')}>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </Field>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
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
