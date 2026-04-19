import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell loading-shell">
          <div className="loading-card">
            <span className="panel-kicker">Runtime error</span>
            <h1>Semisupply Atlas</h1>
            <p>{String(this.state.error.message ?? this.state.error)}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
