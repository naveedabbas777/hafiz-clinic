import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  User,
  Calendar,
  Pill,
  Receipt,
  ArrowRight,
  Phone,
  Clock,
  Sparkles,
  MapPin,
  Stethoscope,
  Tag,
  CheckCircle,
  AlertCircle,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { Appointment, Product, MoneySlip } from '../types';
import { INITIAL_PHARMACY_BATCHES } from '../data/pharmacyBatchData';

export type SearchCategoryFilter = 'all' | 'patients' | 'appointments' | 'medicines' | 'slips';

export interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUrdu?: boolean;
  appointments: Appointment[];
  products: Product[];
  slips: MoneySlip[];
  users?: any[];
  onNavigateTab: (tab: string, filterParam?: string) => void;
  onSelectSlip?: (slip: MoneySlip) => void;
}

export const AdminGlobalSearchModal: React.FC<AdminGlobalSearchModalProps> = ({
  isOpen,
  onClose,
  isUrdu = false,
  appointments,
  products,
  slips,
  users = [],
  onNavigateTab,
  onSelectSlip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategoryFilter>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract and deduplicate unified patients across appointments, slips, and registered users
  const unifiedPatients = useMemo(() => {
    const map = new Map<string, {
      key: string;
      name: string;
      phone: string;
      mrn?: string;
      city?: string;
      problem?: string;
      lastVisit?: string;
      appointmentCount: number;
      slipCount: number;
    }>();

    // From Appointments
    appointments.forEach((app) => {
      const pName = (app.patientName || '').trim();
      const pPhone = (app.phone || '').trim();
      if (!pName) return;
      const key = (pPhone || pName).toLowerCase();

      const existing = map.get(key);
      if (existing) {
        existing.appointmentCount += 1;
        if (!existing.city && app.city) existing.city = app.city;
        if (!existing.problem && app.problem) existing.problem = app.problem;
        if (app.date && (!existing.lastVisit || app.date > existing.lastVisit)) existing.lastVisit = app.date;
      } else {
        map.set(key, {
          key,
          name: pName,
          phone: pPhone,
          city: app.city,
          problem: app.problem,
          lastVisit: app.date,
          appointmentCount: 1,
          slipCount: 0,
        });
      }
    });

    // From Money Slips
    slips.forEach((slp) => {
      const pName = (slp.patientName || '').trim();
      const pPhone = (slp.patientPhone || '').trim();
      if (!pName) return;
      const key = (pPhone || pName).toLowerCase();

      const existing = map.get(key);
      if (existing) {
        existing.slipCount += 1;
        if (!existing.mrn && slp.mrnNumber) existing.mrn = slp.mrnNumber;
        if (slp.date && (!existing.lastVisit || slp.date > existing.lastVisit)) existing.lastVisit = slp.date;
      } else {
        map.set(key, {
          key,
          name: pName,
          phone: pPhone,
          mrn: slp.mrnNumber,
          lastVisit: slp.date,
          appointmentCount: 0,
          slipCount: 1,
        });
      }
    });

    // From Registered Users
    users.forEach((usr) => {
      if (usr.role && usr.role !== 'patient') return;
      const pName = (usr.name || '').trim();
      const pPhone = (usr.phone || '').trim();
      if (!pName) return;
      const key = (pPhone || pName).toLowerCase();

      const existing = map.get(key);
      if (existing) {
        if (!existing.mrn && usr.mrn) existing.mrn = usr.mrn;
        if (!existing.city && usr.city) existing.city = usr.city;
      } else {
        map.set(key, {
          key,
          name: pName,
          phone: pPhone,
          mrn: usr.mrn,
          city: usr.city,
          appointmentCount: 0,
          slipCount: 0,
        });
      }
    });

    return Array.from(map.values());
  }, [appointments, slips, users]);

  // Combined Pharmacy Batches & Products
  const unifiedMedicines = useMemo(() => {
    const list: Array<{
      id: string;
      nameEnglish: string;
      nameUrdu: string;
      category: string;
      price: number;
      stock?: number;
      rackLocation?: string;
      batchNumber?: string;
      source: 'product' | 'batch';
      rawProduct?: Product;
    }> = [];

    // Products Catalog
    products.forEach((p) => {
      list.push({
        id: p.id,
        nameEnglish: p.nameEnglish || (p as any).name || 'Herbal Formulation',
        nameUrdu: p.nameUrdu || '',
        category: p.category || 'Pharmacy Item',
        price: p.pricePKR,
        source: 'product',
        rawProduct: p,
      });
    });

    // Pharmacy Inventory Batches
    INITIAL_PHARMACY_BATCHES.forEach((b) => {
      list.push({
        id: b.id,
        nameEnglish: b.productNameEnglish,
        nameUrdu: b.productNameUrdu,
        category: 'Pharmacy Batch',
        price: b.salePricePKR,
        stock: b.currentStock,
        rackLocation: b.rackLocation,
        batchNumber: b.batchNumber,
        source: 'batch',
      });
    });

    return list;
  }, [products]);

  // Search Filtering Algorithm
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const cleanQuery = query.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');

    if (!query) {
      return {
        patients: unifiedPatients.slice(0, 5),
        appointments: appointments.slice(0, 5),
        medicines: unifiedMedicines.slice(0, 5),
        slips: slips.slice(0, 5),
        totalCount: 0,
      };
    }

    // 1. Patient Matches
    const matchingPatients = unifiedPatients.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchPhone = p.phone && p.phone.replace(/\D/g, '').includes(cleanQuery);
      const matchCity = p.city && p.city.toLowerCase().includes(query);
      const matchMrn = p.mrn && p.mrn.toLowerCase().includes(query);
      const matchProblem = p.problem && p.problem.toLowerCase().includes(query);
      return matchName || matchPhone || matchCity || matchMrn || matchProblem;
    });

    // 2. Appointment ID & Token Matches
    const matchingAppointments = appointments.filter((a) => {
      const appId = (a.id || '').toLowerCase();
      const tokenNum = String(a.tokenNumber || '');
      const matchId = appId.includes(query) || appId.replace(/\D/g, '').includes(cleanQuery);
      const matchToken = tokenNum.includes(query);
      const matchPatient = (a.patientName || '').toLowerCase().includes(query);
      const matchPhone = (a.phone || '').replace(/\D/g, '').includes(cleanQuery);
      const matchDoctor = (a.doctorName || '').toLowerCase().includes(query);
      const matchStatus = (a.status || '').toLowerCase().includes(query);
      return matchId || matchToken || matchPatient || matchPhone || matchDoctor || matchStatus;
    });

    // 3. Medicine & Pharmacy Matches
    const matchingMedicines = unifiedMedicines.filter((m) => {
      const matchEn = m.nameEnglish.toLowerCase().includes(query);
      const matchUr = m.nameUrdu.includes(query);
      const matchCat = m.category.toLowerCase().includes(query);
      const matchBatch = m.batchNumber && m.batchNumber.toLowerCase().includes(query);
      const matchRack = m.rackLocation && m.rackLocation.toLowerCase().includes(query);
      return matchEn || matchUr || matchCat || matchBatch || matchRack;
    });

    // 4. Money Slips & Invoices Matches
    const matchingSlips = slips.filter((s) => {
      const slipNo = (s.slipNo || '').toLowerCase();
      const matchSlipNo = slipNo.includes(query) || slipNo.replace(/\D/g, '').includes(cleanQuery);
      const matchPatient = (s.patientName || '').toLowerCase().includes(query);
      const matchPhone = (s.patientPhone || '').replace(/\D/g, '').includes(cleanQuery);
      const matchMrn = (s.mrnNumber || '').toLowerCase().includes(query);
      const matchDoctor = (s.doctorName || '').toLowerCase().includes(query);
      return matchSlipNo || matchPatient || matchPhone || matchMrn || matchDoctor;
    });

    const totalCount =
      matchingPatients.length +
      matchingAppointments.length +
      matchingMedicines.length +
      matchingSlips.length;

    return {
      patients: matchingPatients,
      appointments: matchingAppointments,
      medicines: matchingMedicines,
      slips: matchingSlips,
      totalCount,
    };
  }, [searchQuery, unifiedPatients, appointments, unifiedMedicines, slips]);

  if (!isOpen) return null;

  const isFiltering = searchQuery.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/80">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUrdu
                  ? 'مریض کا نام، فون نمبر، اپائنٹمنٹ ID، نسخہ، یا دوا تلاش کریں...'
                  : 'Search patient name, phone, appointment ID (APP-001), medicine, or invoice...'
              }
              className="w-full text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
            <span>ESC</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills & Quick Filter Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <span className="text-slate-600 mr-1 text-[11px] shrink-0">
            {isUrdu ? 'فلٹر کیٹیگری:' : 'Filter:'}
          </span>

          {[
            { id: 'all', label: isUrdu ? 'سب نتائج' : 'All Results', count: isFiltering ? searchResults.totalCount : undefined },
            { id: 'patients', label: isUrdu ? 'مریض ریکارڈز' : 'Patients', count: isFiltering ? searchResults.patients.length : unifiedPatients.length },
            { id: 'appointments', label: isUrdu ? 'اپائنٹمنٹس ID' : 'Appointments', count: isFiltering ? searchResults.appointments.length : appointments.length },
            { id: 'medicines', label: isUrdu ? 'ادویات و فارمیسی' : 'Medicines & Stock', count: isFiltering ? searchResults.medicines.length : unifiedMedicines.length },
            { id: 'slips', label: isUrdu ? 'منی سلپ / انوائس' : 'Invoices & Slips', count: isFiltering ? searchResults.slips.length : slips.length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as SearchCategoryFilter)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeCategory === cat.id ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {isFiltering && searchResults.totalCount === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {isUrdu ? 'کوئی ریکارڈ نہیں ملا' : `No records found matching "${searchQuery}"`}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isUrdu
                  ? 'براہ کرم مریض کا نام، درست فون نمبر، اپائنٹمنٹ ID (مثلاً APP-001) یا دوا کا نام دوبارہ چیک کریں۔'
                  : 'Try searching by a partial phone number, patient name, doctor, appointment token ID, or medication.'}
              </p>
            </div>
          )}

          {/* 1. PATIENT RECORDS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'patients') && searchResults.patients.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isUrdu ? 'مریض ریکارڈز (Patient Records)' : 'Patient Records'}</span>
                  <span className="text-[11px] font-mono text-slate-600">({searchResults.patients.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {searchResults.patients.map((pat) => (
                  <div
                    key={pat.key}
                    onClick={() => {
                      onNavigateTab('appointments', pat.name);
                      onClose();
                    }}
                    className="group p-3.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {pat.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-950 flex items-center gap-1.5">
                            <span>{pat.name}</span>
                            {pat.mrn && (
                              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                {pat.mrn}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                            {pat.phone && (
                              <span className="flex items-center gap-1 font-mono text-slate-700">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {pat.phone}
                              </span>
                            )}
                            {pat.city && (
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {pat.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-slate-400 group-hover:text-emerald-700 transition-colors p-1">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>

                    {pat.problem && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic bg-white/80 p-1.5 rounded-lg border border-slate-100">
                        {pat.problem}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>{pat.appointmentCount} Appointments • {pat.slipCount} Invoices</span>
                      <span className="text-emerald-700 font-bold group-hover:underline">
                        {isUrdu ? 'ریکارڈ دیکھیں →' : 'View Patient →'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. APPOINTMENT IDS & TOKENS SECTION */}
          {(activeCategory === 'all' || activeCategory === 'appointments') && searchResults.appointments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isUrdu ? 'اپائنٹمنٹس ID و او پی ڈی ٹوکن (Appointments)' : 'Appointments & OPD Tokens'}</span>
                  <span className="text-[11px] font-mono text-slate-600">({searchResults.appointments.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {searchResults.appointments.map((app) => (
                  <div
                    key={app.id || (app as any)._id}
                    onClick={() => {
                      onNavigateTab('appointments', app.id);
                      onClose();
                    }}
                    className="group p-3.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-lg">
                          {app.id || 'APP-101'}
                        </span>
                        {app.tokenNumber && (
                          <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            Token #{app.tokenNumber}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          app.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {app.status || 'Pending'}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="font-bold text-slate-900 text-sm">{app.patientName}</div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{app.doctorName || 'Senior Consultant'}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{app.date} • {app.timeSlot}</span>
                      <span className="text-emerald-700 font-bold group-hover:underline">
                        Rs. {app.doctorFee || 1500} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MEDICINES, PRODUCTS & PHARMACY BATCHES SECTION */}
          {(activeCategory === 'all' || activeCategory === 'medicines') && searchResults.medicines.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isUrdu ? 'ادویات و فارمیسی انوینٹری (Medicines & Pharmacy)' : 'Medicines & Pharmacy Catalog'}</span>
                  <span className="text-[11px] font-mono text-slate-600">({searchResults.medicines.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {searchResults.medicines.map((med) => (
                  <div
                    key={`${med.source}-${med.id}`}
                    onClick={() => {
                      if (med.source === 'batch') {
                        onNavigateTab('pharmacy_pos', med.nameEnglish);
                      } else {
                        onNavigateTab('products', med.nameEnglish);
                      }
                      onClose();
                    }}
                    className="group p-3.5 bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-purple-950">
                          {med.nameEnglish}
                        </div>
                        {med.nameUrdu && (
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            {med.nameUrdu}
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-lg shrink-0">
                        Rs. {med.price}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {med.category}
                      </span>
                      {typeof med.stock === 'number' && (
                        <span
                          className={`font-bold ${
                            med.stock <= 10 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          Stock: {med.stock} units
                        </span>
                      )}
                      {med.rackLocation && (
                        <span className="text-slate-600 italic">
                          {med.rackLocation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. MONEY SLIPS & PATIENT INVOICES SECTION */}
          {(activeCategory === 'all' || activeCategory === 'slips') && searchResults.slips.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isUrdu ? 'انوائسز و منی سلپس (Money Slips & Bills)' : 'Invoices & Money Slips'}</span>
                  <span className="text-[11px] font-mono text-slate-600">({searchResults.slips.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {searchResults.slips.map((slp) => (
                  <div
                    key={slp.id || slp.slipNo}
                    onClick={() => {
                      if (onSelectSlip) {
                        onSelectSlip(slp);
                      } else {
                        onNavigateTab('slips', slp.slipNo);
                      }
                      onClose();
                    }}
                    className="group p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                        {slp.slipNo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          slp.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {slp.paymentStatus || 'Unpaid'}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="font-bold text-slate-900 text-sm">{slp.patientName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Doctor: {slp.doctorName || 'Hafiz Clinic Consultant'}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>{slp.date} • {slp.paymentMethod || 'Cash'}</span>
                      <span className="text-emerald-700 font-bold">
                        Total: Rs. {slp.totalAmount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-slate-600 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>
              <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono font-bold text-slate-700">Ctrl + K</kbd> anywhere to open
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              {searchResults.totalCount > 0 ? `${searchResults.totalCount} matches found` : 'Hafiz Clinic Global Directory'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
