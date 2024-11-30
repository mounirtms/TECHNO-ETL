import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Custom styles for different types of toasts
        success: {
          duration: 3000,
          style: {
            background: '#28a745',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#28a745',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#dc3545',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#dc3545',
          },
        },
        loading: {
          style: {
            background: '#007bff',
            color: '#fff',
          },
        },
      }}
    />
  );
};

export default Toast;
