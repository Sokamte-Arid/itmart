import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Eye, EyeOff, MapPin } from 'lucide-react';
import * as deliveryZonesApi from '../../api/deliveryZones';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DeliveryZoneFormModal from './DeliveryZoneFormModal';
import { useToast } from '../../components/ui/Toast';

const formatFCFA = (amount) => `${Number(amount).toLocaleString('fr-FR')} FCFA`;

export default function DeliveryZoneList() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    deliveryZonesApi
      .getAllDeliveryZones()
      .then((res) => setZones(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleActive = async (zone) => {
    try {
      await deliveryZonesApi.updateDeliveryZone(zone.id, { isActive: !zone.isActive });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deliveryZonesApi.deleteDeliveryZone(deleteTarget.id);
      showToast(t('common.delete') + ' ✓');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-500 max-w-lg">{t('deliveryZones.hint')}</p>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('deliveryZones.addZone')}
        </Button>
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-500 border-b border-surface-border">
              <th className="px-5 py-2.5 font-medium">{t('deliveryZones.city')}</th>
              <th className="px-5 py-2.5 font-medium">{t('deliveryZones.fee')}</th>
              <th className="px-5 py-2.5 font-medium">{t('common.status')}</th>
              <th className="px-5 py-2.5 font-medium text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className="border-b border-surface-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3 text-ink-800 flex items-center gap-2">
                  <MapPin size={14} className="text-ink-400" />
                  {zone.city}
                </td>
                <td className="px-5 py-3 font-mono-data text-ink-800">{formatFCFA(zone.fee)}</td>
                <td className="px-5 py-3">
                  <Badge tone={zone.isActive ? 'success' : 'neutral'}>
                    {zone.isActive ? t('products.active') : t('products.inactive')}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={zone.isActive ? EyeOff : Eye}
                      onClick={() => toggleActive(zone)}
                      title={zone.isActive ? t('banners.deactivate') : t('banners.activate')}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Pencil}
                      onClick={() => {
                        setEditing(zone);
                        setFormOpen(true);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      className="text-danger-600 hover:bg-danger-100/50"
                      onClick={() => setDeleteTarget(zone)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!loading && zones.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-ink-500">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>

      <DeliveryZoneFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        zone={editing}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
