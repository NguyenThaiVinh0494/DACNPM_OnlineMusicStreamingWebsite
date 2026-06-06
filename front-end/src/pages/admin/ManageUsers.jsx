import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiLock,
  FiMail,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUnlock,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import { adminUserService } from '../../api/services';
import { AuthContext } from '../../context/AuthContext';

const USERS_CACHE_TTL_MS = 60_000;
const usersCache = {
  items: [],
  fetchedAt: 0,
};

function isUsersCacheFresh() {
  return Date.now() - usersCache.fetchedAt < USERS_CACHE_TTL_MS;
}

function updateUsersCache(items) {
  usersCache.items = items;
  usersCache.fetchedAt = Date.now();
}

function getEmptyForm() {
  return {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    vai_tro: 'USER',
    is_active: true,
    anh_dai_dien: '',
  };
}

function normalizeCollection(payload) {
  return Array.isArray(payload) ? payload : payload?.results ?? [];
}

function formatDate(value) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;

  const firstEntry = Object.values(data).find((value) => Array.isArray(value) && value.length);
  if (firstEntry) return firstEntry[0];

  return fallback;
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function ModalTextField({ label, icon: Icon, required, className = '', ...props }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}
        <input
          {...props}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-white ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
        />
      </div>
    </label>
  );
}

function SegmentedField({ label, value, options, onChange, disabled }) {
  return (
    <div className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1">
        {options.map((option) => {
          const Icon = option.icon;
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold outline-none transition ${
                active
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
              } disabled:cursor-not-allowed disabled:opacity-55`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UserModal({ state, values, saving, formError, onClose, onChange, onSubmit, isSelfEdit }) {
  if (!state.open) return null;

  const isCreate = state.mode === 'create';
  const modalTitle = isCreate ? 'Tạo tài khoản mới' : 'Cập nhật người dùng';
  const submitLabel = saving ? 'Đang lưu...' : isCreate ? 'Tạo tài khoản' : 'Lưu thay đổi';
  const fullName = [values.first_name, values.last_name].filter(Boolean).join(' ').trim() || values.username || 'Người dùng';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-6 backdrop-blur-sm sm:px-4 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(244,247,251,0.98))] shadow-[0_30px_120px_rgba(15,23,42,0.30)] sm:rounded-[36px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <FiUsers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-500">Admin Studio</p>
              <h3 id="user-modal-title" className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900">
                {modalTitle}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 outline-none transition hover:border-slate-300 hover:text-slate-900 focus:ring-4 focus:ring-cyan-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form noValidate onSubmit={onSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {formError ? (
            <div className="mb-5 flex items-start gap-3 rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">{formError}</p>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <ModalTextField
                  label="Tên đăng nhập"
                  icon={FiUser}
                  required
                  type="text"
                  value={values.username}
                  onChange={(event) => onChange('username', event.target.value)}
                  placeholder="ví dụ: admin.nct"
                />

                <ModalTextField
                  label="Email"
                  icon={FiMail}
                  type="email"
                  value={values.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ModalTextField
                  label="Tên"
                  icon={FiUser}
                  type="text"
                  value={values.first_name}
                  onChange={(event) => onChange('first_name', event.target.value)}
                  placeholder="Nguyễn"
                />

                <ModalTextField
                  label="Họ"
                  icon={FiUser}
                  type="text"
                  value={values.last_name}
                  onChange={(event) => onChange('last_name', event.target.value)}
                  placeholder="An"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ModalTextField
                  label={isCreate ? 'Mật khẩu' : 'Mật khẩu mới'}
                  icon={FiLock}
                  required={isCreate}
                  type="password"
                  value={values.password}
                  onChange={(event) => onChange('password', event.target.value)}
                  placeholder={isCreate ? 'Bắt buộc' : 'Bỏ trống nếu không đổi'}
                />

                <ModalTextField
                  label="Avatar URL"
                  icon={FiUser}
                  type="url"
                  value={values.anh_dai_dien}
                  onChange={(event) => onChange('anh_dai_dien', event.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SegmentedField
                  label="Vai trò"
                  value={values.vai_tro}
                  disabled={isSelfEdit}
                  onChange={(nextValue) => onChange('vai_tro', nextValue)}
                  options={[
                    { value: 'USER', label: 'User', icon: FiUser },
                    { value: 'ADMIN', label: 'Admin', icon: FiShield },
                  ]}
                />

                <SegmentedField
                  label="Trạng thái tài khoản"
                  value={values.is_active ? 'ACTIVE' : 'LOCKED'}
                  disabled={isSelfEdit}
                  onChange={(nextValue) => onChange('is_active', nextValue === 'ACTIVE')}
                  options={[
                    { value: 'ACTIVE', label: 'Hoạt động', icon: FiUnlock },
                    { value: 'LOCKED', label: 'Đã khóa', icon: FiLock },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] bg-slate-100 text-slate-400">
                {values.anh_dai_dien ? (
                  <img src={values.anh_dai_dien} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <FiUser className="h-10 w-10" />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="truncate text-base font-black text-slate-900">{fullName}</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">{values.email || 'Chưa có email'}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <span className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700">
                  <FiShield className="h-3.5 w-3.5" />
                  {values.vai_tro === 'ADMIN' ? 'Admin' : 'User'}
                </span>
                <span className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold ${
                  values.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {values.is_active ? <FiCheckCircle className="h-3.5 w-3.5" /> : <FiLock className="h-3.5 w-3.5" />}
                  {values.is_active ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>
            </div>
          </div>

          {isSelfEdit ? (
            <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Bạn đang chỉnh sửa chính mình. Quyền admin và trạng thái tài khoản bị khóa để tránh tự gỡ quyền hoặc tự khóa phiên hiện tại.</p>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 mt-7 flex items-center justify-end gap-3 border-t border-slate-100 bg-white/90 px-5 py-5 backdrop-blur sm:-mx-7 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 hover:text-slate-900 focus:ring-4 focus:ring-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white outline-none transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreate ? <FiPlus className="h-4 w-4" /> : <FiEdit2 className="h-4 w-4" />}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState(() => usersCache.items);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(() => !isUsersCacheFresh());
  const [saving, setSaving] = useState(false);
  const [workingUserId, setWorkingUserId] = useState(null);
  const [modalState, setModalState] = useState({ open: false, mode: 'create', user: null });
  const [formValues, setFormValues] = useState(getEmptyForm());
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (isUsersCacheFresh()) {
      return () => {
        isMounted = false;
      };
    }

    adminUserService.getAll()
      .then((data) => {
        if (!isMounted) return;
        const items = normalizeCollection(data);
        updateUsersCache(items);
        setUsers(items);
      })
      .catch((error) => {
        if (!isMounted) return;
        toast.error(getErrorMessage(error, 'Không thể tải danh sách người dùng.'));
        setUsers([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = users.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;

    return [
      item.username,
      item.email,
      item.first_name,
      item.last_name,
      item.vai_tro,
    ].some((value) => value?.toLowerCase().includes(keyword));
  });

  const totalAdmins = users.filter((item) => item.vai_tro === 'ADMIN').length;
  const totalLocked = users.filter((item) => !item.is_active).length;

  const resetModal = () => {
    setModalState({ open: false, mode: 'create', user: null });
    setFormValues(getEmptyForm());
    setFormError('');
  };

  const openCreateModal = () => {
    setModalState({ open: true, mode: 'create', user: null });
    setFormValues(getEmptyForm());
    setFormError('');
  };

  const openEditModal = (selectedUser) => {
    setModalState({ open: true, mode: 'edit', user: selectedUser });
    setFormValues({
      username: selectedUser.username || '',
      email: selectedUser.email || '',
      first_name: selectedUser.first_name || '',
      last_name: selectedUser.last_name || '',
      password: '',
      vai_tro: selectedUser.vai_tro || 'USER',
      is_active: Boolean(selectedUser.is_active),
      anh_dai_dien: selectedUser.anh_dai_dien || '',
    });
    setFormError('');
  };

  const onValueChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formValues.username.trim()) return 'Tên đăng nhập là bắt buộc.';
    if (modalState.mode === 'create' && !formValues.password.trim()) return 'Mật khẩu là bắt buộc khi tạo tài khoản mới.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      username: formValues.username.trim(),
      email: formValues.email.trim(),
      first_name: formValues.first_name.trim(),
      last_name: formValues.last_name.trim(),
      vai_tro: formValues.vai_tro,
      is_active: formValues.is_active,
      anh_dai_dien: formValues.anh_dai_dien.trim(),
    };

    if (formValues.password.trim()) {
      payload.password = formValues.password;
    }

    setSaving(true);
    setFormError('');

    try {
      const updatedUser = modalState.mode === 'create'
        ? await adminUserService.create(payload)
        : await adminUserService.update(modalState.user.id, payload);

      setUsers((prev) => {
        let nextUsers;
        if (modalState.mode === 'create') {
          nextUsers = [updatedUser, ...prev];
        } else {
          nextUsers = prev.map((item) => (item.id === updatedUser.id ? updatedUser : item));
        }
        updateUsersCache(nextUsers);
        return nextUsers;
      });

      toast.success(modalState.mode === 'create' ? 'Đã tạo tài khoản mới.' : 'Đã cập nhật người dùng.');
      resetModal();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Không thể lưu người dùng.'));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickUpdate = async (userId, payload, successMessage, fallbackMessage) => {
    setWorkingUserId(userId);
    try {
      const updatedUser = await adminUserService.update(userId, payload);
      setUsers((prev) => {
        const nextUsers = prev.map((item) => (item.id === updatedUser.id ? updatedUser : item));
        updateUsersCache(nextUsers);
        return nextUsers;
      });
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error, fallbackMessage));
    } finally {
      setWorkingUserId(null);
    }
  };

  const handleToggleLock = async (selectedUser) => {
    await handleQuickUpdate(
      selectedUser.id,
      { is_active: !selectedUser.is_active },
      selectedUser.is_active ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.',
      'Không thể cập nhật trạng thái tài khoản.',
    );
  };

  const handleToggleRole = async (selectedUser) => {
    const nextRole = selectedUser.vai_tro === 'ADMIN' ? 'USER' : 'ADMIN';
    await handleQuickUpdate(
      selectedUser.id,
      { vai_tro: nextRole },
      nextRole === 'ADMIN' ? 'Đã cấp quyền admin.' : 'Đã hạ quyền về user.',
      'Không thể cập nhật vai trò người dùng.',
    );
  };

  const handleDelete = async (selectedUser) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${selectedUser.username}"?`)) return;

    setWorkingUserId(selectedUser.id);
    try {
      await adminUserService.delete(selectedUser.id);
      setUsers((prev) => {
        const nextUsers = prev.filter((item) => item.id !== selectedUser.id);
        updateUsersCache(nextUsers);
        return nextUsers;
      });
      toast.success('Đã xóa tài khoản.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể xóa tài khoản.'));
    } finally {
      setWorkingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-500">Admin Studio</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Người dùng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kết nối dữ liệu thật từ hệ thống, CRUD tài khoản và cấp quyền admin trực tiếp trong dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <FiPlus className="h-4 w-4" />
          Tạo tài khoản
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FiUsers} label="Tổng người dùng" value={users.length} accent="from-cyan-500 to-blue-500" />
        <StatCard icon={FiShield} label="Tài khoản admin" value={totalAdmins} accent="from-fuchsia-500 to-pink-500" />
        <StatCard icon={FiLock} label="Tài khoản bị khóa" value={totalLocked} accent="from-amber-500 to-orange-500" />
        <StatCard icon={FiCheckCircle} label="Đang hoạt động" value={users.length - totalLocked} accent="from-emerald-500 to-teal-500" />
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo username, email, tên hoặc vai trò..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
              />
            </div>
          </div>
          <p className="text-sm text-slate-400">Admin có thể khóa/mở khóa, cấp quyền và chỉnh sửa hồ sơ từng tài khoản.</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                <th className="px-4 py-3 font-semibold">Người dùng</th>
                <th className="px-4 py-3 font-semibold">Liên hệ</th>
                <th className="px-4 py-3 font-semibold">Vai trò</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isSelf = user?.id === item.id;
                  const isWorking = workingUserId === item.id;
                  const displayName = [item.first_name, item.last_name].filter(Boolean).join(' ') || 'Chưa cập nhật tên';

                  return (
                    <tr key={item.id} className="align-top transition hover:bg-slate-50/60">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.anh_dai_dien ? (
                            <img src={item.anh_dai_dien} alt={item.username} className="h-11 w-11 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold uppercase text-white">
                              {item.username?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{item.username}</p>
                            <p className="text-xs text-slate-400">{displayName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-slate-500">
                          <div className="flex items-center gap-2">
                            <FiMail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.email || 'Chưa có email'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiUser className="h-3.5 w-3.5 text-slate-400" />
                            <span>ID #{item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.vai_tro === 'ADMIN'
                            ? 'bg-fuchsia-50 text-fuchsia-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.vai_tro === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(item.date_joined)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleRole(item)}
                            disabled={isSelf || isWorking}
                            className="rounded-xl border border-slate-200 p-2 text-fuchsia-600 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title={item.vai_tro === 'ADMIN' ? 'Hạ quyền về user' : 'Cấp quyền admin'}
                          >
                            <FiShield className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLock(item)}
                            disabled={isSelf || isWorking}
                            className="rounded-xl border border-slate-200 p-2 text-amber-600 transition hover:border-amber-200 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title={item.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {item.is_active ? <FiLock className="h-4 w-4" /> : <FiUnlock className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={isSelf || isWorking}
                            className="rounded-xl border border-slate-200 p-2 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Xóa tài khoản"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        state={modalState}
        values={formValues}
        saving={saving}
        formError={formError}
        onClose={resetModal}
        onChange={onValueChange}
        onSubmit={handleSubmit}
        isSelfEdit={user?.id === modalState.user?.id}
      />
    </div>
  );
}
