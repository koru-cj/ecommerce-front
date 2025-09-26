// src/components/ErrorBoundary.jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('🧨 Error atrapado por ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Algo salió mal. Recargá la página o contactá al soporte.</h2>;
    }

    return this.props.children;
  }
}
