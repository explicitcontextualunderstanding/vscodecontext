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

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(_error, errorInfo) { // eslint-disable-line no-unused-vars
    // Report error to extension (error parameter is used in postMessage)
    vscode.postMessage({
      command: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
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
  switch (message.command) {
    case 'error':
      console.error('Error from extension:', message.error);
      break;
    default:
      console.warn('Unknown message:', message);
  }
});