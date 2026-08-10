import React, { useState } from 'react';
import { Product, OrderItem } from '../types';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Check,
  X,
  CreditCard,
  MessageCircle,
  Truck,
  Lock,
  User,
  Plus,
  Minus,
  Trash2,
  LogIn,
  UserPlus,
  Heart,
  Eye,
  ArrowRightLeft,
  Tag,
  Percent,
} from 'lucide-react';
import { loginApi, registerPatientApi } from '../services/api';

interface StoreViewProps {
  products: Product[];
  cart: OrderItem[];
  currentUser?: any;
  onLoginSuccess?: (user: any) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onClearCart: () => void;
  language?: 'urdu' | 'english';
}

export const StoreView: React.FC<StoreViewProps> = ({
  products,
  cart,
  currentUser,
  onLoginSuccess,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  language = 'english',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const isUrdu = language === 'urdu';

  // Interactive Features: Wishlist, Compare, Quick View, Coupon Code, Recently Viewed
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<string>('');
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Login/Register state if user accesses cart without being logged in
  const [activeCartAuthTab, setActiveCartAuthTab] = useState<'login' | 'register'>('login');
  const [cartUsername, setCartUsername] = useState('');
  const [cartPassword, setCartPassword] = useState('');
  const [cartRegName, setCartRegName] = useState('');
  const [cartRegEmail, setCartRegEmail] = useState('');
  const [cartRegPhone, setCartRegPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState(isUrdu ? 'پاکستان (Pakistan)' : 'Pakistan');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'JazzCash' | 'Easypaisa' | 'BankTransfer' | 'Card'>('COD');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categories = [
    { id: 'all', labelUrdu: 'تمام مصنوعات', labelEnglish: 'All Products' },
    { id: 'hair', labelUrdu: 'ہیئر کیئر', labelEnglish: 'Hair Care' },
    { id: 'skin', labelUrdu: 'بیوٹی کریم و اسکن', labelEnglish: 'Beauty & Skincare' },
    { id: 'eye', labelUrdu: 'آئی کیئر و چشمے', labelEnglish: 'Eyewear & Lenses' },
    { id: 'perfume', labelUrdu: 'پرفیوم و عطر', labelEnglish: 'Perfumes & Attar' },
    { id: 'pain', labelUrdu: 'درد شفا کریم و تیل', labelEnglish: 'Pain Relief Oils' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.nameUrdu.includes(searchQuery) ||
      p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.product.pricePKR * item.quantity, 0);
  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const cartTotal = Math.max(0, subtotal - discountAmount);

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const toggleCompare = (product: Product) => {
    if (compareList.some((p) => p.id === product.id)) {
      setCompareList(compareList.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert(isUrdu ? 'آپ زیادہ سے زیادہ 3 پروڈکٹس موازنہ کر سکتے ہیں' : 'You can compare up to 3 products max');
        return;
      }
      setCompareList([...compareList, product]);
    }
  };

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    // Track in recently viewed
    if (!recentlyViewed.some((p) => p.id === product.id)) {
      setRecentlyViewed([product, ...recentlyViewed.slice(0, 4)]);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'HAFIZ10') {
      setAppliedDiscount(10);
      setCouponMsg(isUrdu ? '🎉 10% ڈسکاؤنٹ لاگو ہو گیا!' : '🎉 10% Coupon Discount Applied!');
    } else if (clean === 'FREESHIP' || clean === 'HAFIZ20') {
      setAppliedDiscount(20);
      setCouponMsg(isUrdu ? '🎉 20% سپیشل ڈسکاؤنٹ لاگو ہو گیا!' : '🎉 20% Special Coupon Applied!');
    } else {
      setCouponMsg(isUrdu ? 'غلط کوپن کوڈ! ڈیفالٹ کوڈ HAFIZ10 ٹرائی کریں' : 'Invalid Code! Try HAFIZ10');
    }
  };

  const handleCartLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await loginApi(cartUsername, cartPassword, 'patient');
      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        setCustomerName(res.user.name || '');
        setPhone(res.user.phone || '');
      } else {
        setAuthError(res.message || 'Login failed. Please check your username and password.');
      }
    } catch (err: any) {
      setAuthError('Connection error during login.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCartRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await registerPatientApi({
        name: cartRegName,
        email: cartRegEmail || `${cartRegName.replace(/\s+/g, '').toLowerCase()}@hafizclinic.com`,
        password: cartPassword,
        phone: cartRegPhone,
      });
      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        setCustomerName(res.user.name || cartRegName);
        setPhone(res.user.phone || cartRegPhone);
      } else {
        setAuthError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setAuthError('Connection error during registration.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      alert(isUrdu ? 'برائے مہربانی تمام ضروری خانے پر کریں۔' : 'Please fill in all required fields.');
      return;
    }
    setOrderPlaced(true);
    setTimeout(() => {
      onClearCart();
      setIsCheckoutOpen(false);
      setOrderPlaced(false);
    }, 4000);
  };

  return (
    <div className="py-12 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full inline-block">
              {isUrdu ? 'آن لائن آفیشل ہربل و آپٹیکل اسٹور' : 'Official Online Herbal & Optical Store'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              {isUrdu ? 'حافظ کلینک آن لائن شاپ (Hafiz Clinic Store)' : 'Hafiz Clinic Online E-Commerce Store'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm">
              {isUrdu
                ? 'ہوراب ہیئر آئل، بیوٹی کریم، پین ریلیو آئل، بلیو کٹ گلاسز، کانٹیکٹ لینز، اور عود پرفیوم کلیکشن آن لائن آرڈر کریں۔'
                : 'Shop authentic Hoorab Hair Oil, Beauty Cream, Pain Relief Oils, Blue Cut Computer Glasses, Contact Lenses, and Perfumes online.'}
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center space-y-2 shrink-0">
            <div className="text-xs text-amber-300 font-bold">{isUrdu ? 'آپ کی کارٹ آئٹمز' : 'Shopping Cart'}</div>
            <div className="text-2xl font-black text-white">{cart.reduce((s, i) => s + i.quantity, 0)} {isUrdu ? 'آئٹمز' : 'Items'}</div>
            <div className="text-xs text-emerald-200">{isUrdu ? 'کل رقم:' : 'Total:'} Rs. {cartTotal}</div>
            {cart.length > 0 && (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2 px-3 rounded-xl shadow"
              >
                {isUrdu ? 'چیک آؤٹ / Checkout' : 'Proceed to Checkout'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? 'پروڈکٹ کا نام تلاش کریں...' : 'Search product name...'}
              className={`w-full bg-white border border-slate-300 rounded-xl py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isUrdu ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            <Search className={`w-4 h-4 text-gray-400 absolute top-3 ${isUrdu ? 'right-3' : 'left-3'}`} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold w-full md:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isUrdu ? cat.labelUrdu : cat.labelEnglish}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isWish = wishlist.includes(prod.id);
            const isComp = compareList.some((c) => c.id === prod.id);

            return (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={prod.image}
                      alt={prod.nameUrdu}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                      {isUrdu ? prod.categoryUrdu : prod.category.toUpperCase()}
                    </span>

                    {/* Interactive Overlay Buttons: Wishlist, Compare, Quick View */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90">
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className={`p-1.5 rounded-full shadow transition-transform hover:scale-110 ${
                          isWish ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:text-red-500'
                        }`}
                        title={isWish ? 'Wishlist Remove' : 'Wishlist Add'}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => toggleCompare(prod)}
                        className={`p-1.5 rounded-full shadow transition-transform hover:scale-110 ${
                          isComp ? 'bg-emerald-600 text-white' : 'bg-white/90 text-gray-700 hover:text-emerald-600'
                        }`}
                        title={isUrdu ? 'موازنہ کریں' : 'Compare Product'}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenQuickView(prod)}
                        className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:text-emerald-700 shadow transition-transform hover:scale-110"
                        title={isUrdu ? 'فوری دیکھئے' : 'Quick View'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">{isUrdu ? prod.nameUrdu : prod.nameEnglish}</h3>
                    <p className="text-xs text-gray-500">{isUrdu ? prod.nameEnglish : prod.nameUrdu}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {isUrdu ? prod.descriptionUrdu : prod.descriptionEnglish}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-lg font-black text-emerald-800">Rs. {prod.pricePKR}</span>
                      {prod.originalPricePKR && (
                        <span className="text-xs text-gray-400 line-through">Rs. {prod.originalPricePKR}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isUrdu ? 'کارٹ میں شامل کریں' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Floating Tray */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 text-xs">
            <div>
              <strong className="text-amber-400 font-bold block">
                {isUrdu ? 'موازنہ ڈریگ:' : 'Compare Tray:'} {compareList.length}/3
              </strong>
              <span className="text-gray-300">
                {compareList.map((p) => (isUrdu ? p.nameUrdu : p.nameEnglish)).join(', ')}
              </span>
            </div>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl"
            >
              {isUrdu ? 'موازنہ ونڈو کھولیں' : 'Open Compare'}
            </button>
            <button onClick={() => setCompareList([])} className="text-red-400 font-bold underline text-[10px]">
              Clear
            </button>
          </div>
        )}

        {/* Compare Modal */}
        {isCompareOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-700" />
                  <span>{isUrdu ? 'پروڈکٹس کا تفصیلی موازنہ' : 'Product Comparison Matrix'}</span>
                </h3>
                <button onClick={() => setIsCompareOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {compareList.map((cp) => (
                  <div key={cp.id} className="border rounded-xl p-4 bg-slate-50 space-y-2">
                    <img src={cp.image} alt={cp.nameUrdu} className="w-full h-32 object-cover rounded-lg" />
                    <h4 className="font-bold text-sm text-slate-900">{isUrdu ? cp.nameUrdu : cp.nameEnglish}</h4>
                    <div className="text-emerald-800 font-black text-base">Rs. {cp.pricePKR}</div>
                    <p className="text-gray-600 leading-relaxed text-[11px]">
                      {isUrdu ? cp.descriptionUrdu : cp.descriptionEnglish}
                    </p>
                    <button
                      onClick={() => onAddToCart(cp)}
                      className="w-full bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs"
                    >
                      {isUrdu ? 'کارٹ میں ڈالیں' : 'Add to Cart'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs">
                  {isUrdu ? quickViewProduct.categoryUrdu : quickViewProduct.category.toUpperCase()}
                </span>
                <button onClick={() => setQuickViewProduct(null)} className="p-1 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.nameUrdu}
                  className="w-full h-56 object-cover rounded-2xl shadow border"
                />
                <div className="space-y-3 text-xs">
                  <h3 className="text-lg font-black text-slate-900">
                    {isUrdu ? quickViewProduct.nameUrdu : quickViewProduct.nameEnglish}
                  </h3>
                  <div className="text-xl font-black text-emerald-800">Rs. {quickViewProduct.pricePKR}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {isUrdu ? quickViewProduct.descriptionUrdu : quickViewProduct.descriptionEnglish}
                  </p>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 font-bold text-[11px]">
                    ✓ 100% Pure Herbal Formulation • Approved by Hafiz Clinic Consultants
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl shadow text-xs flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isUrdu ? 'کارٹ میں شامل کریں' : 'Add to Cart Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-emerald-900 text-white p-6 sticky top-0 z-10 flex justify-between items-center">
              <h3 className="text-lg font-black flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span>{isUrdu ? 'آن لائن آرڈر پروسیسنگ (Express Checkout)' : 'Express Checkout & Delivery'}</span>
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!currentUser ? (
                /* Login Required Notice & Form */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base">
                      {isUrdu ? 'کارٹ دیکھنے اور آرڈر کے لیے لاگ ان کریں' : 'Login Required to Access Cart'}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {isUrdu
                        ? 'شاپنگ کارٹ کا جائزہ لینے اور ہوم ڈیلیوری آرڈر کے لیے برائے مہربانی اپنے اکاؤنٹ میں لاگ ان یا نیا اکاؤنٹ رجسٹر کریں۔'
                        : 'To review your shopping cart items and complete your home delivery order, please login or create a patient account.'}
                    </p>
                  </div>

                  {/* Auth Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setActiveCartAuthTab('login'); setAuthError(''); }}
                      className={`flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 ${
                        activeCartAuthTab === 'login' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500'
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isUrdu ? 'پہلے سے رجسٹرڈ مریض (Login)' : 'Patient Login'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveCartAuthTab('register'); setAuthError(''); }}
                      className={`flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 ${
                        activeCartAuthTab === 'register' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isUrdu ? 'نیا مریض اکاؤنٹ بنائیں (Register)' : 'New Account'}</span>
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold text-center">
                      {authError}
                    </div>
                  )}

                  {activeCartAuthTab === 'login' ? (
                    <form onSubmit={handleCartLogin} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">{isUrdu ? 'یوزر نیم / ایم آر این (Username / MRN)' : 'Username or MRN'}</label>
                        <input
                          type="text"
                          required
                          value={cartUsername}
                          onChange={(e) => setCartUsername(e.target.value)}
                          placeholder="e.g. patient or MRN-12345"
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">{isUrdu ? 'پاس ورڈ (Password)' : 'Password'}</label>
                        <input
                          type="password"
                          required
                          value={cartPassword}
                          onChange={(e) => setCartPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow text-xs flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>{isAuthenticating ? 'Logging in...' : isUrdu ? 'لاگ ان کریں اور کارٹ دیکھیں' : 'Login & Show Cart'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleCartRegister} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">{isUrdu ? 'پورا نام (Full Name)' : 'Full Name'}</label>
                        <input
                          type="text"
                          required
                          value={cartRegName}
                          onChange={(e) => setCartRegName(e.target.value)}
                          placeholder={isUrdu ? 'محمد علی' : 'Muhammad Ali'}
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold mb-1">{isUrdu ? 'فون (Phone)' : 'Phone'}</label>
                          <input
                            type="tel"
                            required
                            value={cartRegPhone}
                            onChange={(e) => setCartRegPhone(e.target.value)}
                            placeholder="03001234567"
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">{isUrdu ? 'ای میل (Email)' : 'Email'}</label>
                          <input
                            type="email"
                            value={cartRegEmail}
                            onChange={(e) => setCartRegEmail(e.target.value)}
                            placeholder="patient@gmail.com"
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold mb-1">{isUrdu ? 'پاس ورڈ (Password)' : 'Password'}</label>
                        <input
                          type="password"
                          required
                          value={cartPassword}
                          onChange={(e) => setCartPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow text-xs flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isAuthenticating ? 'Creating Account...' : isUrdu ? 'رجسٹر کریں اور کارٹ دیکھیں' : 'Register & Access Cart'}</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : orderPlaced ? (
                /* Order Success View */
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-950">
                    {isUrdu ? 'مبارک ہو! آپ کا آرڈر درج کر لیا گیا ہے۔' : 'Order Placed Successfully!'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {isUrdu
                      ? 'حافظ کلینک کی نمائندہ ٹیم جلد ہی فون یا واٹس ایپ کے ذریعے آپ کے آرڈر کی تصدیق کرے گی۔'
                      : 'Our support team will contact you shortly via call or WhatsApp to confirm your dispatch.'}
                  </p>
                  <div className="bg-slate-100 p-3 rounded-xl text-xs font-mono font-bold text-slate-800">
                    Order Tracking ID: HFC-{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                </div>
              ) : (
                /* Full Cart & Checkout Form when logged in */
                <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs font-semibold text-slate-800">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-emerald-950">
                        {isUrdu ? 'لاگ ان شدہ مریض:' : 'Logged in as:'} {currentUser.name || currentUser.username}
                      </span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                      {currentUser.mrn || 'Patient'}
                    </span>
                  </div>

                  {/* Cart Items List */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-black text-slate-900 border-b pb-2 flex justify-between items-center text-sm">
                      <span>{isUrdu ? 'آپ کی کارٹ کے آئٹمز (Cart Items):' : 'Shopping Cart Items:'}</span>
                      <button type="button" onClick={onClearCart} className="text-xs text-red-600 hover:underline">
                        {isUrdu ? 'کارٹ خالی کریں' : 'Clear All'}
                      </button>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 font-semibold">
                        {isUrdu ? 'آپ کی کارٹ بالکل خالی ہے۔' : 'Your cart is currently empty.'}
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.nameUrdu} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                            <div>
                              <div className="font-bold text-slate-900">{isUrdu ? item.product.nameUrdu : item.product.nameEnglish}</div>
                              <div className="text-emerald-800 font-bold text-[11px]">Rs. {item.product.pricePKR}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg bg-slate-100 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-slate-200 text-slate-700"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 font-bold text-xs">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-slate-200 text-slate-700"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.product.id, 0)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Coupon Code Section */}
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-amber-950 text-xs flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isUrdu ? 'کوپن کوڈ / ڈسکاؤنٹ واؤچر (Coupon Code)' : 'Discount Voucher / Coupon Code'}</span>
                        </label>
                        <span className="text-[10px] text-amber-800 font-semibold">(Try: HAFIZ10)</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="HAFIZ10"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-xs uppercase bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs"
                        >
                          {isUrdu ? 'لاگو کریں' : 'Apply'}
                        </button>
                      </div>

                      {couponMsg && (
                        <div className="text-[11px] font-bold text-emerald-800">{couponMsg}</div>
                      )}
                    </div>

                    <div className="border-t pt-2 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>{isUrdu ? 'ذیلی کل:' : 'Subtotal:'}</span>
                        <span>Rs. {subtotal}</span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>{isUrdu ? `ڈسکاؤنٹ (${appliedDiscount}%):` : `Discount (${appliedDiscount}%):`}</span>
                          <span>- Rs. {discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-sm text-emerald-950 pt-1 border-t">
                        <span>{isUrdu ? 'صافی رقم (Net Total):' : 'Net Total Amount:'}</span>
                        <span>Rs. {cartTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  {cart.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 font-bold">{isUrdu ? 'پورا نام (Full Name) *' : 'Full Name *'}</label>
                          <input
                            type="text"
                            required
                            value={customerName || currentUser.name || ''}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={isUrdu ? 'نام لکھیں' : 'John Doe'}
                            className="w-full p-2.5 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">{isUrdu ? 'موبائل / واٹس ایپ نمبر *' : 'Phone / WhatsApp *'}</label>
                          <input
                            type="tel"
                            required
                            value={phone || currentUser.phone || ''}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="03001234567"
                            className="w-full p-2.5 border rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 font-bold">{isUrdu ? 'شہر (City) *' : 'City *'}</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder={isUrdu ? 'گوجرانوالہ، لاہور...' : 'Gujranwala, Lahore...'}
                            className="w-full p-2.5 border rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-bold">{isUrdu ? 'ملک (Country)' : 'Country'}</label>
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full p-2.5 border rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 font-bold">{isUrdu ? 'مکمل ڈیلیوری پتہ (Full Address) *' : 'Delivery Address *'}</label>
                        <textarea
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder={isUrdu ? 'مکان نمبر، گلی نمبر، محلہ / علاقہ...' : 'House #, Street #, Area...'}
                          className="w-full p-2.5 border rounded-lg bg-white h-20"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-bold">{isUrdu ? 'ادائیگی کا طریقہ (Payment Gateway)' : 'Payment Gateway Options'}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'COD', label: isUrdu ? 'کیش آن ڈلیوری (COD)' : 'Cash on Delivery (COD)' },
                            { id: 'Easypaisa', label: 'Easypaisa Mobile' },
                            { id: 'JazzCash', label: 'JazzCash Mobile' },
                            { id: 'Card', label: 'Visa / Mastercard' },
                            { id: 'BankTransfer', label: 'Bank Transfer (IBAN)' },
                          ].map((pm) => (
                            <button
                              type="button"
                              key={pm.id}
                              onClick={() => setPaymentMethod(pm.id as any)}
                              className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-all ${
                                paymentMethod === pm.id
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              {pm.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-sm shadow"
                      >
                        {isUrdu ? 'آرڈر کنفرم کریں (Confirm Order)' : 'Confirm Order'}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
