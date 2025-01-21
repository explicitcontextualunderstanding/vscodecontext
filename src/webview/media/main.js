/* global vscode, React, ReactDOM */
/** @jsx React.createElement */
import PropTypes from 'prop-types';
class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Report error to extension
    vscode.postMessage({
      command: 'error',
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack ?? ''
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return <div className="error">
        Something went wrong. Please try again.
      </div>;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <h1>VSCode Context Webview</h1>
      </div>
    </ErrorBoundary>
  );
}

// Initialize React
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Handle messages from extension
window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'error') {
    console.error('Error from extension:', message.error);
  } else {
    console.warn('Unknown message:', message);
  }
});