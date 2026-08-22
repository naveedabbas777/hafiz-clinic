import React, { useState } from 'react';
import {
  X,
  Lock,
  UserCheck,
  ShieldCheck,
  Key,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Bed,
  Heart,
  ShoppingCart,
  Radio,
  Activity,
  Eye,
} from 'lucide-react';
import { StaffUser } from '../types';
import {
  getOperationalStaffOnly,
  authenticateStaffUser,
} from '../data/staffData';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: StaffUser, targetView: string) => void;
  language?: 'urdu' | 'english';
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language = 'english',
}) => {
  const isUrdu = language === 'urdu';
  const staffList = getOperationalStaffOnly();

  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!inputUsername.trim()) {
      setAuthError(isUrdu ? 'برائے مہربانی اپنا تفویض کردہ یوزر نیم درج کریں۔' : 'Please enter your Admin-issued staff username.');
      return;
    }

    if (!inputPassword.trim()) {
      setAuthError(isUrdu ? 'برائے مہربانی پاس ورڈ درج کریں۔' : 'Please enter your account password.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      const result = authenticateStaffUser(inputUsername, inputPassword);

      if (!result.success || !result.user) {
        setAuthError(result.message);
        setIsAuthenticating(false);
        return;
      }

      const user = result.user;

      // Determine target view based on role
      let targetView = 'staff-portals';
      if (user.role === 'doctor') targetView = 'doctor-portal';
      else if (user.role === 'nurse') targetView = 'nursing-station';
      else if (user.role === 'pharmacist') targetView = 'pharmacy-pos';
      else if (user.role === 'ipd_incharge') targetView = 'ipd-ward';
      else if (user.role === 'lab_doctor') targetView = 'pathology-lab';
      else targetView = 'admin';

      setAuthSuccess(
        isUrdu
          ? `خوش آمدید ${user.name}! ${user.department} میں رسائی کی تصدیق ہو گئی۔`
          : `Welcome ${user.name}! Access authorized for ${user.department}.`
      );
      setIsAuthenticating(false);

      setTimeout(() => {
        onLoginSuccess(user, targetView);
        onClose();
      }, 500);
    }, 300);
  };

  const handleSelectDemoUser = (staff: StaffUser) => {
    setInputUsername(staff.username);
    setInputPassword(staff.password || 'doc123');
    setAuthError('');
    setAuthSuccess('');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />;
      case 'nurse':
        return <Heart className="w-3.5 h-3.5 text-rose-700" />;
      case 'pharmacist':
        return <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />;
      case 'ipd_incharge':
        return <Bed className="w-3.5 h-3.5 text-teal-700" />;
      case 'lab_doctor':
        return <Activity className="w-3.5 h-3.5 text-purple-700" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir="ltr"
    >
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 sm:p-7 text-slate-900 space-y-5 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-center font-bold shrink-0">
            <Lock className="w-6 h-6 text-emerald-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-slate-900">
                {isUrdu ? 'اسٹاف ممبر لاگ ان اسکرین' : 'Hospital Staff Member Login'}
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                RBAC Security
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'ایڈمن کے جاری کردہ کریڈنشلز کے ذریعے اپنے شعبہ جاتی پورٹل میں لاگ ان کریں'
                : 'Sign in with your Admin-issued staff username & password to access your department.'}
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{authSuccess}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAuthenticate} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 mb-1.5 font-bold">
              {isUrdu ? 'اسٹاف یوزر نیم (Staff Username)' : 'Staff Username'} <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="e.g. doctor1, nurse1, pharmacist, dr_xray, dr_pathology"
              className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1.5 font-bold">
              {isUrdu ? 'پاس ورڈ (Password)' : 'Account Password'} <span className="text-rose-600">*</span>
            </label>
            <input
              type="password"
              required
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isAuthenticating
                ? (isUrdu ? 'تصدیق کی جا رہی ہے...' : 'Verifying Credentials...')
                : (isUrdu ? 'لاگ ان کریں اور پورٹل کھولیں' : 'Sign In & Open Departmental Workspace')}
            </span>
          </button>
        </form>

        {/* Quick Demo Staff Autofill Buttons */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isUrdu ? 'فوری ٹیسٹ لاگ ان اکاؤنٹس (Quick Select):' : 'Click Any Active Staff Member to Test Login:'}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{staffList.length} Active Accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-44 overflow-y-auto">
            {staffList.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleSelectDemoUser(staff)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  inputUsername === staff.username
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getRoleIcon(staff.role)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">{staff.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <span>User:</span>
                      <strong className="text-slate-800">{staff.username}</strong>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 text-center pt-1">
            {isUrdu
              ? 'کسی بھی اسٹاف ممبر پر کلک کریں، یوزر نیم و پاس ورڈ خود بخود بھر جائے گا۔'
              : 'Clicking any staff member automatically populates their verified credentials.'}
          </p>
        </div>
      </div>
    </div>
  );
};
