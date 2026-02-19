import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">

            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Something went wrong ⚠
            </h1>

            <p className="text-gray-600 mb-6">
              An unexpected error occurred.
              Please try refreshing the page.
            </p>

            <button
              onClick={this.handleRefresh}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>

          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
