/**
 * Error Messages and Feedback Translations
 * Comprehensive error handling translations for all supported languages
 * Includes RTL support and contextual error messages
 */

export const errorMessages = {
  en: {
    errors: {
      unknown: 'An unknown error occurred',
      network: {
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
        offline: 'You appear to be offline. Please check your connection.',
        timeout: 'Request timed out. Please try again.',
        serverError: 'Server error occurred. Please try again later.',
      },
      chunk: {
        title: 'Loading Error',
        description: 'Failed to load application resources. This may be due to a recent update.',
        reload: 'Please reload the page to get the latest version.',
      },
      auth: {
        unauthorized: 'You are not authorized to perform this action.',
        loginRequired: 'Please log in to continue.',
        sessionExpired: 'Your session has expired. Please log in again.',
        invalidCredentials: 'Invalid username or password.',
        accountLocked: 'Your account has been locked. Please contact support.',
      },
      data: {
        notFound: 'The requested data was not found.',
        validation: 'Data validation failed. Please check your input.',
        saveFailed: 'Failed to save data. Please try again.',
        deleteFailed: 'Failed to delete data. Please try again.',
      },
      file: {
        uploadFailed: 'File upload failed. Please try again.',
        invalidFormat: 'Invalid file format.',
        sizeLimit: 'File size exceeds the allowed limit.',
      },
    },
    navigation: {
      search: 'Search',
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      customers: 'Customers',
      inventory: 'Inventory',
      categories: 'Categories',
      mdm: 'MDM',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
  },
  fr: {
    errors: {
      unknown: 'Une erreur inconnue s\'est produite',
      network: {
        title: 'Erreur réseau',
        description: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.',
        offline: 'Vous semblez être hors ligne. Veuillez vérifier votre connexion.',
        timeout: 'Délai de requête dépassé. Veuillez réessayer.',
        serverError: 'Une erreur serveur s\'est produite. Veuillez réessayer plus tard.',
      },
      chunk: {
        title: 'Erreur de chargement',
        description: 'Échec du chargement des ressources de l\'application. Cela peut être dû à une mise à jour récente.',
        reload: 'Veuillez recharger la page pour obtenir la dernière version.',
      },
      auth: {
        unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action.',
        loginRequired: 'Veuillez vous connecter pour continuer.',
        sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
        invalidCredentials: 'Nom d\'utilisateur ou mot de passe invalide.',
        accountLocked: 'Votre compte a été verrouillé. Veuillez contacter le support.',
      },
      data: {
        notFound: 'Les données demandées n\'ont pas été trouvées.',
        validation: 'Échec de la validation des données. Veuillez vérifier votre saisie.',
        saveFailed: 'Échec de l\'enregistrement des données. Veuillez réessayer.',
        deleteFailed: 'Échec de la suppression des données. Veuillez réessayer.',
      },
      file: {
        uploadFailed: 'Échec du téléchargement du fichier. Veuillez réessayer.',
        invalidFormat: 'Format de fichier invalide.',
        sizeLimit: 'La taille du fichier dépasse la limite autorisée.',
      },
    },
    navigation: {
      search: 'Recherche',
      dashboard: 'Tableau de bord',
      products: 'Produits',
      orders: 'Commandes',
      customers: 'Clients',
      inventory: 'Inventaire',
      categories: 'Catégories',
      mdm: 'MDM',
      reports: 'Rapports',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
    },
    common: {
      loading: 'Chargement...',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      refresh: 'Actualiser',
      search: 'Rechercher',
      filter: 'Filtrer',
      close: 'Fermer',
      success: 'Succès',
      error: 'Erreur',
      warning: 'Avertissement',
      info: 'Info',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
    },
  },
  ar: {
    errors: {
      unknown: 'حدث خطأ غير معروف',
      network: {
        title: 'خطأ في الشبكة',
        description: 'غير قادر على الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت وحاول مرة أخرى.',
        offline: 'يبدو أنك غير متصل بالإنترنت. يرجى التحقق من الاتصال.',
        timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
        serverError: 'حدث خطأ في الخادم. يرجى المحاولة لاحقًا.',
      },
      chunk: {
        title: 'خطأ في التحميل',
        description: 'فشل تحميل موارد التطبيق. قد يكون هذا بسبب تحديث حديث.',
        reload: 'يرجى إعادة تحميل الصفحة للحصول على أحدث إصدار.',
      },
      auth: {
        unauthorized: 'أنت غير مخول لتنفيذ هذا الإجراء.',
        loginRequired: 'يرجى تسجيل الدخول للمتابعة.',
        sessionExpired: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
        invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
        accountLocked: 'تم قفل حسابك. يرجى الاتصال بالدعم.',
      },
      data: {
        notFound: 'لم يتم العثور على البيانات المطلوبة.',
        validation: 'فشل التحقق من صحة البيانات. يرجى التحقق من المدخلات.',
        saveFailed: 'فشل حفظ البيانات. يرجى المحاولة مرة أخرى.',
        deleteFailed: 'فشل حذف البيانات. يرجى المحاولة مرة أخرى.',
      },
      file: {
        uploadFailed: 'فشل تحميل الملف. يرجى المحاولة مرة أخرى.',
        invalidFormat: 'تنسيق ملف غير صالح.',
        sizeLimit: 'حجم الملف يتجاوز الحد المسموح به.',
      },
    },
    navigation: {
      search: 'بحث',
      dashboard: 'لوحة التحكم',
      products: 'المنتجات',
      orders: 'الطلبات',
      customers: 'العملاء',
      inventory: 'المخزون',
      categories: 'الفئات',
      mdm: 'إدارة البيانات الرئيسية',
      reports: 'التقارير',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
    },
    common: {
      loading: 'جار التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      refresh: 'تحديث',
      search: 'بحث',
      filter: 'تصفية',
      close: 'إغلاق',
      success: 'نجاح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومات',
      confirm: 'تأكيد',
      yes: 'نعم',
      no: 'لا',
    },
  },
};

// Helper function to get translated message with interpolation
export const getErrorMessage = (language, key, params = {}) => {
  const keys = key.split('.');
  let message = errorMessages[language] || errorMessages.en;

  for (const k of keys) {
    message = message[k];
    if (!message) {
      // Fallback to English if translation not found
      message = errorMessages.en;
      for (const fallbackKey of keys) {
        message = message[fallbackKey];
        if (!message) return key; // Return key if even English translation is missing
      }
      break;
    }
  }

  // Interpolate parameters
  if (typeof message === 'string' && params) {
    Object.keys(params).forEach(param => {
      message = message.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
  }

  return message || key;
};

export default errorMessages;
