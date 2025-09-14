export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export const parseApiError = (error: any): ApiError => {
  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data.message || 'Invalid input. Please check your data.',
          code: 'VALIDATION_ERROR',
          field: data.field
        };
      case 401:
        return {
          message: 'Please log in to continue.',
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND'
        };
      case 409:
        return {
          message: data.message || 'This item already exists.',
          code: 'CONFLICT'
        };
      case 422:
        return {
          message: data.message || 'Invalid data provided.',
          code: 'UNPROCESSABLE_ENTITY',
          field: data.field
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR'
        };
      default:
        return {
          message: data.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR'
        };
    }
  }

  // Handle network errors
  if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
  }

  // Handle other errors
  return {
    message: error.message || 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR'
  };
};

export const validateDate = (date: Date | null, fieldName: string = 'Date'): string | null => {
  if (!date) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return `${fieldName} cannot be in the past.`;
  }
  
  return null;
};

export const validateTitle = (title: string): string | null => {
  if (!title.trim()) {
    return 'Title is required.';
  }
  
  if (title.trim().length < 3) {
    return 'Title must be at least 3 characters long.';
  }
  
  if (title.length > 255) {
    return 'Title must be less than 255 characters.';
  }
  
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (description.length > 1000) {
    return 'Description must be less than 1000 characters.';
  }
  
  return null;
};
