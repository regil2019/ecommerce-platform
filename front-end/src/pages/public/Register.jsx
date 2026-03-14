import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MagicCard } from '../../components/magicui/MagicCard';
import { ShimmerButton } from '../../components/magicui/ShimmerButton';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.email) errs.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.password) errs.password = 'Password é obrigatória';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!form.confirm) errs.confirm = 'Por favor confirma a password';
    else if (form.password !== form.confirm) errs.confirm = 'As passwords não coincidem';
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Conta criada com sucesso! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden bg-background px-4 py-8">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.015] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-reg" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-reg)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slideUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Criar conta</h1>
          <p className="text-muted-foreground mt-1 text-sm">Junte-se a nós, é grátis e rápido</p>
        </div>

        {/* Card */}
        <MagicCard
          className="p-0"
          spotlightColor="rgba(139, 92, 246, 0.08)"
          size={500}
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-4" noValidate>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="block text-sm font-medium text-foreground">Nome completo</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="João Silva"
                  autoComplete="name"
                  className={`w-full rounded-xl border bg-muted/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                    hover:border-border/80
                    ${errors.name ? 'border-red-500/70 focus:ring-red-500/40' : 'border-border/50'}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ti@exemplo.com"
                  autoComplete="email"
                  className={`w-full rounded-xl border bg-muted/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                    hover:border-border/80
                    ${errors.email ? 'border-red-500/70 focus:ring-red-500/40' : 'border-border/50'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border bg-muted/30 py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                    hover:border-border/80
                    ${errors.password ? 'border-red-500/70 focus:ring-red-500/40' : 'border-border/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              {/* Password strength indicator */}
              {form.password && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4 : 3;
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= strength
                          ? strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-yellow-500' : strength <= 3 ? 'bg-blue-500' : 'bg-emerald-500'
                          : 'bg-border/50'}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-foreground">Confirmar password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repete a password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border bg-muted/30 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                    hover:border-border/80
                    ${errors.confirm ? 'border-red-500/70 focus:ring-red-500/40' : form.confirm && form.confirm === form.password ? 'border-emerald-500/50' : 'border-border/50'}`}
                />
                {form.confirm && form.confirm === form.password && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            {/* Submit */}
            <ShimmerButton
              type="submit"
              disabled={loading}
              borderRadius="12px"
              background="radial-gradient(ellipse at top, #8b5cf6 0%, #6d28d9 60%, #3730a3 100%)"
              className="w-full py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  A criar conta…
                </span>
              ) : 'Criar conta'}
            </ShimmerButton>

          </form>

          {/* Footer */}
          <div className="px-8 pb-7 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">Já tens conta?</span>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-4 block w-full rounded-xl border border-border/50 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200"
            >
              Entrar na minha conta
            </Link>
          </div>
        </MagicCard>
      </div>
    </div>
  );
};

export default Register;
