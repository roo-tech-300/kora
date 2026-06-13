import { Component } from 'react';
import type {ErrorInfo, ReactNode} from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {  
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 shadow-inner relative group">
              <div className="absolute inset-0 bg-rose-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <AlertCircle size={40} className="relative z-10" />
            </div>

            <h1 className="text-3xl font-black text-white tracking-tighter italic mb-4">
              System Fault Detected
            </h1>
            
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 px-2">
              An unexpected runtime error has interrupted the terminal session. The system core remains stable, but this node requires a reset.
            </p>

            {this.state.error && (
              <div className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-4 mb-8 text-left overflow-hidden">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic mb-2">Error Diagnostic</p>
                <p className="text-[11px] font-mono text-slate-500 break-words leading-tight">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={this.handleReload}
                className="h-12 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-indigo-900/20"
              >
                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                Attempt Recovery
              </button>
              
              <button
                onClick={this.handleReset}
                className="h-12 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700/50"
              >
                <Home size={16} />
                Return to Base
              </button>
            </div>

            <p className="mt-8 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] italic">
              Terminal Protection Active
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
