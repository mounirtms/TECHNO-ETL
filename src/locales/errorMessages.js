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
        serverError: 'Server error occurred. Please try again later.'
      },
      chunk: {
        title: 'Loading Error',
        description: 'Failed to load application resources. This may be due to a recent update.',
        reload: 'Please reload the page to get the latest version.'
      },
      boundary: {
        title: 'Something went wrong',
        componentError: 'Error in {component} component',
        genericError: 'An unexpected error occurred',
        description: 'We encountered an unexpected error. You can try refreshing the page or go back to the dashboard.',
        retry: 'Try Again',
        reload: 'Reload Page',
        goHome: 'Go to Dashboard',
        reportBug: 'Report Bug',
        technicalDetails: 'Show Technical Details',
        errorDetails: 'Error Details',
        copyDetails: 'Copy Error Details',
        retryCount: 'Retry attempt {count}'
      },
      settings: {
        title: 'Settings Error',
        unknown: 'Unknown settings error',
        componentError: 'Error in {component} settings',
        genericError: 'Settings configuration error',
        corruption: {
          title: 'Settings Corruption Detected',
          description: 'Your settings appear to be corrupted or invalid. We can help you recover them.'
        },
        generic: {
          description: 'An error occurred while loading or saving your settings.'
        },
        recovery: {
          title: 'Recovery Options',
          retry: {
            title: 'Retry Loading',
            description: 'Attempt to reload your settings from storage'
          },
          reset: {
            title: 'Reset to Defaults',
            description: 'Clear all settings and restore default values'
          }
        },
        reset: {
          dialog: {
            title: 'Reset All Settings',
            warning: 'Warning: This action cannot be undone',
            description: 'This will permanently delete all your custom settings and restore the application to its default state.',
            consequences: 'What will happen:',
            benefits: {
              stability: 'Application will return to stable state',
              defaults: 'All settings will be restored to defaults'
            },
            losses: {
              customizations: 'All your customizations will be lost'
            },
            confirm: 'Reset Settings'
          }
        },
        retryCount: 'Retry attempt {count}/3',
        help: {
          description: 'If problems persist, please contact support or report a bug.'
        },
        operations: {
          loading: 'Loading settings...',
          saving: 'Saving settings...',
          syncing: 'Syncing settings...',
          refreshing: 'Refreshing settings...'
        }
      },
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        minLength: 'Must be at least {min} characters',
        maxLength: 'Must be no more than {max} characters',
        pattern: 'Invalid format',
        numeric: 'Must be a number',
        url: 'Please enter a valid URL'
      }
    },
    feedback: {
      success: {
        default: 'Operation completed successfully',
        saved: 'Changes saved successfully',
        deleted: 'Item deleted successfully',
        updated: 'Item updated successfully',
        created: 'Item created successfully'
      },
      settings: {
        saved: 'Settings saved successfully',
        synced: 'Settings synchronized',
        reset: 'Settings reset to defaults',
        imported: 'Settings imported successfully',
        exported: 'Settings exported successfully'
      },
      confirmation: {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?'
      },
      progress: {
        title: 'Processing...',
        message: 'Please wait while we process your request'
      },
      multiStep: {
        title: 'Multi-step Process',
        completed: 'Completed',
        inProgress: 'In Progress'
      }
    },
    common: {
      loading: 'Loading...',
      saving: 'Saving...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      retry: 'Retry',
      close: 'Close',
      ok: 'OK',
      yes: 'Yes',
      no: 'No'
    }
  },
  ar: {
    errors: {
      unknown: 'حدث خطأ غير معروف',
      network: {
        title: 'خطأ في الشبكة',
        description: 'غير قادر على الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        offline: 'يبدو أنك غير متصل بالإنترنت. يرجى التحقق من الاتصال.',
        timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
        serverError: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
      },
      chunk: {
        title: 'خطأ في التحميل',
        description: 'فشل في تحميل موارد التطبيق. قد يكون هذا بسبب تحديث حديث.',
        reload: 'يرجى إعادة تحميل الصفحة للحصول على أحدث إصدار.'
      },
      boundary: {
        title: 'حدث خطأ ما',
        componentError: 'خطأ في مكون {component}',
        genericError: 'حدث خطأ غير متوقع',
        description: 'واجهنا خطأ غير متوقع. يمكنك محاولة تحديث الصفحة أو العودة إلى لوحة التحكم.',
        retry: 'حاول مرة أخرى',
        reload: 'إعادة تحميل الصفحة',
        goHome: 'الذهاب إلى لوحة التحكم',
        reportBug: 'الإبلاغ عن خطأ',
        technicalDetails: 'إظهار التفاصيل التقنية',
        errorDetails: 'تفاصيل الخطأ',
        copyDetails: 'نسخ تفاصيل الخطأ',
        retryCount: 'محاولة رقم {count}'
      },
      settings: {
        title: 'خطأ في الإعدادات',
        unknown: 'خطأ غير معروف في الإعدادات',
        componentError: 'خطأ في إعدادات {component}',
        genericError: 'خطأ في تكوين الإعدادات',
        corruption: {
          title: 'تم اكتشاف تلف في الإعدادات',
          description: 'يبدو أن إعداداتك تالفة أو غير صالحة. يمكننا مساعدتك في استردادها.'
        },
        generic: {
          description: 'حدث خطأ أثناء تحميل أو حفظ إعداداتك.'
        },
        recovery: {
          title: 'خيارات الاسترداد',
          retry: {
            title: 'إعادة المحاولة',
            description: 'محاولة إعادة تحميل إعداداتك من التخزين'
          },
          reset: {
            title: 'إعادة تعيين إلى الافتراضي',
            description: 'مسح جميع الإعدادات واستعادة القيم الافتراضية'
          }
        },
        reset: {
          dialog: {
            title: 'إعادة تعيين جميع الإعدادات',
            warning: 'تحذير: لا يمكن التراجع عن هذا الإجراء',
            description: 'سيؤدي هذا إلى حذف جميع إعداداتك المخصصة نهائياً واستعادة التطبيق إلى حالته الافتراضية.',
            consequences: 'ما سيحدث:',
            benefits: {
              stability: 'سيعود التطبيق إلى حالة مستقرة',
              defaults: 'ستتم استعادة جميع الإعدادات إلى الافتراضي'
            },
            losses: {
              customizations: 'ستفقد جميع تخصيصاتك'
            },
            confirm: 'إعادة تعيين الإعدادات'
          }
        },
        retryCount: 'محاولة رقم {count}/3',
        help: {
          description: 'إذا استمرت المشاكل، يرجى الاتصال بالدعم أو الإبلاغ عن خطأ.'
        },
        operations: {
          loading: 'جاري تحميل الإعدادات...',
          saving: 'جاري حفظ الإعدادات...',
          syncing: 'جاري مزامنة الإعدادات...',
          refreshing: 'جاري تحديث الإعدادات...'
        }
      },
      validation: {
        required: 'هذا الحقل مطلوب',
        email: 'يرجى إدخال عنوان بريد إلكتروني صالح',
        minLength: 'يجب أن يكون على الأقل {min} أحرف',
        maxLength: 'يجب ألا يزيد عن {max} أحرف',
        pattern: 'تنسيق غير صالح',
        numeric: 'يجب أن يكون رقماً',
        url: 'يرجى إدخال رابط صالح'
      }
    },
    feedback: {
      success: {
        default: 'تمت العملية بنجاح',
        saved: 'تم حفظ التغييرات بنجاح',
        deleted: 'تم حذف العنصر بنجاح',
        updated: 'تم تحديث العنصر بنجاح',
        created: 'تم إنشاء العنصر بنجاح'
      },
      settings: {
        saved: 'تم حفظ الإعدادات بنجاح',
        synced: 'تمت مزامنة الإعدادات',
        reset: 'تم إعادة تعيين الإعدادات إلى الافتراضي',
        imported: 'تم استيراد الإعدادات بنجاح',
        exported: 'تم تصدير الإعدادات بنجاح'
      },
      confirmation: {
        title: 'تأكيد الإجراء',
        message: 'هل أنت متأكد من أنك تريد المتابعة؟'
      },
      progress: {
        title: 'جاري المعالجة...',
        message: 'يرجى الانتظار بينما نعالج طلبك'
      },
      multiStep: {
        title: 'عملية متعددة الخطوات',
        completed: 'مكتمل',
        inProgress: 'قيد التنفيذ'
      }
    },
    common: {
      loading: 'جاري التحميل...',
      saving: 'جاري الحفظ...',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      retry: 'إعادة المحاولة',
      close: 'إغلاق',
      ok: 'موافق',
      yes: 'نعم',
      no: 'لا'
    }
  },
  fr: {
    errors: {
      unknown: 'Une erreur inconnue s\'est produite',
      network: {
        title: 'Erreur réseau',
        description: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet et réessayer.',
        offline: 'Vous semblez être hors ligne. Veuillez vérifier votre connexion.',
        timeout: 'Délai d\'attente dépassé. Veuillez réessayer.',
        serverError: 'Erreur serveur. Veuillez réessayer plus tard.'
      },
      chunk: {
        title: 'Erreur de chargement',
        description: 'Échec du chargement des ressources de l\'application. Cela peut être dû à une mise à jour récente.',
        reload: 'Veuillez recharger la page pour obtenir la dernière version.'
      },
      boundary: {
        title: 'Quelque chose s\'est mal passé',
        componentError: 'Erreur dans le composant {component}',
        genericError: 'Une erreur inattendue s\'est produite',
        description: 'Nous avons rencontré une erreur inattendue. Vous pouvez essayer de rafraîchir la page ou retourner au tableau de bord.',
        retry: 'Réessayer',
        reload: 'Recharger la page',
        goHome: 'Aller au tableau de bord',
        reportBug: 'Signaler un bug',
        technicalDetails: 'Afficher les détails techniques',
        errorDetails: 'Détails de l\'erreur',
        copyDetails: 'Copier les détails de l\'erreur',
        retryCount: 'Tentative {count}'
      },
      settings: {
        title: 'Erreur de paramètres',
        unknown: 'Erreur de paramètres inconnue',
        componentError: 'Erreur dans les paramètres {component}',
        genericError: 'Erreur de configuration des paramètres',
        corruption: {
          title: 'Corruption des paramètres détectée',
          description: 'Vos paramètres semblent corrompus ou invalides. Nous pouvons vous aider à les récupérer.'
        },
        generic: {
          description: 'Une erreur s\'est produite lors du chargement ou de la sauvegarde de vos paramètres.'
        },
        recovery: {
          title: 'Options de récupération',
          retry: {
            title: 'Réessayer le chargement',
            description: 'Tenter de recharger vos paramètres depuis le stockage'
          },
          reset: {
            title: 'Réinitialiser aux valeurs par défaut',
            description: 'Effacer tous les paramètres et restaurer les valeurs par défaut'
          }
        },
        reset: {
          dialog: {
            title: 'Réinitialiser tous les paramètres',
            warning: 'Attention : Cette action ne peut pas être annulée',
            description: 'Cela supprimera définitivement tous vos paramètres personnalisés et restaurera l\'application à son état par défaut.',
            consequences: 'Ce qui va se passer :',
            benefits: {
              stability: 'L\'application reviendra à un état stable',
              defaults: 'Tous les paramètres seront restaurés par défaut'
            },
            losses: {
              customizations: 'Toutes vos personnalisations seront perdues'
            },
            confirm: 'Réinitialiser les paramètres'
          }
        },
        retryCount: 'Tentative {count}/3',
        help: {
          description: 'Si les problèmes persistent, veuillez contacter le support ou signaler un bug.'
        },
        operations: {
          loading: 'Chargement des paramètres...',
          saving: 'Sauvegarde des paramètres...',
          syncing: 'Synchronisation des paramètres...',
          refreshing: 'Actualisation des paramètres...'
        }
      },
      validation: {
        required: 'Ce champ est requis',
        email: 'Veuillez saisir une adresse e-mail valide',
        minLength: 'Doit contenir au moins {min} caractères',
        maxLength: 'Ne doit pas dépasser {max} caractères',
        pattern: 'Format invalide',
        numeric: 'Doit être un nombre',
        url: 'Veuillez saisir une URL valide'
      }
    },
    feedback: {
      success: {
        default: 'Opération terminée avec succès',
        saved: 'Modifications sauvegardées avec succès',
        deleted: 'Élément supprimé avec succès',
        updated: 'Élément mis à jour avec succès',
        created: 'Élément créé avec succès'
      },
      settings: {
        saved: 'Paramètres sauvegardés avec succès',
        synced: 'Paramètres synchronisés',
        reset: 'Paramètres réinitialisés aux valeurs par défaut',
        imported: 'Paramètres importés avec succès',
        exported: 'Paramètres exportés avec succès'
      },
      confirmation: {
        title: 'Confirmer l\'action',
        message: 'Êtes-vous sûr de vouloir continuer ?'
      },
      progress: {
        title: 'Traitement en cours...',
        message: 'Veuillez patienter pendant que nous traitons votre demande'
      },
      multiStep: {
        title: 'Processus multi-étapes',
        completed: 'Terminé',
        inProgress: 'En cours'
      }
    },
    common: {
      loading: 'Chargement...',
      saving: 'Sauvegarde...',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      retry: 'Réessayer',
      close: 'Fermer',
      ok: 'OK',
      yes: 'Oui',
      no: 'Non'
    }
  }
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