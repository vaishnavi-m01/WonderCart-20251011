/**
 * Network Utilities
 * Handles network connectivity and error states
 */

// import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

class NetworkUtils {
  /**
   * Check if device is connected to internet
   */
  static async isConnected(): Promise<boolean> {
    // Temporarily return true to avoid NetInfo issues
    return true;
    // try {
    //   const state = await NetInfo.fetch();
    //   return state.isConnected === true && state.isInternetReachable === true;
    // } catch (error) {
    //   console.error('Network check failed:', error);
    //   return false;
    // }
  }

  /**
   * Get detailed network state
   */
  static async getNetworkState(): Promise<NetworkState> {
    // Temporarily return default state to avoid NetInfo issues
    return {
      isConnected: true,
      type: 'unknown',
      isInternetReachable: true,
    };
    // try {
    //   const state = await NetInfo.fetch();
    //   return {
    //     isConnected: state.isConnected === true,
    //     type: state.type,
    //     isInternetReachable: state.isInternetReachable,
    //   };
    // } catch (error) {
    //   console.error('Failed to get network state:', error);
    //   return {
    //     isConnected: false,
    //     type: null,
    //     isInternetReachable: false,
    //   };
    // }
  }

  /**
   * Subscribe to network state changes
   */
  static subscribeToNetworkChanges(callback: (state: NetworkState) => void) {
    return NetInfo.addEventListener(callback);
  }

  /**
   * Handle network errors with user-friendly messages
   */
  static getNetworkErrorMessage(error: any): string {
    if (!error.response) {
      // Network error
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return 'No internet connection. Please check your network and try again.';
      }
      if (error.code === 'TIMEOUT') {
        return 'Request timed out. Please try again.';
      }
      return 'Network error. Please check your connection and try again.';
    }

    // HTTP error
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    // Network errors are usually retryable
    if (!error.response) {
      return true;
    }

    // HTTP 5xx errors are usually retryable
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  /**
   * Get retry delay based on attempt number
   */
  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
}

export default NetworkUtils;
