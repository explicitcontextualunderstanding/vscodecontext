/** @jsxImportSource react */
import React from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    vscode.postMessage({
      command: 'error',
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack ?? '',
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return <div>Error occurred - check extension logs</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div>Hello World</div>
    </ErrorBoundary>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
