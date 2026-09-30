import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TrackOps BD caught application error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('trackops_token');
      localStorage.removeItem('trackops_user');
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-4 text-center font-sans">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl font-bold shadow-md shadow-orange-500/20">
              ⚡
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              Interface Refreshed
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              We detected an update or cached state. Click below to refresh your session and load TrackOps BD.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-gradient-to-r from-[#FF7A50] to-[#FF5216] hover:from-[#FF8962] hover:to-[#E6450A] text-white rounded-full font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              Reload TrackOps BD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
