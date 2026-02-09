import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full max-w-xl mx-auto p-8 bg-white/90 backdrop-blur-md rounded-[2rem] border-4 border-white shadow-2xl text-center">
            <h2 className="text-3xl font-black text-[#1e3a8a] mb-2">Something went wrong</h2>
            <p className="text-[#1e3a8a]/60 font-bold mb-6">Please try again.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-8 py-3 bg-[#FF6B6B] text-white rounded-full font-black uppercase tracking-widest shadow-[0_8px_0_#D64545] hover:translate-y-1 active:shadow-none transition-all"
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
