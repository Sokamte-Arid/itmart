import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import * as authApi from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AdminFormModal from './AdminFormModal';
import { useToast } from '../../components/ui/Toast';

const roleTone = { SUPER_ADMIN: 'accent', ADMIN: 'info', EDITOR: 'neutral' };

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminsList() {
  const { t } = useTranslation();
  const { admin: currentAdmin } = useAuth();
  const { showToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    authApi
      .getAdmins()
      .then((res) => setAdmins(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Route-level guard: hiding the nav link isn't enough on its own, since
  // someone could still navigate here directly by URL.
  if (currentAdmin && currentAdmin.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />;
  }

  const roleLabel = (r) =>
    ({ SUPER_ADMIN: t('admins.roleSuperAdmin'), ADMIN: t('admins.roleAdmin'), EDITOR: t('admins.roleEditor') }[r]);

  const handleDelete = async () => {
    try {
      await authApi.deleteAdmin(deleteTarget.id);
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
        <p className="text-sm text-ink-500 max-w-lg">{t('admins.hint')}</p>
        <Button icon={Plus} onClick={() => setFormOpen(true)}>
          {t('admins.addAdmin')}
        </Button>
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
<table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-500 border-b border-surface-border">
              <th className="px-5 py-2.5 font-medium">{t('common.name')}</th>
              <th className="px-5 py-2.5 font-medium">{t('login.email')}</th>
              <th className="px-5 py-2.5 font-medium">{t('admins.role')}</th>
              <th className="px-5 py-2.5 font-medium">{t('admins.createdOn')}</th>
              <th className="px-5 py-2.5 font-medium text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.id === currentAdmin?.id;
              return (
                <tr key={a.id} className="border-b border-surface-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3 text-ink-800 flex items-center gap-2">
                    {a.name}
                    {isSelf && (
                      <span className="text-xs text-ink-400 flex items-center gap-1">
                        <ShieldCheck size={12} /> {t('admins.you')}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{a.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={roleTone[a.role]}>{roleLabel(a.role)}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(a.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      disabled={isSelf}
                      title={isSelf ? t('admins.cannotDeleteSelf') : undefined}
                      className="text-danger-600 hover:bg-danger-100/50 disabled:text-ink-300"
                      onClick={() => !isSelf && setDeleteTarget(a)}
                    />
                  </td>
                </tr>
              );
            })}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink-500">
                  {t('common.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>

      <AdminFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
